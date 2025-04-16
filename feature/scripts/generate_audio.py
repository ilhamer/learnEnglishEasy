import os
import json
import re
from gtts import gTTS
import time

def sanitize_filename(text):
    """Replace illegal characters in filenames"""
    return re.sub(r'[\\/*?:"<>|]', "_", text)

def generate_english_audio():
    # Path configuration
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    INPUT_JSON = os.path.join(BASE_DIR, "data", "vocabulary.json")
    OUTPUT_DIR = os.path.join(BASE_DIR, "audio", "english")
    
    try:
        # Read JSON data
        with open(INPUT_JSON, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # Create output directory
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
        for item in data:
            # Use existing audio_file if specified, otherwise generate from word
            audio_filename = item.get("audio_file", f"{sanitize_filename(item['word'])}.mp3")
            output_path = os.path.join(OUTPUT_DIR, audio_filename)
            
            if os.path.exists(output_path):
                print(f"✅ Audio already exists: {audio_filename}")
                continue
                
            print(f"🔈 Generating audio for: {item['word']} ({audio_filename})")
            
            # Generate English pronunciation
            tts = gTTS(text=item["word"], lang="en", slow=False)
            tts.save(output_path)
            time.sleep(1)  # Delay to avoid rate limiting
            
            # Update audio path in data if not already specified
            if "audio_file" not in item:
                item["audio_file"] = os.path.join("audio", "english", audio_filename).replace("\\", "/")
        
        # Save JSON with updated audio paths
        with open(INPUT_JSON, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        print("🎉 All audio files generated successfully!")
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    generate_english_audio()