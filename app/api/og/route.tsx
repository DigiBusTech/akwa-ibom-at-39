import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = (searchParams.get("name") || "PROUD CITIZEN").trim().toUpperCase();
  const score = searchParams.get("score") || "15";
  const total = searchParams.get("total") || "15";
  const badge = (searchParams.get("badge") || "PURE AKWA IBOM LEGEND").trim().toUpperCase();

  // 1080x1080 High-Fidelity Vector Card for Open Graph Previews
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080" style="background:#ffffff; font-family:system-ui, -apple-system, sans-serif;">
  <defs>
    <pattern id="akwaGrid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="#007A33" stroke-width="1.5" stroke-opacity="0.035" />
      <circle cx="30" cy="30" r="2.5" fill="#FF6600" fill-opacity="0.03" />
    </pattern>
    <filter id="avatarShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000000" flood-opacity="0.25" />
    </filter>
    <filter id="greenPlaqueShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#007A33" flood-opacity="0.35" />
    </filter>
  </defs>

  <rect width="1080" height="1080" fill="#FFFFFF" />
  <rect width="1080" height="1080" fill="url(#akwaGrid)" />

  <!-- Top Left: ARISE Crest -->
  <g transform="translate(65, 75)">
    <circle cx="38" cy="8" r="4.5" fill="#FF6600" />
    <circle cx="20" cy="14" r="4.5" fill="#FF6600" />
    <circle cx="6" cy="28" r="4.5" fill="#FF6600" />
    <circle cx="56" cy="14" r="4.5" fill="#FF6600" />
    <circle cx="70" cy="28" r="4.5" fill="#FF6600" />
    <text x="0" y="58" font-size="38" font-weight="900" fill="#007A33" letter-spacing="-1">ARISE</text>
    <text x="0" y="78" font-size="14" font-weight="800" fill="#FF6600" letter-spacing="1">AKWA IBOM @ 39</text>
  </g>

  <!-- Top Right: 39th Anniversary Mark -->
  <g transform="translate(860, 75)">
    <text x="0" y="60" font-size="70" font-weight="900" fill="#007A33">3</text>
    <text x="48" y="60" font-size="70" font-weight="900" fill="#FF6600">9</text>
    <text x="96" y="22" font-size="20" font-weight="800" fill="#FF6600">th</text>
    <text x="0" y="80" font-size="12" font-weight="800" fill="#64748B" letter-spacing="1">ANNIVERSARY</text>
    <text x="0" y="96" font-size="12" font-weight="800" fill="#007A33" letter-spacing="1">CELEBRATION</text>
  </g>

  <!-- Central User Avatar (55% canvas diameter = 570px) -->
  <g transform="translate(540, 360)">
    <circle cx="0" cy="0" r="285" fill="#F8FAFC" filter="url(#avatarShadow)" />
    <circle cx="0" cy="0" r="275" fill="#F1F5F9" stroke="#FF6600" stroke-width="15" />
    <text x="0" y="30" text-anchor="middle" font-size="120" font-weight="900" fill="#FF6600">39</text>
    <text x="0" y="80" text-anchor="middle" font-size="22" font-weight="700" fill="#64748B">Land of Promise</text>
  </g>



  <!-- "I AM" Ribbon -->
  <g transform="translate(540, 615)">
    <rect x="-85" y="0" width="170" height="36" rx="8" fill="#FF6600" />
    <text x="0" y="24" text-anchor="middle" font-size="18" font-weight="900" fill="#FFFFFF" letter-spacing="1">I AM</text>
  </g>

  <!-- Nameplate (The Green Box #007A33) -->
  <g transform="translate(540, 645)" filter="url(#greenPlaqueShadow)">
    <rect x="-360" y="0" width="720" height="116" rx="16" fill="#007A33" />
    <!-- Line 1: User's Name (48px White Bold) -->
    <text x="0" y="48" text-anchor="middle" font-size="${name.length > 20 ? '36' : '48'}" font-weight="900" fill="#FFFFFF" letter-spacing="0.5">${escapeXml(name)}</text>
    <!-- Line 2: Badge & Score (28px Gold) -->
    <text x="0" y="92" text-anchor="middle" font-size="28" font-weight="800" fill="#FFD700" letter-spacing="0.5">★ ${escapeXml(badge)} • ${score}/${total}</text>
  </g>

  <!-- Motto & Celebrating Text -->
  <text x="540" y="796" text-anchor="middle" font-size="24" font-weight="900" fill="#0F172A" letter-spacing="2">WE ARE AKWA IBOMITES</text>
  <text x="540" y="828" text-anchor="middle" font-size="24" font-weight="700" fill="#007A33">Celebrating 39 shades of</text>

  <!-- Massive GRATITUDE (120px) in #FF6600 -->
  <text x="540" y="926" text-anchor="middle" font-size="120" font-weight="900" fill="#FF6600" letter-spacing="-1">GRATITUDE</text>
  <text x="540" y="958" text-anchor="middle" font-size="20" font-weight="700" font-style="italic" fill="#007A33">...the journey continues • Land of Promise</text>

  <!-- Dual-Tiered Footer -->
  <!-- 1. Orange Bar -->
  <rect x="0" y="982" width="1080" height="50" fill="#FF6600" />
  <text x="540" y="1014" text-anchor="middle" font-size="22" font-weight="900" fill="#FFFFFF" letter-spacing="1">#AkwaIbomAt39   #AriseAgenda</text>

  <!-- 2. Green Bar -->
  <rect x="0" y="1032" width="1080" height="48" fill="#007A33" />
  <text x="540" y="1061" text-anchor="middle" font-size="13" font-weight="700" fill="#ECFDF5">Powered by Sabi AI Technologies Ltd (www.sabiaitech.com) • Founder: Uyouko Nathaniel Ekpo</text>
</svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

