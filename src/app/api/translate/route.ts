import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text, targetLanguage } = await req.json();

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        translatedText: data.data.translations[0].translatedText,
      });
    } else {
      return NextResponse.json(
        { error: data.error.message },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
