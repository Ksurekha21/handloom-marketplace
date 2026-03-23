import { useNavigate } from "react-router-dom";
import "./Language.css";

const languages = [
  { code: "en", label: "English" },
  { code: "te", label: "తెలుగు" },
  { code: "ta", label: "தமிழ்" },
  { code: "hi", label: "हिंदी" },
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

export default function Language() {
  const navigate = useNavigate();

  const selectLanguage = (code) => {
    localStorage.setItem("lang", code);   // ✅ save language
    navigate("/role");                    // ✅ go to role select
  };

  return (
    <div className="lang-container">
      <h1 className="lang-title">Choose your language</h1>

      <div className="lang-grid">
        {languages.map((lang) => (
          <button
            key={lang.code}
            className="lang-card"
            onClick={() => selectLanguage(lang.code)}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
