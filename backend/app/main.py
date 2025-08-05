import logging
from collections import defaultdict
from typing import Dict, Literal, Optional, Tuple

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pulp import LpContinuous, LpMinimize, LpProblem, LpVariable, lpSum
from pydantic import BaseModel
from sqlalchemy import and_, or_
from sqlalchemy.orm import selectinload
from sqlmodel import Session, func, select

from app.db.database import create_db_and_tables, engine
from app.db.models import *

logging.basicConfig(level=logging.INFO)
uvicorn_logger = logging.getLogger("uvicorn")
uvicorn_logger.setLevel(logging.INFO)
uvicorn_logger.info("Starting application...")

app = FastAPI()


origins = [
    "http://127.0.0.1:5173",  # Allow local React development server
    "https://d15tewx0oh5z10.cloudfront.net",  # Allow production frontend domain
]


# Add CORS middleware to allow specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows specific origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)


class ExpenseSummary(BaseModel):
    friend_id: int
    friend_name: str
    balance: float  # Positive if the user is owed, negative if the user owes


class ExpenseSummaryResponse(BaseModel):
    summary: list[ExpenseSummary]
    total_balance: float


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


# Dependency to get a session
def get_session():
    with Session(engine) as session:
        yield session


class Friend(BaseModel):
    friend_id: int
    friend_name: str


class GroupModel(BaseModel):
    group_id: Optional[str]
    group_name: str
    debt_summary: str


class FriendDebtSummary(Friend):
    amount_owed: float
    is_debtor: bool
    groups: list[GroupModel]


class ParticipantResponse(BaseModel):
    id: int
    name: str
    amount_owed: float


@app.get("/expense-summary/{user_id}", response_model=List[FriendDebtSummary])
def get_friend_debt_summary(
    user_id: int, session: Session = Depends(get_session)
) -> List[FriendDebtSummary]:
    # Query GroupDebtSummary directly
    stmt = select(GroupDebtSummary).where(
        (GroupDebtSummary.creditor_id == user_id)
        | (GroupDebtSummary.debtor_id == user_id)
    )
    group_debts = session.exec(stmt).all()
    # Aggregate debts by friend
    friend_debts = {}
    for debt in group_debts:
        is_debtor = debt.debtor_id == user_id
        friend_id = debt.creditor_id if is_debtor else debt.debtor_id
        friend_name = (
            session.get(User, friend_id).name
            if session.get(User, friend_id)
            else "Unknown"
        )

        if friend_id not in friend_debts:
            friend_debts[friend_id] = {
                "friend_id": friend_id,
                "friend_name": friend_name,
                "amount_owed": 0,
                "is_debtor": is_debtor,
                "groups": [],
            }

        # Update amount owed based on debtor/creditor role
        friend_debts[friend_id]["amount_owed"] += debt.amount_owed

        # Format debt summary based on debtor/creditor role
        debt_summary = (
            f"You owe {friend_name} ₹{debt.amount_owed:.2f}"
            if is_debtor
            else f"{friend_name} owes you ₹{debt.amount_owed:.2f}"
        )

        # Append group details with formatted debt summary
        friend_debts[friend_id]["groups"].append(
            GroupModel(
                group_id=debt.group_id,
                group_name=debt.group.name if debt.group else "Non Group Expenses",
                debt_summary=debt_summary,
            )
        )

    # Prepare final response
    response = [FriendDebtSummary(**friend) for friend in friend_debts.values()]
    return response


class EmailRequest(BaseModel):
    email: str
    name: str = None  # Optional: In case you want to add a name directly


@app.post("/auth/google")
async def auth_google(request: EmailRequest, session: Session = Depends(get_session)):
    """
    Authenticates or registers a user based on their email.
    """
    try:
        # Extract email and optional name from the request
        email = request.email
        name = request.name

        # Log the received data for debugging
        uvicorn_logger.info(f"Received email: {email}, name: {name}")

        # Check if user exists in the database
        query = select(User).where(User.email == email)
        users = session.exec(query).all()

        if users and isinstance(users, list) and len(users) == 1:
            user = users[0]
            return {"user_id": user.id, "email": user.email, "name": user.name}
        else:
            # If no user exists, create a new one
            if not name:
                raise HTTPException(
                    status_code=400,
                    detail="Name is required for new user registration.",
                )
            user = User(name=name, email=email)
            session.add(user)
            session.commit()
            session.refresh(user)  # Refresh to get the new user ID

            return {"user_id": user.id, "email": user.email, "name": user.name}

    except Exception as e:
        # General error handling
        raise HTTPException(status_code=500, detail=str(e))


class DebtEntry(SQLModel):
    debtor_id: int
    creditor_id: int
    amount_owed: float
    debtor_name: str
    creditor_name: str
    created_at: datetime


class GroupDebtResponse(SQLModel):
    group_id: Optional[int]
    group_name: str
    members: List[User] = []
    debts: List[DebtEntry]


@app.get("/api/groups/debts", response_model=List[GroupDebtResponse])
async def get_group_debts(
    user_id: int = Query(...), session: Session = Depends(get_session)
):
    # Step 1: Query groups where the user is a member
    group_statement = (
        select(Group).join(UserGroupLink).where(UserGroupLink.user_id == user_id)
    )
    groups = session.exec(group_statement).all()

    # Collect group IDs for debt queries
    group_ids = [group.id for group in groups]

    # Step 2: Query debts for these specific groups, including untagged expenses
    debt_statement = select(GroupDebtSummary).where(
        GroupDebtSummary.group_id.in_(group_ids)
        & (
            (GroupDebtSummary.debtor_id == user_id)
            | (GroupDebtSummary.creditor_id == user_id)
        )
        | (
            GroupDebtSummary.group_id.is_(None)
            & (
                (GroupDebtSummary.debtor_id == user_id)
                | (GroupDebtSummary.creditor_id == user_id)
            )
        )
    )

    group_debts_summary = session.exec(debt_statement).all()

    # Step 3: Organize debts by group and format responses
    group_debts = []
    for group in groups:
        # Filter debts relevant to the current group
        group_debt_entries = [
            DebtEntry(
                debtor_id=debt.debtor_id,
                debtor_name=session.get(User, debt.debtor_id).name,
                creditor_id=debt.creditor_id,
                creditor_name=session.get(User, debt.creditor_id).name,
                amount_owed=debt.amount_owed,
                created_at=debt.created_at,
            )
            for debt in group_debts_summary
            if debt.group_id == group.id
        ]

        group_debts.append(
            GroupDebtResponse(
                group_id=group.id,
                group_name=group.name,
                debts=group_debt_entries,  # List of structured debt entries
                members=[member for member in group.members],
            )
        )

    # Step 4: Handle untagged debts
    untagged_debts = [
        DebtEntry(
            debtor_id=debt.debtor_id,
            debtor_name=session.get(User, debt.debtor_id).name,
            creditor_id=debt.creditor_id,
            creditor_name=session.get(User, debt.creditor_id).name,
            amount_owed=debt.amount_owed,
            created_at=debt.created_at,
        )
        for debt in group_debts_summary
        if debt.group_id is None
    ]

    # Add untagged debts to a special entry in the response
    if untagged_debts:
        group_debts.append(
            GroupDebtResponse(
                group_id=None,  # or you can use a special ID for untagged
                group_name="Non Group Expenses",
                debts=untagged_debts,
            )
        )

    return group_debts


