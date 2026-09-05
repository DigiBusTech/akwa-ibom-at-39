import React from "react";

interface AkwaIbomMapProps {
  className?: string;
  size?: number;
  fill?: string;
}

/**
 * Commemorative SVG silhouette of Akwa Ibom State map
 * Filled with solid vibrant orange (#FF6600) as per state identity guidelines.
 */
export function AkwaIbomMap({
  className = "w-9 h-9",
  size = 36,
  fill = "#FF6600",
}: AkwaIbomMapProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Akwa Ibom State Map Silhouette"
      role="img"
    >
      <defs>
        <filter id="aks-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FF6600" floodOpacity="0.4" />
        </filter>
      </defs>
      {/* Akwa Ibom State Map Contour Silhouette */}
      <path
        d="M 48,10 
           C 54,12 60,15 65,19 
           C 68,22 70,26 69,30 
           C 74,33 79,37 81,42 
           C 83,47 80,51 77,55 
           C 80,59 83,63 85,68 
           C 86,72 82,75 78,77 
           C 75,81 70,84 64,85 
           C 58,88 52,90 46,90 
           C 38,90 32,88 27,85 
           C 23,82 20,77 21,72 
           C 22,66 25,61 24,56 
           C 23,51 20,46 22,41 
           C 24,36 29,32 31,27 
           C 34,22 38,16 42,12 
           Z"
        fill={fill}
        filter="url(#aks-glow)"
      />
      {/* Inner subtle geographic relief line indicating the capital heart (Uyo) */}
      <circle cx="51" cy="46" r="3" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}
