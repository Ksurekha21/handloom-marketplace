import { useState, useEffect } from "react";
import "./Dashboard.css";
import api from "../api";

export default function Buyer() {
   const userName = localStorage.getItem("userName") || "Guest";
   const userId = localStorage.getItem("userId");

   // --- STATES ---
   const [view, setView] = useState("main");
   const [activeTab, setActiveTab] = useState("home");
   const [sarees, setSarees] = useState([]);
   const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
   const [wishlist, setWishlist] = useState(JSON.parse(localStorage.getItem("wishlist")) || []);
   const [orders, setOrders] = useState([]);
   const [selectedOrder, setSelectedOrder] = useState(null);
   const [selectedSaree, setSelectedSaree] = useState(null);
   const [searchQuery, setSearchQuery] = useState("");
   const [coupon, setCoupon] = useState("");
   const [discount, setDiscount] = useState(0);
   const [accountSubView, setAccountSubView] = useState(null);
   const [sareeReviews, setSareeReviews] = useState([]);
   const [isVideoOpen, setIsVideoOpen] = useState(false);
   const [isChatOpen, setIsChatOpen] = useState(false);
   const [toast, setToast] = useState("");
   const [showOrderSuccess, setShowOrderSuccess] = useState(false);
   const [showPaymentOptions, setShowPaymentOptions] = useState(false);
   const [checkoutStep, setCheckoutStep] = useState(1);
   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("PhonePe UPI");

   // --- ADVANCED PROFILE STATES ---
   const [addresses, setAddresses] = useState([
      { id: 1, name: "Arun Kumar", phone: "9876543210", line: "45 Weaver Street, Kanchipuram, TN", zip: "631501", primary: true },
      { id: 2, name: "Arun Kumar", phone: "9876543210", line: "Apartment 4B, Silk Heights, Chennai", zip: "600001", primary: false }
   ]);
   const [payments, setPayments] = useState([
      { id: 1, type: "card", provider: "HDFC Visa Platinum", last4: "4589", expiry: "12/28" },
      { id: 2, type: "bank", provider: "State Bank of India", acc: "XXXX 9901", ifsc: "SBIN000123" }
   ]);
   const [walletBalance, setWalletBalance] = useState(1250);
   const [walletHistory, setWalletHistory] = useState([
      { id: 1, desc: "Cashback from Weaver Direct", amt: 250, type: "plus", date: "22 Mar" },
      { id: 2, desc: "Refund - Order #9910", amt: 1000, type: "plus", date: "15 Mar" }
   ]);

   // Modals / Editors
   const [editingAddress, setEditingAddress] = useState(null);
   const [showAddressForm, setShowAddressForm] = useState(false);
   const [showPaymentForm, setShowPaymentForm] = useState(false);

   // --- REQUISITE DATA ---
   useEffect(() => {
      fetchProducts();
      if (userId) fetchOrders();
   }, [userId, activeTab]);

   useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);
   useEffect(() => { localStorage.setItem("wishlist", JSON.stringify(wishlist)); }, [wishlist]);

   const fetchOrders = async () => {
      if (!userId) return;
      try {
         const res = await api.get(`/buyer/orders/${userId}`);
         setOrders(res.data.orders);
      } catch (e) { console.error(e); }
   };

   const fetchProducts = async () => {
      try {
         const res = await api.get("/buyer/products");
         const enhanced = res.data.products.map(p => ({
            ...p,
            rating: (Math.random() * (5 - 4.1) + 4.1).toFixed(1),
            reviewsCount: Math.floor(Math.random() * 60) + 15
         }));
         setSarees(enhanced);
      } catch (e) { console.error(e); }
   };

   const showToast = (t) => {
      setToast(t);
      setTimeout(() => setToast(""), 3000);
   };
   const getStepStatus = (status) => {

      const steps = [
         "Pending",
         "Accepted",
         "Shipped",
         "Delivered"
      ]

      return steps.indexOf(status)

   };
   const addToCart = (s) => {
      if (!cart.find(item => item.id === s.id)) {
         setCart([...cart, { ...s, quantity: 1 }]);
         showToast("Added to Bag! 🛍️");
      } else showToast("Already in Bag!");
   };

   const toggleWishlist = (e, s) => {
      e.stopPropagation();
      if (wishlist.find(item => item.id === s.id)) setWishlist(wishlist.filter(i => i.id !== s.id));
      else setWishlist([...wishlist, s]);
   };

   const deleteAddress = (id) => {
      setAddresses(addresses.filter(a => a.id !== id));
      showToast("Address Removed");
   };

   const addOrUpdateAddress = (e) => {
      e.preventDefault();
      const form = e.target;
      const newAddr = {
         id: editingAddress ? editingAddress.id : Date.now(),
         name: form.fullName.value,
         phone: form.phone.value,
         line: form.line.value,
         zip: form.zip.value,
         primary: false
      };
      if (editingAddress) {
         setAddresses(addresses.map(a => a.id === editingAddress.id ? newAddr : a));
      } else {
         setAddresses([...addresses, newAddr]);
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      showToast(editingAddress ? "Address Updated" : "Address Added");
   };

   const renderStars = (r) => [...Array(5)].map((_, i) => <span key={i} style={{ color: i < Math.floor(r) ? '#ffa41c' : '#ddd', fontSize: '11px' }}>★</span>);

   // --- SUB-VIEW RENDERERS ---

   const renderHome = () => (
      <div className="animate__animated animate__fadeIn" style={{ paddingBottom: '110px' }}>
         <div className="amazon-style-hero" style={{ background: 'linear-gradient(135deg, #800020 0%, #4a0012 100%)', color: 'white', padding: '40px 25px', borderRadius: '0 0 30px 30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: 0, fontSize: '26px' }}>Namaste, {userName.split(' ')[0]}</h2>
            <p style={{ opacity: 0.8, fontSize: '14px', marginTop: '6px' }}>Connecting you to India's Heritage 🧵🇮🇳</p>
         </div>
         <div style={{ padding: '20px' }}>
            <div className="heritage-header">
               <h3 style={{ color: 'var(--primary)', margin: 0 }}>Explore Masterpieces</h3>
               <span style={{ fontSize: '12px', color: '#999', fontWeight: '400' }}>Trending 🔥</span>
            </div>
            <div className="saree-grid">
               {sarees.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                  <div key={s.id} className="saree-card" onClick={() => { setSelectedSaree(s); setView("detail"); }} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.04)', position: 'relative' }}>
                     <div className="wishlist-heart" onClick={(e) => toggleWishlist(e, s)}>
                        <span style={{ color: wishlist.some(i => i.id === s.id) ? '#ff3e30' : '#ddd' }}>{wishlist.some(i => i.id === s.id) ? '❤️' : '♡'}</span>
                     </div>
                     <img src={s.image_url} style={{ height: '190px', width: '100%', objectFit: 'cover' }} alt="" />
                     <div style={{ padding: '15px' }}>
                        <b style={{ fontSize: '14px', color: '#333' }}>{s.title}</b>
                        <div style={{ margin: '6px 0' }}>{renderStars(s.rating)}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <b style={{ color: 'var(--primary)', fontSize: '18px' }}>₹{s.price}</b>
                           {s.rating > 4.5 && <span style={{ fontSize: '9px', background: '#fff9e6', color: '#d4af37', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Top Rated</span>}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );

   const renderSearch = () => (
      <div className="animate__animated animate__fadeIn" style={{ padding: '25px', paddingBottom: '120px' }}>
         <h1 style={{ color: 'var(--primary)', fontSize: '32px', marginBottom: '8px' }}>Search Hub 🔍</h1>
         <p style={{ color: '#999', marginBottom: '25px' }}>Find your legacy weave by region or type</p>
         <div style={{ background: 'white', padding: '20px', borderRadius: '25px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
            <input
               autoFocus placeholder="Ex: Kanchipuram, Banarasi Silk..."
               style={{ width: '100%', padding: '18px', borderRadius: '15px', border: '1px solid #f0f0f0', outline: 'none', background: '#fafafa', fontSize: '16px' }}
               value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
               {["Banarasi", "Chanderi", "Ikat", "Patola", "Linen", "Bridal"].map(t => (
                  <span key={t} onClick={() => { setSearchQuery(t); setActiveTab('home'); }} style={{ background: '#f8f8f8', padding: '10px 18px', borderRadius: '15px', fontSize: '12px', border: '1px solid #eee', cursor: 'pointer' }}>#{t}</span>
               ))}
            </div>

            <div style={{ marginTop: '40px' }}>
               <h3 style={{ color: 'var(--primary)', marginBottom: '15px' }}>Featured Heritage Collections</h3>
               <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                  {[
                     { name: "Kanchipuram Silk", img: "https://images.unsplash.com/photo-1610030469915-9a88ed9695f3?w=200", count: "120+ Sarees" },
                     { name: "Banarasi Legacy", img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200", count: "85+ Sarees" },
                     { name: "Ikat Prints", img: "https://images.unsplash.com/photo-1590736912183-7d30e3863a32?w=200", count: "45+ Sarees" }
                  ].map(col => (
                     <div key={col.name} style={{ minWidth: '160px', background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                        <img src={col.img} style={{ width: '100%', height: '100px', objectFit: 'cover' }} alt="" />
                        <div style={{ padding: '12px' }}>
                           <b style={{ fontSize: '13px' }}>{col.name}</b>
                           <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#999' }}>{col.count}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );

   const renderAddressManager = () => (
      <div className="animate__animated animate__fadeIn" style={{ padding: '25px', paddingBottom: '120px' }}>
         <button style={{ background: 'none', color: '#999', marginBottom: '20px' }} onClick={() => setAccountSubView(null)}>← Account</button>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ margin: 0, color: 'var(--primary)' }}>My Addresses 📍</h2>
            <button onClick={() => { setEditingAddress(null); setShowAddressForm(true); }} style={{ width: 'auto', background: 'var(--primary)', color: 'white', borderRadius: '10px', padding: '8px 15px', fontSize: '12px' }}>+ Add New</button>
         </div>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {addresses.map(a => (
               <div key={a.id} style={{ background: 'white', padding: '20px', borderRadius: '20px', border: a.primary ? '2px solid var(--primary)' : '1px solid #eee', position: 'relative' }}>
                  {a.primary && <span style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--primary)', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '5px' }}>DEFAULT</span>}
                  <b style={{ fontSize: '17px' }}>{a.name}</b>
                  <p style={{ margin: '8px 0', fontSize: '14px', color: '#666', lineHeight: '1.5' }}>{a.line}<br />PIN: {a.zip}</p>
                  <b style={{ fontSize: '13px' }}>📞 {a.phone}</b>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '15px', borderTop: '1px solid #f5f5f5', paddingTop: '15px' }}>
                     <span onClick={() => { setEditingAddress(a); setShowAddressForm(true); }} style={{ color: '#007185', fontSize: '13px', cursor: 'pointer' }}>Edit Details</span>
                     <span onClick={() => deleteAddress(a.id)} style={{ color: '#c62828', fontSize: '13px', cursor: 'pointer' }}>Remove</span>
                  </div>
               </div>
            ))}
         </div>

         {showAddressForm && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', zIndex: 12000, display: 'flex', alignItems: 'flex-end' }}>
               <form onSubmit={addOrUpdateAddress} className="animate__animated animate__slideInUp" style={{ background: 'white', width: '100%', padding: '30px', borderRadius: '30px 30px 0 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}><b>{editingAddress ? 'Edit' : 'Add New'} Address</b> <span onClick={() => setShowAddressForm(false)}>✕</span></div>
                  <input name="fullName" placeholder="Full Name" defaultValue={editingAddress?.name} required style={{ width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #ddd' }} />
                  <input name="phone" placeholder="Mobile Number" defaultValue={editingAddress?.phone} required style={{ width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #ddd' }} />
                  <textarea name="line" placeholder="Full Address / Landmark" defaultValue={editingAddress?.line} required style={{ width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #ddd', height: '80px' }} />
                  <input name="zip" placeholder="ZIP / Pincode" defaultValue={editingAddress?.zip} required style={{ width: '100%', padding: '15px', marginBottom: '25px', borderRadius: '12px', border: '1px solid #ddd' }} />
                  <button type="submit" style={{ height: '55px', background: 'var(--primary)', color: 'white', borderRadius: '15px', width: '100%', fontWeight: 'bold' }}>Save Address</button>
               </form>
            </div>
         )}
      </div>
   );

   const renderPaymentHub = () => (
      <div className="animate__animated animate__fadeIn" style={{ padding: '25px', paddingBottom: '120px' }}>
         <button style={{ background: 'none', color: '#999', marginBottom: '20px' }} onClick={() => setAccountSubView(null)}>← Account</button>
         <h2 style={{ color: 'var(--primary)', marginBottom: '30px' }}>Payment Hub 💳</h2>

         <div style={{ marginBottom: '35px' }}>
            <h4 style={{ fontSize: '13px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Saved Cards</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
               {payments.filter(p => p.type === 'card').map(p => (
                  <div key={p.id} style={{ background: 'linear-gradient(135deg, #222 0%, #444 100%)', color: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}><b>{p.provider}</b> <span>•••• {p.last4}</span></div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>{userName.toUpperCase()}</span>
                        <span>EXP: {p.expiry}</span>
                     </div>
                  </div>
               ))}
               <div style={{ background: '#fcfcfc', padding: '20px', borderRadius: '15px', border: '1px solid #eee', marginBottom: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>Fabric Sourcing:</span> <b>Verified ✅</b></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>Artisan Fair Wage:</span> <b style={{ color: '#2e7d32' }}>Verified ✅</b></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Direct-to-Buyer:</span> <b>True ✅</b></div>
               </div>
               <button onClick={() => showToast("Bank Interface Connection...")} style={{ background: '#f8f8f8', border: '2px dashed #ddd', color: '#777', padding: '18px', borderRadius: '15px', borderStyle: 'dashed' }}>+ Add New Card</button>
            </div>
         </div>

         <div>
            <h4 style={{ fontSize: '13px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Bank Accounts</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
               {payments.filter(p => p.type === 'bank').map(p => (
                  <div key={p.id} style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '15px' }}>
                     <div style={{ width: '40px', height: '40px', background: '#e8f5e9', borderRadius: '50%', textAlign: 'center', lineHeight: '40px', fontSize: '20px' }}>🏦</div>
                     <div style={{ flex: 1 }}>
                        <b style={{ fontSize: '15px' }}>{p.provider}</b>
                        <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#999' }}>{p.acc} • IFSC: {p.ifsc}</p>
                     </div>
                  </div>
               ))}
               <button onClick={() => showToast("KYC Verification Required")} style={{ background: 'none', color: '#007185', fontSize: '14px', fontWeight: 'bold' }}>+ Link Another Bank Account</button>
            </div>
         </div>
      </div>
   );

   const renderWallet = () => (
      <div className="animate__animated animate__fadeIn" style={{ padding: '25px', paddingBottom: '120px' }}>
         <button style={{ background: 'none', color: '#999', marginBottom: '20px' }} onClick={() => setAccountSubView(null)}>← Account</button>
         <div style={{ background: 'var(--primary)', color: 'white', padding: '40px', borderRadius: '30px', textAlign: 'center', boxShadow: '0 15px 40px rgba(128,0,32,0.2)', marginBottom: '35px' }}>
            <p style={{ opacity: 0.8, fontSize: '14px', margin: '0 0 10px 0' }}>Artisan Wallet Balance</p>
            <h1 style={{ margin: 0, fontSize: '48px' }}>₹{walletBalance}</h1>
            <button style={{ marginTop: '25px', background: 'white', color: 'var(--primary)', fontWeight: 'bold', padding: '12px 25px', borderRadius: '15px', border: 'none' }}>Top Up Wallet</button>
         </div>

         <h4 style={{ fontSize: '13px', color: '#999', textTransform: 'uppercase', marginBottom: '15px' }}>Recent Transactions</h4>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {walletHistory.map(t => (
               <div key={t.id} style={{ background: 'white', padding: '18px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f5f5f5' }}>
                  <div style={{ fontSize: '14px' }}>
                     <b style={{ color: '#333' }}>{t.desc}</b>
                     <p style={{ margin: '4px 0 0 0', color: '#bbb', fontSize: '11px' }}>{t.date}</p>
                  </div>
                  <b style={{ color: t.type === 'plus' ? '#2e7d32' : '#c62828' }}>
                     {t.type === 'plus' ? '+' : '-'} ₹{t.amt}
                  </b>
               </div>
            ))}
         </div>
      </div>
   );

   const renderAccount = () => {
      if (accountSubView === 'addresses') return renderAddressManager();
      if (accountSubView === 'payments') return renderPaymentHub();
      if (accountSubView === 'wallet') return renderWallet();
      if (accountSubView === 'wishlist') return (
         <div className="animate__animated animate__fadeIn" style={{ padding: '20px' }}>
            <button onClick={() => setAccountSubView(null)}>← Profile</button>
            <h2 style={{ color: 'var(--primary)', margin: '20px 0' }}>My Wishlist ❤️</h2>
            <div className="saree-grid">
               {wishlist.map(s => (
                  <div key={s.id} onClick={() => { setSelectedSaree(s); setView("detail"); }} style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                     <img src={s.image_url} style={{ height: '140px', width: '100%', objectFit: 'cover' }} alt="" />
                     <div style={{ padding: '12px' }}><b>{s.title}</b><p style={{ color: 'var(--primary)', marginTop: '5px' }}>₹{s.price}</p></div>
                  </div>
               ))}
            </div>
         </div>
      );

      return (
         <div className="animate__animated animate__fadeIn">
            <div style={{ background: 'var(--primary)', color: 'white', padding: '60px 25px', textAlign: 'center', borderRadius: '0 0 50px 50px' }}>
               <div style={{ width: '100px', height: '100px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', border: '4px solid white' }}>{userName[0]}</div>
               <h2 style={{ margin: 0, fontSize: '28px' }}>{userName}</h2>
               <p style={{ opacity: 0.8, fontSize: '14px', marginTop: '5px' }}>{localStorage.getItem("userEmail")}</p>
            </div>
            <div style={{ padding: '25px', paddingBottom: '120px' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                  {[
                     { id: 'wishlist', label: "Wishlist", icon: "❤️", val: `${wishlist.length} Items` },
                     { id: 'wallet', label: "Wallet", icon: "💰", val: `₹${walletBalance}` },
                     { id: 'addresses', label: "Addresses", icon: "📍", val: `${addresses.length} Saved` },
                     { id: 'payments', label: "Payments", icon: "💳", val: "Managed" }
                  ].map(item => (
                     <div key={item.id} className="stat-card" style={{ textAlign: 'center', background: 'white', padding: '25px', borderRadius: '30px', border: '1px solid #f2f2f2', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.02)' }} onClick={() => setAccountSubView(item.id)}>
                        <div style={{ fontSize: '36px', marginBottom: '10px' }}>{item.icon}</div>
                        <b style={{ fontSize: '15px' }}>{item.label}</b>
                        <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#999' }}>{item.val}</p>
                     </div>
                  ))}
               </div>

               <h3 style={{ color: 'var(--primary)', marginBottom: '18px', borderLeft: '4px solid var(--primary)', paddingLeft: '15px' }}>Order History</h3>
               <div className="orders-list">
                  {orders.map(o => (

                     <div
                        key={o.id}

                        style={{

                           background: 'white',
                           padding: '20px',
                           borderRadius: '20px',
                           marginBottom: '15px',

                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'center',

                           border: '1px solid #f5f5f5'

                        }}
                     >

                        <div>

                           <b
                              style={{
                                 fontSize: '15px'
                              }}
                           >
                              {o.saree_title}
                           </b>

                           <p

                              style={{

                                 color:
                                    o.status === "Pending"
                                       ? "orange"
                                       : "#800020",

                                 fontSize: '12px',

                                 fontWeight: 'bold',

                                 marginTop: '5px'

                              }}

                           >

                              {o.status.toUpperCase()}

                           </p>

                        </div>


                        <div

                           style={{

                              display: 'flex',

                              gap: '15px',

                              alignItems: 'center'

                           }}

                        >

                           <b

                              style={{

                                 color: '#800020',

                                 fontSize: '18px'

                              }}

                           >

                              ₹{o.price}

                           </b>


                           <button

                              onClick={() => setSelectedOrder(o)}

                              style={{

                                 background: "#800020",

                                 color: "white",

                                 border: "none",

                                 padding: "8px 18px",

                                 borderRadius: "10px",

                                 cursor: "pointer"

                              }}

                           >

                              Track

                           </button>

                        </div>

                     </div>

                  ))}

                  {orders.length === 0 && (

                     <p

                        style={{

                           textAlign: 'center',

                           color: '#bbb',

                           padding: '30px'

                        }}

                     >

                        No orders yet.

                     </p>

                  )}

               </div>




               <button style={{ marginTop: '40px', background: '#333', color: 'white', height: '60px', borderRadius: '20px', fontWeight: 'bold' }} onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>Sign Out Safeguard 🔒</button>
            </div>
         </div>
      );
   };
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
                              color: active ? "white" : "#0c0b0bff",
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
                              color: active ? "#800020" : "#8a1616ff"
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
                  background: "#f8f6f6ff",
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
               {selectedOrder.estimated_delivery && (

                  <div

                     style={{

                        background: '#e8f5e9',

                        padding: '15px',

                        borderRadius: '12px',

                        marginTop: '20px',

                        display: 'flex',

                        gap: '10px',

                        alignItems: 'center'

                     }}

                  >

                     <span style={{ fontSize: '22px' }}>

                        📅

                     </span>

                     <div>

                        <label
                           style={{
                              fontSize: '11px',
                              color: '#2e7d32'
                           }}
                        >

                           ESTIMATED ARRIVAL

                        </label>

                        <b
                           style={{
                              color: '#2e7d32'
                           }}
                        >

                           {selectedOrder.estimated_delivery}

                        </b>

                     </div>

                  </div>

               )}

            </div>

            <button
               onClick={() => setSelectedOrder(null)}
               style={{
                  marginTop: "20px",
                  background: "#900f0fff",
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

   const renderAmazonCheckout = () => {
      const item = selectedSaree || cart[0];
      if (!item) return null;
      const paymentMethods = [
         { id: 'phonepe', label: 'PhonePe UPI', sub: 'Instant bank transfer via UPI', icon: '🟣', color: '#5F259F' },
         { id: 'gpay', label: 'Google Pay', sub: 'Pay securely via Google Pay', icon: '🔵', color: '#4285F4' },
         { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when your order arrives', icon: '💵', color: '#2e7d32' },
      ];
      return (
         <div className="animate__animated animate__fadeInUp" style={{
            background: '#f4f5f7', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 10500, overflowY: 'auto', fontFamily: "'Inter', sans-serif"
         }}>
            {/* ── Header ── */}
            <div style={{
               background: 'linear-gradient(135deg, #800020 0%, #4a0012 100%)',
               padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px',
               position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.2)'
            }}>
               <button onClick={() => setView("detail")} style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                  width: '36px', height: '36px', borderRadius: '50%', fontSize: '18px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
               }}>←</button>
               <div>
                  <div style={{ color: 'white', fontWeight: '700', fontSize: '17px' }}>Secure Checkout</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>🔒 256-bit SSL Encrypted</div>
               </div>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 16px 100px' }}>

               {/* ── Step indicator ── */}
               <div style={{ display: 'flex', alignItems: 'center', marginBottom: '22px' }}>
                  {['Address', 'Payment', 'Review'].map((s, i) => (
                     <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <div style={{
                           width: '26px', height: '26px', borderRadius: '50%',
                           background: i <= 1 ? 'var(--primary)' : '#ddd',
                           color: i <= 1 ? 'white' : '#999',
                           fontSize: '11px', fontWeight: 'bold',
                           display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>{i + 1}</div>
                        <div style={{ flex: 1, height: '2px', background: i < 1 ? 'var(--primary)' : '#ddd', marginLeft: '4px', marginRight: i < 2 ? '4px' : '0' }}></div>
                        <span style={{ fontSize: '10px', color: i <= 1 ? 'var(--primary)' : '#999', fontWeight: i <= 1 ? '600' : '400', whiteSpace: 'nowrap', marginRight: i < 2 ? '8px' : '0' }}>{s}</span>
                     </div>
                  ))}
               </div>

               {/* ── Delivery Address Card ── */}
               <div style={{
                  background: 'white', borderRadius: '16px', padding: '18px 20px',
                  marginBottom: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #eee'
               }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                     <div>
                        <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Deliver To</div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                           <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #800020, #c0002a)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', flexShrink: 0 }}>📍</div>
                           <div>
                              <div style={{ fontWeight: '700', fontSize: '15px', color: '#1a1a1a' }}>{addresses[0].name}</div>
                              <div style={{ fontSize: '13px', color: '#666', marginTop: '3px', lineHeight: '1.5' }}>{addresses[0].line}</div>
                              <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>PIN: {addresses[0].zip} • 📞 {addresses[0].phone}</div>
                           </div>
                        </div>
                     </div>
                     <button onClick={() => setAccountSubView('addresses')} style={{
                        background: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: '600',
                        border: '1px solid var(--primary)', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer'
                     }}>Change</button>
                  </div>
               </div>

               {/* ── Payment Methods Card ── */}
               <div style={{
                  background: 'white', borderRadius: '16px', padding: '18px 20px',
                  marginBottom: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #eee'
               }}>
                  <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px', fontWeight: '600' }}>Payment Method</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     {paymentMethods.map(p => {
                        const isSelected = selectedPaymentMethod === p.label;
                        return (
                           <div key={p.id} onClick={() => setSelectedPaymentMethod(p.label)} style={{
                              display: 'flex', alignItems: 'center', gap: '14px',
                              padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                              border: isSelected ? `2px solid ${p.color}` : '1.5px solid #eee',
                              background: isSelected ? `${p.color}08` : '#fafafa',
                              transition: 'all 0.2s'
                           }}>
                              <div style={{
                                 width: '42px', height: '42px', borderRadius: '12px',
                                 background: `${p.color}15`, display: 'flex', alignItems: 'center',
                                 justifyContent: 'center', fontSize: '22px', flexShrink: 0
                              }}>{p.icon}</div>
                              <div style={{ flex: 1 }}>
                                 <div style={{ fontWeight: '700', fontSize: '14px', color: '#1a1a1a' }}>{p.label}</div>
                                 <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{p.sub}</div>
                              </div>
                              <div style={{
                                 width: '20px', height: '20px', borderRadius: '50%',
                                 border: `2px solid ${isSelected ? p.color : '#ccc'}`,
                                 display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                              }}>
                                 {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.color }}></div>}
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>

               {/* ── Item Card ── */}
               <div style={{
                  background: 'white', borderRadius: '16px', padding: '18px 20px',
                  marginBottom: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #eee'
               }}>
                  <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px', fontWeight: '600' }}>Your Item</div>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                     <img src={item.image_url} style={{ width: '65px', height: '85px', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} alt="" />
                     <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: '#1a1a1a', lineHeight: '1.4' }}>{item.title}</div>
                        <div style={{ margin: '6px 0', fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>₹{item.price}</div>
                        <span style={{ fontSize: '11px', color: '#007600', background: '#e8f5e9', padding: '3px 8px', borderRadius: '6px', fontWeight: '600' }}>✓ FREE Shipping</span>
                     </div>
                  </div>
               </div>

               {/* ── Price Summary ── */}
               <div style={{
                  background: 'white', borderRadius: '16px', padding: '18px 20px',
                  marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #eee'
               }}>
                  <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px', fontWeight: '600' }}>Price Details</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#555' }}><span>Item Price</span><span>₹{item.price}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#555' }}><span>Delivery Charges</span><span style={{ color: '#007600', fontWeight: '600' }}>FREE</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#555' }}><span>Artisan Support</span><span style={{ color: '#007600', fontWeight: '600' }}>Included</span></div>
                  <div style={{ borderTop: '1.5px dashed #eee', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                     <span style={{ fontWeight: '800', fontSize: '16px' }}>Total Amount</span>
                     <span style={{ fontWeight: '800', fontSize: '20px', color: 'var(--primary)' }}>₹{item.price}</span>
                  </div>
               </div>

               {/* ── Place Order Button ── */}
               <button onClick={async () => {
                  try {
                     await api.post("/buyer/order", {
                        buyer_id: userId, saree_id: item.id, payment_method: selectedPaymentMethod
                     });
                     if (!selectedSaree) setCart(cart.slice(1));
                     setView("main"); setShowOrderSuccess(true);
                  } catch (e) { showToast("Order Failed. Please retry."); }
               }} style={{
                  width: '100%', padding: '17px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #800020, #c0002a)',
                  color: 'white', fontWeight: '800', fontSize: '16px',
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(128,0,32,0.35)',
                  transition: 'transform 0.15s',
                  letterSpacing: '0.3px'
               }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
                  🔒 Place Order · Pay ₹{item.price}
               </button>

               {/* ── Trust Badges ── */}
               <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '18px', flexWrap: 'wrap' }}>
                  {['🔒 Secure Payment', '🤝 Artisan Direct', '♻️ Easy Returns'].map(b => (
                     <span key={b} style={{ fontSize: '11px', color: '#888', fontWeight: '600' }}>{b}</span>
                  ))}
               </div>

            </div>
         </div>
      );
   };

   const renderBag = () => (
      <div className="animate__animated animate__fadeIn" style={{ padding: '25px', paddingBottom: '120px' }}>
         <h1 style={{ color: 'var(--primary)', fontSize: '32px', marginBottom: '30px' }}>My Bag ({cart.length})</h1>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cart.map(i => (
               <div key={i.id} style={{ display: 'flex', gap: '20px', background: 'white', padding: '20px', borderRadius: '25px', border: '1px solid #f0f0f0' }}>
                  <img src={i.image_url} style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: '15px' }} alt="" />
                  <div style={{ flex: 1 }}>
                     <b style={{ fontSize: '17px' }}>{i.title}</b>
                     <p style={{ margin: '8px 0', color: 'var(--primary)', fontWeight: 'bold', fontSize: '20px' }}>₹{i.price}</p>
                     <span style={{ fontSize: '11px', color: '#2e7d32', background: '#e8f5e9', padding: '3px 8px', borderRadius: '6px' }}>Master Handloom</span>
                  </div>
                  <button style={{ width: 'auto', background: 'none', color: '#ddd', fontSize: '24px' }} onClick={() => setCart(cart.filter(x => x.id !== i.id))}>✕</button>
               </div>
            ))}
         </div>
         {cart.length > 0 && (
            <div style={{ marginTop: '40px' }}>
               <button onClick={() => { setSelectedSaree(null); setView("checkout"); }} style={{ height: '65px', background: 'var(--primary)', color: 'white', borderRadius: '20px', width: '100%', fontSize: '18px', fontWeight: 'bold' }}>Proceed to Checkout 📦</button>
            </div>
         )}
      </div>
   );

   return (
      <div className="buyer-app-v2">
         {toast && <div style={{ position: 'fixed', top: '25px', left: '50%', transform: 'translateX(-50%)', background: '#333', color: 'white', padding: '12px 30px', borderRadius: '50px', zIndex: 20000, boxShadow: '0 10px 30px rgba(0,0,0,0.3)', fontWeight: 'bold' }} className="animate__animated animate__bounceInDown">{toast}</div>}

         {showOrderSuccess && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'white', zIndex: 30000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }} className="animate__animated animate__fadeIn">
               <div style={{ fontSize: '100px', marginBottom: '30px' }}>🎉</div>
               <h1 style={{ color: 'var(--primary)', fontSize: '34px' }}>Order Placed!</h1>
               <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.6', margin: '15px 0 40px 0' }}>Your master weaver has been notified and is preparing your heritage saree for dispatch. 🧵🇮🇳</p>
               <button onClick={() => { setShowOrderSuccess(false); setActiveTab("account"); }} style={{ height: '60px', background: 'var(--primary)', color: 'white', padding: '0 40px', borderRadius: '20px', fontWeight: 'bold', fontSize: '18px' }}>Track My Order</button>
            </div>
         )}

         {/* 🔹 DETAIL VIEW */}
         {view === "detail" && (
            <div className="animate__animated animate__fadeInUp" style={{ background: 'white', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, overflowY: 'auto' }}>
               <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'white', padding: '10px', borderRadius: '50%', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', zIndex: 10001 }} onClick={() => { setView("main"); setShowPaymentOptions(false); }}>←</div>
               <img src={selectedSaree.image_url} style={{ width: '100%', height: '320px', objectFit: 'cover' }} alt="" />
               <div style={{ padding: '25px', paddingBottom: '80px' }}>
                  <h1 style={{ color: 'var(--primary)', margin: '0 0 10px 0', fontSize: '26px', fontWeight: '800' }}>{selectedSaree.title}</h1>
                  <div style={{ marginBottom: '20px' }}>{renderStars(selectedSaree.rating)} <span style={{ fontSize: '13px', color: '#999' }}>({selectedSaree.reviewsCount} Reviews)</span></div>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)', marginBottom: '25px' }}>₹{selectedSaree.price}</div>

                  <p style={{ color: '#555', lineHeight: '1.7', fontSize: '15px' }}>{selectedSaree.description || "A pristine example of heritage weaving. Every thread tells a story of generation-spanning artisan skill."}</p>

                  <div className="artisan-story-card" style={{ marginTop: '30px', boxShadow: '0 8px 25px rgba(212,175,55,0.1)' }}>
                     <div className="artisan-glass-card" style={{ marginTop: '30px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                           <div style={{ width: '60px', height: '60px', background: 'var(--secondary)', color: 'white', borderRadius: '50%', textAlign: 'center', lineHeight: '60px', fontSize: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>👳🏽</div>
                           <div>
                              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>{selectedSaree.weaver_name || "Artisan Master"}</h3>
                              <p style={{ margin: '2px 0 0 0', color: 'var(--secondary)', fontWeight: 'bold', fontSize: '13px' }}>{selectedSaree.weaver_experience || "10+"} Years Excellence</p>
                           </div>
                        </div>
                        <button onClick={() => setIsVideoOpen(true)} className="premium-card" style={{ marginTop: '20px', background: 'white', color: 'var(--secondary)', border: '2px solid var(--secondary)', width: '100%', padding: '12px', borderRadius: '15px', fontWeight: 'bold', fontSize: '14px', position: 'relative', zIndex: 1 }}>
                           Watch Process Video 🎬
                        </button>
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '60px', opacity: 0.05, transform: 'rotate(15deg)' }}>🧵</div>
                     </div>
                  </div>

                  <div className="horizontal-action-row">
                     <button onClick={() => { setView("checkout"); }} style={{ background: '#ffa41c', color: 'black' }}>Buy Now</button>
                     <button onClick={() => addToCart(selectedSaree)} style={{ background: '#ffd814', color: 'black' }}>Add to Bag</button>
                  </div>
               </div>

               {isVideoOpen && (
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.95)', zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px' }}>
                     <div style={{ background: '#111', width: '100%', maxWidth: '400px', borderRadius: '30px', padding: '50px 30px', textAlign: 'center', color: 'white' }}>
                        <div style={{ fontSize: '60px', marginBottom: '25px', animation: 'spin 3s linear infinite' }}>📽️</div>
                        <h3>The Loom of {selectedSaree.weaver_name}</h3>
                        <p style={{ opacity: 0.7, fontSize: '14px', marginTop: '10px' }}>Streaming heritage process from {selectedSaree.weaver_state || 'West Bengal'}...</p>
                        <div style={{ width: '40px', height: '40px', border: '4px solid #d4af37', borderTopColor: 'transparent', borderRadius: '50%', margin: '40px auto', animation: 'spin 1s linear infinite' }}></div>
                        <button onClick={() => setIsVideoOpen(false)} style={{ background: 'white', color: 'black', padding: '10px 30px', borderRadius: '15px', fontWeight: 'bold' }}>Close Stream</button>
                     </div>
                  </div>
               )}
            </div>
         )}

         {/* 🔹 CHATBOT */}
         <div className="chatbot-fab" onClick={() => setIsChatOpen(!isChatOpen)} style={{ zIndex: 5000 }}>{isChatOpen ? '✕' : '🤖'}</div>
         {isChatOpen && (
            <div className="chatbot-panel animate__animated animate__slideInUp" style={{ zIndex: 5001 }}>
               <div className="chat-header">Artisan Assistant 🧵</div>
               <div style={{ padding: '50px 20px', textAlign: 'center', color: '#999' }}>
                  <p>Welcome to Handloom Connect Support.</p>
                  <b>How can I assist your discovery?</b>
               </div>
            </div>
         )}

         <main className="main-viewport-v2">
            {activeTab === 'home' && renderHome()}
            {activeTab === 'search' && renderSearch()}
            {activeTab === 'cart' && renderBag()}
            {activeTab === 'account' && renderAccount()}
         </main>

         <nav className="bottom-nav">
            <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setView("main"); setAccountSubView(null); }}>🏠<span>Home</span></div>
            <div className={`nav-item ${activeTab === 'search' ? 'active' : ''}`} onClick={() => { setActiveTab('search'); setView("main"); setAccountSubView(null); }}>🔍<span>Search</span></div>
            <div className={`nav-item ${activeTab === 'cart' ? 'active' : ''}`} onClick={() => { setActiveTab('cart'); setView("main"); setAccountSubView(null); }}>🛍️<span>My Bag</span></div>
            <div className={`nav-item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => { setActiveTab('account'); setView("main"); setAccountSubView(null); }}>👤<span>Profile</span></div>
         </nav>

         {/* 🔹 CHECKOUT VIEW - Full page overlay */}
         {view === 'checkout' && renderAmazonCheckout()}
         {selectedOrder && renderOrderTrackingModal()}
      </div>

   );
}
