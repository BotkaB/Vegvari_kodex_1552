// server/utils/jsonParser.js

export function safeJsonParse(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Üres vagy nem szöveges válasz érkezett a modelltől.");
  }

  let cleanedText = rawText.trim();

  if (cleanedText.startsWith("```json")) {
    cleanedText = cleanedText.replace(/^```json/, "").replace(/```$/, "").trim();
  } else if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText.replace(/^```/, "").replace(/```$/, "").trim();
  }

  try {
    return JSON.parse(cleanedText);
  } catch (err) {
    const firstBrace = cleanedText.indexOf("{");
    const lastBrace = cleanedText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const subJson = cleanedText.substring(firstBrace, lastBrace + 1);
      return JSON.parse(subJson);
    }
    throw err;
  }
}