@app.get("/api/group/debts", response_model=GroupDebtResponse)
async def get_group_debt_summary(
    group_id: Optional[int] = None,  # Make group_id optional
    user_id: int = Query(...),
    session: Session = Depends(get_session),
):
    # Step 1: If group_id is None, retrieve all untagged debts

    if group_id is None:
        # No group_id provided, fetch all untagged debts
        debt_statement = select(GroupDebtSummary).where(
            GroupDebtSummary.group_id.is_(None)
            & (
                (GroupDebtSummary.debtor_id == user_id)
                | (GroupDebtSummary.creditor_id == user_id)
            )
        )
        group_debts_summary = session.exec(debt_statement).all()

        # Build response for untagged debts
        untagged_debt_entries = [
            DebtEntry(
                debtor_id=debt.debtor_id,
                debtor_name=session.get(User, debt.debtor_id).name,
                creditor_id=debt.creditor_id,
                creditor_name=session.get(User, debt.creditor_id).name,
                amount_owed=debt.amount_owed,
                created_at=debt.created_at,
            )
            for debt in group_debts_summary
        ]

        return GroupDebtResponse(
            group_id=None,  # Indicating untagged debts
            group_name="Untagged Expenses",
            debts=untagged_debt_entries,
        )

    # Step 2: Verify that the user is a member of the group if group_id is provided
    user_in_group = session.exec(
        select(UserGroupLink).where(
            UserGroupLink.user_id == user_id, UserGroupLink.group_id == group_id
        )
    ).first()

    if not user_in_group:
        raise HTTPException(
            status_code=403, detail="User is not a member of this group"
        )

    # Step 3: Retrieve the group and its name
    group = session.get(Group, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Step 4: Query debts for this specific group
    debt_statement = select(GroupDebtSummary).where(
        GroupDebtSummary.group_id == group_id
    )
    group_debts_summary = session.exec(debt_statement).all()

    # Step 5: Build the response with debt entries formatted
    group_debt_entries = [
        DebtEntry(
            debtor_id=debt.debtor_id,
            debtor_name=session.get(User, debt.debtor_id).name,
            creditor_id=debt.creditor_id,
            creditor_name=session.get(User, debt.creditor_id).name,
            amount_owed=debt.amount_owed,
            created_at=debt.created_at,
        )
        for debt in group_debts_summary
    ]

    return GroupDebtResponse(
        group_id=group.id,
        group_name=group.name,
        debts=group_debt_entries,
        members=[member for member in group.members],
    )


from collections import defaultdict

from pulp import LpMinimize, LpProblem, LpVariable, lpSum


def reconcile_debts(debts):
    # Step 1: Calculate net balances for each user
    net_balances = defaultdict(float)

    # Calculate net balances based on debts
    for debtor, creditor, amount in debts:
        net_balances[debtor] -= amount
        net_balances[creditor] += amount

    # Step 2: Set up the LP problem
    problem = LpProblem("DebtReconciliation", LpMinimize)

    # Step 3: Create variables for transactions
    transactions = {}
    for debtor in net_balances:
        for creditor in net_balances:
            if debtor != creditor:
                transactions[(debtor, creditor)] = LpVariable(
                    f"{debtor}_to_{creditor}", lowBound=0, cat=LpContinuous
                )

    # Step 4: Objective function: Minimize the total amount transferred
    problem += lpSum(
        transactions[(debtor, creditor)]
        for debtor in net_balances
        for creditor in net_balances
        if debtor != creditor
    )

    # Step 5: Add constraints for the net balances
    for user, balance in net_balances.items():
        if balance > 0:  # User is a creditor
            problem += (
                lpSum(
                    transactions[(debtor, user)]
                    for debtor in net_balances
                    if debtor != user
                )
                == balance
            )
        elif balance < 0:  # User is a debtor
            problem += (
                lpSum(
                    transactions[(user, creditor)]
                    for creditor in net_balances
                    if creditor != user
                )
                == -balance
            )

    # Step 6: Solve the problem
    problem.solve()

    # Step 7: Collect results
    results = []
    for (debtor, creditor), var in transactions.items():
        if var.varValue > 0:
            results.append((debtor, creditor, var.varValue))

    return results


class ExpenseDetailResponse(BaseModel):
    id: int
    amount: float
    description: str
    paid_by: dict  # Or you can define a separate model for the payer
    participants: List[ParticipantResponse]
    created_at: datetime


# Endpoint to get detailed expenses for a specific group
@app.get("/api/groups/{group_id}/expenses", response_model=List[ExpenseDetailResponse])
async def get_group_expenses(group_id: int, session: Session = Depends(get_session)):
    # Fetch expenses for the specified group
    expense_statement = (
        select(Expense)
        .where(Expense.group_id == group_id)
        .options(selectinload(Expense.paid_by))
    ).order_by(Expense.created_at.desc())
    expenses = session.exec(expense_statement).all()

    # Build detailed expense information
    expense_details = []
    for expense in expenses:
        # Query ExpenseParticipantLink to get amount owed for each participant
        participant_links_statement = select(ExpenseParticipantLink).where(
            ExpenseParticipantLink.expense_id == expense.id
        )
        participant_links = session.exec(participant_links_statement).all()

        # Construct participant information with amount owed
        participants = [
            {
                "id": link.user_id,
                "name": session.get(User, link.user_id).name,
                "amount_owed": link.amount_owed,
            }
            for link in participant_links
        ]

        # Append detailed expense information
        expense_details.append(
            {
                "id": expense.id,
                "amount": expense.amount,
                "description": expense.description,
                "paid_by": {
                    "id": expense.paid_by.id,
                    "name": expense.paid_by.name,
                },
                "participants": participants,
                "created_at": expense.created_at,
            }
        )

    return expense_details


@app.get("/api/expenses/untagged", response_model=List[ExpenseDetailResponse])
async def get_untagged_expenses(
    user_id: int = Query(...),  # Accept user_id as a query parameter
    session: Session = Depends(get_session),
):
    # Fetch expenses that are not associated with any group
    expense_statement = (
        select(Expense)
        .where(
            Expense.group_id.is_(None)
            & (
                (Expense.paid_by_id == user_id)
                | (
                    Expense.id.in_(
                        select(ExpenseParticipantLink.expense_id).where(
                            ExpenseParticipantLink.user_id == user_id
                        )
                    )
                )
            )
        )
        .options(selectinload(Expense.paid_by))
    )
    expenses = session.exec(expense_statement).all()

    # Build detailed expense information
    expense_details = []
    for expense in expenses:
        # Query ExpenseParticipantLink to get amount owed for each participant
        participant_links_statement = select(ExpenseParticipantLink).where(
            ExpenseParticipantLink.expense_id == expense.id
        )
        participant_links = session.exec(participant_links_statement).all()

        # Construct participant information with amount owed
        participants = [
            {
                "id": link.user_id,
                "name": session.get(User, link.user_id).name,
                "amount_owed": link.amount_owed,
            }
            for link in participant_links
        ]

        # Append detailed expense information
        expense_details.append(
            {
                "id": expense.id,
                "amount": expense.amount,
                "description": expense.description,
                "paid_by": {
                    "id": expense.paid_by.id,
                    "name": expense.paid_by.name,
                },
                "participants": participants,
                "created_at": expense.created_at,
            }
        )

    return expense_details


class ExpenseStatus(str, Enum):
    PENDING = "PENDING"
    PARTIALLY_SETTLED = "PARTIALLY_SETTLED"
    SETTLED = "SETTLED"


class SettleRequest(SQLModel):
    user_id: int
    group_id: int
    debtor_id: int
    creditor_id: int
    settle_up_amount: float


class SettledExpenseResponse(SQLModel):
    expense_id: int
    description: str
    settled_amount: float
    status: ExpenseStatus


@app.post("/settle-up")
async def settle_debt(request: SettleRequest, session: Session = Depends(get_session)):
    # Step 1: Start a transaction block to manage all operations
    with session.begin():
        debtor = session.query(User).filter(User.id == request.debtor_id).first()
        creditor = session.query(User).filter(User.id == request.creditor_id).first()
        if not debtor or not creditor:
            raise HTTPException(
                status_code=404,
                detail="Creditor or debtor not found",
            )
        # Fetch the specific debt entry for the given group, debtor, and creditor
        debt_summary = session.exec(
            select(GroupDebtSummary)
            .where(GroupDebtSummary.group_id == request.group_id)
            .where(GroupDebtSummary.debtor_id == request.debtor_id)
            .where(GroupDebtSummary.creditor_id == request.creditor_id)
        ).one_or_none()

        if not debt_summary:
            raise HTTPException(
                status_code=404,
                detail="Debt record not found for specified user and group.",
            )

        # Check if the settlement amount is valid
        if (
            request.settle_up_amount <= 0
            or request.settle_up_amount > debt_summary.amount_owed
        ):
            raise HTTPException(status_code=400, detail="Invalid settlement amount.")

        # Update the debt amount owed by the settle-up amount
        debt_summary.amount_owed -= request.settle_up_amount
        session.add(debt_summary)

        # Create a new settlement record
        settlement_record = Settlement(
            creditor_id=request.creditor_id,
            debtor_id=request.debtor_id,
            amount=request.settle_up_amount,
            created_at=datetime.now(),
            group_id=request.group_id,
        )
        session.add(settlement_record)

        # Check for pending debts after settlement
        remaining_debts = (
            session.query(GroupDebtSummary)
            .filter(GroupDebtSummary.group_id == request.group_id)
            .count()
        )

        # If no debts remain, mark the group as settled
        if remaining_debts == 0:
            group = session.get(Group, request.group_id)
            if group:
                group.settled = True
                session.add(group)

        # Record the settlement activity
        activity = Activity(
            action=f"{request.settle_up_amount} settled between {debtor.name} and {creditor.name}",
            user_id=request.user_id,
            group_id=request.group_id,
            activity_type=ActivityTypes.SETTLED_DEBT,
        )
        session.add(activity)

        # If this debt is fully paid, delete the debt entry from GroupDebtSummary
        if debt_summary.amount_owed <= 0:
            session.delete(debt_summary)

        # Check if the group is fully settled
        remaining_debts = session.exec(
            select(GroupDebtSummary).where(
                GroupDebtSummary.group_id == request.group_id
            )
        ).all()
        if not remaining_debts:
            group = session.get(Group, request.group_id)
            group.settled = True
            session.add(group)

    # Return the response with remaining debt amount if any
    return {
        "message": "Debt successfully settled.",
        "remaining_amount": (
            debt_summary.amount_owed if debt_summary.amount_owed > 0 else 0
        ),
    }


@app.get("/users/search", response_model=List[User])
async def search_users(
    term: str = Query(..., min_length=1, description="Name or email to search for"),
    user_id: int = Query(
        ..., description="ID of the current user to exclude from search results"
    ),
    session: Session = Depends(get_session),
):
    """
    Search for users by name or email, excluding the user with the provided user_id.
    """
    statement = select(User).where(
        ((User.name.ilike(f"%{term}%")) | (User.email.ilike(f"%{term}%")))
        & (User.id != user_id)  # Exclude the current user
    )

    results = session.exec(statement).all()
    if not results:
        raise HTTPException(status_code=404, detail="No users found")

    return results


class FriendIdsRequest(BaseModel):
    friend_ids: List[int]


@app.post("/users/{user_id}/friends", status_code=status.HTTP_201_CREATED)
async def add_friends(
    user_id: int, request: FriendIdsRequest, session: Session = Depends(get_session)
):
    """
    Add multiple friends for a given user.
    If any friendship already exists, raise a 409 Conflict error.
    """
    # Fetch the user to validate they exist
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Track existing friendships to avoid duplicates
    existing_friendships = []
    for friend_id in request.friend_ids:
        # Check if the friendship already exists (bidirectional check)
        statement = select(Friendship).where(
            (Friendship.user_id == user_id) & (Friendship.friend_id == friend_id)
            | (Friendship.user_id == friend_id) & (Friendship.friend_id == user_id)
        )
        friendship = session.exec(statement).first()

        if friendship:
            user = session.get(User, friend_id)
            existing_friendships.append(f"{user.name} -- {user.email}")
        else:
            # Create a new friendship relationship
            new_friendship = Friendship(user_id=user_id, friend_id=friend_id)
            session.add(new_friendship)

    # Commit all new friendships at once
    session.commit()

    if existing_friendships:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Friendship already exists with user(s): {existing_friendships}",
        )

    return {"message": "Friends added successfully"}


