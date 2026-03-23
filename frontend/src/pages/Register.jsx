import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { t } from "../i18n";
import api from "../api";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "";

  // 🔹 FORM STATES
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idProof, setIdProof] = useState(null);
  const [error, setError] = useState("");

  const [weaverMaterial, setWeaverMaterial] = useState("");
  const [weaverSareeType, setWeaverSareeType] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");

  const materialSareeMap = {
    Pattu: ["Kanchipuram", "Dharmavaram", "Venkatagiri", "Uppada", "Jamdani", "Banarasi", "Paithani", "Baluchari", "Arani", "Mysore", "Pochampally"],
    Cotton: ["Kanchipuram", "Dharmavaram", "Venkatagiri", "Uppada", "Jamdani", "Banarasi", "Paithani", "Baluchari", "Arani", "Mysore", "Pochampally"],
    Wool: ["Kullu Wool", "Kashmir Wool", "Himachal Wool"],
    Linen: ["Chanderi Linen", "Maheshwari Linen", "Kerala Linen"],
    Blended: ["Silk Cotton", "Cotton Linen"],
    Zari: ["Pure Zari Kanchipuram", "Zari Banarasi"]
  };

  const handleRegister = async () => {
    if (!name || !role || !email || !password) {
      setError("Please fill all fields");
      return;
    }

    if (role === "weaver" && (!weaverMaterial || !weaverSareeType || !yearsExperience)) {
      setError("Please fill all weaver-specific fields, including years of experience");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("state", state);
      formData.append("role", role);
      formData.append("email", email);
      formData.append("password", password);
      
      if (idProof) {
        console.log("Appending ID Proof:", idProof.name);
        formData.append("idProof", idProof);
      }
      
      if (role === "weaver") {
        console.log("Appending Weaver data:", weaverMaterial, weaverSareeType, yearsExperience);
        formData.append("weaver_material", weaverMaterial);
        formData.append("weaver_saree_type", weaverSareeType);
        formData.append("years_experience", yearsExperience);
      }

      console.log("Sending registration request for:", email);
      const res = await api.post("/auth/register", formData);
      console.log("Registration successful:", res.data);
      
      const { role: userRole, name: userName, id: userId, email: userEmail, weaver_material, weaver_saree_type } = res.data;
      
      localStorage.setItem("userRole", userRole);
      localStorage.setItem("userName", userName);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userEmail", userEmail);
      if (weaver_material) localStorage.setItem("weaverMaterial", weaver_material);
      if (weaver_saree_type) localStorage.setItem("weaverSareeType", weaver_saree_type);

      alert("Registration Successful! Welcome to Handloom Connect.");
      setError("");

      if (userRole === "weaver") navigate("/weaver");
      else if (userRole === "supplier") navigate("/supplier");
      else if (userRole === "buyer") navigate("/buyer");
    } catch (err) {
      console.error("Registration Error Details:", err);
      const msg = err.response?.data?.error || err.message || "Registration failed. Connectivity issue?";
      setError(msg);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{t("register")}</h2>

        {error && <p className="error-text">{error}</p>}

        <input
          placeholder={`Name of the ${role || "User"}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder={t("state")}
          value={state}
          onChange={(e) => setState(e.target.value)}
        />

        <p className="role-label">Registering as: <strong>{role.toUpperCase()}</strong></p>

        {role === "weaver" && (
          <div className="specialization-box">
            <select
              value={weaverMaterial}
              onChange={(e) => {
                setWeaverMaterial(e.target.value);
                setWeaverSareeType("");
              }}
            >
              <option value="">Select Handloom Material</option>
              {Object.keys(materialSareeMap).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              value={weaverSareeType}
              onChange={(e) => setWeaverSareeType(e.target.value)}
              disabled={!weaverMaterial}
            >
              <option value="">Select Saree Type</option>
              {weaverMaterial &&
                materialSareeMap[weaverMaterial].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
            </select>

            <input
              type="number"
              placeholder="Years of Experience"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              style={{marginTop: '10px'}}
            />
          </div>
        )}

        {/* 🔥 ID PROOF FIELD (CONDITIONAL) */}
        {(role === "weaver" || role === "supplier") && (
          <div className="file-box">
            <label>{t("idProof")} *</label>
            <input
              type="file"
              onChange={(e) => setIdProof(e.target.files[0])}
            />
          </div>
        )}

        <input
          placeholder={t("email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder={t("password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleRegister}>
          {t("register")}
        </button>

        <p
          className="auth-link"
          onClick={() => navigate("/login")}
        >
          {t("already")}
        </p>
      </div>
    </div>
  );
}
