import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a helpful FAQ assistant for a car rental app.
Answer questions about: browsing cars, booking a car, canceling a booking, registration/login, and reviews.
Keep answers short (2-3 sentences), friendly, and in the same language the user writes in (Arabic or English).
If you don't know the answer, say you'll connect them with support instead of guessing.`;

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question },
      ],
    });

    const answer = response.choices[0].message.content;

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("FAQ chat error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}
