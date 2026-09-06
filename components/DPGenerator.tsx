"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Download, 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Share2, 
  Check, 
  Copy, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Trophy, 
  Camera, 
  Flame, 
  MessageCircle,
  HelpCircle,
  X,
  Globe,
  ArrowRight,
  Loader2
} from "lucide-react";
import { renderAnniversaryFrame, preloadOfficialFrame } from "@/lib/canvas-frame";
import { removePhotoBackground } from "@/lib/background-removal";
import { renderChallengeCard } from "@/lib/canvas-challenge-card";
import { isDiasporaLocation, extractCountryFromDiaspora } from "@/lib/diaspora";

interface DPGeneratorProps {
  userName: string;
  userLga: string;
  badgeTitle: string;
  score: number;
  total: number;
  percentage: number;
  submissionId: string;
}

export function DPGenerator({
  userName,
  userLga,
  badgeTitle,
  score,
  total,
  percentage,
  submissionId,
}: DPGeneratorProps) {
  // Tab controller: "challenge" (instant bragging rights card) vs "dp" (Sept 23rd DP frame with photo)
  const [activeTab, setActiveTab] = useState<"challenge" | "dp">("challenge");

  // Separate Canvas Refs
  const challengeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dpCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // DP Frame states
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [cutoutImage, setCutoutImage] = useState<HTMLImageElement | null>(null);
  const [useCutout, setUseCutout] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Share & Notification states
  const [copied, setCopied] = useState(false);
  const [socialModal, setSocialModal] = useState<"instagram" | "tiktok" | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgRemovalProgress, setBgRemovalProgress] = useState("");
  const cancelBgRemovalRef = useRef(false);

  // Redraw Challenge Card Canvas
  const redrawChallenge = useCallback(() => {
    if (!challengeCanvasRef.current) return;
    renderChallengeCard({
      canvas: challengeCanvasRef.current,
      userImage: imageObj,
      userName,
      userLga,
      badgeTitle,
      score,
      total,
      percentage,
      submissionId,
    });
  }, [imageObj, userName, userLga, badgeTitle, score, total, percentage, submissionId]);

  // Redraw DP Frame Canvas
  const redrawDP = useCallback(() => {
    if (!dpCanvasRef.current) return;
    renderAnniversaryFrame({
      canvas: dpCanvasRef.current,
      userImage: imageObj,
      userName,
      userLga,
      badgeTitle,
      score,
      total,
      percentage,
      submissionId,
      zoom,
      panX,
      panY,
    });
  }, [imageObj, userName, userLga, badgeTitle, score, total, percentage, submissionId, zoom, panX, panY]);

  // Redraw active canvas whenever inputs or activeTab changes
  useEffect(() => {
    if (activeTab === "challenge") {
      redrawChallenge();
    } else {
      redrawDP();
    }
  }, [activeTab, redrawChallenge, redrawDP]);

  // Initial render on mount for challenge card
  useEffect(() => {
    redrawChallenge();
  }, [redrawChallenge]);
  // Preload official frame image in the background
  useEffect(() => {
    preloadOfficialFrame().catch(() => {});
  }, []);


  const handleSkipCutout = () => {
    cancelBgRemovalRef.current = true;
    setIsRemovingBg(false);
    setBgRemovalProgress("");
    if (originalImage) {
      setImageObj(originalImage);
      setUseCutout(false);
    }
  };

  const toggleCutoutMode = () => {
    if (!cutoutImage || !originalImage) return;
    const nextMode = !useCutout;
    setUseCutout(nextMode);
    setImageObj(nextMode ? cutoutImage : originalImage);
  };

  // Handle Photo Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    cancelBgRemovalRef.current = false;
    setIsRemovingBg(true);
    setBgRemovalProgress("Loading photo & optimizing for fast AI...");

    // Immediately load original photo so user never waits with an empty canvas
    const origUrl = URL.createObjectURL(file);
    const rawImg = new Image();
    rawImg.crossOrigin = "anonymous";
    rawImg.onload = () => {
      setOriginalImage(rawImg);
      if (!imageObj) {
        setImageObj(rawImg);
        setZoom(1);
        setPanX(0);
        setPanY(0);
      }
    };
    rawImg.src = origUrl;

    try {
      const blob = await removePhotoBackground(file, (msg) => {
        if (!cancelBgRemovalRef.current) {
          setBgRemovalProgress(msg);
        }
      });

      if (cancelBgRemovalRef.current) return;

      const cutoutUrl = URL.createObjectURL(blob);
      const cutoutImg = new Image();
      cutoutImg.crossOrigin = "anonymous";
      cutoutImg.onload = () => {
        if (cancelBgRemovalRef.current) return;
        setCutoutImage(cutoutImg);
        setImageObj(cutoutImg);
        setUseCutout(true);
        setZoom(1);
        setPanX(0);
        setPanY(0);
        setIsRemovingBg(false);
        setBgRemovalProgress("");
      };
      cutoutImg.src = cutoutUrl;
    } catch (err) {
      console.warn("Auto background removal skipped or timed out, using original photo:", err);
      if (!cancelBgRemovalRef.current) {
        setIsRemovingBg(false);
        setBgRemovalProgress("");
        setUseCutout(false);
        if (rawImg.complete) {
          setImageObj(rawImg);
        }
      }
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
      setDragStart({
        x: e.touches[0].clientX - panX,
        y: e.touches[0].clientY - panY,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanX(e.touches[0].clientX - dragStart.x);
    setPanY(e.touches[0].clientY - dragStart.y);
  };

  const handleTouchEnd = () => setIsDragging(false);

  const safeName = userName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() || "citizen";

  // Download High-Resolution 1080x1080 Challenge Card
  const handleDownloadChallengeCard = () => {
    if (!challengeCanvasRef.current) return;
    const link = document.createElement("a");
    link.download = `AkwaIbomAt39_${safeName}_LGA_Challenge.png`;
    link.href = challengeCanvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Download High-Resolution 1080x1080 Anniversary DP
  const handleDownloadDP = () => {
    if (!dpCanvasRef.current) return;
    const link = document.createElement("a");
    link.download = `AkwaIbomAt39_${safeName}_Anniversary_DP.png`;
    link.href = dpCanvasRef.current.toDataURL("image/png");
    link.click();
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const verifyUrl = `${baseUrl}/verify/${submissionId}?score=${score}&total=${total}&percentage=${percentage}&badge=${encodeURIComponent(badgeTitle)}&name=${encodeURIComponent(userName)}&lga=${encodeURIComponent(userLga)}`;

  const isDiaspora = isDiasporaLocation(userLga);
  const diasporaMeta = isDiaspora ? extractCountryFromDiaspora(userLga) : null;

  // Tailored share text depending on active tab and region
  let shareText = "";
  if (activeTab === "challenge") {
    if (isDiaspora && diasporaMeta) {
      shareText = `🥊 Can your country or chapter beat my ${score}/${total} (${percentage}%) score? I just put ${percentage}% on the board for the ${diasporaMeta.country} Diaspora Chapter in the Akwa Ibom @ 39 Statehood Jubilee Challenge! Defend our residence country on the Global Leaderboard:`;
    } else {
      shareText = `🥊 Can your LGA beat my ${score}/${total} (${percentage}%) score? I just put ${percentage}% on the board for ${userLga || "Akwa Ibom"} in the official Akwa Ibom @ 39 Heritage Showdown! Top 3 LGAs will be celebrated on Sept 23rd Statehood Day. Take the challenge now to vote for your LGA:`;
    }
  } else {
    shareText = `🎉 Akwa Ibom @ 39 Statehood Jubilee: I scored ${score}/${total} (${percentage}%) representing ${userLga || "Akwa Ibom"} and claimed the "${badgeTitle}" badge! Pre-generate your Sept 23rd official commemorative DP frame here:`;
  }

  const copyVerifyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Akwa Ibom @ 39 Anniversary Challenge & DP",
          text: shareText,
          url: verifyUrl,
        });
      } catch {}
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Dual Tab Mode Switcher */}
      <div className="p-1.5 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-2 shadow-xl">
        <button
          onClick={() => setActiveTab("challenge")}
          className={`py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer touch-manipulation ${
            activeTab === "challenge"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-300" />
            <span className="font-extrabold">LGA Challenge Card</span>
          </div>
          <span className="text-[10px] sm:text-xs opacity-90 font-normal">
            (⚡ Ready Instantly)
          </span>
        </button>

        <button
          onClick={() => setActiveTab("dp")}
          className={`py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer touch-manipulation ${
            activeTab === "dp"
              ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-teal-300" />
            <span className="font-extrabold">Sept 23rd DP Frame</span>
          </div>
          <span className="text-[10px] sm:text-xs opacity-90 font-normal">
            (📅 Save for 23rd)
          </span>
        </button>
      </div>

      {/* Mode 1: Viral LGA Challenge Card (Instant Bragging Rights • Optional Photo) */}
      {activeTab === "challenge" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-emerald-500/15 border border-orange-500/30 text-left space-y-1.5">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400 shrink-0" />
              <h4 className="text-xs sm:text-sm font-bold text-white">
                {isDiaspora ? "Global Diaspora Showdown" : "Battle of the 31 LGAs • 18 Days to September 23rd"}
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isDiaspora && diasporaMeta ? (
                <>
                  Every completed quiz elevates your residence country on the Global Diaspora table. Defend <strong>{diasporaMeta.flag} {diasporaMeta.country}</strong> by sharing your scorecard!
                </>
              ) : (
                <>
                  Every completed quiz counts towards your LGA&apos;s score. Rankings are decided by both participant mobilization and quiz scores. Share your scorecard now to rally <strong>{userLga || "your LGA"}</strong>!
                </>
              )}
            </p>
          </div>

          <div className="relative mx-auto max-w-md rounded-2xl overflow-hidden border-2 border-orange-500/40 shadow-2xl bg-slate-900">
            <canvas
              ref={challengeCanvasRef}
              className="w-full aspect-square block"
            />
          </div>

          {/* Profile Picture Option for Challenge Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-orange-500/40 flex items-center justify-center shrink-0 overflow-hidden">
                {imageObj ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageObj.src} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-4 h-4 text-orange-400" />
                )}
              </div>
              <div>
                <p className="font-bold text-white">
                  {imageObj ? "Candidate Photo Added" : "Add Profile Photo to Card (Optional)"}
                </p>
                <p className="text-[11px] text-slate-400">
                  {imageObj ? "Photo displays neatly inside your challenge badge" : "Card is 100% ready without photo, or add your picture"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 font-semibold cursor-pointer transition">
                <span>{imageObj ? "Change Photo" : "+ Add Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {imageObj && (
                <button
                  type="button"
                  onClick={() => setImageObj(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition cursor-pointer"
                  title="Remove Photo"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleDownloadChallengeCard}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99] font-bold text-white text-sm cursor-pointer shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2.5 touch-manipulation"
            >
              <Download className="w-5 h-5 shrink-0" />
              <span>Download Challenge Card (PNG)</span>
            </button>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${verifyUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] font-bold text-slate-950 text-sm cursor-pointer shadow-lg shadow-[#25D366]/20 transition flex items-center justify-center gap-2.5 touch-manipulation"
            >
              <MessageCircle className="w-5 h-5 shrink-0 text-slate-950 fill-current" />
              <span>Share to WhatsApp Status</span>
            </a>
          </div>

          {/* Direct Link to View Full Leaderboard Rankings */}
          <Link
            href="/leaderboard"
            className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-orange-500/50 hover:bg-slate-850 text-slate-200 hover:text-white transition flex items-center justify-between text-xs sm:text-sm font-bold shadow-md group"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>See where your {isDiaspora ? "Country" : "LGA"} ranks on the Full Leaderboard</span>
            </div>
            <div className="flex items-center gap-1 text-orange-400 group-hover:translate-x-1 transition duration-200">
              <span className="text-xs">View Stats</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      )}

      {/* Mode 2: Commemorative DP Frame (Pre-generate for Sept 23) */}
      {activeTab === "dp" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 text-left space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Official State-Approved Anniversary DP Frame
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Upload your photo below, our AI automatically removes your background and positions your portrait seamlessly over the orange anniversary motif. Save it now to wear your state pride on WhatsApp &amp; social media on <strong>September 23rd</strong>!
            </p>
          </div>

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
              <button
                type="button"
                onClick={handleSkipCutout}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 transition cursor-pointer shadow"
              >
                Skip Cutout &amp; Use Photo Directly &rarr;
              </button>
            </div>
          )}

          <div className="relative mx-auto max-w-sm rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl bg-slate-900 group">
            <canvas
              ref={dpCanvasRef}
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
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-slate-300 pointer-events-none opacity-80 group-hover:opacity-100 transition">
                Drag photo to adjust position
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="w-full h-14 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] font-bold text-white text-sm cursor-pointer shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2.5 touch-manipulation">
                <Upload className="w-5 h-5 shrink-0" />
                <span>{imageObj ? "Change Photo" : "Upload Portrait Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleDownloadDP}
                className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] font-bold text-white text-sm cursor-pointer shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2.5 touch-manipulation"
              >
                <Download className="w-5 h-5 shrink-0" />
                <span>Download Official DP (PNG)</span>
              </button>
            </div>

            {/* AI Cutout Mode Toggle */}
            {cutoutImage && originalImage && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span>AI Cutout Mode:</span>
                </span>
                <button
                  type="button"
                  onClick={toggleCutoutMode}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    useCutout
                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                      : "bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  {useCutout ? "Transparent Cutout (ON)" : "Original Photo (OFF)"}
                </button>
              </div>
            )}

            {imageObj && (
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
                <ZoomOut className="w-4 h-4 text-slate-400" />
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-orange-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                />
                <ZoomIn className="w-4 h-4 text-slate-400" />
                <button
                  onClick={() => { setZoom(1); setPanX(0); setPanY(0); }}
                  title="Reset Position"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Multi-Platform Social Share Suite */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-orange-400" />
            {activeTab === "challenge" ? "Rally Your LGA Across Social Media" : "Share Your Commemorative Jubilee DP"}
          </h4>
          <button
            onClick={copyVerifyLink}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition py-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied Link!" : "Copy Verification Link"}</span>
          </button>
        </div>

        {/* Multi-Platform Buttons (h-12 / min-h-[48px] touch targets) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs sm:text-sm font-bold text-white">
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${verifyUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[48px] px-3 py-2.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 hover:bg-[#25D366]/30 text-[#25D366] flex items-center justify-center gap-2 transition touch-manipulation"
          >
            <span>WhatsApp</span>
          </a>

          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(verifyUrl)}&quote=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[48px] px-3 py-2.5 rounded-xl bg-[#1877F2]/20 border border-[#1877F2]/40 hover:bg-[#1877F2]/30 text-[#4da3ff] flex items-center justify-center gap-2 transition touch-manipulation"
          >
            <span>Facebook</span>
          </a>

          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(verifyUrl)}&hashtags=AkwaIbomAt39,AriseAgenda,31LGAShowdown`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[48px] px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white flex items-center justify-center gap-2 transition touch-manipulation"
          >
            <span>X (Twitter)</span>
          </a>

          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[48px] px-3 py-2.5 rounded-xl bg-[#0A66C2]/20 border border-[#0A66C2]/40 hover:bg-[#0A66C2]/30 text-[#70b5f9] flex items-center justify-center gap-2 transition touch-manipulation"
          >
            <span>LinkedIn</span>
          </a>

          <button
            onClick={() => setSocialModal("instagram")}
            className="min-h-[48px] px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#E1306C]/20 to-[#FD1D1D]/20 border border-[#E1306C]/40 hover:opacity-90 text-[#f56598] flex items-center justify-center gap-2 transition cursor-pointer touch-manipulation"
          >
            <span>Instagram</span>
          </button>

          <button
            onClick={() => setSocialModal("tiktok")}
            className="min-h-[48px] px-3 py-2.5 rounded-xl bg-[#00F2FE]/15 border border-[#00F2FE]/30 hover:opacity-90 text-[#00F2FE] flex items-center justify-center gap-2 transition cursor-pointer touch-manipulation"
          >
            <span>TikTok</span>
          </button>
        </div>

        {/* Verifiable Link Badge */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verifiable on System via ID: {submissionId.slice(0, 8)}...</span>
          </div>
          <a
            href={verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 hover:underline flex items-center gap-1"
          >
            <span>View Public Certificate</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Social Instruction Modal */}
      {socialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-950 border border-orange-500/30 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white capitalize">Share to {socialModal}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              1. Tap <strong>Download &amp; Copy Caption</strong> below to save your card to your device photos.
              <br />
              2. Open <strong>{socialModal === "instagram" ? "Instagram Feed / Stories" : "TikTok"}</strong>.
              <br />
              3. Share your image with #AkwaIbomAt39 #AriseAgenda #31LGAShowdown!
            </p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 italic">
              &quot;{shareText} {verifyUrl}&quot;
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  copyVerifyLink();
                  if (activeTab === "challenge") {
                    handleDownloadChallengeCard();
                  } else {
                    handleDownloadDP();
                  }
                  setSocialModal(null);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-emerald-600 font-bold text-white text-xs cursor-pointer"
              >
                Download &amp; Copy Caption
              </button>
              <button
                onClick={() => setSocialModal(null)}
                className="py-2 px-3 rounded-xl bg-slate-900 text-slate-400 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
