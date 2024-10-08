# uvicorn app.main:app --reload --port 8000
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.multi_choice_question import router as multi_choice_question_router
from app.learning_page import router as learning_page_router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(multi_choice_question_router)
app.include_router(learning_page_router)


@app.get("/")
def read_root():
    return {"message": "Test hi world"}
