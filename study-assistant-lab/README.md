# Study Assistant Lab

Welcome to your **mini AI tutor** — a magic bridge from static PDFs to living knowledge,  
where questions meet answers and exam prep turns poetic.

---

## Part 1 — Q&A Assistant from PDFs (~60 min)

### Goal  
Build an assistant that listens to your study questions and finds answers from your PDFs.

### Project Structure

```plaintext
study-assistant-lab/
├─ README.md
├─ requirements.txt       # openai>=1.83.0, python-dotenv, pydantic
├─ .env.example           # Put your OPENAI_API_KEY here
├─ data/
│  └─ calculus_basics.pdf
├─ scripts/
│  ├─ 00_bootstrap.py     # Create or reuse assistant with file_search tool
│  ├─ 01_qna_assistant.py # Q&A assistant implementation
│  ├─ 02_generate_notes.py# Generate structured exam notes
│  └─ 99_cleanup.py       # Clean up resources
└─ tests/
   └─ test_notes_schema.py # Optional schema validation tests
```

Step 1: Bootstrap your assistant
assistant = client.assistants.create(
    name="Study Q&A Assistant",
    instructions=(
        "You are a helpful tutor. Use the knowledge in the attached files to answer questions. "
        "Cite sources where possible."
    ),
    model="gpt-4o-mini",
    tools=[{"type": "file_search"}]
)

Step 2: Upload your PDFs for knowledge retrieval
file_id = client.files.create(
    purpose="knowledge_retrieval",
    file=open("data/calculus_basics.pdf", "rb")
).id

client.assistants.update(
    assistant.id,
    tool_resources={"file_search": {"vector_store_files": [file_id]}}
)

Step 3: Interact with your assistant via threads
Try asking:

“Explain the difference between a definite and an indefinite integral in one paragraph.”
“Give me the statement of the Mean Value Theorem.”
Pro tip: Verify the answers reference chunk IDs from your PDF — proof that your assistant truly “reads” your materials.


Part 2 — Generate 10 Exam Notes (~45 min)

Goal
Craft exactly ten bite-sized, exam-ready notes in JSON format with strict validation — a symphony of concise wisdom.

1. Define your schema with Pydantic
from pydantic import BaseModel, Field

class Note(BaseModel):
    id: int = Field(..., ge=1, le=10)
    heading: str = Field(..., example="Mean Value Theorem")
    summary: str = Field(..., max_length=150)
    page_ref: int | None = Field(None, description="Page number in source PDF")
2. Generate notes using a JSON-mode prompt (02_generate_notes.py)
import json

system = (
    "You are a study summarizer. "
    "Return exactly 10 unique notes that will help prepare for the exam. "
    "Respond *only* with valid JSON matching the Note[] schema."
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "system", "content": system}],
    response_format={"type": "json_object"}
)

data = json.loads(response.choices[0].message.content)
notes = [Note(**item) for item in data["notes"]]  # Validate schema
3. Save or print your notes beautifully
with open("exam_notes.json", "w") as f:
    json.dump([note.dict() for note in notes], f, indent=2)

for note in notes:
    print(f"{note.id}. {note.heading}\n  {note.summary}\n  (Source: page {note.page_ref})\n")

