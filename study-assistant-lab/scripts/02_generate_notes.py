from openai import OpenAI
from pydantic import BaseModel, Field
import os, json
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class Note(BaseModel):
    id: int = Field(..., ge=1, le=10)
    heading: str = Field(..., example="Mean Value Theorem")
    summary: str = Field(..., max_length=150)
    page_ref: int | None = Field(None, description="Page number in source PDF")

system = (
    "You are a study summarizer. "
    "Return exactly 10 unique notes that will help prepare for the exam. "
    "Respond *only* with valid JSON matching the Note[] schema."
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": system}
    ],
    response_format={"type": "json_object"}
)

data = json.loads(response.choices[0].message.content)
notes = [Note(**item) for item in data["notes"]]  

for note in notes:
    print(f"{note.id}. {note.heading} (p.{note.page_ref})\n→ {note.summary}\n")
