# Build iOS App - Calorie Check

## ข้อกำหนด

- **Mac** พร้อม **Xcode 15+** (ดาวน์โหลดฟรีจาก App Store)
- **Apple Developer Account** ($99/ปี) สำหรับอัพขึ้น App Store
- **Node.js 18+** ติดตั้งบน Mac
- **CocoaPods** (`sudo gem install cocoapods`)

## ขั้นตอน Build

### 1. Clone โปรเจค (บน Mac)

```bash
git clone https://github.com/tarkungZZ/calorie_check.git
cd calorie_check/frontend
npm install
```

### 2. สร้าง .env.local (ถ้ายังไม่มี)

```bash
cp .env.production .env.local
```

### 3. Build สำหรับ iOS

```bash
npm run build:ios
```

คำสั่งนี้จะ:
- Build Next.js แบบ static export (ไฟล์ HTML/JS/CSS ลงโฟลเดอร์ `out/`)
- Sync ไฟล์ไปยัง iOS project

### 4. เปิด Xcode

```bash
npm run open:ios
```

### 5. ตั้งค่าใน Xcode

1. เลือก **App** target ในแถบซ้าย
2. ไปที่ **Signing & Capabilities**
3. เลือก **Team** (ต้อง login ด้วย Apple Developer Account)
4. เปลี่ยน **Bundle Identifier** ถ้าต้องการ (ค่าเริ่มต้น: `com.caloriecheck.app`)

### 6. ทดสอบ

- เลือก Simulator หรือเชื่อมต่อ iPhone จริง
- กด **Run** (▶️) หรือ `Cmd + R`

### 7. อัพขึ้น App Store

1. ใน Xcode เลือก **Product > Archive**
2. เมื่อ Archive เสร็จ กด **Distribute App**
3. เลือก **App Store Connect**
4. ทำตามขั้นตอน (upload)
5. ไปที่ [App Store Connect](https://appstoreconnect.apple.com) เพื่อจัดการแอพ

## อัพเดทแอพ (เวอร์ชันใหม่)

```bash
cd calorie_check/frontend
git pull origin main
npm run build:ios
npm run open:ios
# แล้ว Archive + Distribute ใน Xcode อีกครั้ง
```

## โครงสร้าง iOS Project

```
frontend/
├── ios/
│   └── App/
│       ├── App/
│       │   ├── Info.plist        # App permissions + config
│       │   ├── public/           # Web assets (auto-synced)
│       │   └── capacitor.config.json
│       ├── App.xcodeproj         # Xcode project
│       └── Podfile               # iOS dependencies
├── capacitor.config.ts           # Capacitor config
└── out/                          # Static export output
```

## หมายเหตุ

- แอพจะเชื่อมต่อ API ที่ `http://157.230.244.241` (ตั้งใน `.env.production`)
- Camera permission จะถามผู้ใช้ครั้งแรกที่ใช้งาน
- ถ้าต้องการเปลี่ยน App Icon ให้แก้ที่ `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
