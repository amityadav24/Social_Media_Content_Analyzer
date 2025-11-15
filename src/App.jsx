import { useState } from "react";
import DocumentUploader from "./components/DocumentUploader";

function App() {
  const [theme, setTheme] = useState("light");
  const isDark = theme === "dark";

  return (
    <div
      className={
        "min-h-screen flex items-center justify-center transition-colors duration-300 " +
        (isDark
          ? "bg-slate-950 text-slate-50"
          : "bg-gradient-to-br from-sky-50 via-white to-sky-100 text-slate-900")
      }
    >
      <div className="absolute top-4 right-4 flex items-center gap-2 text-xs sm:text-sm">
        <span className={isDark ? "text-slate-300" : "text-slate-600"}>
          {isDark ? "Dark" : "Light"} mode
        </span>
        <button
          onClick={() =>
            setTheme((t) => (t === "light" ? "dark" : "light"))
          }
          className={
            "w-10 h-6 rounded-full flex items-center px-0.5 transition " +
            (isDark ? "bg-sky-500" : "bg-slate-300")
          }
        >
          <span
            className={
              "w-5 h-5 rounded-full bg-white shadow transform transition " +
              (isDark ? "translate-x-4" : "translate-x-0")
            }
          />
        </button>
      </div>

      <DocumentUploader theme={theme} />
    </div>
  );
}

export default App;