@app.get("/api/friends/{user_id}", response_model=List[User])
def get_friends(user_id: int, db: Session = Depends(get_session)):
    statement = select(Friendship).where(
        (Friendship.user_id == user_id) | (Friendship.friend_id == user_id)
    )
    friends = db.exec(statement).all()

    if not friends:
        raise HTTPException(status_code=404, detail="No friends found")

    friend_ids = []
    for friend in friends:
        u_id = friend.friend_id
        if friend.friend_id == user_id:
            u_id = friend.user_id
        friend_ids.append(u_id)
    friend_users = db.exec(select(User).where(User.id.in_(friend_ids))).all()

    return friend_users


@app.get("/api/groups/{user_id}", response_model=List[Group])
def list_groups(user_id: int, db: Session = Depends(get_session)):
    # Query to get the user's groups and their last expense creation date
    statement = (
        select(Group)
        .join(UserGroupLink)
        .outerjoin(Expense)
        .where(UserGroupLink.user_id == user_id)
        .group_by(Group.id)  # Group by group ID to avoid duplicates
        .order_by(func.max(Expense.created_at).desc())  # Order by the max expense date
    )

    groups = db.exec(statement).all()

    if not groups:
        raise HTTPException(status_code=404, detail="No groups found for this user")

    return groups


