"use client";

import { useEffect, useState } from "react";

export default function PWAInstall() {
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const ua = navigator.userAgent;
    const ios =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone;

    if (ios && !standalone) {
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed) {
        setIsIOS(true);
        setShowBanner(true);
      }
    }
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-orange-500 text-white safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-start gap-3">
        <div className="flex-1">
          <p className="font-bold text-sm">ติดตั้ง Calorie Check</p>
          {isIOS ? (
            <p className="text-xs mt-1 opacity-90">
              กดปุ่ม{" "}
              <span className="inline-block bg-white/20 rounded px-1">
                ⎙ แชร์
              </span>{" "}
              ด้านล่าง แล้วเลือก{" "}
              <strong>&quot;เพิ่มไปยังหน้าจอโฮม&quot;</strong>
            </p>
          ) : (
            <p className="text-xs mt-1 opacity-90">
              เพิ่มแอพลงหน้าจอโฮมเพื่อใช้งานแบบเต็มจอ
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setShowBanner(false);
            localStorage.setItem("pwa-install-dismissed", "1");
          }}
          className="text-white/80 hover:text-white text-xl leading-none mt-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
