import { useState, useEffect } from "react";
import "./Dashboard.css";
import api from "../api";

export default function SupplierMarketplace() {
  const userRole = localStorage.getItem("userRole"); 
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (userRole === "weaver") {
      fetchMaterials();
    }
  }, [userRole]);

  const fetchMaterials = async () => {
    try {
      const res = await api.get("/supplier/materials");
      setItems(res.data.materials);
    } catch (err) {
      console.error(err);
    }
  };

  if (userRole !== "weaver") {
    return (
      <div className="dashboard-container">
        <h2>Access Denied</h2>
        <p>This page is only for weavers.</p>
      </div>
    );
  }

  const handleBuy = (item) => {
    alert("Purchase functionality requires Payment Gateway integration.");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Supplier Marketplace 🏪</h1>
        <button onClick={() => window.location.href = "/weaver"}>
          Back to Weaver Dashboard
        </button>
      </div>

      {items.length === 0 ? (
        <p>No tools or raw materials available.</p>
      ) : (
        <div className="list-card">
          <h2>Available Tools & Raw Materials</h2>
          <div className="saree-list">
            {items.map((item) => (
              <div key={item.id} className="saree-item">
                <p><strong>Material:</strong> {item.type}</p>
                <p><strong>Quantity:</strong> {item.quantity}</p>
                <p><strong>Cost:</strong> ₹{item.price}</p>
                <button onClick={() => handleBuy(item)}>Buy</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}