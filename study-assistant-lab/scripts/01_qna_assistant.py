from openai import OpenAI
from pydantic import BaseModel, Field
import os, json, time
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

print("API KEY:", os.getenv("OPENAI_API_KEY"))

# Load assistant ID
with open("assistant_id.txt") as f:
    assistant_id = f.read().strip()

class Note(BaseModel):
    id: int = Field(..., ge=1, le=10)
    heading: str = Field(..., example="Mean Value Theorem")
    summary: str = Field(..., max_length=150)
    page_ref: int | None = Field(None, description="Page number in source PDF")

# Create a thread
thread = client.beta.threads.create()

# Send the summarization prompt
prompt = (
    "You are a study summarizer. "
    "Return exactly 10 unique notes that will help prepare for the exam. "
    "Respond *only* with valid JSON matching the Note[] schema. "
    "Cite page numbers from the PDF where possible."
)
client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content=prompt,
)

# Run the assistant
run = client.beta.threads.runs.create(
    thread_id=thread.id,
    assistant_id=assistant_id,
    response_format={"type": "json_object"}
)

# Wait for completion
while run.status != "completed":
    time.sleep(1)
    run = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)

# Get the response
messages = client.beta.threads.messages.list(thread_id=thread.id)
for msg in messages.data:
    if msg.role == "assistant":
        try:
            data = json.loads(msg.content[0].text.value)
            notes = [Note(**item) for item in data["notes"]]
            for note in notes:
                print(f"{note.id}. {note.heading} (p.{note.page_ref})\n→ {note.summary}\n")
        except Exception as e:
            print("Error parsing notes:", e)
        break