from sqlalchemy.exc import SQLAlchemyError


def reconcile_all_group_debts(
    db: Session,
    expenses: List[Expense],
    group_id: int,
    adjusted_debts: list[tuple[str, str, float]],
):
    """
    Reconcile debts for all expenses in the group, deleting existing summaries and upserting the new reconciled debts.
    """
    all_debts = []

    # Calculate debts for each expense in the group
    for expense in expenses:
        participant_links = (
            db.query(ExpenseParticipantLink)
            .filter(ExpenseParticipantLink.expense_id == expense.id)
            .all()
        )

        for link in participant_links:
            all_debts.append((link.user_id, expense.paid_by_id, link.amount_owed))

    # factor in for adjustments (settlements)
    all_debts.extend(adjusted_debts)

    # Reconcile debts based on all accumulated debts in the group
    reconciled_debts = reconcile_debts(all_debts)

    # Delete all existing debt summaries within this group
    db.query(GroupDebtSummary).filter(GroupDebtSummary.group_id == group_id).delete(
        synchronize_session=False
    )

    # Insert the new reconciled debt summaries
    for debtor_id, creditor_id, amount in reconciled_debts:
        debt_summary = GroupDebtSummary(
            group_id=group_id,
            debtor_id=debtor_id,
            creditor_id=creditor_id,
            amount_owed=amount,
        )
        db.add(debt_summary)

    return [
        {"debtor": d[0], "creditor": d[1], "amount": d[2]} for d in reconciled_debts
    ]


def reconcile_single_expense(
    db: Session, debts: List[Tuple[int, int, float]], group_id: int
):
    """
    Reconcile debts for a single expense, updating or inserting individual debt records as necessary.
    """
    reconciled_debts = reconcile_debts(debts)
    debt_summary_updates = []

    for debtor_id, creditor_id, amount in reconciled_debts:
        # Check for existing debt summary (direct or reversed)
        existing_summary = (
            db.query(GroupDebtSummary)
            .filter(
                GroupDebtSummary.group_id == group_id,
                GroupDebtSummary.debtor_id == debtor_id,
                GroupDebtSummary.creditor_id == creditor_id,
            )
            .first()
        )
        reversed_summary = (
            db.query(GroupDebtSummary)
            .filter(
                GroupDebtSummary.group_id == group_id,
                GroupDebtSummary.debtor_id == creditor_id,
                GroupDebtSummary.creditor_id == debtor_id,
            )
            .first()
        )

        if existing_summary:
            existing_summary.amount_owed += amount
            db.add(existing_summary)
        elif reversed_summary:
            if reversed_summary.amount_owed > amount:
                reversed_summary.amount_owed -= amount
                db.add(reversed_summary)
            else:
                db.delete(reversed_summary)
                new_summary = GroupDebtSummary(
                    group_id=group_id,
                    debtor_id=debtor_id,
                    creditor_id=creditor_id,
                    amount_owed=amount - reversed_summary.amount_owed,
                )
                db.add(new_summary)
        else:
            new_summary = GroupDebtSummary(
                group_id=group_id,
                debtor_id=debtor_id,
                creditor_id=creditor_id,
                amount_owed=amount,
            )
            db.add(new_summary)

        debt_summary_updates.append(
            {"debtor": debtor_id, "creditor": creditor_id, "amount": amount}
        )

    return debt_summary_updates


