// lib/emotionAnalyzer.tsx

import axios from 'axios';

const EMOTION_API_URL = "https://api.emotion-analyzer.com/analyze"; // Hypothetical API endpoint
const EMOTION_API_KEY = process.env.NEXT_PUBLIC_EMOTION_API_KEY; // Ensure you have your API key in environment variables

interface EmotionResponse {
  emotion: string;
  confidence: number;
}

interface GifResponse {
  gifUrl: string;
}

export const getEmotionGif = async (text: string): Promise<string | null> => {
  try {
    // Analyze the text to determine the emotion
    const { data: emotionData } = await axios.post<EmotionResponse>(EMOTION_API_URL, {
      text,
      apiKey: EMOTION_API_KEY,
    });

    const emotion = emotionData.emotion;

    // Map emotion to a GIF using some hypothetical API or logic
    const { data: gifData } = await axios.get<GifResponse>(`https://api.gif-service.com/search?emotion=${emotion}`, {
      headers: { 'Authorization': `Bearer ${EMOTION_API_KEY}` }
    });

    return gifData.gifUrl;
  } catch (error) {
    console.error("Error fetching emotion GIF:", error);
    return null;
  }
};

export const getEmotionEmoji = async (text: string): Promise<string | null> => {
  try {
    // Analyze the text to determine the emotion
    const { data: emotionData } = await axios.post<EmotionResponse>(EMOTION_API_URL, {
      text,
      apiKey: EMOTION_API_KEY,
    });

    const emotion = emotionData.emotion;

    // Map emotion to an emoji (simple example, you can expand this mapping)
    const emotionToEmoji: { [key: string]: string } = {
      happy: "😊",
      sad: "😢",
      angry: "😡",
      surprised: "😲",
      love: "😍",
      // Add more mappings as needed
    };

    return emotionToEmoji[emotion] || null;
  } catch (error) {
    console.error("Error fetching emotion emoji:", error);
    return null;
  }
};
