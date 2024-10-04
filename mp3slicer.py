from pydub import AudioSegment
import os

# Function to slice the MP3 file into 5-second pieces
def slice_mp3(file_path, output_folder):
    # Load the audio file
    audio = AudioSegment.from_mp3(file_path)
    
    # Calculate duration of the audio in milliseconds
    duration = len(audio)
    
    # Slice duration: 5 seconds = 5000 ms
    slice_duration = 5000
    
    # Create the output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    # Number of slices
    slice_count = 20  # You requested 20 slices
    
    # Loop to slice the audio
    for i in range(slice_count):
        start = i * slice_duration
        end = start + slice_duration
        
        # Break if end exceeds the audio length
        if start >= duration:
            print("Not enough audio length to create more slices.")
            break
        
        # Get the slice
        slice_audio = audio[start:end]
        
        # Naming logic: 1-10 for English, 11-20 for Russian
        if i < 10:
            file_name = f"stage_{i+1}_Xuinity_en.mp3"
        else:
            file_name = f"stage_{i-9}_Xuinity_ru.mp3"
        
        # Save the slice with the appropriate name
        slice_audio.export(os.path.join(output_folder, file_name), format="mp3")
        
        print(f"Saved {file_name}")

# Example usage
file_path = "your_audio.mp3"  # Your input MP3 file
output_folder = "public"  # Folder to save sliced files

slice_mp3(file_path, output_folder)
