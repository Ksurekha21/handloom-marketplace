import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { t } from "../i18n";
import api from "../api";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedRole = searchParams.get("role") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
      
      const { role, name, id, email: userEmail, weaver_material, weaver_saree_type } = res.data;
      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", name);
      localStorage.setItem("userId", id);
      localStorage.setItem("userEmail", userEmail);
      if (weaver_material) localStorage.setItem("weaverMaterial", weaver_material);
      if (weaver_saree_type) localStorage.setItem("weaverSareeType", weaver_saree_type);

      if (role === "weaver") navigate("/weaver");
      else if (role === "supplier") navigate("/supplier");
      else if (role === "buyer") navigate("/buyer");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Invalid credentials.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{t("login")}</h2>

        {error && <p className="error-text" style={{color: 'red'}}>{error}</p>}
        <input placeholder={t("email")} value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" placeholder={t("password")} value={password} onChange={e=>setPassword(e.target.value)} />

        <button onClick={handleLogin}>
          {t("login")}
        </button>

        <p
          className="auth-link"
          onClick={() => navigate(`/register?role=${selectedRole}`)}
        >
          {t("noAccount")}
        </p>
      </div>
    </div>
  );
}
