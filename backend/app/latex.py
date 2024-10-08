from fastapi import APIRouter, Depends
from pydantic import BaseModel
from openai import OpenAI
import os

router = APIRouter(prefix="/english-to-latex")


def get_openai_client():
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class LatexOutput(BaseModel):
    latex: str


class EnglishInput(BaseModel):
    text: str


@router.post("/generate")
async def generate_latex(
    input: EnglishInput, client: OpenAI = Depends(get_openai_client)
):
    completion = client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "Convert the given English text to LaTeX. This is using the Mathematics extension of the tiptap editor. Write the latex directly. ",
            },
            {"role": "user", "content": input.text},
        ],
        response_format=LatexOutput,
    )

    latex_output = completion.choices[0].message.parsed
    return latex_output.latex
