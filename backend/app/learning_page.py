from fastapi import APIRouter
from pydantic import BaseModel
from .utils import load_json, save_json

# Assumptions for simplicity:
# - there is only one learning page

router = APIRouter(prefix="/learning_page")

LEARNING_PAGE_FILE = "database/learning_page.json"


class LearningPage(BaseModel):
    content: str


@router.post("/upsert")
async def upsert_learning_page(page: LearningPage):
    save_json(page.model_dump(), LEARNING_PAGE_FILE)
    return {"message": "Learning page created/updated successfully"}


@router.get("/")
async def get_learning_page():
    page = load_json(LEARNING_PAGE_FILE)
    return page or {"content": ""}
