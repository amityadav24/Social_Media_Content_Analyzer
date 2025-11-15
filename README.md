# Social Media Content Analyzer

A lightweight web application that extracts and analyzes text from PDFs and image files (including scanned documents). Built as part of a technical assessment to demonstrate clean architecture, problem-solving, and production-ready UI/UX.

## 🚀 Features

### 🗂 File Upload

- Drag & drop or browse to upload files
- Supports **PDF** and **image formats (JPG/PNG/etc.)**
- File size validation (max 10MB)

### 🔍 Text Extraction

- **PDF Parsing** using `pdfjs-dist`, with preserved line formatting
- **OCR for Images** using Tesseract.js
- Real-time OCR progress indicator

### 📊 Content Analysis

- Word, character, and line count
- Hashtag, mention, and emoji detection
- Engagement improvement suggestions
- Downloadable full analysis report (`.txt`)

### 🎨 UI / UX

- Responsive layout
- Light & Dark theme toggle
- Smooth transitions and subtle animations
- Loading indicators and disabled states for better feedback
- Clean, accessible, and minimal interface

## 🛠 Tech Stack

- **React + Vite**
- **Tailwind CSS**
- **pdfjs-dist** (PDF text extraction)
- **Tesseract.js** (OCR engine)
- **react-dropzone** (file upload)

## ▶️ Running Locally

```bash
npm install
npm run dev
```
