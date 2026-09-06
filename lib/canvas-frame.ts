/**
 * Official State-Approved Akwa Ibom @ 39 Anniversary DP Frame Canvas Renderer.
 * - Canvas Dimensions: 1080 x 1350 (4:5 Aspect Ratio)
 * - Base Template: /frames/official-state-frame-v2.png
 * - Foreground Layer (Nameplate & Lower Banner): /frames/official-state-frame-foreground-v2.png
 * - Automatic background-removed portrait sits seamlessly over the central orange patterned motif.
 * - Foreground overlay ensures portrait sits cleanly behind the "I AM" badge and green nameplate.
 */

export interface FrameRenderOptions {
  canvas: HTMLCanvasElement;
  userImage: HTMLImageElement | null;
  userName: string;
  userLga?: string;
  badgeTitle?: string;
  score?: number;
  total?: number;
  percentage?: number;
  submissionId?: string;
  zoom: number;
  panX: number;
  panY: number;
  onRenderComplete?: () => void;
}

let cachedBaseImage: HTMLImageElement | null = null;
let cachedForegroundImage: HTMLImageElement | null = null;
let preloadPromise: Promise<[HTMLImageElement, HTMLImageElement]> | null = null;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export function preloadOfficialFrame(): Promise<[HTMLImageElement, HTMLImageElement]> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Browser only"));
  }
  if (
    cachedBaseImage &&
    cachedBaseImage.complete &&
    cachedBaseImage.naturalWidth > 0 &&
    cachedForegroundImage &&
    cachedForegroundImage.complete &&
    cachedForegroundImage.naturalWidth > 0
  ) {
    return Promise.resolve([cachedBaseImage, cachedForegroundImage]);
  }

  if (preloadPromise) return preloadPromise;

  preloadPromise = Promise.all([
    loadImage("/frames/official-state-frame-v2.png"),
    loadImage("/frames/official-state-frame-foreground-v2.png"),
  ]).then(([base, foreground]) => {
    cachedBaseImage = base;
    cachedForegroundImage = foreground;
    return [base, foreground];
  });

  return preloadPromise;
}