def reconcile_single_expense_delete(
    db: Session, debts: List[Tuple[int, int, float]], group_id: int
):
    """
    Reconcile debts for a single expense, updating or inserting individual debt records as necessary.
    """
    reconciled_debts = reconcile_debts(debts)
    debt_summary_updates = []

    for debtor_id, creditor_id, amount in reconciled_debts:
        # Check for existing debt summary (direct or reversed)
        existing_summary = (
            db.query(GroupDebtSummary)
            .filter(
                GroupDebtSummary.group_id == group_id,
                GroupDebtSummary.debtor_id == debtor_id,
                GroupDebtSummary.creditor_id == creditor_id,
            )
            .first()
        )
        reversed_summary = (
            db.query(GroupDebtSummary)
            .filter(
                GroupDebtSummary.group_id == group_id,
                GroupDebtSummary.debtor_id == creditor_id,
                GroupDebtSummary.creditor_id == debtor_id,
            )
            .first()
        )

        if existing_summary:
            existing_summary.amount_owed -= amount
            if existing_summary.amount_owed <= amount:
                db.delete(reversed_summary)
            else:
                new_summary = GroupDebtSummary(
                    group_id=group_id,
                    debtor_id=debtor_id,
                    creditor_id=creditor_id,
                    amount_owed=amount - existing_summary.amount_owed,
                )
                db.add(existing_summary)
        elif reversed_summary:
            reversed_summary.amount_owed += amount
            db.add(reversed_summary)
        else:
            new_summary = GroupDebtSummary(
                group_id=group_id,
                debtor_id=debtor_id,
                creditor_id=creditor_id,
                amount_owed=amount,
            )
            db.add(new_summary)

        debt_summary_updates.append(
            {"debtor": debtor_id, "creditor": creditor_id, "amount": amount}
        )

    return debt_summary_updates


class ExpenseData(SQLModel):
    user_id: int
    amount: float
    description: str
    currency: str
    payer_id: int
    group_id: Optional[int]
    participants: List[int]
    splitType: Literal["custom", "equal"] = "equal"
    splitMode: Optional[Literal["amount", "share"]] = None
    customSplits: Optional[Dict[int, float]] = None


def validate_expense_data(expense_data: ExpenseData):
    if expense_data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")
    if not expense_data.payer_id or not expense_data.participants:
        raise HTTPException(
            status_code=400, detail="Payer and participants are required."
        )


def store_expense(
    db: Session, expense_data: ExpenseData, expense_id: int = None
) -> tuple[int, str]:
    """Stores or updates an expense record and returns the expense ID."""
    if expense_id:
        expense = db.query(Expense).get(expense_id)
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found.")
        expense.amount = expense_data.amount
        expense.description = expense_data.description
        expense.currency = expense_data.currency
        expense.paid_by_id = expense_data.payer_id
        expense.group_id = expense_data.group_id
    else:
        expense = Expense(
            amount=expense_data.amount,
            description=expense_data.description,
            currency=expense_data.currency,
            created_at=datetime.utcnow(),
            paid_by_id=expense_data.payer_id,
            group_id=expense_data.group_id,
        )
    db.add(expense)
    db.flush()
    return expense.id, expense.description


def calculate_debts(expense_data: ExpenseData) -> List[Tuple[int, int, float]]:
    """Calculates debts for each participant based on split type."""
    debts = []
    total_shares = (
        sum(expense_data.customSplits.values())
        if expense_data.splitMode == "share"
        else None
    )

    for participant_id in expense_data.participants:
        if expense_data.splitType == "equal":
            amount_owed = expense_data.amount / len(expense_data.participants)
        elif expense_data.splitType == "custom":
            if expense_data.splitMode == "amount":
                amount_owed = expense_data.customSplits.get(participant_id, 0)
            elif expense_data.splitMode == "share" and total_shares:
                amount_owed = (
                    expense_data.customSplits.get(participant_id, 0) / total_shares
                ) * expense_data.amount
            else:
                raise HTTPException(
                    status_code=400, detail="Invalid split configuration."
                )

        debts.append((participant_id, expense_data.payer_id, amount_owed))

    return debts


def provide_expense_adjustments(
    expense_data: ExpenseData, db: Session
) -> list[tuple[str, str, float]]:
    # Fetch existing settlements for the group (if any)
    settlement_records = (
        db.query(Settlement)
        .filter(
            Settlement.group_id == expense_data.group_id,
            or_(
                and_(
                    Settlement.debtor_id == expense_data.payer_id,
                    Settlement.creditor_id.in_(expense_data.participants),
                ),
                and_(
                    Settlement.creditor_id == expense_data.payer_id,
                    Settlement.debtor_id.in_(expense_data.participants),
                ),
            ),
        )
        .all()
    )

    adjusted_debts: list[tuple[str, str, float]] = [
        (record.creditor_id, record.debtor_id, record.amount)
        for record in settlement_records
    ]
    return adjusted_debts


@app.post("/expenses")
def create_expense(expense_data: ExpenseData, db: Session = Depends(get_session)):
    validate_expense_data(expense_data)
    try:
        # Begin transaction block
        with db.begin():
            user = db.query(User).filter(User.id == expense_data.user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            stored_expense_id, expense_name = store_expense(db, expense_data)
            debts = calculate_debts(expense_data)

            # Insert ExpenseParticipantLink for each participant
            for participant_id, _, amount_owed in debts:
                participant_link = ExpenseParticipantLink(
                    expense_id=stored_expense_id,
                    user_id=participant_id,
                    amount_owed=amount_owed,
                )
                db.add(participant_link)

            # Fetch existing settlements for the group (if any)
            adjusted_debts = provide_expense_adjustments(expense_data, db)

            # Include the adjustment of the settlement before reconcillation
            debts.extend(adjusted_debts)

            # Reconcile debts
            if expense_data.group_id:
                all_expenses = (
                    db.query(Expense)
                    .filter(Expense.group_id == expense_data.group_id)
                    .all()
                )
                debt_summary = reconcile_all_group_debts(
                    db, all_expenses, expense_data.group_id, adjusted_debts
                )
            else:
                debt_summary = reconcile_single_expense(
                    db, debts, expense_data.group_id
                )

            # Log activity
            activity = Activity(
                action=f"Expense -- {expense_name} created by {user.name}",
                user_id=expense_data.user_id,
                expense_id=stored_expense_id,
                group_id=expense_data.group_id,
                timestamp=datetime.utcnow(),
                activity_type=ActivityTypes.CREATED_EXPENSE,
            )
            db.add(activity)

            # Commit transaction
            db.commit()

        return {
            "status": "success",
            "expense_id": stored_expense_id,
            "debt_summary": debt_summary,
        }

    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=500, detail="An error occurred while creating the expense."
        )


