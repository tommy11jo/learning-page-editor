from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime

from .utils import load_json, save_json

# Assumptions for simplicity:
# - the question id is created on the client side for convenience
# - there is only one student
# - there will be few questions in total (json storage is fine)

router = APIRouter(prefix="/multi_choice_question")

QUESTIONS_FILE = "database/questions.json"
SUBMISSIONS_FILE = "database/submissions.json"


class MultiChoiceQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_answer: int


class Submission(BaseModel):
    question_id: str
    selected_answer: int


@router.post("/upsert")
async def upsert_multi_choice_question(question: MultiChoiceQuestion):
    questions = load_json(QUESTIONS_FILE)
    question_index = next(
        (index for index, q in enumerate(questions) if q["id"] == question.id),
        None,
    )

    if question_index is None:
        questions.append(question.model_dump())
        message = "Multi-choice question created successfully"
    else:
        questions[question_index] = question.model_dump()
        message = "Multi-choice question updated successfully"

    save_json(questions, QUESTIONS_FILE)
    return {"message": message}


@router.post("/submit")
async def submit_answer(submission: Submission):
    questions = load_json(QUESTIONS_FILE)
    question = next((q for q in questions if q["id"] == submission.question_id), None)

    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")

    is_correct = question["correct_answer"] == submission.selected_answer

    submission_data = submission.model_dump()
    submission_data["is_correct"] = is_correct
    submission_data["timestamp"] = datetime.now().isoformat()

    submissions = load_json(SUBMISSIONS_FILE)

    existing_submission_index = next(
        (
            index
            for index, s in enumerate(submissions)
            if s["question_id"] == submission.question_id
        ),
        None,
    )

    if existing_submission_index is not None:
        submissions[existing_submission_index] = submission_data
    else:
        submissions.append(submission_data)

    save_json(submissions, SUBMISSIONS_FILE)

    return {"message": "Answer submitted successfully", "is_correct": is_correct}


@router.delete("/delete/{question_id}")
async def delete_multi_choice_question(question_id: str):
    questions = load_json(QUESTIONS_FILE)
    question_index = next(
        (index for index, q in enumerate(questions) if q["id"] == question_id),
        None,
    )

    if question_index is None:
        raise HTTPException(status_code=404, detail="Question not found")

    deleted_question = questions.pop(question_index)
    save_json(questions, QUESTIONS_FILE)
    return {
        "message": "Multi-choice question deleted successfully",
        "deleted_question": deleted_question,
    }
