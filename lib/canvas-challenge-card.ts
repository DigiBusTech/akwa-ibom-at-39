/**
 * High-Fidelity 1080x1080 Akwa Ibom @ 39 Viral Challenge Scorecard Canvas Renderer.
 * - Instant 0-friction shareable bragging rights card (NO user photo required).
 * - Drives the "Great 31 LGA Heritage Showdown" leading up to September 23rd.
 * - Displays candidate name, badge emblem, official score/accuracy, LGA representation,
 *   and a catchy viral challenge message to spur mass sharing.
 */

export interface ChallengeCardRenderOptions {
  canvas: HTMLCanvasElement;
  userName: string;
  userLga?: string;
  badgeTitle: string;
  score: number;
  total: number;
  percentage?: number;
  submissionId: string;
}

export function renderChallengeCard(options: ChallengeCardRenderOptions) {
  const {
    canvas,
    userName,
    userLga = "Akwa Ibom",
    badgeTitle,
    score,
    total,
    percentage = Math.round((score / total) * 100),
  } = options;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = 1080;
  const H = 1080;
  canvas.width = W;
  canvas.height = H;

  // 1. Deep Obsidian-Emerald Gradient Background
  const bgGrad = ctx.createRadialGradient(W / 2, H * 0.42, 80, W / 2, H / 2, 750);
  bgGrad.addColorStop(0, "#0E2A1C");
  bgGrad.addColorStop(0.5, "#07170F");
  bgGrad.addColorStop(1, "#030A06");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 2. Commemorative Geometric Grid & Starburst Mesh
  ctx.save();
  ctx.strokeStyle = "rgba(0, 200, 83, 0.045)";
  ctx.lineWidth = 1.2;
  const gridStep = 60;
  for (let x = 0; x <= W; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Radiating celebratory dots
  ctx.fillStyle = "rgba(255, 102, 0, 0.08)";
  for (let x = 30; x <= W; x += 120) {
    for (let y = 30; y <= H; y += 120) {
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // 3. Ambient Glow Orbs
  ctx.save();
  const glowEmerald = ctx.createRadialGradient(180, 200, 10, 180, 200, 320);
  glowEmerald.addColorStop(0, "rgba(0, 122, 51, 0.35)");
  glowEmerald.addColorStop(1, "rgba(0, 122, 51, 0)");
  ctx.fillStyle = glowEmerald;
  ctx.beginPath();
  ctx.arc(180, 200, 320, 0, Math.PI * 2);
  ctx.fill();

  const glowOrange = ctx.createRadialGradient(900, 220, 10, 900, 220, 320);
  glowOrange.addColorStop(0, "rgba(255, 102, 0, 0.28)");
  glowOrange.addColorStop(1, "rgba(255, 102, 0, 0)");
  ctx.fillStyle = glowOrange;
  ctx.beginPath();
  ctx.arc(900, 220, 320, 0, Math.PI * 2);
  ctx.fill();

  const glowGold = ctx.createRadialGradient(540, 370, 20, 540, 370, 260);
  glowGold.addColorStop(0, "rgba(255, 215, 0, 0.22)");
  glowGold.addColorStop(1, "rgba(255, 215, 0, 0)");
  ctx.fillStyle = glowGold;
  ctx.beginPath();
  ctx.arc(540, 370, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. Outer Double Border Frame (Akwa Ibom State colors)
  ctx.save();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#FF6600";
  ctx.strokeRect(20, 20, W - 40, H - 40);

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 215, 0, 0.6)";
  ctx.strokeRect(28, 28, W - 56, H - 56);
  ctx.restore();

  // 5. Top Header Navigation Bar
  ctx.save();
  ctx.fillStyle = "#FF6600";
  for (let i = 0; i < 7; i++) {
    const angle = (Math.PI / 8) * (i - 3) - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(90 + Math.cos(angle) * 26, 68 + Math.sin(angle) * 26, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#00D154";
  ctx.font = "900 28px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.fillText("ARISE", 125, 74);
  ctx.fillStyle = "#FF8533";
  ctx.font = "800 12px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.fillText("AKWA IBOM @ 39", 125, 90);
  ctx.restore();

  // Countdown to Sept 23rd Jubilee Pill
  const targetDate = new Date("2026-09-23T00:00:00Z");
  const now = new Date();
  const diffDays = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const countdownText = diffDays > 0 ? `⏳ ${diffDays} DAYS TO SEPT 23 JUBILEE` : `🎉 STATEHOOD DAY IS HERE!`;

  ctx.save();
  const pillW = 320;
  const pillH = 40;
  const pillX = W - 60 - pillW;
  const pillY = 56;
  ctx.fillStyle = "rgba(255, 102, 0, 0.15)";
  ctx.strokeStyle = "rgba(255, 102, 0, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 20);
  // 6. The Great 31 LGA Heritage Battle Ribbon
  ctx.save();
  const battleRibbonY = 125;
  const ribbonW = 960;
  const ribbonH = 82;
  const ribbonX = (W - ribbonW) / 2;

  ctx.fillStyle = "rgba(0, 122, 51, 0.25)";
  ctx.strokeStyle = "rgba(0, 209, 84, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(ribbonX, battleRibbonY, ribbonW, ribbonH, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#FFD700";
  ctx.font = "900 13px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("⚔️ THE 31 LGA & DIASPORA HERITAGE SHOWDOWN ⚔️", W / 2, battleRibbonY + 26);

  const lgaDisplay = (userLga || "AKWA IBOM STATE").trim().toUpperCase();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 22px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`PROUDLY REPRESENTING:  ${lgaDisplay}`, W / 2, battleRibbonY + 60);
  ctx.restore();

  // 7. Central Candidate Showcase & Badge Emblem
  const centerCX = 540;
  const emblemCY = 330;
  const emblemRadius = 88;

  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#FFD700";
  ctx.shadowColor = "rgba(255, 215, 0, 0.6)";
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.arc(centerCX, emblemCY, emblemRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#FF6600";
  ctx.beginPath();
  ctx.arc(centerCX, emblemCY, emblemRadius - 8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#071D12";
  ctx.beginPath();
  ctx.arc(centerCX, emblemCY, emblemRadius - 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Draw Emblem Icon
  drawEmblemIcon(ctx, centerCX, emblemCY, badgeTitle);

  // 8. Candidate Full Name
  ctx.save();
  const cleanName = (userName || "PATRIOTIC CITIZEN").trim().toUpperCase();
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 12;

  let nameFontSize = 46;
  ctx.font = `900 ${nameFontSize}px 'Inter', system-ui, -apple-system, sans-serif`;
  while (ctx.measureText(cleanName).width > 860 && nameFontSize > 28) {
    nameFontSize -= 2;
    ctx.font = `900 ${nameFontSize}px 'Inter', system-ui, -apple-system, sans-serif`;
  }
  ctx.fillText(cleanName, centerCX, 474);
  ctx.restore();

  // 9. Badge Title Pill
  ctx.save();
  const badgePillW = 460;
  const badgePillH = 46;
  const badgePillX = centerCX - badgePillW / 2;
  const badgePillY = 498;

  const badgeGrad = ctx.createLinearGradient(badgePillX, 0, badgePillX + badgePillW, 0);
  if (badgeTitle.includes("Legend")) {
    badgeGrad.addColorStop(0, "rgba(255, 179, 0, 0.25)");
    badgeGrad.addColorStop(0.5, "rgba(255, 215, 0, 0.4)");
    badgeGrad.addColorStop(1, "rgba(255, 102, 0, 0.25)");
  } else if (badgeTitle.includes("Ambassador")) {
    badgeGrad.addColorStop(0, "rgba(0, 209, 84, 0.25)");
    badgeGrad.addColorStop(0.5, "rgba(0, 255, 128, 0.35)");
    badgeGrad.addColorStop(1, "rgba(0, 150, 60, 0.25)");
  } else {
    badgeGrad.addColorStop(0, "rgba(255, 102, 0, 0.25)");
    badgeGrad.addColorStop(0.5, "rgba(255, 140, 0, 0.35)");
    badgeGrad.addColorStop(1, "rgba(255, 69, 0, 0.25)");
  }

  ctx.fillStyle = badgeGrad;
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(badgePillX, badgePillY, badgePillW, badgePillH, 23);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#FFD700";
  ctx.font = "900 18px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`★  ${badgeTitle.toUpperCase()}  ★`, centerCX, badgePillY + 30);
  ctx.restore();

  // 10. Dual Metric Score Cards
  ctx.save();
  const cardY = 568;
  const cardW = 440;
  const cardH = 132;
  const gap = 24;
  const leftX = centerCX - cardW - gap / 2;
  const rightX = centerCX + gap / 2;

  drawStatBox(ctx, leftX, cardY, cardW, cardH, {
    label: "HERITAGE SCORE",
    value: `${score} / ${total}`,
    accentColor: "#00E676",
    subtext: "Official 15-Question Statehood Assessment",
  });

  drawStatBox(ctx, rightX, cardY, cardW, cardH, {
    label: "HERITAGE ACCURACY",
    value: `${percentage}%`,
    accentColor: "#FF9100",
    subtext: percentage >= 80 ? "Top Tier Statehood Knowledge" : "Proud Civic Participation",
  });
  ctx.restore();

  // 11. Catchy Viral Challenge Banner (The Call-To-Arms!)
  ctx.save();
  const chalY = 730;
  const chalW = 960;
  const chalH = 176;
  const chalX = (W - chalW) / 2;

  const chalGrad = ctx.createLinearGradient(chalX, chalY, chalX + chalW, chalY + chalH);
  chalGrad.addColorStop(0, "rgba(255, 102, 0, 0.18)");
  chalGrad.addColorStop(0.5, "rgba(0, 122, 51, 0.25)");
  chalGrad.addColorStop(1, "rgba(255, 215, 0, 0.16)");

  ctx.fillStyle = chalGrad;
  ctx.strokeStyle = "rgba(255, 102, 0, 0.7)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(chalX, chalY, chalW, chalH, 22);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#FF6600";
  ctx.font = "900 24px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🥊 CAN YOUR LGA BEAT MY SCORE? 🥊", centerCX, chalY + 44);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 21px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.fillText(
    `I just put ${score}/${total} (${percentage}%) on the board for ${lgaDisplay}!`,
    centerCX,
    chalY + 84
  );

  ctx.fillStyle = "#A7F3D0";
  ctx.font = "600 17px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.fillText(
    "Top 3 LGAs with highest score & participation will be celebrated on Sept 23rd Statehood Day.",
    centerCX,
    chalY + 118
  );

  ctx.fillStyle = "#FFD700";
  ctx.font = "800 18px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.fillText(
    "👉 Take the 3-minute quiz now: akwaibom39.ng/quiz",
    centerCX,
    chalY + 150
  );
  ctx.restore();

  // 12. Bottom Banner & Watermark
  ctx.save();
  const footerY = 935;

  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, footerY);
  ctx.lineTo(W - 60, footerY);
  ctx.stroke();

  ctx.fillStyle = "#FF8533";
  ctx.font = "800 18px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("#AkwaIbomAt39   #AriseAgenda   #31LGAShowdown   #September23rdJubilee", centerCX, footerY + 36);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "500 14px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.fillText(
    "Official Statehood Trivia & Civic Engagement Platform • Verification: akwaibom39.ng",
    centerCX,
    footerY + 66
  );

  ctx.fillStyle = "#64748B";
  ctx.font = "500 12px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.fillText(
    "Powered by Sabi AI Technologies Ltd (www.sabiaitech.com) • Founder: Uyouko Nathaniel Ekpo",
    centerCX,
    footerY + 92
  );
  ctx.restore();
}
function drawStatBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  data: { label: string; value: string; accentColor: string; subtext: string }
) {
  ctx.save();
  ctx.fillStyle = "rgba(10, 30, 20, 0.85)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#94A3B8";
  ctx.font = "800 13px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(data.label, x + w / 2, y + 28);

  ctx.fillStyle = data.accentColor;
  ctx.font = "900 48px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.fillText(data.value, x + w / 2, y + 82);

  ctx.fillStyle = "#64748B";
  ctx.font = "500 11px 'Inter', system-ui, -apple-system, sans-serif";
  ctx.fillText(data.subtext, x + w / 2, y + 112);
  ctx.restore();
}

function drawEmblemIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, badge: string) {
  ctx.save();
  ctx.translate(cx, cy);

  if (badge.includes("Legend")) {
    ctx.fillStyle = "#FFD700";
    ctx.strokeStyle = "#FFA000";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(-44, 26);
    ctx.lineTo(-44, -10);
    ctx.lineTo(-24, 8);
    ctx.lineTo(0, -32);
    ctx.lineTo(24, 8);
    ctx.lineTo(44, -10);
    ctx.lineTo(44, 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(0, -32, 5, 0, Math.PI * 2);
    ctx.arc(-44, -10, 4, 0, Math.PI * 2);
    ctx.arc(44, -10, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FF6600";
    ctx.fillRect(-32, 16, 12, 6);
    ctx.fillRect(-6, 16, 12, 6);
    ctx.fillRect(20, 16, 12, 6);
  } else if (badge.includes("Ambassador")) {
    ctx.fillStyle = "#00E676";
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 3;

    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const rOuter = 38;
      const rInner = 19;
      ctx.lineTo(Math.cos(angle) * rOuter, Math.sin(angle) * rOuter);
      ctx.lineTo(Math.cos(angle + Math.PI / 8) * rInner, Math.sin(angle + Math.PI / 8) * rInner);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FF6600";
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (badge.includes("Citizen")) {
    ctx.fillStyle = "#FF6600";
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(-32, -30);
    ctx.lineTo(32, -30);
    ctx.lineTo(32, 5);
    ctx.quadraticCurveTo(32, 34, 0, 44);
    ctx.quadraticCurveTo(-32, 34, -32, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#007A33";
    ctx.font = "900 16px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("39", 0, 6);
  } else {
    ctx.fillStyle = "#FF9100";
    ctx.strokeStyle = "#FF3D00";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, -36);
    ctx.quadraticCurveTo(22, -10, 12, 12);
    ctx.quadraticCurveTo(0, 32, -12, 12);
    ctx.quadraticCurveTo(-22, -10, 0, -36);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(0, 2, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

