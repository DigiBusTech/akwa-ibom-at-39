/**
 * Official State-Approved Akwa Ibom @ 39 Anniversary DP Frame Canvas Renderer.
 * - Canvas Dimensions: 1080 x 1350 (4:5 Aspect Ratio)
 * - Official Frame: /frames/official-state-frame.png
 * - Portal Cutout: Centered at (538, 432), Radius 312px
 * - Dynamic Text: Green Badge centered at (537, 766) with Montserrat / Inter
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

let cachedFrameImage: HTMLImageElement | null = null;
let frameLoadPromise: Promise<HTMLImageElement> | null = null;

export function preloadOfficialFrame(): Promise<HTMLImageElement> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Browser only"));
  }
  if (cachedFrameImage && cachedFrameImage.complete && cachedFrameImage.naturalWidth > 0) {
    return Promise.resolve(cachedFrameImage);
  }
  if (frameLoadPromise) return frameLoadPromise;

  frameLoadPromise = new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      cachedFrameImage = img;
      resolve(img);
    };
    img.onerror = (err) => {
      console.error("Failed to load official state frame:", err);
      reject(err);
    };
    img.src = "/frames/official-state-frame.png";
  });

  return frameLoadPromise;
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

  const drawScene = (frameImg: HTMLImageElement | null) => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0A2012";
    ctx.fillRect(0, 0, W, H);

    const portalCX = 538;
    const portalCY = 432;
    const portalRadius = 312;

    // 1. Draw User Photo clipped inside circle behind frame
    ctx.save();
    ctx.beginPath();
    ctx.arc(portalCX, portalCY, portalRadius + 2, 0, Math.PI * 2);
    ctx.clip();

    if (userImage && userImage.complete && userImage.naturalWidth > 0) {
      const iw = userImage.naturalWidth;
      const ih = userImage.naturalHeight;
      const baseScale = Math.max((portalRadius * 2) / iw, (portalRadius * 2) / ih);
      const drawW = iw * baseScale * zoom;
      const drawH = ih * baseScale * zoom;
      const drawX = portalCX - drawW / 2 + panX;
      const drawY = portalCY - drawH / 2 + panY;
      ctx.drawImage(userImage, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = "#0d2b1a";
      ctx.fillRect(portalCX - portalRadius, portalCY - portalRadius, portalRadius * 2, portalRadius * 2);

      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      ctx.arc(portalCX, portalCY - 30, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(portalCX, portalCY + 180, 160, Math.PI, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#E2E8F0";
      ctx.font = "900 28px 'Montserrat', 'Inter', system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("TAP TO UPLOAD PHOTO", portalCX, portalCY - 5);

      ctx.font = "600 18px 'Montserrat', 'Inter', system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#94A3B8";
      ctx.fillText("Position & Zoom Into Circle", portalCX, portalCY + 30);
    }
    ctx.restore();


    // 2. Draw Official Frame PNG Overlay (Layer 2)
    if (frameImg && frameImg.complete && frameImg.naturalWidth > 0) {
      ctx.drawImage(frameImg, 0, 0, W, H);
    }

    // 3. Draw Dynamic Text Badge (Layer 3: Centered over the Green Pill)
    const badgeCX = 537;
    const cleanName = (userName || "PROUD CITIZEN").trim().toUpperCase();

    // Determine subtitle line
    let subtitleText = "";
    if (badgeTitle && score !== undefined && total !== undefined && total > 0) {
      subtitleText = `★ ${badgeTitle.toUpperCase()} • ${score}/${total}`;
    } else if (userLga && userLga.trim().length > 0) {
      subtitleText = `★ PROUD AKWA IBOMITE • ${userLga.toUpperCase()}`;
    } else {
      subtitleText = "★ LAND OF PROMISE • 1987 - 2026";
    }

    const maxBadgeWidth = 390; // Safe width inside green box

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Text placement Y coordinates
    const nameY = subtitleText ? 766 : 778;
    const subY = 804;

    // Render User Name with Dynamic Scale-Down
    let nameSize = 36;
    ctx.font = `900 ${nameSize}px 'Montserrat', 'Inter', system-ui, -apple-system, sans-serif`;
    while (ctx.measureText(cleanName).width > maxBadgeWidth && nameSize > 16) {
      nameSize -= 1;
      ctx.font = `900 ${nameSize}px 'Montserrat', 'Inter', system-ui, -apple-system, sans-serif`;
    }

    // Subtle drop shadow for crisp visibility
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(cleanName, badgeCX, nameY);

    // Render Subtitle / LGA / Heritage Badge
    if (subtitleText) {
      let subSize = 18;
      ctx.font = `800 ${subSize}px 'Montserrat', 'Inter', system-ui, -apple-system, sans-serif`;
      while (ctx.measureText(subtitleText).width > maxBadgeWidth && subSize > 11) {
        subSize -= 1;
        ctx.font = `800 ${subSize}px 'Montserrat', 'Inter', system-ui, -apple-system, sans-serif`;
      }
      ctx.fillStyle = "#FFD700"; // Rich Gold
      ctx.shadowBlur = 3;
      ctx.fillText(subtitleText, badgeCX, subY);
    }

    ctx.restore();

    if (onRenderComplete) {
      onRenderComplete();
    }
  };

  // Check if frame is already loaded
  if (cachedFrameImage && cachedFrameImage.complete && cachedFrameImage.naturalWidth > 0) {
    drawScene(cachedFrameImage);
  } else {
    preloadOfficialFrame()
      .then((img) => drawScene(img))
      .catch(() => drawScene(null));
  }
}

