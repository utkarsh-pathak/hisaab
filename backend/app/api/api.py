from fastapi import APIRouter

api_router = APIRouter()


# Example endpoint
@api_router.get("/expenses")
async def get_expenses():
    return [{"id": 1, "description": "Dinner", "amount": 30}]
