/**
 * Client-side Automatic Background Removal Utility.
 * Uses @imgly/background-removal with quantized model and pre-scaled input
 * for ultra-fast performance on mobile and desktop browsers.
 */

/**
 * Pre-downscales large smartphone camera images (e.g. 4000x3000) to max 800px
 * before AI inference. This reduces memory footprint and cuts processing time by 80%+.
 */
async function downscaleForInference(file: File | Blob, maxDim = 800): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width <= maxDim && height <= maxDim) {
        resolve(file);
        return;
      }

      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

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
        0.88
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

export async function removePhotoBackground(
  file: File | Blob,
  onProgress?: (status: string) => void
): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("Client-side only");
  }

  onProgress?.("Optimizing image for fast processing...");
  const optimizedInput = await downscaleForInference(file, 800);

  onProgress?.("Initializing AI background cutout engine...");

  // Dynamically import ESM from CDN via runtime evaluator to bypass webpack bundling
  const dynamicImport = new Function("specifier", "return import(specifier)");
  const bgModule: any = await dynamicImport(
    "https://esm.sh/@imgly/background-removal@1.7.0"
  );

  const removeBackgroundFn = bgModule.removeBackground || bgModule.default;
  if (typeof removeBackgroundFn !== "function") {
    throw new Error("removeBackground function not found in loaded module");
  }

  onProgress?.("Removing background... Please wait");

  const blob: Blob = await removeBackgroundFn(optimizedInput, {
    model: "isnet_quint8", // Quantized model: 4x smaller download & 3x faster inference
    rescale: true,
    progress: (key: string, current: number, total: number) => {
      if (key.includes("fetch")) {
        const pct = Math.min(99, Math.round((current / (total || 1)) * 100));
        onProgress?.(`Loading Fast AI Engine (${pct}%)...`);
      } else if (key.includes("compute")) {
        onProgress?.("Extracting portrait cutout...");
      } else {
        onProgress?.("Removing background... Please wait");
      }
    },
  });

  return blob;
}

