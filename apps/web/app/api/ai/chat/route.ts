import { NextResponse } from "next/server";
import OpenAI from "openai";

// Force Node.js runtime
export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
});

// Dynamically load pdf parser + canvas polyfills
async function getPdfParser() {
  try {
    // Dynamic import prevents Turbopack bundling issue
    const canvas = await import("@napi-rs/canvas");

    if (!(global as any).DOMMatrix) {
      (global as any).DOMMatrix = canvas.DOMMatrix;
      (global as any).ImageData = canvas.ImageData;
      (global as any).Path2D = canvas.Path2D;
    }

    // @ts-ignore
    const pdfModule = await import("pdf-parse/lib/pdf-parse.js");

    return pdfModule.default || pdfModule;
  } catch (e) {
    console.error("Failed loading pdf parser:", e);
    return null;
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    try {
      const pdf = await getPdfParser();

      if (!pdf) {
        return `[PDF File: ${file.name}] (PDF parser unavailable)`;
      }

      const data = await pdf(buffer);

      return `[PDF File: ${file.name}]\n${data.text}`;
    } catch (e) {
      console.error("PDF parse error:", e);

      return `[PDF File: ${file.name}] (Could not parse text)`;
    }
  }

  if (file.type.startsWith("image/")) {
    return `[Image File: ${file.name}] (Image content)`;
  }

  return "";
}

// Convert image file to base64 for OpenAI Vision
async function fileToBase64(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const message = formData.get("message") as string;

    const files = formData.getAll("files") as File[];

    let context = "";

    const visionContent: any[] = [];

    // Process uploaded files
    for (const file of files) {
      if (file.type === "application/pdf") {
        console.log(`Processing PDF file: ${file.name}`);

        const text = await extractTextFromFile(file);

        console.log(`Extracted text length: ${text.length}`);

        context += text + "\n\n";
      } else if (file.type.startsWith("image/")) {
        const base64 = await fileToBase64(file);

        visionContent.push({
          type: "image_url",
          image_url: {
            url: base64,
          },
        });
      }
    }

    const systemPrompt = `
You are CarePulse Assistant, an AI that helps patients understand their medical reports and prescriptions.

INSTRUCTIONS:
1. Analyze the provided context (text from PDFs) and any attached images.
2. Answer the user's question or summarize the documents in simple, patient-friendly language.
3. If the user asks for a summary, provide:
   - Doctor's name / Clinic
   - Key findings or Diagnosis
   - Prescribed medications
   - Next steps

SAFETY GUARDRAILS:
- DO NOT provide personal medical diagnosis.
- DO NOT prescribe medications.
- DO NOT recommend dosage changes.
- ONLY reference information found in the uploaded documents.
- If unclear, say you cannot read that section.

DISCLAIMER:
Always end your response with:

_"I'm an AI assistant, not a doctor. This is informational only. Please consult a qualified clinician for medical advice."_
`;

    const userContent: any[] = [];

    if (context) {
      userContent.push({
        type: "text",
        text: `Context from uploaded PDF files:\n${context}`,
      });
    }

    if (message) {
      userContent.push({
        type: "text",
        text: `User Question: ${message}`,
      });
    } else if (files.length > 0) {
      userContent.push({
        type: "text",
        text: "Please summarize these documents for me.",
      });
    }

    // Add images
    visionContent.forEach((v) => userContent.push(v));

    if (userContent.length === 0) {
      return NextResponse.json({
        reply: "Please provide a message or upload a file.",
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      max_tokens: 1000,
    });

    const reply =
      response.choices[0]?.message?.content ||
      "I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI Chat Error:", error);

    return NextResponse.json(
      {
        reply:
          "Sorry, I encountered an error processing your request.",
      },
      { status: 500 }
    );
  }
}