/**
 * Official State-Approved Akwa Ibom @ 39 Anniversary DP Frame Canvas Renderer.
 * - Canvas Dimensions: 1080 x 1350 (4:5 Aspect Ratio)
 * - Base Template: /frames/official-state-frame.png
 * - Foreground Layer (Nameplate & Lower Banner): /frames/official-state-frame-foreground.png
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
    loadImage("/frames/official-state-frame.png"),
    loadImage("/frames/official-state-frame-foreground.png"),
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
      const drawW = iw * baseScale * zoom;
      const drawH = ih * baseScale * zoom;
      const drawX = targetCX - drawW / 2 + panX;
      const drawY = targetCY - drawH / 2 + panY;

      ctx.save();
      ctx.drawImage(userImage, drawX, drawY, drawW, drawH);
      ctx.restore();
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

    // 4. Dynamic Text on Green Nameplate
    const cleanName = (userName || "PROUD CITIZEN").trim().toUpperCase();

    // Determine subtitle line
    let subtitleText = "";
    if (badgeTitle && score !== undefined && total !== undefined && total > 0) {
      subtitleText = `${badgeTitle.toUpperCase()} • ${score}/${total}`;
    } else if (userLga && userLga.trim().length > 0) {
      subtitleText = `${(badgeTitle || "PROUD AKWA IBOMITE").toUpperCase()}, ${userLga.toUpperCase()} LGA`;
    } else if (badgeTitle) {
      subtitleText = badgeTitle.toUpperCase();
    }

    const textX = 345;
    const maxTextWidth = 385;

    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const nameY = subtitleText ? 752 : 772;
    const subY = 788;

    // Render User Name (Line 1, Bold White)
    let nameSize = 30;
    ctx.font = `900 ${nameSize}px 'Montserrat', 'Inter', system-ui, -apple-system, sans-serif`;
    while (ctx.measureText(cleanName).width > maxTextWidth && nameSize > 16) {
      nameSize -= 1;
      ctx.font = `900 ${nameSize}px 'Montserrat', 'Inter', system-ui, -apple-system, sans-serif`;
    }

    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(cleanName, textX, nameY);

    // Render Subtitle / LGA / Heritage Badge (Line 2, White)
    if (subtitleText) {
      let subSize = 18;
      ctx.font = `700 ${subSize}px 'Montserrat', 'Inter', system-ui, -apple-system, sans-serif`;
      while (ctx.measureText(subtitleText).width > maxTextWidth && subSize > 11) {
        subSize -= 1;
        ctx.font = `700 ${subSize}px 'Montserrat', 'Inter', system-ui, -apple-system, sans-serif`;
      }
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowBlur = 3;
      ctx.fillText(subtitleText, textX, subY);
    }

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


