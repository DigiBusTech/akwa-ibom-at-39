import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // Max execution duration in seconds for Vercel functions

const HF_MODEL_URL = "https://api-inference.huggingface.co/models/briaai/RMBG-1.4";

export async function POST(req: NextRequest) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey.includes("xxxxxxxx")) {
    return NextResponse.json(
      { error: "HUGGINGFACE_API_KEY is not configured or is a placeholder" },
      { status: 503 }
    );
  }

  let imageBuffer: ArrayBuffer | Uint8Array;

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = (formData.get("image") || formData.get("file")) as File | null;
      if (!file) {
        return NextResponse.json({ error: "Missing image in form data" }, { status: 400 });
      }
      imageBuffer = await file.arrayBuffer();
    } else if (contentType.includes("application/json")) {
      const json = await req.json();
      if (!json.image) {
        return NextResponse.json({ error: "Missing image in JSON body" }, { status: 400 });
      }
      // Handle base64 string
      const base64Data = json.image.replace(/^data:image\/\w+;base64,/, "");
      const buf = Buffer.from(base64Data, "base64");
      imageBuffer = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    } else {
      // Raw binary payload
      imageBuffer = await req.arrayBuffer();
    }

    if (!imageBuffer || imageBuffer.byteLength === 0) {
      return NextResponse.json({ error: "Empty image payload" }, { status: 400 });
    }
  } catch (parseError: any) {
    return NextResponse.json(
      { error: `Failed to parse upload payload: ${parseError?.message || "Unknown error"}` },
      { status: 400 }
    );
  }

  // Call Hugging Face RMBG-1.4 Inference API with AbortSignal timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 28000);

  try {
    const hfRes = await fetch(HF_MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/octet-stream",
      },
      body: imageBuffer as BodyInit,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (hfRes.status === 429) {
      return NextResponse.json(
        { error: "Hugging Face rate limit exceeded (429). Server busy." },
        { status: 429 }
      );
    }

    if (hfRes.status === 503) {
      return NextResponse.json(
        { error: "Model is currently loading or server unavailable (503)." },
        { status: 503 }
      );
    }

    if (!hfRes.ok) {
      const errorText = await hfRes.text().catch(() => "Unknown Hugging Face error");
      return NextResponse.json(
        { error: `Hugging Face inference error (${hfRes.status}): ${errorText}` },
        { status: hfRes.status >= 400 && hfRes.status < 600 ? hfRes.status : 502 }
      );
    }

    const outputBuffer = await hfRes.arrayBuffer();

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError" || controller.signal.aborted) {
      return NextResponse.json(
        { error: "Background removal timed out after 28 seconds." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: `Inference proxy error: ${error?.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
