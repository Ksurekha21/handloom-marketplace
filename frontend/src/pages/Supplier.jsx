import { useState, useEffect } from "react";
import "./Dashboard.css";
import { t } from "../i18n";
import api from "../api";
import API, {BASE_URL} from "../api";

const toolsList = ["Loom (Handloom)", "Pit Loom", "Frame Loom", "Warp Beam", "Cloth Beam", "Reed", "Shuttle", "Charkha", "Takli"];
const fabricList = ["Pure Pattu", "Pure Cotton", "Pure Wool", "Mulberry Silk Yarn", "Cotton Yarn", "Zari"];

export default function Supplier() {
  const userName = localStorage.getItem("userName") || "Supplier";
  const supplierId = localStorage.getItem("userId");
  const userEmail = localStorage.getItem("userEmail") || "supplier@example.com";
  const userState = localStorage.getItem("userState") || "Andhra Pradesh";

  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("Tools"); // Tools, Fabrics
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("items");
  const [cost, setCost] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("inventory"); // inventory, my-supplies, orders, profile

  // Advanced States
  const [searchTerm, setSearchTerm] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Status update states
  const [updatingId, setUpdatingId] = useState(null);
  const [estDelivery, setEstDelivery] = useState("");

  useEffect(() => {
    if (supplierId) {
      fetchMaterials();
      fetchOrders();
    }
  }, [supplierId]);

  useEffect(() => {
    // Calculate total revenue from delivered orders
    const revenue = orders
      .filter(o => o.status === 'Delivered')
      .reduce((sum, o) => sum + o.total_price, 0);
    setTotalRevenue(revenue);
  }, [orders]);

  const fetchMaterials = async () => {
    try {
      const res = await api.get("/supplier/materials");
      const myItems = res.data.materials.filter(m => String(m.supplier_id) === String(supplierId));
      setItems(myItems);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/supplier/material-orders/${supplierId}`);
      setOrders(res.data.orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const payload = { status: newStatus };
      if (newStatus === "Accepted" && estDelivery) {
        payload.estimated_delivery = estDelivery;
      }
      
      await api.patch(`/supplier/material-order/${orderId}/status`, payload);
      alert(`Order status updated to ${newStatus}!`);
      setUpdatingId(null);
      setEstDelivery("");
      fetchOrders();
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Error updating order status.");
    }
  };

  const handleAddItem = async () => {
    if (!itemName || !cost || !quantity) {
      alert("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("supplier_id", supplierId);
      formData.append("material_type", itemName);
      formData.append("category", category === "Tools" ? "Tool" : "Fabric");
      formData.append("quantity", `${quantity} ${unit}`);
      formData.append("price", cost);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await api.post("/supplier/material", formData);

      alert("Supply item added successfully! 🧶✨");
      fetchMaterials();

      // Reset
      setItemName("");
      setQuantity("");
      setCost("");
      setImageFile(null);
      setPreview("");
      setActiveTab("my-supplies");
    } catch(e) {
      console.error(e);
      alert(e.response?.data?.message || "Error adding item");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(i => i.type.toLowerCase().includes(searchTerm.toLowerCase()));

  const renderInventory = () => (
    <div className="animate__animated animate__fadeIn" style={{marginBottom: '100px'}}>
      <div className="form-card" style={{maxWidth: '800px', margin: '0 auto'}}>
        <h2 style={{fontSize: '24px', color: 'var(--primary)', marginBottom: '10px'}}>Add New Supply Item</h2>
        <p style={{color: '#666', marginBottom: '30px', fontSize: '14px'}}>Add high-quality tools and fabrics to the Resource Hub for weavers.</p>
        
        <div style={{ display: "flex", gap: "20px", marginBottom: '25px' }}>
          <label className={`category-tab ${category === "Tools" ? 'active' : ''}`} onClick={() => { setCategory("Tools"); setUnit("items"); setItemName(""); }}>
            🛠️ Tools
          </label>
          <label className={`category-tab ${category === "Fabrics" ? 'active' : ''}`} onClick={() => { setCategory("Fabrics"); setUnit("kg"); setItemName(""); }}>
            🧵 Fabrics
          </label>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>{category} Name</label>
            <select value={itemName} onChange={(e) => setItemName(e.target.value)}>
              <option value="">Select {category === "Tools" ? "Tool" : "Fabric"}</option>
              {(category === "Tools" ? toolsList : fabricList).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input placeholder="Qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" />
              {category === "Fabrics" && (
                <select value={unit} onChange={(e) => setUnit(e.target.value)} style={{ width: '80px' }}>
                  <option value="kg">Kg</option>
                  <option value="g">Grams</option>
                </select>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Total Cost (₹)</label>
            <input placeholder="Ex: 5000" value={cost} onChange={(e) => setCost(e.target.value)} type="number" />
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'left' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>Product Photo</label>
          <input type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setImageFile(file);
              setPreview(URL.createObjectURL(file));
            }
          }} />
        </div>

        {preview && <img src={preview} alt="preview" style={{width: '100%', maxHeight: '300px', objectFit: 'cover', marginTop: '15px', borderRadius: '12px', border: '1px solid #ddd'}} />}

        <button onClick={handleAddItem} disabled={loading} style={{marginTop: '30px', background: 'var(--primary)', color: 'white', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'block', width: '100%'}}>
          {loading ? "Adding..." : "Add to Resource Hub"}
        </button>
      </div>
    </div>
  );

  const renderMySupplies = () => (
    <div className="animate__animated animate__fadeIn" style={{marginBottom: '100px'}}>
      <div className="info-box" style={{background: 'var(--primary)', color: 'white', padding: '30px', textAlign: 'center', borderRadius: '24px', marginBottom: '30px'}}>
         <h2 style={{margin: 0, fontSize: '24px'}}>My Supplies Inventory</h2>
         <p style={{opacity: 0.9, marginTop: '10px'}}>Managing <b>{items.length}</b> verified material listings.</p>
      </div>

      <div style={{padding: '0 15px 20px 15px'}}>
         <input 
           placeholder="Search your inventory (e.g. Zari, Pattu)..." 
           style={{background: 'white', border: '1px solid #ddd', borderRadius: '20px'}}
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="resource-hub-grid">
        {filteredItems.map((i) => (
          <div key={i.id} className="resource-card">
            <div style={{position: 'relative'}}>
              {i.image_url ? (
                        <img 
                        src={`${BASE_URL}${i.image_url}`}
                        alt=""
                        className="resource-image"
                        />
                        ) : (
                        <div className="resource-image">🧶</div>
                        )}
              
              <span className="badge" style={{position: 'absolute', top: '15px', right: '15px', background: i.category === 'Tool' ? '#333' : 'var(--accent)'}}>{i.category}</span>
              
              {/* 🔹 LOW STOCK ALERT */}
              {parseFloat(i.quantity) < 5 && (
                <span style={{position: 'absolute', bottom: '10px', left: '10px', background: '#c62828', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold'}}>LOW STOCK ⚠️</span>
              )}
            </div>
            <div style={{padding: '20px'}}>
               <h3 style={{margin: '0 0 5px 0', fontSize: '18px'}}>{i.type}</h3>
               <p style={{fontSize: '14px', color: '#800020', fontWeight: 'bold', margin: '0 0 10px 0'}}>₹{i.price}</p>
               <span style={{fontSize: '12px', background: '#f0f0f0', padding: '4px 10px', borderRadius: '20px'}}>{i.quantity}</span>
               <p style={{fontSize: '12px', color: '#888', marginTop: '15px'}}>Listing Date: {new Date(i.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '100px 0'}}>
            <p style={{color: '#999'}}>No matches found.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="animate__animated animate__fadeIn" style={{marginBottom: '100px'}}>
      {/* 🔹 ARTISAN SPECIAL REQUESTS PORTAL */}
      <div style={{background: '#fff3e0', border: '1px solid #ffe0b2', padding: '20px', borderRadius: '20px', marginBottom: '30px', color: '#e65100'}}>
         <h3 style={{marginTop: 0, fontSize: '18px'}}>Artisan Special Requests 🎨</h3>
         <p style={{fontSize: '13px'}}>Artisans are looking for: **Gold Zari (High Lustre)** and **Organic Indigo Dye**.</p>
         <button style={{width: 'auto', padding: '8px 20px', background: '#ef6c00', color: 'white', fontSize: '11px', marginTop: '10px'}}>Contact Artisan</button>
      </div>

      <div className="info-box" style={{background: '#800020', color: 'white', padding: '30px', textAlign: 'center', borderRadius: '24px', marginBottom: '30px'}}>
         <h2 style={{margin: 0, fontSize: '24px'}}>Incoming Material Orders 🔔</h2>
         <p style={{opacity: 0.9, marginTop: '10px'}}>Manage fulfillment and tracking for weaver requests.</p>
      </div>

      <div className="orders-container">
        {orders.map(order => (
          <div key={order.id} className="order-item" style={{background: '#fff', padding: '25px', borderRadius: '20px', marginBottom: '20px', border: '1px solid #eee'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
              <div>
                <h3 style={{margin: 0, fontSize: '20px', color: 'var(--primary)'}}>{order.material_name}</h3>
                <p style={{margin: '5px 0', fontSize: '14px', color: '#666'}}>Ordered by: <b>{order.weaver_name}</b></p>
              </div>
              <span className="badge" style={{
                 background: order.status === 'Pending' ? '#fff3e0' : (order.status === 'Accepted' ? '#e1f5fe' : (order.status === 'Shipped' ? '#e8f5e9' : '#f3e5f5')),
                 color: order.status === 'Pending' ? '#ef6c00' : (order.status === 'Accepted' ? '#0288d1' : (order.status === 'Shipped' ? '#2e7d32' : '#7b1fa2')),
                 border: '1px solid currentcolor'
              }}>{order.status}</span>
            </div>
            
            <div className="order-details-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '14px', background: '#fcfcfc', padding: '15px', borderRadius: '12px'}}>
              <div className="detail">
                <label style={{color: '#999', display: 'block', fontSize: '11px'}}>Quantity</label>
                <b>{order.quantity}</b>
              </div>
              <div className="detail">
                <label style={{color: '#999', display: 'block', fontSize: '11px'}}>Price</label>
                <b style={{color: 'var(--primary)'}}>₹{order.total_price}</b>
              </div>
              <div className="detail" style={{gridColumn: '1/-1'}}>
                <label style={{color: '#999', display: 'block', fontSize: '11px'}}>Address</label>
                <p style={{margin: '5px 0'}}>{order.address}</p>
                <b>📞 {order.phone}</b>
              </div>
            </div>

            <div style={{marginTop: '25px', display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
              {order.status === 'Pending' && (
                <div style={{width: '100%'}}>
                  <input 
                    type="date" 
                    style={{padding: '12px', borderRadius: '10px', border: '1px solid #ddd', width: '100%', marginBottom: '15px', color: '#333'}}
                    value={updatingId === order.id ? estDelivery : ""}
                    onChange={(e) => { setUpdatingId(order.id); setEstDelivery(e.target.value); }}
                  />
                  <button style={{background: '#2e7d32', color: 'white'}} onClick={() => handleUpdateStatus(order.id, "Accepted")}>Accept Order</button>
                </div>
              )}
              {order.status === 'Accepted' && <button style={{background: '#0288d1', color: 'white'}} onClick={() => handleUpdateStatus(order.id, "Shipped")}>Mark as Shipped 🚚</button>}
              {order.status === 'Shipped' && <button style={{background: '#7b1fa2', color: 'white'}} onClick={() => handleUpdateStatus(order.id, "Delivered")}>Mark as Delivered ✅</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="animate__animated animate__fadeIn" style={{marginBottom: '100px'}}>
      <div style={{background: 'var(--amazon-dark)', color: 'white', padding: '40px 20px', textAlign: 'center', borderRadius: '0 0 40px 40px', marginBottom: '30px'}}>
         <div style={{width: '90px', height: '90px', background: '#febd69', color: '#333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 15px auto'}}>
            {userName[0]}
         </div>
         <h2 style={{margin: 0}}>{userName}</h2>
         <p style={{opacity: 0.7, fontSize: '14px', marginTop: '10px'}}>{userEmail} • {userState}</p>
      </div>

      <div style={{padding: '0 20px', color: '#333'}}>
         <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px'}}>
            <div className="form-card" style={{padding: '20px', textAlign: 'center', border: '1px solid #eee'}}>
               <span style={{fontSize: '24px', display: 'block', marginBottom: '10px'}}>📦</span>
               <b>Orders</b>
               <p style={{fontSize: '11px', color: '#888'}}>{orders.length} Handled</p>
            </div>
            <div className="form-card" style={{padding: '20px', textAlign: 'center', border: '1px solid #eee'}}>
               <span style={{fontSize: '24px', display: 'block', marginBottom: '10px'}}>🛡️</span>
               <b>Security</b>
               <p style={{fontSize: '11px', color: '#888'}}>Pass & Login</p>
            </div>
            <div className="form-card" style={{padding: '20px', textAlign: 'center', border: '1px solid #eee'}}>
               <span style={{fontSize: '24px', display: 'block', marginBottom: '10px'}}>📈</span>
               <b>Analytics</b>
               <p style={{fontSize: '11px', color: '#888'}}>Sales Stats</p>
            </div>
            <div className="form-card" style={{padding: '20px', textAlign: 'center', border: '1px solid #eee'}}>
               <span style={{fontSize: '24px', display: 'block', marginBottom: '10px'}}>💰</span>
               <b>Payouts</b>
               <p style={{fontSize: '11px', color: '#888'}}>Bank Info</p>
            </div>
         </div>

         {/* 🔹 MARKETPLACE LEADERBOARD CARD */}
         <div className="form-card leaderboard-card" style={{marginBottom: '25px', textAlign: 'center'}}>
            <h3 style={{marginTop: 0, fontSize: '18px', color: '#b45309'}}>Marketplace Standing 👑</h3>
            <div style={{display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '15px'}}>
               <div>
                  <label style={{fontSize: '10px', color: '#888'}}>RANK</label>
                  <b style={{fontSize: '24px', display: 'block', color: '#b45309'}}>#12</b>
               </div>
               <div style={{width: '2px', background: '#fcd34d'}}></div>
               <div>
                  <label style={{fontSize: '10px', color: '#888'}}>REPUTATION</label>
                  <b style={{fontSize: '24px', display: 'block', color: '#b45309'}}>Top 1%</b>
               </div>
            </div>
            <p style={{fontSize: '11px', color: '#888', marginTop: '15px'}}>You are among the most reliable suppliers in {userState}!</p>
         </div>

         <div className="form-card" style={{background: '#f1f8ff', border: '1px solid #0366d6', marginBottom: '25px', color: '#333'}}>
            <h3 style={{marginTop: 0, fontSize: '18px'}}>Business Performance</h3>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
               <div style={{textAlign: 'center'}}>
                  <b style={{fontSize: '20px', display: 'block'}}>₹{totalRevenue}</b>
                  <span style={{fontSize: '11px', color: '#888'}}>Total Revenue</span>
               </div>
               <div style={{textAlign: 'center'}}>
                  <b style={{fontSize: '20px', display: 'block'}}>{orders.filter(o => o.status === 'Delivered').length}</b>
                  <span style={{fontSize: '11px', color: '#888'}}>Fulfillments</span>
               </div>
               <div style={{textAlign: 'center'}}>
                  <b style={{fontSize: '20px', display: 'block'}}>98%</b>
                  <span style={{fontSize: '11px', color: '#888'}}>Reliability</span>
               </div>
            </div>
         </div>

         <button style={{background: '#eee', color: '#333'}} onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>Sign Out</button>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header animate__animated animate__fadeIn">
        <h1>{activeTab === 'profile' ? "Supplier Account" : `Welcome ${userName.split(' ')[0]}`}</h1>
      </div>

      {activeTab === 'inventory' && renderInventory()}
      {activeTab === 'my-supplies' && renderMySupplies()}
      {activeTab === 'orders' && renderOrders()}
      {activeTab === 'profile' && renderProfile()}

      <div className="bottom-nav">
        <div className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
           <span className="icon">➕</span>
           <span>Add Item</span>
        </div>
        <div className={`nav-item ${activeTab === 'my-supplies' ? 'active' : ''}`} onClick={() => setActiveTab('my-supplies')}>
           <span className="icon">📦</span>
           <span>Inventory</span>
        </div>
        <div className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
           <span className="icon">🔔</span>
           <span>Orders</span>
        </div>
        <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
           <span className="icon">👤</span>
           <span>Profile</span>
        </div>
      </div>
    </div>
  );
}