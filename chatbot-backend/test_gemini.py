
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
print(f"API Key found: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    print("API Key is missing!")
    exit(1)

try:
    genai.configure(api_key=api_key)
    print("Listing available models:")
    for m in genai.list_models():
        print(f"- {m.name}")
except Exception as e:
    print(f"Error: {e}")