@app.put("/expenses/{expense_id}")
def update_expense(
    expense_id: int, expense_data: ExpenseData, db: Session = Depends(get_session)
):
    """Update an expense and recalculate all related debts within a single transaction."""
    validate_expense_data(expense_data)
    try:
        with db.begin() as _:
            user = db.query(User).filter(User.id == expense_data.user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            # Store or update the expense
            stored_expense_id, expense_name = store_expense(
                db, expense_data, expense_id=expense_id
            )

            # Calculate debts for the expense
            debts = calculate_debts(expense_data)

            # Fetch existing settlements for the group (if any)
            adjusted_debts = provide_expense_adjustments(expense_data, db)

            # Update ExpenseParticipantLink entries
            db.query(ExpenseParticipantLink).filter(
                ExpenseParticipantLink.expense_id == expense_id
            ).delete()

            for participant_id, _, amount_owed in debts:
                participant_link = ExpenseParticipantLink(
                    expense_id=expense_id,
                    user_id=participant_id,
                    amount_owed=amount_owed,
                )
                db.add(participant_link)
            # add adjustment to the current debt for untagged expense
            debts.extend(adjusted_debts)

            # Handle debt reconciliation
            if expense_data.group_id:
                all_expenses = (
                    db.query(Expense)
                    .filter(Expense.group_id == expense_data.group_id)
                    .all()
                )
                debt_summary = reconcile_all_group_debts(
                    db, all_expenses, expense_data.group_id, adjusted_debts
                )
            else:
                debt_summary = reconcile_single_expense(
                    db, debts, expense_data.group_id
                )

            # Log activity
            activity = Activity(
                action=f"Expense -- {expense_name} updated by: {user.name}",
                user_id=expense_data.user_id,
                expense_id=stored_expense_id,
                group_id=expense_data.group_id,
                timestamp=datetime.utcnow(),
                activity_type=ActivityTypes.UPDATED_EXPENSE,
            )
            db.add(activity)

            # Commit happens automatically when the context manager exits
            return {
                "status": "success",
                "expense_id": stored_expense_id,
                "debt_summary": debt_summary,
            }

    except SQLAlchemyError as e:
        # The transaction will automatically rollback on exception
        raise HTTPException(
            status_code=500, detail="An error occurred while updating the expense."
        )


@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, user_id: int, db: Session = Depends(get_session)):
    """Delete an expense and its participant links, but retain related activity with null expense_id."""
    try:
        # Step 1: Check if the user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=403, detail="User not found")

        # Step 2: Fetch the expense to ensure it exists
        expense = db.query(Expense).filter(Expense.id == expense_id).first()
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")

        # Step 3: Load related ExpenseParticipantLink entries explicitly
        participant_links = (
            db.query(ExpenseParticipantLink)
            .filter(ExpenseParticipantLink.expense_id == expense_id)
            .all()
        )

        # Handle debt reconciliation before deleting the expense
        expense_data = ExpenseData(
            user_id=user.id,
            amount=expense.amount,
            description=expense.description,
            currency=expense.currency,
            payer_id=expense.paid_by_id,
            group_id=expense.group_id,
            participants=[link.user_id for link in participant_links],
        )
        debts = calculate_debts(expense_data)
        adjusted_debts = provide_expense_adjustments(expense_data, db)

        if expense_data.group_id:
            all_expenses = (
                db.query(Expense)
                .filter(
                    Expense.group_id == expense_data.group_id, Expense.id != expense_id
                )
                .all()
            )
            _ = reconcile_all_group_debts(
                db, all_expenses, expense_data.group_id, adjusted_debts
            )
        else:
            _ = reconcile_single_expense_delete(db, debts, expense_data.group_id)

        # Step 4: Delete the participant links
        for link in participant_links:
            db.delete(link)

        # Step 5: Update related activities to set expense_id to None
        db.query(Activity).filter(Activity.expense_id == expense_id).update(
            {
                "expense_id": None,
                "activity_type": ActivityTypes.DELETED_EXPENSE,
                "user_id": user_id,
                "action": f"Expense - {expense_id} deleted by user {user.name}",
            }
        )

        # Step 6: Delete the expense itself
        db.delete(expense)

        # Commit all changes at once
        db.commit()
        return {"status": "success", "message": "Expense deleted successfully"}

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500, detail="An error occurred while deleting the expense."
        )


class GroupCreateRequest(BaseModel):
    user_id: int
    group_name: str
    participants: List[int]  # List of user IDs participating in the group


class GroupGetResponse(BaseModel):
    group_id: int
    group_name: str
    participants: List[User]  # List of user IDs participating in the group


@app.get(
    "/groups/{group_id}",
    status_code=status.HTTP_200_OK,
    response_model=GroupGetResponse,
)
async def get_group(
    user_id: int, group_id: int, session: Session = Depends(get_session)
):
    data = None
    try:
        query = select(User).where(User.id == user_id)
        users = session.exec(query).all()
        if not users:
            raise HTTPException(status_code=400, detail="Invalid User")
        user = users[0]
        # Step 1: Create the Group
        group = session.get(Group, group_id)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        data = GroupGetResponse(
            group_id=group.id,
            group_name=group.name,
            participants=[user for user in group.members],
        )
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail="Failed to create group")

    return data


@app.post("/groups", status_code=status.HTTP_201_CREATED)
async def create_group(
    request: GroupCreateRequest, session: Session = Depends(get_session)
):
    try:
        query = select(User).where(User.id == request.user_id)
        users = session.exec(query).all()
        if not users:
            raise HTTPException(status_code=400, detail="Invalid User")
        user = users[0]
        # Step 1: Create the Group
        new_group = Group(name=request.group_name)
        session.add(new_group)
        session.flush()
        # Step 2: Add Participants to UserGroupLink
        user_group_links = []
        activity_links = []
        for user_id in request.participants:
            # Check if the user exists
            result = session.exec(select(User).where(User.id == user_id)).all()
            if not result:
                raise HTTPException(status_code=400, detail=f"Participant not found")

            # Create a link between the user and the group
            user_group_link = UserGroupLink(user_id=user_id, group_id=new_group.id)
            user_group_links.append(user_group_link)

            # Step 3: Create Activity Log
            activity_links.append(
                Activity(
                    action=f"New group, {new_group.name} created by {user.name}",
                    user_id=user_id,
                    group_id=new_group.id,
                    activity_type=ActivityTypes.GROUP_CREATED,
                    timestamp=datetime.utcnow(),
                )
            )
        session.add_all(activity_links)
        session.add_all(user_group_links)

        # Commit all changes
        session.commit()
    except SQLAlchemyError as e:
        session.rollback()  # Rollback in case of any error
        print(f"Transaction failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to create group")

    return {"group_id": new_group.id, "message": "Group created successfully"}


