import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { t } from "../i18n";
import api from "../api";

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export default function Weaver() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Weaver";
  const userId = localStorage.getItem("userId");
  const userEmail = localStorage.getItem("userEmail") || "weaver@example.com";
  const userState = localStorage.getItem("userState") || "Andhra Pradesh";
  const weaverMaterial = localStorage.getItem("weaverMaterial") || "Pattu";
  const weaverSareeType = localStorage.getItem("weaverSareeType") || "Kanchipuram";

  const [activeTab, setActiveTab] = useState("studio"); // studio, my-sarees, resource-hub, my-orders, profile
  const [sarees, setSarees] = useState([]);
  const [resources, setResources] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState({});

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [rawCost, setRawCost] = useState("");
  const [price, setPrice] = useState("");
  const [daysTaken, setDaysTaken] = useState("");
  const [color, setColor] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  // Ecosystem Features
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showQR, setShowQR] = useState(null); // saree object

  // Profit Analysis (AI Simulation)
  const [margin, setMargin] = useState(0);
  const [profit, setProfit] = useState(0);

  // Material Order states
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Advanced Tracking
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    } else {
      fetchSarees();
      fetchResources();
      fetchMyOrders();
      fetchBuyerOrders();
      const getStepStatus = (status) => {
        const steps = [
          "Pending",
          "Accepted",
          "Shipped",
          "Delivered"
        ]

        return steps.indexOf(status)

      }

      const acceptOrder = async (id) => {
        await api.post(`/weaver/accept-order/${id}`);

        fetchBuyerOrders()

      }

    }
  }, [userId]);

  // AI Profit Calculation
  useEffect(() => {
    if (price && rawCost) {
      const p = parseFloat(price);
      const c = parseFloat(rawCost);
      const prof = p - c;
      const marg = (prof / p) * 100;
      setProfit(prof);
      setMargin(marg.toFixed(1));
    } else {
      setProfit(0);
      setMargin(0);
    }
  }, [price, rawCost]);

  const fetchSarees = async () => {
    try {
      const res = await api.get(`/weaver/products/${userId}`);
      setSarees(res.data.products);
    } catch (e) {
      console.error("Error fetching sarees", e);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await api.get("/weaver/resources");
      setResources(res.data.resources);
    } catch (e) {
      console.error("Error fetching resources", e);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const res = await api.get(`/weaver/material-orders/${userId}`);
      setMyOrders(res.data.orders);
    } catch (e) {
      console.error("Error fetching my orders", e);
    }
  };
  const fetchBuyerOrders = async () => {

    try {

      const res = await api.get(`/weaver/buyer-orders/${userId}`);

      setBuyerOrders(res.data.orders)

    } catch (e) {

      console.error(e)

    }

  };
  const acceptOrder = async (id) => {
    try {

      await api.post(`/weaver/accept-order/${id}`)

      alert("Order Accepted")

      fetchBuyerOrders()

    }
    catch (e) {

      console.log(e)

      alert("Error accepting order")

    }

  };
  const updateBuyerOrderStatus = async (

    id,

    status,

    estimated_delivery = null

  ) => {

    await api.post(

      `/weaver/update-buyer-order-status/${id}`,

      {

        status: status,

        estimated_delivery: estimated_delivery

      }

    )

    fetchBuyerOrders()

  };

  const handleUpload = async () => {
    if (!price || !image || !color) {
      alert("Please enter price, color and upload an image of your masterpiece");
      return;
    }

    const sareeTitle = `${weaverSareeType} (${weaverMaterial})`;
    setLoading(true);
    try {
      await api.post("/weaver/product", {
        weaver_id: userId,
        title: sareeTitle,
        category: weaverSareeType,
        price: Number(price),
        color: color,
        days_to_weave: Number(daysTaken),
        raw_material_cost: Number(rawCost),
        description: `Hand-woven ${weaverMaterial} ${weaverSareeType}`,
        image_url: image
      });
      alert("Saree successfully added to your digital showroom!");
      fetchSarees();

      setRawCost("");
      setPrice("");
      setDaysTaken("");
      setColor("");
      setImage("");
      setActiveTab("my-sarees");
    } catch (e) {
      console.error("Upload error:", e);
      alert("Error adding saree. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!address || !phone) {
      alert("Please enter address and phone number");
      return;
    }

    try {
      await api.post("/weaver/order-material", {
        weaver_id: userId,
        material_id: selectedMaterial.id,
        quantity: selectedMaterial.quantity,
        total_price: selectedMaterial.price,
        payment_method: paymentMethod,
        address: address,
        phone: phone
      });
      alert(`Order for ${selectedMaterial.type} placed successfully! Supplier will be notified.`);
      setShowCheckout(false);
      setSelectedMaterial(null);
      setAddress("");
      setPhone("");
      fetchMyOrders();
    } catch (e) {
      console.error("Order error:", e);
      alert("Error placing order. Please try again.");
    }
  };

  const handleStudioMagic = () => {
    setIsEnhancing(true);
    setTimeout(() => {
      setIsEnhancing(false);
      alert("AI Enhancement applied! Colors and details optimized for the marketplace. ✨");
    }, 2000);
  };


  const renderStudio = () => (
    <div className="animate__animated animate__fadeIn" style={{ marginBottom: '100px' }}>
      {/* 🔹 AI CLIMATE GUIDE WIDGET */}
      <div className="climate-widget">
        <span style={{ fontSize: '30px' }}>🌤️</span>
        <div>
          <b style={{ fontSize: '14px', display: 'block' }}>AI Climate Guide</b>
          <p style={{ fontSize: '12px', margin: 0, opacity: 0.9 }}>Humidity is **65%**. Perfect for silk weaving. Keep bobbins in dry storage overnight.</p>
        </div>
      </div>

      <div className="form-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '24px', color: 'var(--primary)', marginBottom: '10px' }}>List a New Masterpiece</h2>
        <p style={{ color: '#888', marginBottom: '30px', fontSize: '14px' }}>
          Currently listing as a <b>{weaverSareeType}</b> specialist.
        </p>

        <div className="form-grid">
          <div className="form-group">
            <label>Raw Material Cost (₹)</label>
            <input placeholder="Ex: 4500" value={rawCost} onChange={(e) => setRawCost(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Saree Color</label>
            <input placeholder="Ex: Crimson Red" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Days to Weave</label>
            <input placeholder="Ex: 15" type="number" value={daysTaken} onChange={(e) => setDaysTaken(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Selling Price (₹)</label>
            <div style={{ position: 'relative' }}>
              <input placeholder="Ex: 12000" value={price} onChange={(e) => setPrice(e.target.value)} />
              <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', background: '#e1f5fe', color: '#01579b', padding: '4px 8px', borderRadius: '4px', fontStyle: 'italic' }}>AI Recommended: ₹11,500</span>
            </div>
          </div>
        </div>

        {/* 🔹 AI PROFIT ANALYSIS */}
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '15px', marginTop: '20px', display: 'flex', justifyContent: 'space-around', border: '1px dashed #ddd' }}>
          <div style={{ textAlign: 'center' }}>
            <label style={{ fontSize: '11px', color: '#999', display: 'block' }}>ESTIMATED PROFIT</label>
            <b style={{ fontSize: '20px', color: profit > 0 ? '#2e7d32' : '#c62828' }}>₹{profit}</b>
          </div>
          <div style={{ textAlign: 'center' }}>
            <label style={{ fontSize: '11px', color: '#999', display: 'block' }}>MARGIN</label>
            <b style={{ fontSize: '20px', color: margin > 20 ? '#2e7d32' : '#c62828' }}>{margin}%</b>
          </div>
          <div style={{ textAlign: 'center' }}>
            <label style={{ fontSize: '11px', color: '#999', display: 'block' }}>MARKET SCORE</label>
            <b style={{ fontSize: '20px', color: '#0288d1' }}>High ✨</b>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#800020', fontWeight: 'bold', marginBottom: '8px' }}>Saree Photo</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input type="file" accept="image/*" onChange={async (e) => {
              const file = e.target.files[0];
              if (file) setImage(await toBase64(file));
            }} />
            {image && (
              <button
                onClick={handleStudioMagic}
                style={{ width: 'auto', padding: '10px 20px', background: 'linear-gradient(45deg, #FFD700, #FFA500)', color: '#333', fontSize: '12px', borderRadius: '20px' }}
              >
                Studio Magic ✨
              </button>
            )}
          </div>
        </div>

        {image && (
          <div className={`studio-magic-container ${isEnhancing ? 'studio-magic-shimmer' : ''}`} style={{ marginTop: '20px' }}>
            <img src={image} alt="Preview" style={{ width: "100%", maxHeight: "300px", objectFit: 'cover', borderRadius: "14px", border: '2px dashed #d4af37' }} />
          </div>
        )}

        <button onClick={handleUpload} disabled={loading} style={{ marginTop: '30px', background: 'var(--primary)', color: 'white', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'block', width: '100%' }}>
          {loading ? "Uploading..." : "List Saree on Marketplace"}
        </button>
      </div>
    </div>
  );

  const filteredSarees = sarees.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const renderMySarees = () => (
    <div className="animate__animated animate__fadeIn" style={{ marginBottom: '100px' }}>
      <div className="info-box" style={{ background: 'var(--primary)', color: 'white', padding: '30px', textAlign: 'center', borderRadius: '24px', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>My Saree Collection</h2>
        <p style={{ opacity: 0.9, marginTop: '10px' }}>Managing <b>{sarees.length}</b> live listings in the marketplace.</p>
      </div>

      <div style={{ padding: '0 15px 20px 15px' }}>
        <input
          placeholder="Search your inventory (e.g. Red, Pattu)..."
          style={{ background: 'white', border: '1px solid #ddd', borderRadius: '20px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="saree-grid">
        {filteredSarees.map(s => (
          <div key={s.id} className="saree-card">
            <div className="card-image">
              {s.image_url ? <img src={s.image_url} alt="" /> : <div style={{ height: '200px', background: '#eee' }}></div>}
              <span className="badge">LIVE</span>
              <button
                onClick={() => setShowQR(s)}
                style={{ position: 'absolute', bottom: '10px', right: '10px', width: '40px', height: '40px', padding: 0, background: 'white', borderRadius: '20%', border: '1px solid #ddd' }}
              >
                🔳
              </button>
            </div>
            <div style={{ padding: '15px' }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{s.title}</h3>
              <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '18px', margin: '0 0 10px 0' }}>₹{s.price}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', background: '#f5f5f5', padding: '3px 8px', borderRadius: '4px' }}>{s.color}</span>
                <span style={{ fontSize: '11px', background: '#f5f5f5', padding: '3px 8px', borderRadius: '4px' }}>{s.days_to_weave} Days</span>
              </div>
            </div>
          </div>
        ))}
        {filteredSarees.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0' }}>
            <p style={{ color: '#999' }}>No matches found.</p>
          </div>
        )}
      </div>

      {showQR && (
        <div className="modal-overlay animate__animated animate__zoomIn" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 7000 }}>
          <div className="modal-content" style={{ background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center', maxWidth: '300px' }}>
            <h3>Digital Product ID</h3>
            <p style={{ fontSize: '11px', color: '#888', marginBottom: '20px' }}>{showQR.title}</p>
            <div className="qr-code-box">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=handloom-connect-product-${showQR.id}`} alt="QR" style={{ width: '100%' }} />
            </div>
            <p style={{ fontSize: '10px', marginTop: '15px', color: '#666' }}>Print this QR and attach to your physical product for buyer verification.</p>
            <button
              style={{ marginTop: '20px', background: '#eee', color: '#333' }}
              onClick={() => setShowQR(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderResourceHub = () => (
    <div className="animate__animated animate__fadeIn" style={{ marginBottom: '100px' }}>
      <div className="info-box" style={{ background: '#d4af37', color: 'white', padding: '30px', textAlign: 'center', borderRadius: '24px', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#333' }}>Artisan Resource Hub 🛍️</h2>
        <p style={{ opacity: 0.9, marginTop: '10px', color: '#444' }}>Premium materials for your next masterpiece.</p>
      </div>

      <div className="resource-hub-grid">
        {resources.map(res => (
          <div key={res.id} className="resource-card">
            <div style={{ position: 'relative' }}>
              {res.image_url ? <img src={res.image_url} alt="" className="resource-image" /> : <div className="resource-image" style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>🧶</div>}
              <span className="badge" style={{ position: 'absolute', top: '15px', right: '15px', background: res.category === 'Tool' ? '#333' : 'var(--accent)' }}>{res.category}</span>
            </div>
            <div style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{res.type}</h3>
              <p style={{ fontSize: '12px', color: '#888', margin: '0 0 15px 0' }}>Supplier: {res.supplier_name}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>₹{res.price}</span>
                <span style={{ fontSize: '12px', background: '#f0f0f0', padding: '4px 10px', borderRadius: '20px' }}>{res.quantity}</span>
              </div>
              <button
                style={{ background: 'var(--accent)', borderRadius: '12px' }}
                onClick={() => {
                  setSelectedMaterial(res);
                  setShowCheckout(true);
                }}
              >
                Order for Loom
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCheckout && selectedMaterial && (
        <div className="modal-overlay animate__animated animate__fadeIn" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6000 }}>
          <div className="modal-content" style={{ background: 'white', padding: '30px', borderRadius: '20px', maxWidth: '400px', width: '90%', textAlign: 'left', color: '#333' }}>
            <h2 style={{ marginTop: 0 }}>Checkout Material</h2>
            <p style={{ fontSize: '14px', color: '#666' }}>Ordering <b>{selectedMaterial.type}</b> (₹{selectedMaterial.price})</p>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>Delivery Address</label>
              <textarea placeholder="Full address" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={address} onChange={e => setAddress(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>Phone Number</label>
              <input placeholder="Mobile number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>Payment Method</label>
              <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="COD">Cash on Delivery</option>
                <option value="PhonePe">PhonePe</option>
                <option value="GPay">Google Pay</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                style={{ background: 'var(--primary)', flex: 1 }}
                onClick={handlePlaceOrder}
              >
                Place Order
              </button>
              <button
                style={{ background: '#eee', color: '#333', flex: 1 }}
                onClick={() => setShowCheckout(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const getStepStatus = (status) => {
    const steps = ["Pending", "Accepted", "Shipped", "Delivered"];
    return steps.indexOf(status);
  };

  const renderOrderDetailsModal = () => (
    <div className="modal-overlay animate__animated animate__fadeIn" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6000 }}>
      <div className="modal-content" style={{ background: 'white', padding: '40px', borderRadius: '24px', maxWidth: '600px', width: '95%', textAlign: 'left', position: 'relative', color: '#333' }}>
        <button onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888' }}>×</button>

        <h2 style={{ marginTop: 0, color: 'var(--primary)' }}>Order Tracking Details</h2>
        <p style={{ color: '#888', marginBottom: '30px' }}>Order ID: #{selectedOrder.id} • {new Date(selectedOrder.created_at).toLocaleDateString()}</p>

        {/* 🔹 PROGRESS TIMELINE */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '40px', padding: '0 20px' }}>
          <div style={{ position: 'absolute', top: '15px', left: '40px', right: '40px', height: '3px', background: '#eee', zIndex: 0 }}>
            <div style={{ height: '100%', background: 'var(--primary)', width: `${(getStepStatus(selectedOrder.status) / 3) * 100}%`, transition: 'width 0.5s ease' }}></div>
          </div>
          {["Pending", "Accepted", "Shipped", "Delivered"].map((step, i) => {
            const isActive = i <= getStepStatus(selectedOrder.status);
            return (
              <div key={step} style={{ zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: isActive ? 'var(--primary)' : 'white',
                  border: `3px solid ${isActive ? 'var(--primary)' : '#eee'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isActive ? 'white' : '#ccc', fontSize: '14px', fontWeight: 'bold'
                }}>
                  {isActive ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '11px', marginTop: '8px', color: isActive ? 'var(--primary)' : '#aaa', fontWeight: isActive ? 'bold' : 'normal' }}>{step}</span>
              </div>
            );
          })}
        </div>

        <div className="order-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f9f9f9', padding: '20px', borderRadius: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#999', textTransform: 'uppercase' }}>Item Details</label>
            <b style={{ fontSize: '18px' }}>{selectedOrder.material_name}</b>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>{selectedOrder.quantity}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#999', textTransform: 'uppercase' }}>Supplier</label>
            <b>{selectedOrder.supplier_name}</b>
          </div>
          <div style={{ gridColumn: '1/-1', borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>Delivery Contact</label>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
              Address: {selectedOrder.address}<br />
              Phone: <b>{selectedOrder.phone}</b>
            </p>
          </div>
          {selectedOrder.estimated_delivery && (
            <div style={{ gridColumn: '1/-1', background: '#e8f5e9', padding: '15px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '24px' }}>📅</span>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#2e7d32' }}>ESTIMATED ARRIVAL</label>
                <b style={{ color: '#2e7d32' }}>{selectedOrder.estimated_delivery}</b>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#999' }}>TOTAL PAID</label>
            <b style={{ fontSize: '22px', color: 'var(--primary)' }}>₹{selectedOrder.total_price}</b>
          </div>
          <button onClick={() => setSelectedOrder(null)} style={{ background: '#eee', color: '#333', width: 'auto', padding: '10px 30px', borderRadius: '12px' }}>Close</button>
        </div>
      </div>
    </div>
  );

  const renderMyOrders = () => (
    <div className="animate__animated animate__fadeIn" style={{ marginBottom: '100px' }}>
      <div className="info-box" style={{ background: '#800020', color: 'white', padding: '30px', textAlign: 'center', borderRadius: '24px', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>Track Your Procurement</h2>
        <p style={{ opacity: 0.9, marginTop: '10px' }}>Stay updated on your material shipments.</p>
      </div>

      <div className="orders-list">
        {myOrders.map(order => (
          <div
            key={order.id}
            className="order-item"
            style={{ background: '#fff', padding: '20px', borderRadius: '16px', marginBottom: '15px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setSelectedOrder(order)}
          >
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ margin: 0 }}>{order.material_name}</h3>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>Supplier: <b>{order.supplier_name}</b></p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="badge" style={{
                background: order.status === 'Pending' ? '#fff3e0' : (order.status === 'Accepted' ? '#e1f5fe' : (order.status === 'Shipped' ? '#e8f5e9' : '#f3e5f5')),
                color: order.status === 'Pending' ? '#ef6c00' : (order.status === 'Accepted' ? '#0288d1' : (order.status === 'Shipped' ? '#2e7d32' : '#7b1fa2')),
                border: '1px solid currentcolor',
                padding: '3px 10px'
              }}>
                {order.status}
              </span>
            </div>
          </div>
        ))}
        {myOrders.length === 0 && <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No ongoing material orders.</p>}
      </div>
    </div>
  );
  const renderBuyerOrders = () => (

    <div
      className="animate__animated animate__fadeIn"
      style={{ marginBottom: "100px" }}
    >

      <div
        className="info-box"
        style={{
          background: "#800020",
          color: "white",
          padding: "30px",
          textAlign: "center",
          borderRadius: "24px",
          marginBottom: "30px"
        }}
      >

        <h2 style={{ margin: 0, fontSize: "24px" }}>
          Buyer Orders
        </h2>

        <p style={{ opacity: 0.9, marginTop: "10px" }}>
          Manage saree orders from buyers.
        </p>

      </div>


      <div className="orders-list">

        {buyerOrders.map((order) => (

          <div
            key={order.id}

            style={{

              background: "#fff",

              padding: "20px",

              borderRadius: "16px",

              marginBottom: "15px",

              border: "1px solid #eee"

            }}

          >

            <h3>
              {order.saree_title}
            </h3>

            <p>
              Buyer: <b>{order.buyer_name}</b>
            </p>

            <p>

              Status:

              <b
                style={{

                  color:
                    order.status === "Pending"
                      ? "orange"
                      :
                      order.status === "Accepted"
                        ? "#0288d1"
                        :
                        order.status === "Shipped"
                          ? "#2e7d32"
                          :
                          "#7b1fa2"

                }}

              >

                {order.status}

              </b>

            </p>


            {/* Delivery Date */}

            {order.status === "Accepted" && (

              <div
                style={{
                  marginTop: "10px"
                }}
              >

                <label>

                  Delivery Date

                </label>

                <input

                  type="date"

                  value={deliveryDate[order.id] || ""}

                  onChange={(e) => {

                    setDeliveryDate({

                      ...deliveryDate,

                      [order.id]: e.target.value

                    })

                  }}

                  style={{

                    padding: "8px",

                    borderRadius: "8px",

                    border: "1px solid #ddd",

                    marginLeft: "10px"

                  }}

                />

              </div>

            )}


            {/* Buttons */}

            <div
              style={{
                marginTop: "15px"
              }}
            >

              {order.status === "Pending" && (

                <button

                  onClick={() =>
                    updateBuyerOrderStatus(
                      order.id,
                      "Accepted"
                    )
                  }

                  style={{
                    background: "#2e7d32",
                    color: "white"
                  }}

                >

                  Accept Order

                </button>

              )}


              {order.status === "Accepted" && (

                <button

                  disabled={!deliveryDate[order.id]}

                  onClick={() =>
                    updateBuyerOrderStatus(

                      order.id,

                      "Shipped",

                      deliveryDate[order.id]

                    )
                  }

                  style={{

                    background: "#0288d1",

                    color: "white",

                    opacity:
                      deliveryDate[order.id]
                        ? 1
                        : 0.5

                  }}

                >

                  Mark as Shipped 🚚

                </button>

              )}


              {order.status === "Shipped" && (

                <button

                  onClick={() =>
                    updateBuyerOrderStatus(
                      order.id,
                      "Delivered"
                    )
                  }

                  style={{
                    background: "#7b1fa2",
                    color: "white"
                  }}

                >

                  Mark as Delivered ✅

                </button>

              )}

            </div>

          </div>

        ))}


        {buyerOrders.length === 0 && (

          <p
            style={{

              textAlign: "center",

              padding: "40px",

              color: "#999"

            }}
          >

            No buyer orders yet.

          </p>

        )}

      </div>

    </div>

  );


  const renderProfile = () => (
    <div className="animate__animated animate__fadeIn" style={{ marginBottom: '100px' }}>
      <div style={{ background: 'var(--amazon-dark)', color: 'white', padding: '40px 20px', textAlign: 'center', borderRadius: '0 0 40px 40px', marginBottom: '30px' }}>
        <div style={{ width: '90px', height: '90px', background: 'var(--secondary)', color: '#333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', margin: '0 auto 15px auto' }}>
          {userName[0]}
        </div>
        <h2 style={{ margin: 0, fontSize: '24px' }}>{userName}</h2>
        <span style={{ background: 'var(--secondary)', color: '#333', fontSize: '11px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '10px', textTransform: 'uppercase', marginTop: '10px', display: 'inline-block' }}>Gold Artisan</span>
        <p style={{ opacity: 0.7, fontSize: '14px', marginTop: '10px' }}>{userEmail} • {userState}</p>
      </div>

      <div style={{ padding: '0 20px', color: '#333' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
          <div className="form-card" style={{ padding: '20px', textAlign: 'center', border: '1px solid #eee', cursor: 'pointer' }}>
            <span style={{ fontSize: '24px', display: 'block', marginBottom: '10px' }}>🧵</span>
            <b style={{ fontSize: '14px' }}>Your Loom</b>
            <p style={{ fontSize: '11px', color: '#888', margin: '5px 0' }}>{weaverSareeType}</p>
          </div>
          <div className="form-card" style={{ padding: '20px', textAlign: 'center', border: '1px solid #eee', cursor: 'pointer' }}>
            <span style={{ fontSize: '24px', display: 'block', marginBottom: '10px' }}>🛡️</span>
            <b style={{ fontSize: '14px' }}>Security</b>
            <p style={{ fontSize: '11px', color: '#888', margin: '5px 0' }}>Login settings</p>
          </div>
          <div className="form-card" style={{ padding: '20px', textAlign: 'center', border: '1px solid #eee', cursor: 'pointer' }} onClick={() => setActiveTab('my-orders')}>
            <span style={{ fontSize: '24px', display: 'block', marginBottom: '10px' }}>🛒</span>
            <b style={{ fontSize: '14px' }}>Procurement</b>
            <p style={{ fontSize: '11px', color: '#888', margin: '5px 0' }}>{myOrders.length} Material Orders</p>
          </div>
          <div className="form-card" style={{ padding: '20px', textAlign: 'center', border: '1px solid #eee' }}>
            <span style={{ fontSize: '24px', display: 'block', marginBottom: '10px' }}>✨</span>
            <b style={{ fontSize: '14px' }}>Performance</b>
            <p style={{ fontSize: '11px', color: '#888', margin: '5px 0' }}>{sarees.length} Live Items</p>
          </div>
        </div>

        <div className="form-card" style={{ background: '#fffbf0', border: '1px solid #febd69', marginBottom: '25px' }}>
          <h3 style={{ marginTop: 0, fontSize: '18px' }}>Artisan Highlights</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <b style={{ fontSize: '20px', display: 'block' }}>{sarees.length}</b>
              <span style={{ fontSize: '11px', color: '#888' }}>Sarees Live</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <b style={{ fontSize: '20px', display: 'block' }}>{myOrders.length}</b>
              <span style={{ fontSize: '11px', color: '#888' }}>Hub Orders</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <b style={{ fontSize: '20px', display: 'block' }}>4.9 ⭐</b>
              <span style={{ fontSize: '11px', color: '#888' }}>Rating</span>
            </div>
          </div>
        </div>

        <button
          style={{ background: '#eee', color: '#333', border: '1px solid #ddd', fontWeight: 'bold' }}
          onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
  const renderOrderTrackingModal = () => (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 6000
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "24px",
          width: "600px",
          color: "#333",
          position: "relative"
        }}
      >

        <button
          onClick={() => setSelectedOrder(null)}
          style={{
            position: "absolute",
            right: "20px",
            top: "20px",
            border: "none",
            background: "none",
            fontSize: "22px",
            cursor: "pointer"
          }}
        >
          ×
        </button>

        <h2
          style={{
            color: "#800020"
          }}
        >
          Order Tracking Details
        </h2>

        <p>
          Order ID: #{selectedOrder.id}
        </p>

        {/* Timeline */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
            padding: "0 20px",
            position: "relative"
          }}
        >

          <div
            style={{
              position: "absolute",
              top: "15px",
              left: "40px",
              right: "40px",
              height: "3px",
              background: "#eee"
            }}
          >

            <div
              style={{
                height: "100%",
                background: "#800020",
                width: `${(getStepStatus(selectedOrder.status) / 3) * 100}%`
              }}
            >
            </div>

          </div>

          {["Pending", "Accepted", "Shipped", "Delivered"].map((step, i) => {

            const active = i <= getStepStatus(selectedOrder.status);

            return (
              <div
                key={step}
                style={{
                  textAlign: "center",
                  zIndex: 1
                }}
              >

                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: active ? "#800020" : "white",
                    border: active
                      ? "3px solid #800020"
                      : "3px solid #eee",
                    color: active ? "white" : "#ccc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {active ? "✓" : i + 1}
                </div>

                <p
                  style={{
                    fontSize: "12px",
                    marginTop: "8px",
                    color: active ? "#800020" : "#aaa"
                  }}
                >
                  {step}
                </p>

              </div>
            );

          })}

        </div>

        {/* Order info */}

        <div
          style={{
            background: "#f9f9f9",
            padding: "20px",
            borderRadius: "16px",
            marginTop: "30px"
          }}
        >

          <h3>
            {selectedOrder.saree_title}
          </h3>

          <p>
            Status: <b>{selectedOrder.status}</b>
          </p>

        </div>

        <button
          onClick={() => setSelectedOrder(null)}
          style={{
            marginTop: "20px",
            background: "#eee",
            padding: "10px 30px",
            borderRadius: "12px",
            border: "none"
          }}
        >
          Close
        </button>

      </div>

    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header animate__animated animate__fadeIn">
        <h1>{activeTab === 'profile' ? "Artisan Account" : `${userName.split(' ')[0]}'s Portal`}</h1>
      </div>

      {activeTab === 'studio' && renderStudio()}
      {activeTab === 'my-sarees' && renderMySarees()}
      {activeTab === 'resource-hub' && renderResourceHub()}
      {activeTab === 'my-orders' && renderMyOrders()}
      {activeTab === 'buyer-orders' && renderBuyerOrders()}
      {activeTab === 'profile' && renderProfile()}

      {/* 🔹 BOTTOM NAVIGATION BAR (5 BUTTONS) */}
      <div className="bottom-nav">
        <div className={`nav-item ${activeTab === 'studio' ? 'active' : ''}`} onClick={() => setActiveTab('studio')}>
          <span className="icon">🎨</span>
          <span>Studio</span>
        </div>
        <div className={`nav-item ${activeTab === 'my-sarees' ? 'active' : ''}`} onClick={() => setActiveTab('my-sarees')}>
          <span className="icon">👗</span>
          <span>Inventory</span>
        </div>
        <div className={`nav-item ${activeTab === 'resource-hub' ? 'active' : ''}`} onClick={() => setActiveTab('resource-hub')}>
          <span className="icon">🛒</span>
          <span>Supply Hub</span>
        </div>
        <div className={`nav-item ${activeTab === 'my-orders' ? 'active' : ''}`} onClick={() => setActiveTab('my-orders')}>
          <span className="icon">🚚</span>
          <span>My Orders</span>
        </div>
        <div className={`nav-item ${activeTab === 'buyer-orders' ? 'active' : ''}`} onClick={() => setActiveTab('buyer-orders')}>
          <span className="icon">📦</span>
          <span>Buyer Orders</span>
        </div>
        <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <span className="icon">👤</span>
          <span>Profile</span>
        </div>
      </div>

      {selectedOrder && renderOrderDetailsModal()}
    </div>
  );
}