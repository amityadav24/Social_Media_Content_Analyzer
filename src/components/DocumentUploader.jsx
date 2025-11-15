import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";
import AnalysisPanel from "./AnalysisPanel";
import { analyzeText, buildReport } from "../utils/analysis";

// Use pdf.js worker from CDN (simple + free)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const DocumentUploader = ({ theme = "light" }) => {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("auto"); // auto / pdf / image
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [error, setError] = useState("");

  const isDark = theme === "dark";

  // ---------- Helpers ----------

  const resetState = () => {
    setExtractedText("");
    setError("");
    setOcrProgress(0);
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File is too large. Please upload a file under 10MB.");
      return;
    }
    setFile(selectedFile);
    resetState();
    extractText(selectedFile);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    handleFile(selectedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [],
      "image/*": [],
    },
    multiple: false,
    disabled: loading,
    noClick: true, // prevent auto-open on card click
    noKeyboard: true,
  });

  // ---------- PDF Formatting Helper ----------

  const buildFormattedText = (textContent) => {
    const lines = {};

    textContent.items.forEach((item) => {
      const [, , , , x, y] = item.transform; // only x, y (avoid ESLint unused vars)
      const key = Math.round(y);
      if (!lines[key]) lines[key] = [];
      lines[key].push({ x, str: item.str });
    });

    return Object.keys(lines)
      .map(Number)
      .sort((a, b) => b - a) // PDF origin bottom-left → reverse
      .map((y) =>
        lines[y]
          .sort((i1, i2) => i1.x - i2.x)
          .map((i) => i.str)
          .join(" ")
      )
      .join("\n");
  };

  // ---------- Extraction Logic ----------

  const extractTextFromPdf = (file) => {
    setLoading(true);
    setError("");
    setExtractedText("");

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const typedArray = new Uint8Array(reader.result);
        const loadingTask = pdfjsLib.getDocument({ data: typedArray });
        const pdf = await loadingTask.promise;

        let fullText = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = buildFormattedText(textContent);
          fullText += pageText + "\n\n";
        }

        setExtractedText(
          fullText.trim() || "No readable text was found in this PDF."
        );
      } catch (err) {
        console.error("PDF parsing error:", err);
        setError("Failed to read PDF. Try another file.");
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Unable to read this file.");
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const extractTextFromImage = (file) => {
    setLoading(true);
    setError("");
    setExtractedText("");
    setOcrProgress(0);

    Tesseract.recognize(file, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text" && m.progress) {
          setOcrProgress(Math.round(m.progress * 100));
        }
      },
    })
      .then(({ data: { text } }) => {
        setExtractedText(
          text.trim() || "No readable text found in this image."
        );
      })
      .catch((err) => {
        console.error("Tesseract error:", err);
        setError(
          "Failed to run OCR on this image. Please try a clearer JPG/PNG."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const extractText = (file) => {
    if (!file) return;

    const type = file.type;
    const forcedPdf = mode === "pdf";
    const forcedImage = mode === "image";

    if ((type === "application/pdf" && !forcedImage) || forcedPdf) {
      extractTextFromPdf(file);
    } else if ((type.startsWith("image/") && !forcedPdf) || forcedImage) {
      extractTextFromImage(file);
    } else {
      setError(
        "Unsupported file type for the selected mode. Please upload a PDF or image."
      );
    }
  };

  // ---------- Download Report ----------

  const handleDownload = () => {
    if (!extractedText) return;
    const analysis = analyzeText(extractedText);
    const report = buildReport(extractedText, analysis);
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "content-analysis-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- Theming helpers ----------

  const cardBg = isDark
    ? "bg-slate-900 border-slate-700"
    : "bg-gradient-to-br from-sky-50 via-white to-sky-100 border-sky-100";
  const textHeading = isDark ? "text-sky-200" : "text-sky-900";
  const textMuted = isDark ? "text-slate-300" : "text-sky-700";
  const subtleBg = isDark
    ? "bg-slate-800 border-slate-700"
    : "bg-sky-50 border-sky-100";

  // ---------- UI ----------

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div
        className={`${cardBg} rounded-3xl shadow-xl p-6 sm:p-8 mt-10 border transition-colors`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-semibold ${textHeading}`}>
              Social Media Content Analyzer
            </h1>
            <p className={`text-sm mt-1 ${textMuted}`}>
              Upload a PDF or image (scanned document) to extract and analyze
              text.
            </p>
          </div>

          {/* Dropdown mode selector */}
          <div className="flex items-center gap-2">
            <label className={`text-sm font-medium ${textMuted}`}>Mode:</label>

            <select
              value={mode}
              disabled={loading}
              onChange={(e) => setMode(e.target.value)}
              className={
                `text-sm rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 disabled:opacity-60 ` +
                (isDark
                  ? "bg-slate-800 border-slate-600 text-slate-100"
                  : "bg-white border-sky-200 text-slate-900")
              }
            >
              <option value="auto">Auto detect</option>
              <option value="pdf">PDF only</option>
              <option value="image">Image only</option>
            </select>
          </div>
        </div>

        {/* Upload area */}
        <div className="grid gap-4 sm:grid-cols-[2fr,1fr] items-start">
          {/* Drag & Drop Card */}
          <div
            {...getRootProps()}
            className={`relative rounded-2xl border-2 border-dashed p-6 sm:p-8 cursor-pointer transition-all duration-200 ${
              loading
                ? "opacity-60 cursor-not-allowed"
                : isDragActive
                ? "border-sky-500 " +
                  (isDark ? "bg-slate-800" : "bg-sky-50") +
                  " shadow-lg scale-[1.01]"
                : "border-sky-200 " +
                  (isDark ? "bg-slate-900" : "bg-white") +
                  " hover:bg-sky-50 hover:shadow-md"
            }`}
          >
            {/* SINGLE input managed by react-dropzone */}
            <input {...getInputProps()} />

            <div className="flex flex-col items-center text-center gap-3">
              {/* Icon */}
              <div
                className={
                  "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-sm " +
                  (isDark ? "bg-slate-700" : "bg-sky-100")
                }
              >
                <span className="text-2xl">📄</span>
              </div>

              <div>
                <p className={`font-medium ${textHeading}`}>
                  {isDragActive
                    ? "Drop your file here"
                    : "Drag & drop a file here"}
                </p>
                <p className={`text-xs mt-1 ${textMuted}`}>
                  PDF & image files are supported (max 10MB)
                </p>
              </div>

              <div className="mt-3">
                <span className="text-xs uppercase tracking-wide text-sky-500">
                  or
                </span>
              </div>

              {/* Browse button using dropzone's open() → no extra <input> */}
              <button
                type="button"
                onClick={() => !loading && open()}
                className={
                  "inline-flex items-center justify-center px-4 py-2 rounded-full bg-sky-500 text-white text-sm font-medium shadow-md hover:bg-sky-600 active:scale-95 transition transform " +
                  (loading ? "opacity-60 cursor-not-allowed" : "")
                }
              >
                Browse files
              </button>

              {/* Selected file info */}
              {file && (
                <p className={`mt-2 text-xs ${textMuted}`}>
                  Selected: <span className="font-semibold">{file.name}</span>
                </p>
              )}
            </div>
          </div>

          {/* Side info / status */}
          <div className="space-y-3">
            <div className={`${subtleBg} rounded-2xl p-4 shadow-sm`}>
              <h2 className={`text-sm font-semibold mb-1 ${textHeading}`}>
                How it works
              </h2>
              <ul
                className={`text-xs space-y-1 list-disc list-inside ${textMuted}`}
              >
                <li>PDF Parsing: extract text while preserving line breaks.</li>
                <li>OCR: extract text from image files using Tesseract.</li>
                <li>Drag & drop or click “Browse files” to upload.</li>
              </ul>
            </div>

            {loading && (
              <div
                className={`${subtleBg} flex items-center gap-2 rounded-2xl px-4 py-3 shadow-sm`}
              >
                <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${textHeading}`}>
                    Processing...
                  </span>
                  {ocrProgress > 0 && (
                    <span className={`text-xs ${textMuted}`}>
                      OCR progress: {ocrProgress}%
                    </span>
                  )}
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 shadow-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Extracted text + Download + Analysis */}
        {extractedText && (
          <>
            <div className="mt-6 flex items-center justify-between gap-2">
              <h2 className={`text-lg font-semibold ${textHeading}`}>
                Extracted Text
              </h2>
              <button
                type="button"
                onClick={handleDownload}
                className="text-xs sm:text-sm px-3 py-1.5 rounded-full bg-sky-500 text-white shadow hover:bg-sky-600 active:scale-95 transition"
              >
                Download Report
              </button>
            </div>

            <textarea
              value={extractedText}
              readOnly
              rows={10}
              className={
                "w-full text-sm font-mono rounded-2xl border p-4 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 " +
                (isDark
                  ? "bg-slate-900 border-slate-700 text-slate-100"
                  : "bg-white border-sky-200 text-slate-900")
              }
            />

            <AnalysisPanel text={extractedText} />
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentUploader;
