import { NextRequest, NextResponse } from "next/server";
import { Client } from "@gradio/client";

export const dynamic = "force-dynamic";
export const maxDuration = 45; // Max execution duration in seconds for Vercel functions

const SPACE_NAME = "briaai/BRIA-RMBG-1.4";

export async function POST(req: NextRequest) {
  let imageBlob: Blob;

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = (formData.get("image") || formData.get("file")) as File | null;
      if (!file) {
        return NextResponse.json({ error: "Missing image in form data" }, { status: 400 });
      }
      imageBlob = file;
    } else if (contentType.includes("application/json")) {
      const json = await req.json();
      if (!json.image) {
        return NextResponse.json({ error: "Missing image in JSON body" }, { status: 400 });
      }
      // Handle base64 string
      const base64Data = json.image.replace(/^data:image\/\w+;base64,/, "");
      const buf = Buffer.from(base64Data, "base64");
      imageBlob = new Blob([buf], { type: "image/jpeg" });
    } else {
      // Raw binary payload
      const arrayBuf = await req.arrayBuffer();
      imageBlob = new Blob([arrayBuf], { type: "image/jpeg" });
    }

    if (!imageBlob || imageBlob.size === 0) {
      return NextResponse.json({ error: "Empty image payload" }, { status: 400 });
    }
  } catch (parseError: any) {
    return NextResponse.json(
      { error: `Failed to parse upload payload: ${parseError?.message || "Unknown error"}` },
      { status: 400 }
    );
  }

  try {
    // 1. Connect directly to the free hosted HF Space
    const apiKey = process.env.HUGGINGFACE_API_KEY?.trim();
    const hasValidKey = apiKey && !apiKey.includes("xxxxxxxx");

    const client = await Client.connect(
      SPACE_NAME,
      hasValidKey ? { token: apiKey as `hf_${string}` } : undefined
    );

    // Normalize replica config root if needed
    if (client.config?.root?.endsWith("/config")) {
      client.config.root = client.config.root.replace(/\/config$/, "");
    }
    if (!client.api_info) {
      try {
        client.api_info = await client.view_api();
      } catch {
        // Fallback silently if info is already cached
      }
    }

    // 2. Pass the uploaded file/blob to the space predictor (fn_index 0)
    const result = await client.predict(0, [imageBlob]);

    // 3. Extract the transparent PNG image object/url from result.data[0]
    const fileData = (result.data as any[])?.[0];
    let downloadUrl: string | undefined = fileData?.url;

    if (!downloadUrl && fileData?.path) {
      const root = client.config?.root || "https://briaai-bria-rmbg-1-4.hf.space";
      downloadUrl = `${root}/file=${fileData.path}`;
    }

    if (!downloadUrl) {
      return NextResponse.json(
        { error: "Model space did not return an output file URL" },
        { status: 502 }
      );
    }

    // 4. Fetch the transparent PNG binary payload
    const imageResponse = await fetch(downloadUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: `Failed to download output image: ${imageResponse.status}` },
        { status: 502 }
      );
    }

    const pngBuffer = await imageResponse.arrayBuffer();

    // 5. Return PNG buffer to the frontend
    return new NextResponse(pngBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err: any) {
    console.warn("Gradio space inference error or queue timeout:", err);

    const errorMsg = String(err?.message || err);
    if (errorMsg.includes("queue") || errorMsg.includes("timeout") || errorMsg.includes("429")) {
      return NextResponse.json(
        { error: "Gradio queue is full or server busy. Using standard portrait mode." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: `Background removal failed: ${errorMsg}` },
      { status: 500 }
    );
  }
}
