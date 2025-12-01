import Groq from "groq-sdk";
import { NextResponse } from "next/server";

// Helper function to retry API calls
async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
}

// Helper function to clean and validate JSON
function cleanAndParseJSON(rawOutput) {
  let cleaned = rawOutput.trim();
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/```json\s*/g, "").replace(/```\s*/g, "");
  
  // Extract JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt to fix common JSON issues
    cleaned = cleaned
      .replace(/\n/g, " ")
      .replace(/\r/g, " ")
      .replace(/\t/g, " ")
      .replace(/\s+/g, " ")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); // Remove control characters
    
    return JSON.parse(cleaned);
  }
}

export async function POST(req) {
  try {
    console.log("GROQ KEY:", process.env.GROQ_API_KEY ? "FOUND" : "MISSING");

    const { taskDescription, code, language = "javascript" } = await req.json();
    
    // Validate input
    if (!taskDescription || !code) {
      return NextResponse.json(
        { error: "Task description and code are required" },
        { status: 400 }
      );
    }
    
    console.log("INPUT RECEIVED:", taskDescription.substring(0, 100), "...");

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Retry API call with exponential backoff
    const aiResponse = await retryWithBackoff(async () => {
      return await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are an expert code reviewer. You MUST respond with ONLY valid JSON. No markdown, no code blocks, no extra text. Just pure JSON.",
          },
          {
            role: "user",
            content: `Evaluate this ${language.toUpperCase()} coding task and return ONLY a JSON object with no additional text or formatting.

Task: ${taskDescription}

Code (Language: ${language}):
${code}

Return this EXACT JSON structure (ensure all strings are on single lines with no line breaks):
{
  "score": <number 0-100>,
  "strengths": "<4-6 sentences describing what is good>",
  "weaknesses": "<4-6 sentences describing issues>",
  "improvements": "<5-8 sentences with specific suggestions>"
}

CRITICAL: Return ONLY the JSON object. No markdown, no backticks, no explanation.`,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
        max_tokens: 1500,
      });
    });

    const rawOutput = aiResponse.choices[0].message.content.trim();
    console.log("AI RAW OUTPUT:", rawOutput.substring(0, 200), "...");

    // Parse and validate JSON
    let feedback;
    try {
      feedback = cleanAndParseJSON(rawOutput);
      console.log("✓ JSON parsed successfully");
    } catch (err) {
      console.error("JSON PARSE ERROR:", err);
      return NextResponse.json(
        {
          error: "AI returned invalid JSON format",
          details: err.message,
          hint: "Please try again or simplify your code submission",
        },
        { status: 400 }
      );
    }

    // Validate response structure
    if (
      typeof feedback.score !== "number" ||
      feedback.score < 0 ||
      feedback.score > 100
    ) {
      return NextResponse.json(
        { error: "Invalid score in AI response" },
        { status: 400 }
      );
    }

    if (
      typeof feedback.strengths !== "string" ||
      typeof feedback.weaknesses !== "string" ||
      typeof feedback.improvements !== "string"
    ) {
      return NextResponse.json(
        { error: "AI response missing required fields" },
        { status: 400 }
      );
    }

    // Ensure reasonable string lengths
    if (
      feedback.strengths.length < 10 ||
      feedback.weaknesses.length < 10 ||
      feedback.improvements.length < 10
    ) {
      return NextResponse.json(
        { error: "AI response too short, please try again" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("SERVER ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}