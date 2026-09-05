"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  MapPin, 
  User, 
  Clock, 
  ArrowRight, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  RotateCcw,
  ShieldCheck,
  Globe
} from "lucide-react";
import { AKWA_IBOM_LGAS } from "@/types/database";
import type { QuestionWithOptions } from "@/types/database";
import { POPULAR_DIASPORA_LOCATIONS } from "@/lib/diaspora";
import { fetchQuizQuestions, submitQuizAnswers } from "@/app/actions/quiz";

const TIMER_SECONDS = 15;

interface AnswerRecord {
  question_id: string;
  selected_option_id: string;
}

export default function QuizPage() {
  const router = useRouter();

  // Navigation / Wizard State
  const [step, setStep] = useState<"DETAILS" | "QUIZ" | "EVALUATING">("DETAILS");
  
  // User Onboarding State
  const [userName, setUserName] = useState("");
  const [locationType, setLocationType] = useState<"home" | "diaspora">("home");
  const [selectedLga, setSelectedLga] = useState("Uyo");
  const [diasporaLocation, setDiasporaLocation] = useState("");
  const [lga, setLga] = useState("Uyo LGA");
  const [nameError, setNameError] = useState("");

  // Quiz Engine State
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load questions on mount
  useEffect(() => {
    let isMounted = true;
    async function loadQuestions() {
      try {
        const fetched = await fetchQuizQuestions();
        if (isMounted) {
          setQuestions(fetched);
          setIsLoadingQuestions(false);
        }
      } catch (err) {
        console.error("Failed to load questions:", err);
        if (isMounted) {
          setIsLoadingQuestions(false);
        }
      }
    }
    loadQuestions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Form Submission (Step 1 -> Step 2)
  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = userName.trim();

    if (!cleanName) {
      setNameError("Please enter your name to begin.");
      return;
    }

    if (cleanName.length > 25) {
      setNameError("Name cannot exceed 25 characters.");
      return;
    }

    const resolvedLocation =
      locationType === "home"
        ? `${selectedLga} LGA`
        : diasporaLocation.trim()
        ? `${diasporaLocation.trim()} (Diaspora)`
        : "Global Diaspora";

    setLga(resolvedLocation);
    setNameError("");
    setStep("QUIZ");
    setTimeLeft(TIMER_SECONDS);
  };

  // Submit all collected answers and redirect
  const handleFinalSubmission = useCallback(
    async (finalAnswers: AnswerRecord[]) => {
      setStep("EVALUATING");
      try {
        const result = await submitQuizAnswers({
          userName: userName.trim(),
          lga: lga.trim() || undefined,
          answers: finalAnswers,
        });

        // Navigate to commemorative result page
        const params = new URLSearchParams({
          score: result.score.toString(),
          total: result.total.toString(),
          percentage: result.percentage.toString(),
          badge: result.badgeTitle,
          name: userName.trim(),
          lga: lga.trim() || "",
        });

        router.push(`/quiz/result/${result.submissionId}?${params.toString()}`);
      } catch (error) {
        console.error("Submission failed:", error);
        // Fallback redirection with local calculation
        const fallbackScore = finalAnswers.length > 0 ? Math.floor(finalAnswers.length * 0.7) : 0;
        const total = questions.length || 15;
        const pct = Math.round((fallbackScore / total) * 100);
        router.push(`/quiz/result/${crypto.randomUUID()}?score=${fallbackScore}&total=${total}&percentage=${pct}&badge=Akwa+Ibom+Citizen&name=${encodeURIComponent(userName)}&lga=${encodeURIComponent(lga)}`);
      }
    },
    [userName, lga, questions.length, router]
  );

  // Advance to next question or complete quiz
  const advanceQuestion = useCallback(
    (chosenOptionId?: string | null) => {
      if (isAdvancing) return;
      setIsAdvancing(true);

      const activeQ = questions[currentIdx];
      const answerPayload = chosenOptionId
        ? { question_id: activeQ.id, selected_option_id: chosenOptionId }
        : { question_id: activeQ.id, selected_option_id: "" };

      const nextAnswers = [...answers, answerPayload];
      setAnswers(nextAnswers);

      if (currentIdx + 1 < questions.length) {
        // Next question
        setTimeout(() => {
          setCurrentIdx((prev) => prev + 1);
          setSelectedOptionId(null);
          setTimeLeft(TIMER_SECONDS);
          setIsAdvancing(false);
        }, 300);
      } else {
        // Quiz complete -> evaluate
        setTimeout(() => {
          handleFinalSubmission(nextAnswers);
        }, 400);
      }
    },
    [isAdvancing, questions, currentIdx, answers, handleFinalSubmission]
  );

  // Real-time Timer Effect per question
  useEffect(() => {
    if (step !== "QUIZ" || isAdvancing) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          // Auto-advance on timer expiration
          advanceQuestion(selectedOptionId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [step, currentIdx, isAdvancing, selectedOptionId, advanceQuestion]);

  // Option Click Handler
  const handleOptionClick = (optionId: string) => {
    if (isAdvancing) return;
    setSelectedOptionId(optionId);
    // Auto-advance smoothly after short tactile feedback
    setTimeout(() => {
      advanceQuestion(optionId);
    }, 280);
  };

  // Timer Color Threshold
  const getTimerStyles = (time: number) => {
    if (time > 7) {
      return {
        badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        barColor: "bg-emerald-500",
        pulse: false,
      };
    }
    if (time > 3) {
      return {
        badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        barColor: "bg-amber-500",
        pulse: false,
      };
    }
    return {
      badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/50",
      barColor: "bg-rose-500",
      pulse: true,
    };
  };

  const timerStyle = getTimerStyles(timeLeft);
  const currentQuestion = questions[currentIdx];
  const progressPercentage = questions.length > 0 
    ? Math.round(((currentIdx + 1) / questions.length) * 100) 
    : 0;

  // Option marker labels
  const optionPrefixes = ["A", "B", "C", "D"];

  return (
    <main className="min-h-[85vh] w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {/* ================================================================= */}
        {/* STEP 1: USER DETAILS ONBOARDING                                    */}
        {/* ================================================================= */}
        {step === "DETAILS" && (
          <motion.div
            key="details-step"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="w-full space-y-6"
          >
            {/* Header Badge */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-xs sm:text-sm font-semibold backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>Akwa Ibom @ 39 Anniversary Trivia</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Prove Your Akwa Ibom Identity
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
                Test your knowledge of our state's 39-year heritage across cuisine, leadership, 
                geography, and culture to claim your commemorative anniversary badge.
              </p>
            </div>

            {/* Form Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -top-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <form onSubmit={handleStartQuiz} className="space-y-6 relative">
                {/* Name Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor="user-name-input"
                      className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5 text-orange-400" />
                      <span>Your Full Name or Nickname</span>
                    </label>
                    <span className="text-xs font-mono text-slate-500">
                      {userName.length}/25
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="user-name-input"
                      type="text"
                      maxLength={25}
                      placeholder="e.g., Aniefiok Bassey"
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                        if (nameError) setNameError("");
                      }}
                      className={`w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border ${
                        nameError ? "border-rose-500/80 focus:border-rose-500" : "border-slate-800 focus:border-orange-500/60"
                      } text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition`}
                      autoFocus
                    />
                  </div>
                  {nameError && (
                    <p className="text-xs text-rose-400 flex items-center gap-1.5 pt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{nameError}</span>
                    </p>
                  )}
                </div>

                {/* Location Selection with Home vs Diaspora Tabs */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Origin or Residence Location</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {locationType === "home" ? "Akwa Ibom Roots" : "Diaspora Network"}
                    </span>
                  </div>

                  {/* Top-level Tabs */}
                  <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setLocationType("home")}
                      className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
                        locationType === "home"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>Home (31 LGAs)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationType("diaspora")}
                      className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
                        locationType === "diaspora"
                          ? "bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Globe className="w-4 h-4 text-orange-400" />
                      <span>Diaspora</span>
                    </button>
                  </div>

                  {/* Conditional Location Input */}
                  {locationType === "home" ? (
                    <div className="relative">
                      <select
                        id="lga-select"
                        value={selectedLga}
                        onChange={(e) => setSelectedLga(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/60 transition appearance-none cursor-pointer"
                      >
                        {AKWA_IBOM_LGAS.map((item) => (
                          <option key={item} value={item} className="bg-slate-950 text-white">
                            {item} LGA
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        list="diaspora-quiz-options"
                        maxLength={60}
                        value={diasporaLocation}
                        onChange={(e) => setDiasporaLocation(e.target.value)}
                        placeholder="Search or type country / city (e.g. Benin Republic, UK, USA, Canada)"
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/60 transition"
                      />
                      <datalist id="diaspora-quiz-options">
                        {POPULAR_DIASPORA_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc} />
                        ))}
                      </datalist>
                      <p className="text-[11px] text-slate-500 pt-1.5">
                        Akwa Ibom diaspora worldwide is tracked live for state analytics.
                      </p>
                    </div>
                  )}
                </div>

                {/* Challenge Rules Box */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5 text-xs text-slate-300">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-orange-400" />
                    <span>Trivia Challenge Guidelines</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>15 Curated Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>15s Timer per Question</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span>Official Badge Tiers</span>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isLoadingQuestions}
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 font-bold text-white text-sm sm:text-base shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 hover:scale-[1.01] active:scale-[0.99] transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group touch-manipulation cursor-pointer"
                >
                  <span>{isLoadingQuestions ? "Preparing Questions..." : "Enter Trivia Arena"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ================================================================= */}
        {/* STEP 2: GAMIFIED QUESTION VIEW                                    */}
        {/* ================================================================= */}
        {step === "QUIZ" && currentQuestion && (
          <div className="w-full space-y-6">
            {/* Top Bar: Progress & Dynamic Timer */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800/90 shadow-md space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">
                    Question {currentIdx + 1} of {questions.length}
                  </span>
                  {currentQuestion.category && (
                    <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-medium text-xs">
                      {currentQuestion.category.name}
                    </span>
                  )}
                </div>

                {/* 15-Second Animated Countdown */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono font-bold text-sm ${
                    timerStyle.badgeBg
                  } ${timerStyle.pulse ? "animate-pulse" : ""}`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{timeLeft}s</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Question Card with Framer Motion slide-in */}
            <motion.div
              key={`question-${currentQuestion.id}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6 relative overflow-hidden"
            >
              <div className="space-y-2">
                {currentQuestion.category && (
                  <div className="sm:hidden text-xs font-semibold text-orange-400 uppercase tracking-wider">
                    {currentQuestion.category.name}
                  </div>
                )}
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                  {currentQuestion.question_text}
                </h2>
              </div>

              {/* 4 Interactive Option Buttons (min-h-[3.5rem] = 56px for mobile touch) */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = selectedOptionId === option.id;
                  const prefix = optionPrefixes[optIdx] || `${optIdx + 1}`;

                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleOptionClick(option.id)}
                      disabled={isAdvancing}
                      className={`w-full min-h-[3.5rem] p-3.5 sm:p-4 rounded-xl text-left font-medium transition duration-150 flex items-center gap-3.5 border touch-manipulation cursor-pointer ${
                        isSelected
                          ? "bg-orange-500/20 border-orange-400 text-white shadow-md shadow-orange-500/20"
                          : "bg-slate-900/70 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700 text-slate-200"
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition ${
                          isSelected
                            ? "bg-orange-500 text-white"
                            : "bg-slate-800 text-slate-400 group-hover:text-white"
                        }`}
                      >
                        {prefix}
                      </span>
                      <span className="text-sm sm:text-base flex-1 break-words leading-snug">
                        {option.option_text}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 animate-in fade-in" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer Hint */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/60">
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Tap an option to confirm your answer
                </span>
                <span>Auto-advances if time expires</span>
              </div>
            </motion.div>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 3: EVALUATING STATE                                          */}
        {/* ================================================================= */}
        {step === "EVALUATING" && (
          <motion.div
            key="evaluating-step"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-12"
          >
            {/* Spinning Akwa Ibom State Glow Rings */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-emerald-500/20 border-b-emerald-400 animate-spin-reverse" />
              <Award className="w-10 h-10 text-amber-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Evaluating your Akwa Ibom identity...
              </h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Comparing your answers against state archives and generating your official 
                Akwa Ibom @ 39 anniversary credentials...
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Dakkada • Arise to Greatness</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
