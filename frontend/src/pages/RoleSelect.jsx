import { useNavigate } from "react-router-dom";
import { t } from "../i18n";
import "./Role.css";

import weaverImg from "../assets/roles/weaver.png";
import supplierImg from "../assets/roles/supplier.png";
import buyerImg from "../assets/roles/buyer.png";

export default function Role() {
  const navigate = useNavigate();

  return (
    <div className="role-container">
      <h1 className="role-title">{t("selectRole")}</h1>

      <div className="role-grid">

        <div
          className="role-card"
          onClick={() => navigate("/login?role=weaver")}
        >
          <img src={weaverImg} alt="Weaver" className="role-image" />
          <h3>{t("weaver")}</h3>
          <p>Sell handwoven sarees</p>
        </div>

        <div
          className="role-card"
          onClick={() => navigate("/login?role=supplier")}
        >
          <img src={supplierImg} alt="Supplier" className="role-image" />
          <h3>{t("supplier")}</h3>
          <p>Provide raw materials</p>
        </div>

        <div
          className="role-card"
          onClick={() => navigate("/login?role=buyer")}
        >
          <img src={buyerImg} alt="Buyer" className="role-image" />
          <h3>{t("buyer")}</h3>
          <p>Buy authentic sarees</p>
        </div>

      </div>
    </div>
  );
}
