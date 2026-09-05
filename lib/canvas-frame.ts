/**
 * High-Fidelity 1080x1080 Akwa Ibom @ 39 Frame Canvas Renderer.
 * Strict Design System:
 * - Dimensions: 1080x1080 (1:1 Ratio for WhatsApp, Instagram, X, Facebook)
 * - Deep Green: #007A33
 * - Vibrant Orange: #FF6600
 * - Gold Accent: #FFD700
 * - 55% Canvas User Avatar with 15px Orange Border & Drop Shadow
 * - Clean Green Nameplate: Name (48px White) + Badge & Score (28px Gold)
 * - Massive "GRATITUDE" (120px)
 * - Orange & Green Dual Tiered Footer
 */

export interface FrameRenderOptions {
  canvas: HTMLCanvasElement;
  userImage: HTMLImageElement | null;
  userName: string;
  userLga?: string;
  badgeTitle: string;
  score: number;
  total: number;
  percentage?: number;
  submissionId: string;
  zoom: number;
  panX: number;
  panY: number;
}

export function renderAnniversaryFrame(options: FrameRenderOptions) {
  const {
    canvas,
    userImage,
    userName,
    badgeTitle,
    score,
    total,
    zoom,
    panX,
    panY,
  } = options;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = 1080;
  const H = 1080;
  canvas.width = W;
  canvas.height = H;

  // 1. Clean White Background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, W, H);

  // 2. Subtle Geometric Watermark Pattern at 3% Opacity
  ctx.save();
  ctx.strokeStyle = "rgba(0, 122, 51, 0.035)";
  ctx.lineWidth = 1.5;
  const step = 60;
  for (let x = 0; x <= W + step; x += step) {
    for (let y = 0; y <= H + step; y += step) {
      ctx.beginPath();
      ctx.moveTo(x, y - step / 2);
      ctx.lineTo(x + step / 2, y);
      ctx.lineTo(x, y + step / 2);
      ctx.lineTo(x - step / 2, y);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 102, 0, 0.03)";
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // 3. Top Left: ARISE Crest
  ctx.save();
  ctx.fillStyle = "#FF6600";
  // 7 radiating sunburst dots
  for (let i = 0; i < 7; i++) {
    const angle = (Math.PI / 8) * (i - 3) - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(105 + Math.cos(angle) * 36, 80 + Math.sin(angle) * 36, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#007A33";
  ctx.font = "900 36px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.fillText("ARISE", 65, 116);
  ctx.fillStyle = "#FF6600";
  ctx.font = "800 13px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.fillText("AKWA IBOM @ 39", 65, 134);
  ctx.restore();

  // 4. Top Right: 39th Anniversary Celebration Mark
  ctx.save();
  ctx.fillStyle = "#007A33";
  ctx.font = "900 70px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.fillText("3", 860, 122);
  ctx.fillStyle = "#FF6600";
  ctx.fillText("9", 908, 122);
  ctx.font = "800 18px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.fillText("th", 958, 80);
  ctx.fillStyle = "#555555";
  ctx.font = "800 12px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.fillText("ANNIVERSARY", 860, 140);
  ctx.fillStyle = "#007A33";
  ctx.fillText("CELEBRATION", 860, 155);
  ctx.restore();

  // 5. Central Portrait Portal (55% of canvas height/width)
  // Center: (540, 360), Radius: 285px (Diameter: 570px = 52.8% of 1080)
  const portalCX = 540;
  const portalCY = 360;
  const portalRadius = 285;

  // Heavy Drop Shadow for the Avatar
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.28)";
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 14;
  ctx.beginPath();
  ctx.arc(portalCX, portalCY, portalRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.restore();

  // Draw User Photo Clipped Inside Circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(portalCX, portalCY, portalRadius - 7, 0, Math.PI * 2);
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
    // Elegant Placeholder
    ctx.fillStyle = "#F8FAFC";
    ctx.fillRect(portalCX - portalRadius, portalCY - portalRadius, portalRadius * 2, portalRadius * 2);
    ctx.fillStyle = "#94A3B8";
    ctx.font = "bold 26px 'Inter', system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Upload Your Photo", portalCX, portalCY - 10);
    ctx.font = "500 16px 'Inter', system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#CBD5E1";
    ctx.fillText("1080x1080 Commemorative Avatar", portalCX, portalCY + 22);
  }
  ctx.restore();

  // Thick 15px Solid Border in Vibrant Orange (#FF6600)
  ctx.save();
  ctx.lineWidth = 15;
  ctx.strokeStyle = "#FF6600";
  ctx.beginPath();
  ctx.arc(portalCX, portalCY, portalRadius - 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();


  // 6. "I AM" Ribbon (Overlapping top of Green Box)
  const ribbonY = 615;
  ctx.save();
  ctx.fillStyle = "#FF6600";
  ctx.shadowColor = "rgba(255, 102, 0, 0.4)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  ctx.roundRect(portalCX - 85, ribbonY, 170, 36, 8);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 18px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("I AM", portalCX, ribbonY + 24);
  ctx.restore();

  // 7. Nameplate (The Green Box) Overlapping Avatar Bottom
  // Dimensions: 720 width x 116 height, centered at X=540, Y=645
  const plaqueW = 720;
  const plaqueH = 116;
  const plaqueX = portalCX - plaqueW / 2;
  const plaqueY = 645;

  ctx.save();
  ctx.fillStyle = "#007A33";
  ctx.shadowColor = "rgba(0, 122, 51, 0.38)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.beginPath();
  ctx.roundRect(plaqueX, plaqueY, plaqueW, plaqueH, 16);
  ctx.fill();
  ctx.restore();

  // Nameplate Line 1: User's Name in uppercase, ultra-bold, size 48px, White
  const cleanName = (userName || "PROUD CITIZEN").trim().toUpperCase();
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF";
  let nameFontSize = 48;
  ctx.font = `900 ${nameFontSize}px 'Inter', system-ui, -apple-system, sans-serif`;
  while (ctx.measureText(cleanName).width > 670 && nameFontSize > 28) {
    nameFontSize -= 2;
    ctx.font = `900 ${nameFontSize}px 'Inter', system-ui, -apple-system, sans-serif`;
  }
  ctx.fillText(cleanName, portalCX, plaqueY + 48);

  // Nameplate Line 2: The Score and Badge in uppercase, bold, size 28px, Gold (#FFD700)
  const badgeScoreText = `★ ${(badgeTitle || "AKWA IBOM CITIZEN").toUpperCase()} • ${score}/${total}`;
  ctx.fillStyle = "#FFD700";
  let badgeFontSize = 28;
  ctx.font = `800 ${badgeFontSize}px 'Inter', system-ui, -apple-system, sans-serif`;
  while (ctx.measureText(badgeScoreText).width > 670 && badgeFontSize > 18) {
    badgeFontSize -= 2;
    ctx.font = `800 ${badgeFontSize}px 'Inter', system-ui, -apple-system, sans-serif`;
  }
  ctx.fillText(badgeScoreText, portalCX, plaqueY + 92);
  ctx.restore();

  // 8. Connecting Motto
  ctx.save();
  ctx.fillStyle = "#0F172A";
  ctx.font = "900 24px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("WE ARE AKWA IBOMITES", portalCX, 792);
  ctx.restore();

  // 9. Celebrating 39 shades of GRATITUDE
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#007A33";
  ctx.font = "700 24px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.fillText("Celebrating 39 shades of", portalCX, 824);

  // Massive "GRATITUDE" (size 120px) in Vibrant Orange (#FF6600)
  ctx.font = "900 120px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#FF6600";
  ctx.fillText("GRATITUDE", portalCX, 922);

  // Subtext: "...the journey continues"
  ctx.fillStyle = "#007A33";
  ctx.font = "italic 700 20px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.fillText("...the journey continues • Land of Promise", portalCX, 955);
  ctx.restore();

  // 10. Thick Orange Bar at bottom with white text: "#AkwaIbomAt39 #AriseAgenda"
  ctx.save();
  ctx.fillStyle = "#FF6600";
  ctx.fillRect(0, 982, W, 50);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 22px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("#AkwaIbomAt39   #AriseAgenda", portalCX, 1014);
  ctx.restore();

  // 11. Green Bar for Powered by Sabi AI watermark
  ctx.save();
  ctx.fillStyle = "#007A33";
  ctx.fillRect(0, 1032, W, 48);
  ctx.fillStyle = "#ECFDF5";
  ctx.font = "700 13px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Powered by Sabi AI Technologies Ltd (www.sabiaitech.com) • Founder: Uyouko Nathaniel Ekpo", portalCX, 1061);
  ctx.restore();
}
