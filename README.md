# Calorie Check - เช็คแคลอรี่จากรูปอาหาร

แอพวิเคราะห์แคลอรี่อาหารด้วย AI เพียงถ่ายรูปหรืออัพโหลดรูปอาหาร แล้ว AI จะวิเคราะห์ชื่ออาหาร แคลอรี่ และสารอาหารให้คุณทันที

## Tech Stack

- **Frontend**: Next.js + React + Tailwind CSS
- **Backend**: Node.js + Express
- **AI**: OpenAI GPT-4o (Vision)

## โครงสร้างโปรเจกต์

```
calorie_check/
├── backend/           # Express.js API server
│   ├── server.js      # Main server + OpenAI API integration
│   ├── package.json
│   └── .env           # API key config
├── frontend/          # Next.js app
│   ├── src/
│   │   ├── app/       # App router pages
│   │   └── components/
│   │       ├── ImageUpload.tsx    # Camera/upload component
│   │       ├── ResultDisplay.tsx  # Nutrition result display
│   │       └── LoadingSpinner.tsx # Loading animation
│   └── .env.local     # Frontend config
└── README.md
```

## เริ่มต้นใช้งาน

### 1. ขอ API Key จาก OpenAI

ไปที่ [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys) แล้วสร้าง API Key

### 2. ตั้งค่า Backend

```bash
cd backend
npm install

# แก้ไขไฟล์ .env ใส่ API Key
# OPENAI_API_KEY=your_api_key_here

# รันเซิร์ฟเวอร์
npm run dev
```

Backend จะรันที่ `http://localhost:5000`

### 3. ตั้งค่า Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend จะรันที่ `http://localhost:3000`

### 4. เปิดใช้งาน

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000` แล้วถ่ายรูปหรืออัพโหลดรูปอาหารได้เลย

## ฟีเจอร์

- ถ่ายรูปอาหารจากกล้อง (มือถือ)
- อัพโหลดรูปจากเครื่อง
- ลากรูปมาวาง (Drag & Drop)
- วิเคราะห์ชื่ออาหาร (ไทย + อังกฤษ)
- ประมาณค่าแคลอรี่ (kcal)
- แสดงสารอาหาร (โปรตีน, คาร์บ, ไขมัน, ไฟเบอร์)
- แสดงส่วนประกอบหลัก
- คำแนะนำด้านสุขภาพ

## หมายเหตุ

ค่าแคลอรี่และสารอาหารเป็นค่าประมาณจาก AI ไม่ควรใช้แทนคำแนะนำจากนักโภชนาการ
