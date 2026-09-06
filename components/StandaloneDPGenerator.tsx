"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Share2,
  Check,
  Copy,
  MessageCircle,
  HelpCircle,
  ArrowRight,
  User,
  MapPin,
  Award,
  Loader2
} from "lucide-react";
import { renderAnniversaryFrame, preloadOfficialFrame } from "@/lib/canvas-frame";
import { removePhotoBackground } from "@/lib/background-removal";
import { AKWA_IBOM_LGAS } from "@/types/database";

const POPULAR_BADGES = [
  "Proud Akwa Ibomite",
  "Heritage Ambassador",
  "ARISE Partner",
  "Dakkada Pioneer",
  "Land of Promise Patron",
  "Diaspora Patriot",
  "Statehood Champion",
];

export function StandaloneDPGenerator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [userName, setUserName] = useState("");
  const [userLga, setUserLga] = useState("Uyo");
  const [badgeTitle, setBadgeTitle] = useState("Proud Akwa Ibomite");
  const [customBadge, setCustomBadge] = useState("");
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgRemovalProgress, setBgRemovalProgress] = useState("");

  useEffect(() => {
    preloadOfficialFrame().catch(() => {});
  }, []);

  const activeBadge = customBadge.trim() ? customBadge.trim() : badgeTitle;

  const redraw = useCallback(() => {
    if (!canvasRef.current) return;
    renderAnniversaryFrame({
      canvas: canvasRef.current,
      userImage: imageObj,
      userName: userName || "PROUD CITIZEN",
      userLga,
      badgeTitle: activeBadge,
      zoom,
      panX,
      panY,
    });
  }, [imageObj, userName, userLga, activeBadge, zoom, panX, panY]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRemovingBg(true);
    setBgRemovalProgress("Initializing AI background removal engine...");

    try {
      const blob = await removePhotoBackground(file, (msg) => {
        setBgRemovalProgress(msg);
      });

      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setImageObj(img);
        setZoom(1);
        setPanX(0);
        setPanY(0);
        setIsRemovingBg(false);
        setBgRemovalProgress("");
      };
      img.onerror = () => {
        throw new Error("Failed to load processed cutout");
      };
      img.src = url;
    } catch (err) {
      console.warn("Auto background removal failed, falling back to original photo:", err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setImageObj(img);
          setZoom(1);
          setPanX(0);
          setPanY(0);
          setIsRemovingBg(false);
          setBgRemovalProgress("");
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - panX, y: e.touches[0].clientY - panY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanX(e.touches[0].clientX - dragStart.x);
    setPanY(e.touches[0].clientY - dragStart.y);
  };

  const handleTouchEnd = () => setIsDragging(false);

  const safeName = (userName || "citizen").replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();

  const handleDownloadDP = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `AkwaIbomAt39_${safeName}_Official_DP.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/dp` : "";
  const shareMessage = `🇳🇬 Celebrate 39 Shades of Gratitude! Personalize your official Akwa Ibom @ 39 Jubilee DP frame: ${shareUrl}`;

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Interactive Canvas Preview */}
      <div className="lg:col-span-6 space-y-4">
        <div className="relative mx-auto max-w-sm rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl bg-slate-900 group">
                    {/* AI Background Removal Processing Overlay */}
          {isRemovingBg && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-20 animate-in fade-in duration-200">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                  <Sparkles className="w-8 h-8 animate-pulse text-orange-400" />
                </div>
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin absolute -bottom-1 -right-1" />
              </div>
              <div className="space-y-1.5 max-w-xs">
                <p className="text-base font-bold text-white">Removing background... Please wait</p>
                <p className="text-xs text-orange-300 font-medium">
                  {bgRemovalProgress || "Isolating portrait & crafting transparent cutout..."}
                </p>
              </div>
              <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 animate-pulse w-full" />
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full aspect-[4/5] cursor-grab active:cursor-grabbing block touch-none"
          />

          {imageObj && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-medium text-slate-200 pointer-events-none opacity-85 group-hover:opacity-100 transition shadow">
              Drag portrait to position over orange motif
            </div>
          )}

          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 pointer-events-none backdrop-blur-md">
            1080 × 1350 HD
          </div>
        </div>

        {/* Zoom & Positioning Controls */}
        {imageObj && (
          <div className="max-w-sm mx-auto p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-orange-400" />
                <span>Adjust Zoom</span>
              </span>
              <span className="font-mono text-[11px] text-slate-300">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
              <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setPanX(0);
                  setPanY(0);
                }}
                title="Reset Position"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Primary Download & WhatsApp Share Buttons */}
        <div className="max-w-sm mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleDownloadDP}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-[0.99] font-bold text-white text-sm cursor-pointer shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5 shrink-0" />
            <span>Download DP (PNG)</span>
          </button>

          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-14 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] font-bold text-slate-950 text-sm cursor-pointer shadow-lg shadow-[#25D366]/20 transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5 shrink-0 text-slate-950 fill-current" />
            <span>Post to Status</span>
          </a>
        </div>
      </div>
      {/* Right Column: Customization Controls */}
      <div className="lg:col-span-6 space-y-6">
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="w-5 h-5 shrink-0" />
            <h3 className="text-base font-bold text-white">
              Personalize Your Anniversary DP
            </h3>
          </div>

          {/* Photo Upload Area */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-orange-400" />
              <span>Select Portrait Photo</span>
            </label>
            <label className="flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-orange-500/60 bg-slate-950/60 hover:bg-slate-950 cursor-pointer transition group">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 group-hover:scale-105 transition">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white group-hover:text-orange-400 transition">
                  {imageObj ? "Replace Chosen Photo" : "Upload Your Picture"}
                </p>
                <p className="text-xs text-slate-400">
                  PNG, JPG or WEBP (Square or portrait works best)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Citizen Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-400" />
                <span>Full Name (Brand Display)</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Auto-scales dynamically
              </span>
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Uyouko Nathaniel Ekpo"
              maxLength={40}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition text-sm font-medium"
            />
          </div>
          {/* LGA / Chapter Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span>LGA of Origin / Residence</span>
            </label>
            <select
              value={userLga}
              onChange={(e) => setUserLga(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 transition text-sm font-medium cursor-pointer"
            >
              <optgroup label="Akwa Ibom LGAs (31)">
                {AKWA_IBOM_LGAS.map((lga) => (
                  <option key={lga} value={lga}>
                    {lga} LGA
                  </option>
                ))}
              </optgroup>
              <optgroup label="Global Diaspora">
                <option value="Global Diaspora">Global Diaspora</option>
                <option value="United Kingdom">United Kingdom Chapter</option>
                <option value="United States">United States Chapter</option>
                <option value="Canada">Canada Chapter</option>
              </optgroup>
            </select>
          </div>

          {/* Badge / Subtitle Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-orange-400" />
              <span>Anniversary Badge Title</span>
            </label>
            <select
              value={badgeTitle}
              onChange={(e) => {
                setBadgeTitle(e.target.value);
                setCustomBadge("");
              }}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 transition text-sm font-medium cursor-pointer"
            >
              {POPULAR_BADGES.map((badge) => (
                <option key={badge} value={badge}>
                  ★ {badge}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Badge Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400">
              Or write a custom title (e.g. &quot;ARISE Youth Leader&quot;):
            </label>
            <input
              type="text"
              value={customBadge}
              onChange={(e) => setCustomBadge(e.target.value)}
              placeholder="Leave empty to use dropdown badge above"
              maxLength={30}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Social Share & Link Copy */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-orange-400" />
              <span>Share link with friends</span>
            </span>
            <button
              type="button"
              onClick={copyShareLink}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Link Copied!" : "Copy Page Link"}</span>
            </button>
          </div>
        </div>

        {/* Link to Take Heritage Quiz */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-orange-400" />
              <span>Want your official Trivia Score on your frame?</span>
            </h4>
            <p className="text-xs text-slate-400">
              Complete the 10-question Akwa Ibom @ 39 Heritage Quiz to lock your verified badge and rank for your LGA.
            </p>
          </div>
          <Link
            href="/quiz"
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition shadow-md shadow-orange-500/20"
          >
            <span>Take Quiz</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}



