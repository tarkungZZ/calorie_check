"use client";

import { useRef, useState, useCallback } from "react";

interface ImageUploadProps {
  onAnalyze: (images: string[], description: string) => void;
  isLoading: boolean;
}

const MAX_IMAGES = 5;

export default function ImageUpload({ onAnalyze, isLoading }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  const processFiles = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (imageFiles.length === 0) return;

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => {
          if (prev.length >= MAX_IMAGES) return prev;
          return [...prev, reader.result as string];
        });
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files?.length) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        processFiles(e.target.files);
        e.target.value = "";
      }
    },
    [processFiles]
  );

  const handleRemoveImage = useCallback((index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearAll = useCallback(() => {
    setPreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }, []);

  const handleSubmit = useCallback(() => {
    if (previews.length > 0) {
      onAnalyze(previews, description.trim());
    }
  }, [previews, description, onAnalyze]);

  return (
    <div className="w-full max-w-lg mx-auto">
      {previews.length === 0 ? (
        <>
          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
              ${
                dragActive
                  ? "border-green-500 bg-green-50 scale-[1.02]"
                  : "border-gray-300 hover:border-green-400 hover:bg-green-50/50"
              }
              ${isLoading ? "opacity-50 pointer-events-none" : ""}
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <div>
                <p className="text-lg font-semibold text-gray-700">
                  ลากรูปมาวางที่นี่
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  หรือคลิกเพื่อเลือกรูปจากเครื่อง
                </p>
              </div>

              <p className="text-xs text-gray-400">
                เลือกได้สูงสุด {MAX_IMAGES} รูป เพื่อวิเคราะห์จากหลายมุมมอง
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-400 font-medium">หรือ</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Camera Button */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            disabled={isLoading}
            className="
              w-full flex items-center justify-center gap-3 py-4 px-6
              bg-gradient-to-r from-green-500 to-emerald-600
              hover:from-green-600 hover:to-emerald-700
              text-white font-semibold rounded-2xl
              transition-all duration-300 transform hover:scale-[1.02]
              shadow-lg hover:shadow-xl
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            "
          >
            <svg
              className="w-6 h-6"
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
            ถ่ายรูปอาหาร
          </button>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      ) : (
        <div className="space-y-5">
          {/* Image Previews Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">
                รูปภาพ ({previews.length}/{MAX_IMAGES})
              </p>
              <button
                onClick={handleClearAll}
                disabled={isLoading}
                className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                ลบทั้งหมด
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm group"
                >
                  <img
                    src={src}
                    alt={`รูปที่ ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage(i)}
                    disabled={isLoading}
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    aria-label="ลบรูป"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="absolute bottom-1 left-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">
                      {i + 1}
                    </span>
                  </div>
                </div>
              ))}

              {/* Add More Button */}
              {previews.length < MAX_IMAGES && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50/50 flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50"
                >
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-[10px] text-gray-400">เพิ่มรูป</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            {previews.length > 1 && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                หลายรูปช่วยให้ AI วิเคราะห์ได้แม่นยำขึ้น
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="food-description"
              className="block text-sm font-semibold text-gray-700 mb-1.5"
            >
              อธิบายอาหารเพิ่มเติม{" "}
              <span className="font-normal text-gray-400">(ไม่บังคับ)</span>
            </label>
            <textarea
              id="food-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
              placeholder="เช่น ปลาทอดน้ำปลา, ข้าวกล้อง, ไม่ใส่น้ำตาล เพื่อให้ AI วิเคราะห์ได้แม่นยำขึ้น"
              className="
                w-full px-4 py-3 rounded-xl border border-gray-200
                text-sm text-gray-700 placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent
                resize-none transition-all
                disabled:opacity-50 disabled:bg-gray-50
              "
            />
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
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
              ระบุวิธีปรุงหรือวัตถุดิบช่วยให้ผลแม่นยำขึ้น
            </p>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="
              w-full flex items-center justify-center gap-3 py-4 px-6
              bg-gradient-to-r from-green-500 to-emerald-600
              hover:from-green-600 hover:to-emerald-700
              text-white font-semibold rounded-2xl
              transition-all duration-300 transform hover:scale-[1.02]
              shadow-lg hover:shadow-xl
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            "
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            วิเคราะห์แคลอรี่
            {previews.length > 1 && ` (${previews.length} รูป)`}
          </button>
        </div>
      )}
    </div>
  );
}
