
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("API Key missing")
    exit(1)

genai.configure(api_key=api_key)

print("Searching for a working model...")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(f"Testing model: {m.name}")
        try:
            model = genai.GenerativeModel(m.name)
            response = model.generate_content("Hello")
            print(f"SUCCESS! Working model found: {m.name}")
            with open("valid_model.txt", "w") as f:
                f.write(m.name)
            print(f"Response: {response.text}")
            break
        except Exception as e:
            print(f"Failed with {m.name}: {e}")
