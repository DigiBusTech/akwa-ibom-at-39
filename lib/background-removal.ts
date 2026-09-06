/**
 * Client-side Automatic Background Removal Utility.
 * Uses @imgly/background-removal via dynamic runtime browser import
 * to bypass Next.js Webpack 5 Terser `.mjs` bundling conflicts while keeping bundle size optimal.
 */

export async function removePhotoBackground(
  file: File | Blob,
  onProgress?: (status: string) => void
): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("Client-side only");
  }

  onProgress?.("Initializing AI background cutout engine...");

  // Dynamically import ESM from CDN via runtime evaluator to bypass webpack bundling and TypeScript URL resolution
  const dynamicImport = new Function("specifier", "return import(specifier)");
  const bgModule: any = await dynamicImport(
    "https://esm.sh/@imgly/background-removal@1.7.0"
  );

  const removeBackgroundFn = bgModule.removeBackground || bgModule.default;
  if (typeof removeBackgroundFn !== "function") {
    throw new Error("removeBackground function not found in loaded module");
  }

  onProgress?.("Removing background... Please wait");

  const blob: Blob = await removeBackgroundFn(file, {
    progress: (key: string, current: number, total: number) => {
      if (key.includes("fetch")) {
        const pct = Math.round((current / (total || 1)) * 100);
        onProgress?.(`Loading AI model (${pct}%)...`);
      } else {
        onProgress?.("Removing background... Please wait");
      }
    },
  });

  return blob;
}
