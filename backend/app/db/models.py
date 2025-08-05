from datetime import datetime
from enum import Enum
from typing import List, Optional

from sqlmodel import Column, Field, Relationship, SQLModel, String, UniqueConstraint


# Define an Enum for Activity Types
class ActivityTypes(str, Enum):
    CREATED_EXPENSE = "Created Expense"
    SETTLED_DEBT = "Settled Debt"
    UPDATED_EXPENSE = "Updated Expense"
    GROUP_CREATED = "Group Created"
    DELETED_EXPENSE = "Deleted Expense"
    UPDATED_GROUP = "Updated Group"


# Many-to-Many Link Table for Users and Groups
class UserGroupLink(SQLModel, table=True):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    group_id: int = Field(foreign_key="group.id", primary_key=True)


class UserBase(SQLModel):
    name: str
    email: str
    avatar_url: Optional[str] = None


class User(UserBase, table=True):
    id: int = Field(default=None, primary_key=True)
    groups: List["Group"] = Relationship(
        back_populates="members", link_model=UserGroupLink
    )
    expenses: List["Expense"] = Relationship(back_populates="paid_by")
    activities: List["Activity"] = Relationship(back_populates="user")

    # Update the relationship to use foreign_keys
    friends: List["Friendship"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"primaryjoin": "User.id == Friendship.user_id"},
    )
    self_management_expenses: List["SelfManagementExpense"] = Relationship(
        back_populates="user"
    )
    tags: List["Tag"] = Relationship(back_populates="user")


class Friendship(SQLModel, table=True):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    friend_id: int = Field(foreign_key="user.id", primary_key=True)

    # Explicitly specify the foreign keys for the user and friend relationships
    user: User = Relationship(
        back_populates="friends",
        sa_relationship_kwargs={"foreign_keys": "[Friendship.user_id]"},
    )
    friend: User = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Friendship.friend_id]"}
    )


class GroupBase(SQLModel):
    name: str
    description: Optional[str] = None
    settled: bool = Field(default=False)  # Mark group as settled


class Group(GroupBase, table=True):
    id: int = Field(default=None, primary_key=True)
    members: List[User] = Relationship(
        back_populates="groups", link_model=UserGroupLink
    )
    expenses: List["Expense"] = Relationship(back_populates="group")
    debt_summaries: List["GroupDebtSummary"] = Relationship(back_populates="group")
    activities: List["Activity"] = Relationship(back_populates="group")
    settlements: List["Settlement"] = Relationship(back_populates="group")


class GroupDebtSummary(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    group_id: Optional[int] = Field(foreign_key="group.id")
    creditor_id: int = Field(foreign_key="user.id")
    debtor_id: int = Field(foreign_key="user.id")
    amount_owed: float
    group: Group = Relationship(back_populates="debt_summaries")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ExpenseParticipantLink(SQLModel, table=True):
    expense_id: int = Field(foreign_key="expense.id", primary_key=True)
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    amount_owed: float = Field(default=0.0)


class ExpenseBase(SQLModel):
    amount: float
    description: str
    currency: str
    created_at: datetime
    paid_by_id: int = Field(foreign_key="user.id")
    group_id: Optional[int] = Field(foreign_key="group.id")


class Expense(ExpenseBase, table=True):
    id: int = Field(default=None, primary_key=True)
    participants: List[User] = Relationship(link_model=ExpenseParticipantLink)
    group: Group = Relationship(back_populates="expenses")
    paid_by: User = Relationship(
        back_populates="expenses", sa_relationship_kwargs={"viewonly": True}
    )


class ActivityBase(SQLModel):
    action: str
    user_id: int = Field(foreign_key="user.id")
    expense_id: Optional[int] = Field(default=None, foreign_key="expense.id")
    group_id: Optional[int] = Field(default=None, foreign_key="group.id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    activity_type: ActivityTypes = Field(
        sa_column=Column(String(50))
    )  # Set length to 50 or another suitable value
    self_expense_id: Optional[int] = Field(
        default=None, foreign_key="selfmanagementexpense.id"
    )


class Activity(ActivityBase, table=True):
    id: int = Field(default=None, primary_key=True)
    user: User = Relationship(
        back_populates="activities", sa_relationship_kwargs={"viewonly": True}
    )
    group: Optional[Group] = Relationship(
        back_populates="activities", sa_relationship_kwargs={"viewonly": True}
    )


class Settlement(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    creditor_id: int = Field(index=True)
    debtor_id: int = Field(index=True)
    amount: float  # Assuming the amount is a float for currency
    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )  # Set default to current UTC time
    group_id: Optional[int] = Field(
        default=None, foreign_key="group.id"
    )  # Optional field

    # Relationship with the Group table
    group: Optional["Group"] = Relationship(back_populates="settlements")


class SelfManagementExpenseBase(SQLModel):
    amount: float = Field(..., description="The amount of the expense.")
    description: Optional[str] = Field(
        default=None, description="Optional description of the expense."
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp of when the expense was created.",
    )
    user_id: int = Field(
        foreign_key="user.id",
        description="The ID of the user associated with this expense.",
    )
    tag_id: int = Field(
        foreign_key="tag.id", description="The ID of the associated tag."
    )  # Mandatory tag


class SelfManagementExpense(SelfManagementExpenseBase, table=True):
    id: int = Field(
        default=None, primary_key=True, description="Primary key for the expense."
    )

    # Relationships
    user: "User" = Relationship(back_populates="self_management_expenses")
    tag: "Tag" = Relationship(back_populates="expenses")


class TagBase(SQLModel):
    name: str = Field(..., description="The name of the tag.")
    user_id: int = Field(
        foreign_key="user.id", description="The ID of the user who owns this tag."
    )


class Tag(TagBase, table=True):
    id: int = Field(
        default=None, primary_key=True, description="Primary key for the tag."
    )

    # Relationships
    user: "User" = Relationship(back_populates="tags")
    expenses: List["SelfManagementExpense"] = Relationship(back_populates="tag")

    __table_args__ = (UniqueConstraint("name", "user_id", name="unique_user_tag"),)
