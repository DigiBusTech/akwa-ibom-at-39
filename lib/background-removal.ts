/**
 * Automatic Background Removal Utility.
 * Powered by Hugging Face Inference API (briaai/RMBG-1.4) via serverless proxy /api/remove-bg.
 * Pre-downscales images to max 800px on a hidden canvas before sending to keep payload light and fast.
 */

/**
 * Pre-downscales large smartphone camera images (e.g. 12MP / 4000x3000) to max 800px
 * and 0.85 JPEG quality on a hidden HTML5 canvas before sending to the background removal API.
 * Keeps payload size under 150KB for rapid network transport and minimal latency.
 */
export async function precompressUploadedImage(
  file: File | Blob,
  maxDimension = 800,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { naturalWidth: width, naturalHeight: height } = img;
      if (!width || !height) {
        width = img.width || 800;
        height = img.height || 800;
      }

      // Constrain strictly to maxDimension (800px)
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          resolve(blob || file);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

/**
 * Calls the serverless /api/remove-bg endpoint (powered by Hugging Face RMBG-1.4).
 * Throws on failure, timeout, or 429 rate limit so the UI can gracefully fallback.
 */
export async function removePhotoBackground(
  file: File | Blob,
  onProgress?: (status: string) => void,
  signal?: AbortSignal
): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("Client-side only");
  }

  if (signal?.aborted) {
    throw new Error("Aborted");
  }

  onProgress?.("Removing background... Please wait");

  // 1. Pre-compress to max 800px on hidden canvas
  const compressedBlob = await precompressUploadedImage(file, 800, 0.85);

  if (signal?.aborted) {
    throw new Error("Aborted");
  }

  // 2. Transmit to serverless /api/remove-bg route
  const formData = new FormData();
  formData.append("image", compressedBlob, "portrait.jpg");

  const response = await fetch("/api/remove-bg", {
    method: "POST",
    body: formData,
    signal,
  });

  if (!response.ok) {
    let errorDetail = "";
    try {
      const errJson = await response.json();
      errorDetail = errJson.error || response.statusText;
    } catch {
      errorDetail = response.statusText;
    }

    const error: any = new Error(
      errorDetail || `Background removal failed with status ${response.status}`
    );
    error.status = response.status;
    throw error;
  }

  const resultBlob = await response.blob();
  return resultBlob;
}



