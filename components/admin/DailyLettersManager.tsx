"use client";

import React, { useState } from "react";
import { 
  ScrollText, 
  Plus, 
  Pencil, 
  Trash2, 
  Calendar, 
  Check, 
  X, 
  Loader2, 
  Sparkles,
  AlertCircle
} from "lucide-react";
import type { DailyLetter } from "@/types/database";
import { 
  createDailyLetter, 
  updateDailyLetter, 
  deleteDailyLetter 
} from "@/app/actions/daily-letters";

interface DailyLettersManagerProps {
  initialLetters: DailyLetter[];
}

export function DailyLettersManager({ initialLetters }: DailyLettersManagerProps) {
  const [letters, setLetters] = useState<DailyLetter[]>(initialLetters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<DailyLetter | null>(null);

  // Form State
  const [dayNumber, setDayNumber] = useState<number>(() => {
    if (initialLetters.length === 0) return 1;
    const maxDay = Math.max(...initialLetters.map((l) => l.day_number));
    return maxDay + 1;
  });
  const [publishDate, setPublishDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingLetter(null);
    const maxDay = letters.length > 0 ? Math.max(...letters.map((l) => l.day_number)) : 0;
    setDayNumber(maxDay + 1);
    setPublishDate(new Date().toISOString().split("T")[0]);
    setTitle("");
    setContent("");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (letter: DailyLetter) => {
    setEditingLetter(letter);
    setDayNumber(letter.day_number);
    setPublishDate(letter.publish_date);
    setTitle(letter.title);
    setContent(letter.content);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!content.trim()) {
      setFormError("Content is required.");
      return;
    }
    if (!dayNumber || dayNumber < 1) {
      setFormError("Valid Day Number is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingLetter) {
        const res = await updateDailyLetter(editingLetter.id, {
          day_number: Number(dayNumber),
          publish_date: publishDate,
          title: title.trim(),
          content: content.trim(),
        });
        if (!res.success) {
          setFormError(res.error || "Failed to update letter.");
          setIsSubmitting(false);
          return;
        }
        setLetters((prev) =>
          prev.map((l) =>
            l.id === editingLetter.id
              ? {
                  ...l,
                  day_number: Number(dayNumber),
                  publish_date: publishDate,
                  title: title.trim(),
                  content: content.trim(),
                  updated_at: new Date().toISOString(),
                }
              : l
          ).sort((a, b) => a.day_number - b.day_number)
        );
      } else {
        const res = await createDailyLetter({
          day_number: Number(dayNumber),
          publish_date: publishDate,
          title: title.trim(),
          content: content.trim(),
        });
        if (!res.success || !res.letter) {
          setFormError(res.error || "Failed to create letter.");
          setIsSubmitting(false);
          return;
        }
        setLetters((prev) => [...prev, res.letter!].sort((a, b) => a.day_number - b.day_number));
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Error saving letter.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this daily letter?")) return;
    setDeletePendingId(id);
    try {
      const res = await deleteDailyLetter(id);
      if (res.success) {
        setLetters((prev) => prev.filter((l) => l.id !== id));
      } else {
        alert(res.error || "Failed to delete letter.");
      }
    } finally {
      setDeletePendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ScrollText className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-white">A Letter to Akwa Ibom</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
              {letters.length} Letters
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Commemorative 39-day countdown letters published daily leading up to September 23rd Statehood Day.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-orange-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Write Daily Letter</span>
        </button>
      </div>

      {/* Letters List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {letters.map((letter) => (
          <div
            key={letter.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold">
                  Day {letter.day_number}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{letter.publish_date}</span>
                </span>
              </div>
              <h4 className="text-sm font-bold text-white line-clamp-1">{letter.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {letter.content}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => openEditModal(letter)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(letter.id)}
                disabled={deletePendingId === letter.id}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                {deletePendingId === letter.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingLetter ? "Edit Daily Letter" : "New Daily Letter"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Day Number</label>
                  <input
                    type="number"
                    min="1"
                    max="39"
                    value={dayNumber}
                    onChange={(e) => setDayNumber(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Publish Date</label>
                  <input
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Letter Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Dawn of Promise: Remembering September 23, 1987"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Letter Content</label>
                  <span className="text-[10px] text-slate-500">{content.length} characters</span>
                </div>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the commemorative letter to the citizens of Akwa Ibom..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-orange-500 resize-y"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingLetter ? "Update Letter" : "Publish Letter"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


