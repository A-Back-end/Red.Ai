import importlib.util
import sys
import os
from pydantic import ValidationError

#import the module from 'scripts/02_generate_notes.py'
script_path = os.path.join("scripts", "02_generate_notes.py")
spec = importlib.util.spec_from_file_location("generate_notes", script_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

Note = module.Note  

test_note = {
    "id": 1,
    "heading": "Neural Networks",
    "summary": "A model mimicking the human brain using layers of interconnected nodes.",
    "page_ref": 7
}

try:
    note = Note(**test_note)
    print("Validation passed:", note)
except ValidationError as e:
    print("Validation failed:", e)
