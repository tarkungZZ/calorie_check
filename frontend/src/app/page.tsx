"use client";

import { useState, useCallback } from "react";
import ImageUpload from "@/components/ImageUpload";
import ResultDisplay from "@/components/ResultDisplay";
import LoadingSpinner from "@/components/LoadingSpinner";
import NavBar from "@/components/NavBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

export default function Home() {
  const { authHeaders } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NutritionData | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = useCallback(
    async (images: string[], description: string) => {
      setImageUrls(images);
      setIsLoading(true);
      setResult(null);
      setAnalysisId(null);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify({ images, description }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "เกิดข้อผิดพลาด");
        }

        if (data.success) {
          setResult(data.data);
          if (data.analysisId) setAnalysisId(data.analysisId);
        } else {
          throw new Error(data.error || "ไม่สามารถวิเคราะห์ภาพได้");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
        setError(message);
        setResult(null);
      } finally {
        setIsLoading(false);
      }
    },
    [authHeaders]
  );

  const handleReset = useCallback(() => {
    setResult(null);
    setImageUrls([]);
    setAnalysisId(null);
    setError(null);
  }, []);

  return (
    <ProtectedRoute>
      <main className="flex-1 flex flex-col">
        <NavBar />

        {/* Main Content */}
        <div className="flex-1 px-4 py-8">
          {/* Upload Section */}
          {!result && !isLoading && (
            <div className="animate-fade-in-up">
              <ImageUpload onAnalyze={analyzeImage} isLoading={isLoading} />
            </div>
          )}

          {/* Loading */}
          {isLoading && <LoadingSpinner />}

          {/* Error */}
          {error && !isLoading && (
            <div className="w-full max-w-lg mx-auto mt-8 animate-fade-in-up">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <p className="text-red-700 font-medium mb-4">{error}</p>
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors"
                >
                  ลองใหม่อีกครั้ง
                </button>
              </div>
            </div>
          )}

          {/* Result */}
          {result && !isLoading && (
            <>
              <ResultDisplay
                data={result}
                imageUrls={imageUrls}
                apiUrl={API_URL}
                analysisId={analysisId}
              />
              <div className="w-full max-w-lg mx-auto mt-6 text-center">
                <button
                  onClick={handleReset}
                  className="
                    inline-flex items-center gap-2 px-8 py-3
                    bg-white border-2 border-green-500 text-green-600
                    font-semibold rounded-2xl
                    hover:bg-green-50 transition-all duration-300
                    shadow-sm hover:shadow-md
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
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  วิเคราะห์อาหารอื่น
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-100">
          <p>Powered by OpenAI GPT-4o</p>
          <p className="mt-1">
            * ค่าแคลอรี่เป็นค่าประมาณเท่านั้น ไม่ควรใช้แทนคำแนะนำจากนักโภชนาการ
          </p>
        </footer>
      </main>
    </ProtectedRoute>
  );
}
