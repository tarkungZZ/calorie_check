"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

interface QAEntry {
  question: string;
  answer: string;
}

interface NutritionData {
  name: string;
  name_en: string;
  ingredients: string[];
  calories: number;
  nutrition: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  nutritionDetails?: {
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
  };
  healthTip: string;
  confidence: string;
  error?: string;
}

interface ResultDisplayProps {
  data: NutritionData | null;
  imageUrls?: string[];
  apiUrl: string;
  analysisId?: number | null;
}

function NutritionBar({
  label,
  value,
  max,
  color,
  detail,
  unit = "g",
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  detail?: string;
  unit?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const percentage = Math.min((value / max) * 100, 100);
  const hasDetail = !!detail;

  return (
    <div
      className={`rounded-xl transition-all duration-200 ${
        hasDetail ? "cursor-pointer" : ""
      } ${expanded ? "bg-gray-50 p-3 -mx-1" : ""}`}
      onClick={() => hasDetail && setExpanded((prev) => !prev)}
    >
      <div className="space-y-1">
        <div className="flex justify-between text-sm items-center">
          <span className="text-gray-600 font-medium flex items-center gap-1.5">
            {label}
            {hasDetail && (
              <svg
                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                  expanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </span>
          <span className="font-semibold">
            {value} {unit}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {expanded && detail && (
        <div className="mt-2.5 text-sm text-gray-600 leading-relaxed bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
          {detail}
        </div>
      )}
    </div>
  );
}

function ConfidenceBadge({ level }: { level: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    high: {
      bg: "bg-green-100",
      text: "text-green-700",
      label: "ความมั่นใจสูง",
    },
    medium: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      label: "ความมั่นใจปานกลาง",
    },
    low: { bg: "bg-red-100", text: "text-red-700", label: "ความมั่นใจต่ำ" },
  };

  const c = config[level] || config.medium;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
    >
      {c.label}
    </span>
  );
}

export default function ResultDisplay({
  data,
  imageUrls = [],
  apiUrl,
  analysisId,
}: ResultDisplayProps) {
  const { authHeaders } = useAuth();
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [qaList, setQaList] = useState<QAEntry[]>([]);
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const qaEndRef = useRef<HTMLDivElement>(null);

  const handleAsk = useCallback(async () => {
    if (!question.trim() || !data || isAsking) return;

    const q = question.trim();
    setQuestion("");
    setIsAsking(true);

    try {
      const response = await fetch(`${apiUrl}/api/followup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ analysisId, question: q }),
      });

      const result = await response.json();

      if (result.success) {
        setQaList((prev) => [...prev, { question: q, answer: result.answer }]);
      } else {
        setQaList((prev) => [
          ...prev,
          { question: q, answer: result.error || "ไม่สามารถตอบได้ ลองใหม่อีกครั้ง" },
        ]);
      }

      setTimeout(() => qaEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setQaList((prev) => [
        ...prev,
        { question: q, answer: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" },
      ]);
    } finally {
      setIsAsking(false);
    }
  }, [question, data, isAsking, apiUrl, analysisId, authHeaders]);

  if (!data) return null;

  if (data.error) {
    return (
      <div className="w-full max-w-lg mx-auto mt-8 animate-fade-in-up">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-red-700 font-medium">{data.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto mt-8 animate-fade-in-up">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Image Preview (clickable) */}
        {imageUrls.length > 0 && (
          <div className="relative h-48 overflow-hidden cursor-pointer group"
            onClick={() => { setLightboxIndex(activeImageIndex); setShowLightbox(true); }}
          >
            <img
              src={imageUrls[activeImageIndex]}
              alt={data.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Zoom icon */}
            <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>

            {/* Image count badge */}
            {imageUrls.length > 1 && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 text-white text-xs font-medium">
                {activeImageIndex + 1} / {imageUrls.length}
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold text-white">{data.name}</h2>
              <p className="text-white/80 text-sm">{data.name_en}</p>
            </div>

            {/* Thumbnail strip for multiple images */}
            {imageUrls.length > 1 && (
              <div className="absolute bottom-16 left-4 right-4 flex gap-1.5 justify-center">
                {imageUrls.map((src, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setActiveImageIndex(i); }}
                    className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      i === activeImageIndex
                        ? "border-white shadow-lg scale-110"
                        : "border-white/40 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lightbox Modal */}
        {showLightbox && imageUrls.length > 0 && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowLightbox(false)}
          >
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-10"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="absolute top-5 left-4 right-16">
              <p className="text-white font-semibold text-lg truncate">{data.name}</p>
              <p className="text-white/70 text-sm">
                {data.name_en}
                {imageUrls.length > 1 && ` — ${lightboxIndex + 1}/${imageUrls.length}`}
              </p>
            </div>

            {/* Prev/Next */}
            {imageUrls.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length); }}
                  className="absolute left-3 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-10"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % imageUrls.length); }}
                  className="absolute right-3 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-10"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            <img
              src={imageUrls[lightboxIndex]}
              alt={data.name}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            <p className="absolute bottom-5 text-white/50 text-sm">
              คลิกที่ใดก็ได้เพื่อปิด
            </p>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Calorie Circle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {data.calories}
                  </p>
                  <p className="text-[10px] text-white/80 -mt-1">kcal</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">แคลอรี่ต่อจาน</p>
                <p className="text-xs text-gray-400">ค่าประมาณ</p>
              </div>
            </div>
            <ConfidenceBadge level={data.confidence} />
          </div>

          {/* Nutrition Bars */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
                สารอาหาร
              </h3>
              {data.nutritionDetails && (
                <span className="text-xs text-gray-400">
                  แตะเพื่อดูรายละเอียด
                </span>
              )}
            </div>
            <NutritionBar
              label="โปรตีน"
              value={data.nutrition.protein}
              max={50}
              color="bg-blue-500"
              detail={data.nutritionDetails?.protein}
            />
            <NutritionBar
              label="คาร์โบไฮเดรต"
              value={data.nutrition.carbs}
              max={100}
              color="bg-amber-500"
              detail={data.nutritionDetails?.carbs}
            />
            <NutritionBar
              label="ไขมัน"
              value={data.nutrition.fat}
              max={65}
              color="bg-red-400"
              detail={data.nutritionDetails?.fat}
            />
            <NutritionBar
              label="ไฟเบอร์"
              value={data.nutrition.fiber}
              max={25}
              color="bg-green-500"
              detail={data.nutritionDetails?.fiber}
            />
          </div>

          {/* Ingredients */}
          {data.ingredients && data.ingredients.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-2">
                ส่วนประกอบหลัก
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Health Tip */}
          {data.healthTip && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-800 mb-1">
                    คำแนะนำ
                  </p>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    {data.healthTip}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Follow-up Q&A Section */}
          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              ถามเพิ่มเติมเกี่ยวกับอาหารนี้
            </h3>

            {/* Q&A History */}
            {qaList.length > 0 && (
              <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                {qaList.map((qa, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-end">
                      <div className="bg-green-500 text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-md max-w-[85%] shadow-sm">
                        {qa.question}
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-700 text-sm px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[85%] leading-relaxed shadow-sm">
                        {qa.answer}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={qaEndRef} />
              </div>
            )}

            {/* Loading indicator */}
            {isAsking && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-100 text-gray-500 text-sm px-4 py-2.5 rounded-2xl rounded-bl-md shadow-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  กำลังตอบ...
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                disabled={isAsking}
                placeholder="เช่น กินคู่กับอะไรลดแคลอรี่ได้? ..."
                className="
                  flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                  focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent
                  disabled:opacity-50 disabled:bg-gray-50
                  placeholder:text-gray-400
                "
              />
              <button
                onClick={handleAsk}
                disabled={isAsking || !question.trim()}
                className="
                  px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600
                  text-white font-medium text-sm
                  transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                  flex-shrink-0
                "
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
