"use client";

import { useState, useEffect, useCallback } from "react";
import NavBar from "@/components/NavBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AnalysisSummary {
  id: number;
  image_path: string | string[];
  name: string;
  name_en: string;
  calories: number;
  confidence: string;
  created_at: string;
}

interface AnalysisDetail {
  id: number;
  image_path: string | string[];
  description: string;
  name: string;
  name_en: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  ingredients: string[];
  nutrition_details: {
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
  } | null;
  health_tip: string;
  confidence: string;
  created_at: string;
  followups: { question: string; answer: string; created_at: string }[];
}

function getImagePaths(imagePath: string | string[]): string[] {
  if (Array.isArray(imagePath)) return imagePath;
  try {
    const parsed = JSON.parse(imagePath);
    return Array.isArray(parsed) ? parsed : [imagePath];
  } catch {
    return imagePath ? [imagePath] : [];
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryPage() {
  const { authHeaders } = useAuth();
  const [list, setList] = useState<AnalysisSummary[]>([]);
  const [detail, setDetail] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/history`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) setList(data.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const viewDetail = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/history/${id}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) setDetail(data.data);
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบรายการนี้?")) return;
    setDeleting(id);
    try {
      await fetch(`${API_URL}/api/history/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      setList((prev) => prev.filter((item) => item.id !== id));
      if (detail?.id === id) setDetail(null);
    } catch {
      /* ignore */
    } finally {
      setDeleting(null);
    }
  };

  return (
    <ProtectedRoute>
      <main className="flex-1 flex flex-col">
        <NavBar />

        <div className="flex-1 px-4 py-6">
          <div className="w-full max-w-lg mx-auto">
            {/* Detail View */}
            {detail ? (
              <div className="animate-fade-in-up">
                {/* Back button */}
                <button
                  onClick={() => setDetail(null)}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 mb-4 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  กลับไปรายการ
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                  {/* Image(s) */}
                  {getImagePaths(detail.image_path).length > 0 && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={`${API_URL}/uploads/${getImagePaths(detail.image_path)[0]}`}
                        alt={detail.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-2xl font-bold text-white">
                          {detail.name}
                        </h2>
                        <p className="text-white/80 text-sm">
                          {detail.name_en}
                        </p>
                      </div>
                      {getImagePaths(detail.image_path).length > 1 && (
                        <div className="absolute bottom-16 left-4 right-4 flex gap-1.5 justify-center">
                          {getImagePaths(detail.image_path).map((p, i) => (
                            <div key={i} className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/40 flex-shrink-0">
                              <img src={`${API_URL}/uploads/${p}`} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6 space-y-5">
                    <p className="text-xs text-gray-400">
                      {formatDate(detail.created_at)}
                    </p>

                    {/* Calories + Nutrition */}
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-white">
                            {detail.calories}
                          </p>
                          <p className="text-[10px] text-white/80 -mt-1">
                            kcal
                          </p>
                        </div>
                      </div>
                      <div className="flex-1 space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">โปรตีน</span>
                          <span className="font-semibold">
                            {detail.protein}g
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">คาร์โบไฮเดรต</span>
                          <span className="font-semibold">{detail.carbs}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">ไขมัน</span>
                          <span className="font-semibold">{detail.fat}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">ไฟเบอร์</span>
                          <span className="font-semibold">{detail.fiber}g</span>
                        </div>
                      </div>
                    </div>

                    {/* Ingredients */}
                    {detail.ingredients && detail.ingredients.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-2">
                          ส่วนประกอบหลัก
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {detail.ingredients.map((ing, i) => (
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

                    {/* Health tip */}
                    {detail.health_tip && (
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                        <p className="text-sm font-semibold text-blue-800 mb-1">
                          คำแนะนำ
                        </p>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          {detail.health_tip}
                        </p>
                      </div>
                    )}

                    {/* Follow-up history */}
                    {detail.followups && detail.followups.length > 0 && (
                      <div className="border-t border-gray-100 pt-4">
                        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">
                          คำถามที่เคยถาม
                        </h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {detail.followups.map((qa, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex justify-end">
                                <div className="bg-green-500 text-white text-sm px-4 py-2 rounded-2xl rounded-br-md max-w-[85%]">
                                  {qa.question}
                                </div>
                              </div>
                              <div className="flex justify-start">
                                <div className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-2xl rounded-bl-md max-w-[85%] leading-relaxed">
                                  {qa.answer}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* List View */}
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  ประวัติการวิเคราะห์
                </h2>

                {loading ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="flex justify-center gap-1.5 mb-3">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2.5 h-2.5 rounded-full bg-green-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                    กำลังโหลด...
                  </div>
                ) : list.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-10 h-10 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-400 font-medium">
                      ยังไม่มีประวัติการวิเคราะห์
                    </p>
                    <p className="text-gray-300 text-sm mt-1">
                      ลองวิเคราะห์อาหารสักจานดูสิ!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {list.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div
                          className="flex gap-3 p-3 cursor-pointer"
                          onClick={() => viewDetail(item.id)}
                        >
                          {/* Thumbnail */}
                          {getImagePaths(item.image_path).length > 0 && (
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                              <img
                                src={`${API_URL}/uploads/${getImagePaths(item.image_path)[0]}`}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                              {getImagePaths(item.image_path).length > 1 && (
                                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white font-bold">
                                  +{getImagePaths(item.image_path).length - 1}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-400 truncate">
                              {item.name_en}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-sm font-bold text-orange-500">
                                {item.calories} kcal
                              </span>
                              <span className="text-xs text-gray-300">
                                {formatDate(item.created_at)}
                              </span>
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="flex items-center">
                            <svg
                              className="w-5 h-5 text-gray-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>

                        {/* Delete */}
                        <div className="border-t border-gray-50 px-3 py-2 flex justify-end">
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deleting === item.id}
                            className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            {deleting === item.id ? "กำลังลบ..." : "ลบ"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-100">
          <p>Powered by OpenAI GPT-4o</p>
        </footer>
      </main>
    </ProtectedRoute>
  );
}