export function renderAnniversaryFrame(options: FrameRenderOptions) {
  const {
    canvas,
    userImage,
    userName,
    userLga,
    badgeTitle,
    score,
    total,
    zoom,
    panX,
    panY,
    onRenderComplete,
  } = options;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = 1080;
  const H = 1350;
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;

  const drawScene = (baseImg: HTMLImageElement | null, fgImg: HTMLImageElement | null) => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, W, H);

    // 1. Draw Base Official Template (Background & Orange Shape Motif)
    if (baseImg && baseImg.complete && baseImg.naturalWidth > 0) {
      ctx.drawImage(baseImg, 0, 0, W, H);
    }

    // 2. Draw User Portrait (Cutout over Orange Shape, Behind Green Nameplate)
    const targetCX = 538;
    const targetCY = 440;

    if (userImage && userImage.complete && userImage.naturalWidth > 0) {
      const iw = userImage.naturalWidth;
      const ih = userImage.naturalHeight;
      const baseScale = Math.max(620 / iw, 540 / ih);
      const drawW = Math.round(iw * baseScale * zoom);
      const drawH = Math.round(ih * baseScale * zoom);
      const drawX = Math.round(targetCX - drawW / 2 + panX);
      const drawY = Math.round(targetCY - drawH / 2 + panY);

      // Create an offscreen buffer to feather the bottom edge seamlessly
      // Prevents harsh horizontal cutoffs and blends into the orange motif
      const portraitCanvas = document.createElement("canvas");
      portraitCanvas.width = drawW;
      portraitCanvas.height = drawH;
      const pCtx = portraitCanvas.getContext("2d");

      if (pCtx) {
        // Draw user image onto offscreen buffer
        pCtx.drawImage(userImage, 0, 0, drawW, drawH);

        // Apply smooth transparency gradient mask to bottom 18-20%
        const fadeHeight = Math.max(drawH * 0.20, 80);
        const fadeStartY = drawH - fadeHeight;

        pCtx.globalCompositeOperation = "destination-out";
        const maskGrad = pCtx.createLinearGradient(0, fadeStartY, 0, drawH);
        maskGrad.addColorStop(0, "rgba(0, 0, 0, 0)");       // 0% transparent (100% visible)
        maskGrad.addColorStop(0.25, "rgba(0, 0, 0, 0.10)"); // Subtle start of feather
        maskGrad.addColorStop(0.55, "rgba(0, 0, 0, 0.40)"); // Soft mid feather
        maskGrad.addColorStop(0.80, "rgba(0, 0, 0, 0.75)"); // Near transparent
        maskGrad.addColorStop(1, "rgba(0, 0, 0, 1.0)");      // 100% erased (feathered to transparent)

        pCtx.fillStyle = maskGrad;
        pCtx.fillRect(0, fadeStartY, drawW, fadeHeight);
        pCtx.globalCompositeOperation = "source-over"; // Reset buffer composite

        // Draw the feathered portrait onto the main canvas
        ctx.save();
        ctx.drawImage(portraitCanvas, drawX, drawY, drawW, drawH);
        ctx.restore();
      } else {
        // Fallback standard draw
        ctx.save();
        ctx.drawImage(userImage, drawX, drawY, drawW, drawH);
        ctx.restore();
      }
    } else {
      // Interactive placeholder card positioned over the orange shape
      ctx.save();
      const pw = 360;
      const ph = 150;
      const px = targetCX - pw / 2;
      const py = targetCY - ph / 2;

      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      if (typeof ctx.roundRect === "function") {
        ctx.beginPath();
        ctx.roundRect(px, py, pw, ph, 20);
        ctx.fill();
      } else {
        ctx.fillRect(px, py, pw, ph);
      }

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 24px 'Montserrat', 'Inter', system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("TAP TO UPLOAD PHOTO", targetCX, targetCY - 16);

      ctx.font = "600 16px 'Montserrat', 'Inter', system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#FFD700";
      ctx.fillText("AI Auto Background Cutout", targetCX, targetCY + 18);
      ctx.restore();
    }

    // 3. Draw Foreground Overlay (Green Nameplate & Official Lower Banner)
    // Ensures user's lower portrait sits cleanly behind the green box and does not obstruct text.
    if (fgImg && fgImg.complete && fgImg.naturalWidth > 0) {
      ctx.drawImage(fgImg, 0, 0, W, H);
    }

    // 4. Dynamic Text on Orange Badge & Green Nameplate
    const cleanName = (userName || "PROUD CITIZEN").trim().toUpperCase();

    // 4a. Draw "I AM" Prefix with Official Drop Shadow
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 23px 'Montserrat Bold', 'Montserrat', 'Georgia', system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText("I AM", 403, 703);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.restore();

    // Determine subtitle line
    let subtitleText = "";
    if (badgeTitle && (badgeTitle.toLowerCase().includes("none") || badgeTitle === "Official Name Only")) {
      subtitleText = "";
    } else if (badgeTitle && score !== undefined && total !== undefined && total > 0) {
      subtitleText = `${badgeTitle.toUpperCase()} • ${score}/${total}`;
    } else if (badgeTitle && badgeTitle.trim().length > 0 && !badgeTitle.toLowerCase().includes("none") && badgeTitle !== "Proud Akwa Ibomite") {
      subtitleText = badgeTitle.toUpperCase();
    } else if (userLga && userLga.trim().length > 0 && userLga !== "Akwa Ibom") {
      subtitleText = `${(badgeTitle || "PROUD AKWA IBOMITE").toUpperCase()}, ${userLga.toUpperCase()} LGA`;
    }

    const textX = 355;
    const maxTextWidth = 380;

    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const nameY = subtitleText ? 748 : 769;
    const subY = 788;

    // Render User Name with Bold Serif/Sans font & Canvas Drop Shadow
    let nameSize = subtitleText ? 30 : 34;
    ctx.font = `700 ${nameSize}px 'Georgia', 'Merriweather', 'Montserrat Bold', 'Montserrat', serif`;
    while (ctx.measureText(cleanName).width > maxTextWidth && nameSize > 16) {
      nameSize -= 1;
      ctx.font = `700 ${nameSize}px 'Georgia', 'Merriweather', 'Montserrat Bold', 'Montserrat', serif`;
    }

    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(cleanName, textX, nameY);

    // Render Subtitle / LGA / Heritage Badge (Line 2, White)
    if (subtitleText) {
      let subSize = 16;
      ctx.font = `700 ${subSize}px 'Montserrat', 'Inter', system-ui, sans-serif`;
      while (ctx.measureText(subtitleText).width > maxTextWidth && subSize > 11) {
        subSize -= 1;
        ctx.font = `700 ${subSize}px 'Montserrat', 'Inter', system-ui, sans-serif`;
      }
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 1.5;
      ctx.shadowOffsetY = 1.5;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(subtitleText, textX, subY);
    }

    // Reset shadow properties to prevent accidental bleed
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.restore();

    if (onRenderComplete) {
      onRenderComplete();
    }
  };

  if (
    cachedBaseImage &&
    cachedBaseImage.complete &&
    cachedBaseImage.naturalWidth > 0 &&
    cachedForegroundImage &&
    cachedForegroundImage.complete &&
    cachedForegroundImage.naturalWidth > 0
  ) {
    drawScene(cachedBaseImage, cachedForegroundImage);
  } else {
    preloadOfficialFrame()
      .then(([base, fg]) => drawScene(base, fg))
      .catch(() => drawScene(null, null));
  }
}


