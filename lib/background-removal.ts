/**
 * Client-side Automatic Background Removal Utility.
 * Uses @imgly/background-removal with quantized model and pre-scaled input
 * for ultra-fast performance on mobile and desktop browsers without OOM crashes.
 */

/**
 * Pre-downscales large smartphone camera images (e.g. 12MP / 4000x3000) to max 600px
 * and 0.7 JPEG quality on a hidden HTML5 canvas before sending to AI inference.
 * This guarantees fast inference and prevents mobile browser out-of-memory (OOM) crashes.
 */
export async function precompressUploadedImage(
  file: File | Blob,
  maxDimension = 600,
  quality = 0.7
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
        width = img.width || 600;
        height = img.height || 600;
      }

      // Constrain strictly to max 600px dimension
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

  // Yield to UI thread so spinner animates smoothly at 60fps
  await new Promise((resolve) => setTimeout(resolve, 50));
  if (signal?.aborted) throw new Error("Aborted");

  onProgress?.("Compressing image for fast AI processing...");
  const optimizedInput = await precompressUploadedImage(file, 600, 0.7);

  if (signal?.aborted) throw new Error("Aborted");
  await new Promise((resolve) => setTimeout(resolve, 30));

  onProgress?.("Initializing AI background cutout engine...");

  // Dynamically import ESM from CDN via runtime evaluator to bypass webpack bundling
  const dynamicImport = new Function("specifier", "return import(specifier)");
  const bgModule: any = await dynamicImport(
    "https://esm.sh/@imgly/background-removal@1.7.0"
  );

  if (signal?.aborted) throw new Error("Aborted");

  const removeBackgroundFn = bgModule.removeBackground || bgModule.default;
  if (typeof removeBackgroundFn !== "function") {
    throw new Error("removeBackground function not found in loaded module");
  }

  onProgress?.("Removing background... Please wait");
  await new Promise((resolve) => setTimeout(resolve, 20));

  const blob: Blob = await removeBackgroundFn(optimizedInput, {
    model: "isnet_quint8", // Quantized model: 4x smaller download & 3x faster inference
    rescale: true,
    progress: (key: string, current: number, total: number) => {
      if (signal?.aborted) return;
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

  if (signal?.aborted) throw new Error("Aborted");

  return blob;
}