@app.put("/groups/{group_id}", status_code=status.HTTP_200_OK)
async def modify_group(
    group_id: int, request: GroupCreateRequest, session: Session = Depends(get_session)
):
    try:
        # Step 1: Verify that the user making the request exists
        query = select(User).where(User.id == request.user_id)
        users = session.exec(query).all()
        if not users:
            raise HTTPException(status_code=400, detail="Invalid User")
        user = users[0]

        # Step 2: Get the group to modify
        group = session.get(Group, group_id)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")

        existing_members = {member.id for member in group.members}

        # Step 3: Delete UserGroupLink associations
        user_group_links = session.exec(
            select(UserGroupLink).where(UserGroupLink.group_id == group_id)
        ).all()
        for link in user_group_links:
            session.delete(link)

        # Step 4: Add participants with a get-or-create approach
        user_group_links = []
        activity_links = []
        for user_id in request.participants:
            # Create a new link if one does not exist
            user_group_link = UserGroupLink(user_id=user_id, group_id=group.id)
            user_group_links.append(user_group_link)
            if user_id in existing_members:
                continue
            # Log this addition as an activity
            activity_links.append(
                Activity(
                    action=f"Added participant to group {group.name} by {user.name}",
                    user_id=user_id,
                    group_id=group.id,
                    activity_type=ActivityTypes.UPDATED_GROUP,
                    timestamp=datetime.utcnow(),
                )
            )

        # Step 5: Add all new links and activities to the session
        session.add_all(activity_links)
        session.add_all(user_group_links)

        # Commit the changes
        session.commit()

    except SQLAlchemyError as e:
        session.rollback()  # Rollback if there's an error
        print(f"Transaction failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to modify group")

    return {"group_id": group.id, "message": "Group updated successfully"}


@app.delete("/groups/{group_id}")
async def delete_group(group_id: int, session: Session = Depends(get_session)):
    try:
        # Step 1: Fetch the group
        group = session.get(Group, group_id)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")

        # Step 2: Delete UserGroupLink associations
        user_group_links = session.exec(
            select(UserGroupLink).where(UserGroupLink.group_id == group_id)
        ).all()
        for link in user_group_links:
            session.delete(link)

        # Step 3: Update Activities to set group_id to null
        activities = session.exec(
            select(Activity).where(Activity.group_id == group_id)
        ).all()
        for activity in activities:
            activity.group_id = None
            session.add(activity)  # mark as dirty to update the DB

        # Delete the group debt summaries
        group_deby_summaries = session.exec(
            select(GroupDebtSummary).where(GroupDebtSummary.group_id == group_id)
        ).all()
        for group_debt_summary in group_deby_summaries:
            session.delete(group_debt_summary)

        # Step 5: Delete the Group entry
        session.delete(group)

        # Commit all changes
        session.commit()

    except SQLAlchemyError as e:
        session.rollback()  # Rollback in case of any error
        print(f"Transaction failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete group")

    return {"message": "Group deleted successfully"}


class SettlementResponse(SQLModel):
    id: int
    creditor_id: int
    creditor_name: str
    debtor_id: int
    debtor_name: str
    amount: float
    created_at: datetime
    group_id: Optional[int]


@app.get("/api/settlements", response_model=List[SettlementResponse])
async def list_settlements(
    user_id: int = Query(...),
    group_id: Optional[int] = Query(None),
    session: Session = Depends(get_session),
):
    # Define the query to fetch settlements based on group_id and user_id criteria
    query = select(Settlement).where(
        or_((Settlement.creditor_id == user_id), (Settlement.debtor_id == user_id))
    )

    # Apply the group filter if a group_id is provided; otherwise, filter for untagged settlements
    if group_id is not None:
        query = query.where(Settlement.group_id == group_id)
    else:
        query = query.where(Settlement.group_id.is_(None))

    # Add sorting by created_at in descending order
    query = query.order_by(Settlement.created_at.desc())
    # Execute the query
    settlements = session.exec(query).all()
    data = []
    for settlement in settlements:
        creditor_name = session.get(User, settlement.creditor_id).name
        debtor_name = session.get(User, settlement.debtor_id).name
        data_dict = {
            **settlement.dict(),
            "creditor_name": creditor_name,
            "debtor_name": debtor_name,
        }
        data.append(SettlementResponse(**data_dict))
    return data


# Endpoint to get detail for a single expenses
@app.get("/api/expenses/{expense_id}", response_model=ExpenseDetailResponse)
async def get_expense_detail(expense_id: int, session: Session = Depends(get_session)):
    # Fetch expenses for the specified group
    expense_statement = select(Expense).where(Expense.id == expense_id)
    expenses = session.exec(expense_statement).all()
    if not expenses:
        raise HTTPException(status_code=404, detail="Expense not found")
    expense = expenses[0]
    # Build detailed expense information

    # Query ExpenseParticipantLink to get amount owed for each participant
    participant_links_statement = select(ExpenseParticipantLink).where(
        ExpenseParticipantLink.expense_id == expense.id
    )
    participant_links = session.exec(participant_links_statement).all()

    # Construct participant information with amount owed
    participants = [
        {
            "id": link.user_id,
            "name": session.get(User, link.user_id).name,
            "amount_owed": link.amount_owed,
        }
        for link in participant_links
    ]

    # Append detailed expense information
    expense_data = {
        "id": expense.id,
        "amount": expense.amount,
        "description": expense.description,
        "paid_by": {
            "id": expense.paid_by.id,
            "name": expense.paid_by.name,
        },
        "participants": participants,
        "created_at": expense.created_at,
    }

    return ExpenseDetailResponse(**expense_data)


@app.get("/users/{user_id}/activities", response_model=List[Activity])
async def get_user_activities(
    user_id: int,
    session: Session = Depends(get_session),  # Dependency to get the session
):
    user = session.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    statement = (
        select(Activity)
        .where(Activity.user_id == user_id)
        .order_by(Activity.timestamp.desc())
    )
    activities = session.exec(statement)
    return activities.all()


class TagCreateRequest(BaseModel):
    user_id: int
    tag_name: str


