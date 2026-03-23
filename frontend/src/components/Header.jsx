import { useState } from "react";
import "./Header.css";

const languages = [
  { code: "en", label: "English" },
  { code: "te", label: "తెలుగు" },
  { code: "hi", label: "हिंदी" },
  { code: "ta", label: "தமிழ்" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "bn", label: "বাংলা" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "mr", label: "मराठी" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "or", label: "ଓଡ଼ିଆ" },
  { code: "as", label: "অসমীয়া" },
  { code: "sa", label: "संस्कृत" },
  { code: "ne", label: "नेपाली" },
  { code: "ur", label: "اردو" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" }
];

export default function Header() {
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");

  const changeLanguage = (e) => {
    const selectedLang = e.target.value;
    setLang(selectedLang);
    localStorage.setItem("lang", selectedLang);

    // 🔥 Force re-render
    window.location.reload();
  };

  return (
    <header className="app-header">
      <h2 className="logo">Handloom</h2>

      <select value={lang} onChange={changeLanguage}>
        {languages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </header>
  );
}
