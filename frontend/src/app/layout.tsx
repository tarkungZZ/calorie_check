import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import VersionChecker from "@/components/VersionChecker";
import PWAInstall from "@/components/PWAInstall";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f97316",
};

export const metadata: Metadata = {
  title: "Calorie Check - เช็คแคลอรี่จากรูปอาหาร",
  description:
    "ถ่ายรูปหรืออัพโหลดรูปอาหาร แล้วให้ AI วิเคราะห์แคลอรี่และสารอาหารให้คุณ",
  manifest: "/manifest.json",
  themeColor: "#f97316",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Calorie Check",
  },
  icons: {
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
      { url: "/icons/icon-152.png", sizes: "152x152" },
      { url: "/icons/icon-167.png", sizes: "167x167" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <VersionChecker />
          <PWAInstall />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
