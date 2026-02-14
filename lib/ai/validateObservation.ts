import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function validateObservationWithAI(observation: any) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
You are a scientific observation validator for a citizen science platform.

Check whether the following observation is scientifically reasonable.

Rules:
- Reject impossible environmental values.
- Reject unrealistic descriptions.
- Accept normal real-world observations.

Return ONLY valid JSON:
{
  "valid": true/false,
  "message": "short explanation"
}

Observation:
${JSON.stringify(observation)}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Gemini sometimes returns markdown, remove ```json
    const clean = text.replace(/```json|```/g, "").trim();

    return JSON.parse(clean);
  } catch (err) {
    console.error("Gemini validation failed:", err);

    // Fail-open strategy (important in production)
    return { valid: true, message: "AI validation skipped" };
  }
}