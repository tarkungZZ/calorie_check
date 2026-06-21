"use client";

export default function LoadingSpinner() {
  return (
    <div className="w-full max-w-lg mx-auto mt-8 animate-fade-in-up">
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 animate-spin-slow" />

          {/* Inner icon */}
          <div className="absolute inset-3 rounded-full bg-green-50 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          กำลังวิเคราะห์อาหาร...
        </h3>
        <p className="text-sm text-gray-500">
          AI กำลังตรวจสอบภาพและคำนวณแคลอรี่ให้คุณ
        </p>

        <div className="flex justify-center gap-1.5 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-green-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
