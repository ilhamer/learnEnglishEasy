import os
import json
import re
from gtts import gTTS
import time

def sanitize_filename(text):
    """Replace illegal characters in filenames"""
    return re.sub(r'[\\/*?:"<>|]', "_", text)

def generate_conversation_audio():
    # Path configuration
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    INPUT_JSON = os.path.join(BASE_DIR, "data", "conversations.json")
    OUTPUT_DIR = os.path.join(BASE_DIR, "audio", "conversation")
    
    try:
        # Read JSON data
        with open(INPUT_JSON, "r", encoding="utf-8") as f:
            conversations = json.load(f)
        
        # Create output directory
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
        for conversation in conversations:
            # Generate audio for each conversation using its title
            audio_filename = conversation.get("audio_file", f"{sanitize_filename(conversation['title'])}.mp3")
            output_path = os.path.join(OUTPUT_DIR, audio_filename)
            
            if os.path.exists(output_path):
                print(f"✅ Audio already exists: {audio_filename}")
                continue
                
            print(f"🔈 Generating audio for: {conversation['title']} ({audio_filename})")
            
            # Combine all English dialog into one text
            dialog_text = " ".join([line["english"] for line in conversation["dialog"]])
            
            # Generate English pronunciation
            tts = gTTS(text=dialog_text, lang="en", slow=False)
            tts.save(output_path)
            time.sleep(1)  # Delay to avoid rate limiting
            
            # Update audio path in data if not already specified
            if "audio_file" not in conversation:
                conversation["audio_file"] = audio_filename
        
        # Save JSON with updated audio paths
        with open(INPUT_JSON, "w", encoding="utf-8") as f:
            json.dump(conversations, f, indent=2, ensure_ascii=False)
            
        print("🎉 All conversation audio files generated successfully!")
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    generate_conversation_audio()