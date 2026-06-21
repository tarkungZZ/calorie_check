"use client";

import { useEffect, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function VersionChecker() {
  const knownVersion = useRef<string | null>(null);

  useEffect(() => {
    async function checkVersion() {
      try {
        const res = await fetch(`${API_URL}/api/version`, {
          cache: "no-store",
        });
        const data = await res.json();
        const serverVersion = data.buildTime || data.version;

        if (!knownVersion.current) {
          knownVersion.current = serverVersion;
          return;
        }

        if (knownVersion.current !== serverVersion) {
          knownVersion.current = serverVersion;
          if ("caches" in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          }
          window.location.reload();
        }
      } catch {
        // Server unreachable, skip
      }
    }

    checkVersion();
    const interval = setInterval(checkVersion, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return null;
}
