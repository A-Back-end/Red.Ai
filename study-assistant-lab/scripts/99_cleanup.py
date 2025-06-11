from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

with open("assistant_id.txt") as f:
    assistant_id = f.read().strip()

client.beta.assistants.delete(assistant_id)
print(f"Deleted assistant: {assistant_id}")

files = client.files.list().data
for f in files:
    if f.purpose == "knowledge_retrieval":
        client.files.delete(f.id)
        print(f"Deleted file: {f.filename} ({f.id})")
