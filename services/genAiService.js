const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.predictNextWord = async (text, tone) => {
  try {
    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `The user is typing a message. Suggest 3 likely next words or short phrases to complete:
      "${text}"
      Tone: ${tone || "neutral"}.
      Respond in JSON array like ["suggestion1", "suggestion2", "suggestion3"].`,
    });

    return extractJSONArray(response.text);
  } catch (error) {
    return null;
  }
};

exports.smartReplies = async (text, tone) => {
  try {
    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
      Suggest 3 short, natural replies to the message:
      "${text}"
      Tone: ${tone || "friendly"}.
      Respond in JSON array like ["reply1", "reply2", "reply3"].
    `,
    });

    return extractJSONArray(response.text);
  } catch (err) {
    return;
  }
};

function extractJSONArray(text) {
  try {
    text = text.replace(/```json|```/gi, "").trim();

    const matches = text.match(/\[[\s\S]*?\]/g);
    if (!matches) return [];

    for (const m of matches) {
      try {
        const parsed = JSON.parse(m);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        continue;
      }
    }

    return text
      .replace(/[\[\]"`]/g, "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch (err) {
    console.error("extractJSONArray error:", err);
    return [];
  }
}
