const { GoogleGenAI } = require("@google/genai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

exports.predictNextWord = async (text, tone) => {
  try {
    console.log("Using AI services");
    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
      The user is typing a message. Suggest 3 likely next words or short phrases to complete:
      "${text}"
      Tone: ${tone || "neutral"}.
      Respond in JSON array like ["suggestion1", "suggestion2", "suggestion3"].
    `,
    });

    console.log(response.text);

    return extractJSONArray(response.text);
  } catch (err) {
    return;
  }
};

exports.smartReplies = async (message, tone) => {
  try {
    console.log("Using AI services");
    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
      Suggest 3 short, natural replies to the message:
      "${message}"
      Tone: ${tone || "friendly"}.
      Respond in JSON array like ["reply1", "reply2", "reply3"].
    `,
    });

    console.log(response.text);

    return extractJSONArray(response.text);
  } catch (err) {
    return;
  }
};

function extractJSONArray(text) {
  try {
    // Remove code fences like ```json ... ```
    text = text.replace(/```json|```/gi, "").trim();

    // Find all JSON-like arrays inside
    const matches = text.match(/\[[\s\S]*?\]/g);
    if (!matches) return [];

    // Try to parse the first valid array
    for (const m of matches) {
      try {
        const parsed = JSON.parse(m);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        continue;
      }
    }

    // If nothing valid found, fallback to text splitting
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