@app.post("/api/tags/", response_model=Tag)
async def create_tag(
    request: TagCreateRequest, session: Session = Depends(get_session)
):
    tag_name = request.tag_name
    user_id = request.user_id
    statement = select(Tag).where(Tag.name == tag_name, Tag.user_id == user_id)
    existing_tag = session.exec(statement).first()

    if existing_tag:
        raise HTTPException(status_code=400, detail="Tag already exists for this user.")

    tag = Tag(name=tag_name, user_id=user_id)
    session.add(tag)
    session.commit()
    session.refresh(tag)

    return tag


from sqlalchemy.sql import func


@app.get("/api/tags/{user_id}")
async def list_tags(user_id: int, session: Session = Depends(get_session)):
    """
    List tags for a user, ordered by the latest associated expense date.
    Includes the total amount of expenses for each tag.
    """
    # Query to fetch tags with total amount and latest expense date
    statement = (
        select(
            Tag,
            func.coalesce(func.sum(SelfManagementExpense.amount), 0).label(
                "total_amount"
            ),
            func.coalesce(
                func.max(SelfManagementExpense.created_at), datetime.min
            ).label("latest_expense_date"),
        )
        .join(
            SelfManagementExpense, Tag.id == SelfManagementExpense.tag_id, isouter=True
        )
        .where(Tag.user_id == user_id)
        .group_by(Tag.id)
        .order_by(
            func.coalesce(
                func.max(SelfManagementExpense.created_at), datetime.min
            ).desc()
        )
    )
    results = session.exec(statement).all()

    # Combine tag data with total amounts and latest expense date
    tags_with_totals = [
        {
            "id": tag.id,
            "name": tag.name,
            "user_id": tag.user_id,
            "total_amount": total_amount,
        }
        for tag, total_amount, _ in results
    ]

    return tags_with_totals


@app.delete("/api/tags/{tag_id}", status_code=204)
def delete_tag(
    tag_id: int, user_id: int = Query(...), session: Session = Depends(get_session)
):
    """
    Delete a tag by ID. Validates if the tag belongs to the user.
    Updates related activity records, removes expenses, and deletes the tag.
    """
    tag = session.get(Tag, tag_id)

    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    if tag.user_id != user_id:
        raise HTTPException(status_code=403, detail="Tag does not belong to the user")

    # Fetch associated expenses
    associated_expenses = (
        session.query(SelfManagementExpense)
        .filter(SelfManagementExpense.tag_id == tag_id)
        .all()
    )
    expense_ids = [expense.id for expense in associated_expenses]

    # Update activities for all associated expenses in bulk
    if expense_ids:
        session.query(Activity).filter(
            Activity.self_expense_id.in_(expense_ids)
        ).update({"self_expense_id": None}, synchronize_session=False)

    # Delete associated expenses
    for expense in associated_expenses:
        session.delete(expense)

    # Delete the tag
    session.delete(tag)
    session.commit()


class SelfExpenseCreateRequest(BaseModel):
    amount: float
    user_id: int
    tag_id: int
    description: Optional[str] = (None,)


@app.post("/api/self-expenses/", response_model=SelfManagementExpense)
async def create_self_expense(
    request: SelfExpenseCreateRequest,
    session: Session = Depends(get_session),
):
    # Validate the tag
    tag = session.get(Tag, request.tag_id)
    if not tag or tag.user_id != request.user_id:
        raise HTTPException(status_code=400, detail="Invalid or unauthorized tag.")

    # Create the expense
    expense = SelfManagementExpense(
        amount=request.amount,
        user_id=request.user_id,
        description=request.description,
        tag_id=request.tag_id,
    )
    session.add(expense)
    session.commit()
    session.refresh(expense)

    # Log activity
    activity = Activity(
        action=f"Created self expense with tag {tag.name} for amount ₹{expense.amount}",
        user_id=request.user_id,
        self_expense_id=expense.id,
        activity_type=ActivityTypes.CREATED_EXPENSE,
    )
    session.add(activity)
    session.commit()
    session.refresh(activity)

    return expense


@app.put("/api/self-expenses/{expense_id}", response_model=SelfManagementExpense)
async def update_self_expense(
    expense_id: int,
    request: SelfExpenseCreateRequest,
    session: Session = Depends(get_session),
):
    # Fetch the expense
    expense = session.get(SelfManagementExpense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found.")

    # Validate ownership
    if expense.user_id != request.user_id:
        raise HTTPException(
            status_code=403, detail="Unauthorized to update this expense."
        )

    # Update fields if provided
    if request.amount is not None:
        expense.amount = request.amount
    if request.description is not None:
        expense.description = request.description

    # Commit changes
    session.add(expense)
    session.commit()
    session.refresh(expense)

    # Log activity
    activity = Activity(
        action=f"Updated self expense with ID {expense.id}",
        user_id=request.user_id,
        self_expense_id=expense.id,
        activity_type=ActivityTypes.UPDATED_EXPENSE,
    )
    session.add(activity)
    session.commit()
    session.refresh(activity)

    return expense


@app.get("/api/self-expenses/{user_id}/", response_model=List[SelfManagementExpense])
async def list_self_expenses(user_id: int, session: Session = Depends(get_session)):
    cursor = select(SelfManagementExpense).where(
        SelfManagementExpense.user_id == user_id
    )
    expenses = session.exec(cursor).all()
    return expenses


@app.delete("/api/self-expenses/{expense_id}", status_code=204)
async def delete_self_expense(
    expense_id: int, user_id: int, session: Session = Depends(get_session)
):
    # Fetch the expense
    expense = session.get(SelfManagementExpense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found.")

    # Validate ownership
    if expense.user_id != user_id:
        raise HTTPException(
            status_code=403, detail="Unauthorized to delete this expense."
        )

    # Update associated activities
    session.query(Activity).filter(Activity.self_expense_id == expense_id).update(
        {"self_expense_id": None}
    )

    # Delete the expense
    session.delete(expense)
    session.commit()


@app.get("/api/tags/{tag_id}/expenses", response_model=List[SelfManagementExpense])
async def list_self_expenses_by_tag(
    tag_id: int, session: Session = Depends(get_session)
):
    """
    List self-management expenses for a given tag.
    """
    cursor = (
        select(SelfManagementExpense)
        .where(SelfManagementExpense.tag_id == tag_id)
        .order_by(SelfManagementExpense.created_at.desc())
    )
    expenses = session.exec(cursor).all()

    if not expenses:
        raise HTTPException(
            status_code=404, detail="No expenses found for the given tag."
        )

    return expenses


handler = Mangum(app)
