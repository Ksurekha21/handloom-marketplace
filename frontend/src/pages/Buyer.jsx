import { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
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
   const [searchResults, setSearchResults] = useState([]);
   const [totalResults, setTotalResults] = useState(0);
   const [searchPage, setSearchPage] = useState(1);
   const [searchSort, setSearchSort] = useState('relevance');
   const [perPage] = useState(24);
   const [suggestions, setSuggestions] = useState([]);
   const [loadingSearch, setLoadingSearch] = useState(false);
   const [recentUploads, setRecentUploads] = useState([]);
   const [coupon, setCoupon] = useState("");
   const [discount, setDiscount] = useState(0);
   const [accountSubView, setAccountSubView] = useState(null);
   const [reviewRating, setReviewRating] = useState(0);
   const [reviewText, setReviewText] = useState('');
   const [reviewFile, setReviewFile] = useState(null);
   const [reviewAfterDelivery, setReviewAfterDelivery] = useState(false);
   const [sareeReviews, setSareeReviews] = useState([]);
   const [isVideoOpen, setIsVideoOpen] = useState(false);
   const [isChatOpen, setIsChatOpen] = useState(false);
     // Categories and filters for enhanced marketplace (text-only chips)
     const [categories] = useState([
        { id: 'silk', name: 'Silk (Pattu)' },
        { id: 'cotton', name: 'Cotton' },
        { id: 'wool', name: 'Wool' },
        { id: 'linen', name: 'Linen' },
        { id: 'blended', name: 'Blended' },
        { id: 'zari', name: 'Zari' }
     ]);
     const [activeCategory, setActiveCategory] = useState(null);
   const [selectedType, setSelectedType] = useState(null);
     const [listingFilters, setListingFilters] = useState({ material: '', price: '', state: '', rating: 0, availability: '' });
     const [darkMode, setDarkMode] = useState(false);
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
      // check URL query params so redirects (e.g., from weaver upload) load correct products
      const params = new URLSearchParams(window.location.search);
      const mat = params.get('material');
      const st = params.get('saree_type');
      if (mat || st) {
         // set UI state where possible
         if (mat) {
            const match = categories.find(c => c.name.toLowerCase().includes(mat.toLowerCase()));
            if (match) setActiveCategory(match.id);
         }
         if (st) setSelectedType(st);
         fetchProducts(mat, st);
      } else {
         fetchProducts();
         // also prime recent uploads for the search page
         fetchRecentUploads();
      }
      if (userId) fetchOrders();
   }, [userId, activeTab]);

     useEffect(() => {
        document.body.classList.toggle('dark-mode', darkMode);
     }, [darkMode]);

   useEffect(() => { try { localStorage.setItem("cart", JSON.stringify(cart)); } catch (e) { console.error('cart save failed', e); } }, [cart]);
   useEffect(() => { try { localStorage.setItem("wishlist", JSON.stringify(wishlist)); } catch (e) { console.error('wishlist save failed', e); try { localStorage.setItem("wishlist", JSON.stringify(wishlist.map(i => i.id))); } catch (err) { console.error('wishlist fallback save failed', err); } } }, [wishlist]);

   const isWishlisted = (id) => wishlist.some(i => String(i.id) === String(id));

   const fetchOrders = async () => {
      if (!userId) return;
      try {
         const res = await api.get(`/buyer/orders/${userId}`);
         setOrders(res.data.orders);
      } catch (e) { console.error(e); }
   };

   const fetchProducts = async (material, saree_type) => {
      try {
         const params = {};
         if (material) params.material = material;
         if (saree_type) params.saree_type = saree_type;
         const res = await api.get("/buyer/products", { params });
         const products = res.data.products || [];
         // if no products found and saree_type provided, try the search endpoint (type-only)
         if (products.length === 0 && saree_type) {
            try {
               const sres = await api.get('/buyer/search', { params: { q: saree_type, per_page: 48 } });
               const fallback = sres.data.products || [];
               const enhancedFallback = fallback.map(p => ({ ...p, rating: (Math.random() * (5 - 4.1) + 4.1).toFixed(1), reviewsCount: Math.floor(Math.random() * 60) + 15 }));
               setSarees(enhancedFallback);
               return;
            } catch (e) {
               console.error('fallback search failed', e);
            }
         }

         const enhanced = products.map(p => ({
            ...p,
            rating: (Math.random() * (5 - 4.1) + 4.1).toFixed(1),
            reviewsCount: Math.floor(Math.random() * 60) + 15
         }));
         setSarees(enhanced);
      } catch (e) { console.error(e); }
   };

     // --- Search / Suggestions ---
     let suggTimer = null;
     const fetchSearchSuggestions = (q) => {
        if (suggTimer) clearTimeout(suggTimer);
        suggTimer = setTimeout(async () => {
           try {
              const res = await api.get('/buyer/suggestions', { params: { q, limit: 8 } });
              setSuggestions(res.data.suggestions || []);
           } catch (e) { console.error(e); setSuggestions([]); }
        }, 200);
     };

     const handleSearchSubmit = async (q, reset = true, sortParam = null) => {
        setLoadingSearch(true);
        try {
           const pageToUse = reset ? 1 : searchPage;
           const sortToUse = sortParam || searchSort || 'relevance';
           if (reset) setSearchSort(sortToUse);
           const res = await api.get('/buyer/search', { params: { q, page: pageToUse, per_page: perPage, sort: sortToUse } });
           if (reset) {
              setSearchResults(res.data.products || []);
              setSearchPage(1);
           } else {
              setSearchResults(prev => [...prev, ...(res.data.products || [])]);
           }
           setTotalResults(res.data.total || 0);
        } catch (e) { console.error(e); }
        setLoadingSearch(false);
     };

     const loadMoreSearch = async () => {
        const next = searchPage + 1;
        try {
           const res = await api.get('/buyer/search', { params: { q: searchQuery, page: next, per_page: perPage, sort: searchSort } });
           setSearchResults(prev => [...prev, ...(res.data.products || [])]);
           setSearchPage(next);
        } catch (e) { console.error(e); }
     };

     const fetchRecentUploads = async () => {
        try {
           const res = await api.get('/buyer/search', { params: { sort: 'newest', per_page: 6 } });
           setRecentUploads(res.data.products || []);
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
   const navigate = useNavigate();
     const location = useLocation();

    const goBack = (fallback) => {
       try {
          if (window.history && window.history.length > 1) {
             navigate(-1);
             return;
          }
       } catch (e) { /* ignore */ }
       if (typeof fallback === 'function') fallback();
       else navigate('/buyer');
    };

   // Save current search/listing state to sessionStorage so it can be restored
   const saveSearchRestore = () => {
      try {
         const key = `search_restore_${Date.now()}`;
         const payload = {
            q: searchQuery,
            filters: listingFilters,
            sort: searchSort,
            results: searchResults,
            totalResults,
            page: searchPage,
            scrollY: window.scrollY || 0
         };
         sessionStorage.setItem(key, JSON.stringify(payload));
         return key;
      } catch (e) { return null; }
   };

     // handle navigation state from other pages (e.g., ProductDetail Buy Now / Add to Bag)
     useEffect(() => {
        if (!location || !location.state) return;
        const s = location.state;
       // restore saved search state if provided directly or via a nested `from` payload
       let restoreKey = s && s.restoreSearchKey;
       if (!restoreKey && s && s.from) {
          try {
             const fromObj = typeof s.from === 'string' ? JSON.parse(s.from) : s.from;
             if (fromObj && fromObj.state && fromObj.state.restoreSearchKey) restoreKey = fromObj.state.restoreSearchKey;
          } catch (e) { /* ignore */ }
       }
       if (restoreKey) {
          try {
             const saved = JSON.parse(sessionStorage.getItem(restoreKey) || 'null');
             if (saved) {
                setSearchQuery(saved.q || '');
                setListingFilters(saved.filters || { material: '', price: '', state: '', rating: 0, availability: '' });
                setSearchSort(saved.sort || 'relevance');
                setSearchResults(saved.results || []);
                setTotalResults(saved.totalResults || 0);
                setSearchPage(saved.page || 1);
                setActiveTab('search');
                setView('main');
                setTimeout(() => { try { window.scrollTo(0, saved.scrollY || 0); } catch (e) {} }, 60);
             }
          } catch (e) { }
       }
        if (s.action === 'open_cart') {
           setActiveTab('cart');
           setView('main');
        }
        if (s.action === 'open_search') {
           setActiveTab('search');
           setView('main');
        }
        if (s.action === 'open_wishlist') {
           setActiveTab('account');
           setView('main');
           setAccountSubView('wishlist');
        }
        if (s.action === 'checkout') {
           if (s.product) setSelectedSaree(s.product);
           setView('checkout');
        }
        // clear the location state so the action doesn't replay
        try { navigate(location.pathname + window.location.search, { replace: true, state: {} }); } catch (e) { /* ignore */ }
     }, [location && location.state]);

    // Respond to URL query params so navigating back to /buyer?q=... restores search/listing
    useEffect(() => {
       if (!location) return;
       try {
          const params = new URLSearchParams(location.search);
          const q = params.get('q');
          const mat = params.get('material');
          const st = params.get('saree_type');
          if (q) {
             setSearchQuery(q);
             handleSearchSubmit(q);
             setActiveTab('search');
             setView('main');
             return;
          }
          if (mat || st) {
             const matVal = mat || undefined;
             const stVal = st || undefined;
             fetchProducts(matVal, stVal);
             setActiveTab('search');
             setView('main');
             return;
          }
       } catch (e) { /* ignore */ }
    }, [location && location.search]);

   const addToCart = (s) => {
      if (!cart.find(item => item.id === s.id)) {
         setCart([...cart, { ...s, quantity: 1 }]);
         showToast("Added to Bag! 🛍️");
      } else showToast("Already in Bag!");
   };

   const toggleWishlist = (e, s) => {
      try {
         if (e && e.stopPropagation) e.stopPropagation();
         setWishlist(prev => {
            const exists = prev.find(item => String(item.id) === String(s.id));
            if (exists) return prev.filter(i => String(i.id) !== String(s.id));
            return [...prev, s];
         });
      } catch (err) {
         console.error('toggleWishlist error', err);
         showToast('Could not update wishlist');
      }
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
            {/* Categories */}
            <div style={{ marginBottom: '18px' }}>
               <h3 style={{ color: 'var(--primary)', margin: '6px 0' }}>Explore Categories</h3>
               <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {categories.map(c => (
                     <div key={c.id} onClick={() => {
                        const label = c.name.replace(/\s*\(.*\)/, '').trim();
                        setActiveCategory(c.id); setView('category'); setActiveTab('search'); setSelectedType(null);
                        // update URL so deep links / redirects work
                        window.history.replaceState(null, '', `/buyer?material=${encodeURIComponent(label)}`);
                        fetchProducts(label);
                     }}
                        className={`category-chip ${activeCategory === c.id ? 'selected' : ''}`} style={{ cursor: 'pointer' }}>
                        {c.name}
                     </div>
                  ))}
               </div>
            </div>
            <p style={{ color: '#777', marginTop: '8px' }}>Select a category to view its saree types and products below.</p>
         </div>
      </div>
   );

   const renderSearch = () => (
      <div className="animate__animated animate__fadeIn" style={{ padding: '20px', paddingBottom: '120px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '18px', marginBottom: '18px' }}>
            <div style={{ flex: 1 }}>
               <div style={{ fontSize: '12px', color: '#999', marginBottom: '6px' }}>Search handloom sarees from verified weavers</div>
               <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                     autoFocus
                     placeholder="Search by name, type, material, color, state, weaver..."
                     style={{ width: '100%', padding: '18px', borderRadius: '14px', border: '1px solid #eee', outline: 'none', fontSize: '16px' }}
                     value={searchQuery}
                     onChange={e => { setSearchQuery(e.target.value); fetchSearchSuggestions(e.target.value); }}
                     onKeyDown={e => { if (e.key === 'Enter') { handleSearchSubmit(e.target.value); } }}
                  />
                  <button onClick={() => handleSearchSubmit(searchQuery)} style={{ background: 'var(--primary)', color: 'white', padding: '12px 18px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>Search</button>
               </div>
               {suggestions.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                     {suggestions.map(s => (
                        <div key={s} onClick={() => { setSearchQuery(s); handleSearchSubmit(s); }} style={{ background: '#f6f6f6', padding: '8px 12px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px' }}>{s}</div>
                     ))}
                  </div>
               )}
            </div>
            <div style={{ width: '320px', textAlign: 'right' }}>
               <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{totalResults} Results</div>
               <div style={{ fontSize: '12px', color: '#888' }}>{searchQuery ? `for "${searchQuery}"` : 'Browse recent uploads'}</div>
            </div>
         </div>

         {/* Recent uploads (from DB) shown when no active search */}
         {!searchQuery && recentUploads.length > 0 && (
            <div style={{ marginTop: '8px' }}>
               <h3 style={{ color: 'var(--primary)', margin: '10px 0' }}>Recently Uploaded</h3>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '12px' }}>
                        {recentUploads.map(s => (
                           <div key={s.id} className="saree-card" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => { const k = saveSearchRestore(); navigate(`/product/${s.id}`, { state: { from: JSON.stringify({ path: window.location.pathname + window.location.search, state: { restoreSearchKey: k } }) } }); }}>
                              <div className="wishlist-heart" onClick={(e) => { e.stopPropagation(); toggleWishlist(e, s); }} style={{ position: 'absolute', right: 10, top: 10, zIndex: 2 }}>
                           <span style={{ color: isWishlisted(s.id) ? '#ff3e30' : '#ddd' }}>{isWishlisted(s.id) ? '❤️' : '♡'}</span>
                              </div>
                              <img src={s.image_url} alt="" style={{ height: '140px', width: '100%', objectFit: 'cover' }} />
                              <div style={{ padding: '10px' }}>
                                 <b style={{ fontSize: '13px' }}>{s.title}</b>
                                 <div style={{ fontSize: '12px', color: '#666' }}>{s.weaver_name} • {s.weaver_state}</div>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                    <div style={{ color: 'var(--primary)', fontWeight: 800 }}>₹{s.price || ''}</div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                       <button onClick={(e) => { e.stopPropagation(); const k = saveSearchRestore(); navigate(`/product/${s.id}`, { state: { from: JSON.stringify({ path: window.location.pathname + window.location.search, state: { restoreSearchKey: k } }) } }); }} style={{ background: 'var(--primary)', color: 'white', borderRadius: '10px', padding: '8px 12px', border: 'none', cursor: 'pointer' }}>View</button>
                                       <button onClick={(e) => { e.stopPropagation(); addToCart(s); }} style={{ background: '#ffd814', border: 'none', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }}>Add</button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
            </div>
         )}

         {/* Search results */}
         {searchQuery && (
            <div style={{ marginTop: '18px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, color: 'var(--primary)' }}>Results</h3>
                     <div style={{ display: 'flex', gap: '8px' }}>
                     <select value={searchSort} onChange={e => { setSearchSort(e.target.value); handleSearchSubmit(searchQuery, true, e.target.value); }}>
                        <option value="relevance">Relevance</option>
                        <option value="newest">Newest</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                     </select>
                  </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '14px' }}>
                  {searchResults.map(s => (
                     <div key={s.id} className="saree-card">
                        <div className="wishlist-heart" onClick={(e) => toggleWishlist(e, s)}><span style={{ color: isWishlisted(s.id) ? '#ff3e30' : '#ddd' }}>{isWishlisted(s.id) ? '❤️' : '♡'}</span></div>
                        <img src={s.image_url} alt="" style={{ height: '170px', width: '100%', objectFit: 'cover' }} />
                        <div style={{ padding: '12px' }}>
                           <b style={{ fontSize: '14px' }}>{s.title}</b>
                           <div style={{ margin: '6px 0' }}>{renderStars(s.rating)} <span style={{ fontSize: '12px', color: '#777', marginLeft: '6px' }}>{s.reviewsCount} reviews</span></div>
                           <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{s.weaver_name} • {s.weaver_state}</div>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                 <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '16px' }}>₹{s.price}</div>
                                 <div style={{ fontSize: '12px', color: '#2e7d32' }}>{s.material}</div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                 <button onClick={() => { const k = saveSearchRestore(); navigate(`/product/${s.id}`, { state: { from: JSON.stringify({ path: window.location.pathname + window.location.search, state: { restoreSearchKey: k } }) } }); }} style={{ background: 'var(--primary)', color: 'white', borderRadius: '10px', padding: '8px 12px', border: 'none', cursor: 'pointer' }}>View</button>
                                 <button onClick={() => addToCart(s)} style={{ background: '#ffd814', border: 'none', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }}>Add</button>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>

               {searchResults.length < totalResults && (
                  <div style={{ textAlign: 'center', marginTop: '18px' }}>
                     <button onClick={loadMoreSearch} style={{ padding: '10px 18px', borderRadius: '12px', background: 'white', border: '1px solid #ddd' }}>{loadingSearch ? 'Loading...' : 'Load more'}</button>
                  </div>
               )}

               {searchResults.length === 0 && !loadingSearch && (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
                     <b>No sarees found matching your search.</b>
                     <div style={{ marginTop: '12px' }}>
                        <h4 style={{ color: 'var(--primary)' }}>Popular Saree Types</h4>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                           {suggestions.slice(0,6).map(s => <div key={s} onClick={() => { setSearchQuery(s); handleSearchSubmit(s); }} style={{ background: '#f6f6f6', padding: '8px 12px', borderRadius: '12px', cursor: 'pointer' }}>{s}</div>)}
                        </div>
                     </div>
                  </div>
               )}
            </div>
         )}
      </div>
   );

     // ── CATEGORY & LISTING RENDERS ──
     const categoryTypes = {
        silk: ['Kanchipuram','Dharmavaram','Venkatagiri','Uppada','Jamdani','Banarasi','Paithani','Baluchari','Arani','Mysore','Pochampally'],
        cotton: ['Kanchipuram Cotton','Dharmavaram Cotton','Venkatagiri Cotton','Uppada Cotton','Jamdani Cotton','Banarasi Cotton','Paithani Cotton','Baluchari Cotton','Arani Cotton','Mysore Cotton','Pochampally Cotton'],
        wool: ['Kullu Wool','Kashmir Wool','Himachal Wool'],
        linen: ['Chanderi Linen','Maheshwari Linen','Kerala Linen'],
        blended: ['Silk Cotton','Cotton Linen'],
        zari: ['Pure Zari Kanchipuram','Zari Banarasi']
     };

     const renderCategoryPage = () => {
        if (!activeCategory) return null;
         const materialLabel = (categories.find(c => c.id === activeCategory)?.name || '').replace(/\s*\(.*\)/, '').trim();
         const displayed = applyListingFilters(sarees);
          return (
           <div style={{ padding: '20px', paddingBottom: '120px' }}>
              <button style={{ background: 'none', color: '#999', marginBottom: '14px' }} onClick={() => goBack(() => { setView('main'); setActiveCategory(null); setActiveTab('home'); })}>← Back</button>
              <h2 style={{ color: 'var(--primary)' }}>{categories.find(c => c.id === activeCategory)?.name}</h2>
              <p style={{ color: '#777' }}>Select a saree type</p>
              <div style={{ marginTop: '18px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  { (categoryTypes[activeCategory] || []).map(t => {
                    // count products that match category+type
                    const materialLabelForCount = (categories.find(c => c.id === activeCategory)?.name || '').replace(/\s*\(.*\)/, '').trim().toLowerCase();
                    const count = sarees.filter(s => {
                       const titleMatch = (s.title || '').toLowerCase().includes(t.toLowerCase());
                       const typeMatch = (s.saree_type || s.type || '').toLowerCase().includes(t.toLowerCase());
                       const catField = (s.material || s.category || '').toLowerCase();
                       const catMatch = materialLabelForCount ? (catField.includes(materialLabelForCount) || materialLabelForCount.includes(catField)) : true;
                       return (titleMatch || typeMatch) && (activeCategory ? catMatch : true);
                    }).length;
                       return (
                          <div key={t} onClick={() => {
                             setSelectedType(t);
                             const materialLabel = (categories.find(c => c.id === activeCategory)?.name || '').replace(/\s*\(.*\)/, '').trim();
                             // update URL so deep links / redirects work
                             window.history.replaceState(null, '', `/buyer?material=${encodeURIComponent(materialLabel)}&saree_type=${encodeURIComponent(t)}`);
                             fetchProducts(materialLabel, t);
                          }} className={`type-chip ${selectedType === t ? 'selected' : ''}`} style={{ cursor: 'pointer' }}>
                          <div style={{ fontWeight: 700 }}>{t}</div>
                       <div style={{ fontSize: '12px', color: '#666' }}></div>
                       </div>
                    );
                 }) }
              </div>

              <div style={{ marginTop: '12px' }}></div>

              {/* If a type is selected, show matching sarees inline here (no navigation) */}
              {selectedType && (
                 <div style={{ marginTop: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                       <h3 style={{ margin: 0, color: 'var(--primary)' }}>{selectedType} • <span style={{ fontSize: '14px', color: '#666' }}>{displayed.length} items</span></h3>
                       <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => { const materialLabel = (categories.find(c => c.id === activeCategory)?.name || '').replace(/\s*\(.*\)/, '').trim(); setSelectedType(null); window.history.replaceState(null, '', `/buyer?material=${encodeURIComponent(materialLabel)}`); fetchProducts(materialLabel); }} style={{ background: 'none', border: '1px solid #eee', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }}>Clear</button>
                       </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '14px' }}>
                       { displayed.map(s => (
                          <div key={s.id} className="saree-card">
                             <div className="wishlist-heart" onClick={(e) => toggleWishlist(e, s)}><span style={{ color: isWishlisted(s.id) ? '#ff3e30' : '#ddd' }}>{isWishlisted(s.id) ? '❤️' : '♡'}</span></div>
                             <img src={s.image_url} alt="" style={{ height: '170px', width: '100%', objectFit: 'cover' }} />
                             <div style={{ padding: '12px' }}>
                                <b style={{ fontSize: '14px' }}>{s.title}</b>
                                <div style={{ margin: '6px 0' }}>{renderStars(s.rating)} <span style={{ fontSize: '12px', color: '#777', marginLeft: '6px' }}>{s.reviewsCount} reviews</span></div>
                                <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{s.weaver_name || s.seller || 'Artisan' } • {s.weaver_state || s.location || ''}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                   <div>
                                      <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '16px' }}>₹{s.price}</div>
                                      <div style={{ fontSize: '12px', color: '#2e7d32' }}>{s.material || s.category || ''}</div>
                                   </div>
                                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      <button onClick={() => { const k = saveSearchRestore(); navigate(`/product/${s.id}`, { state: { from: JSON.stringify({ path: window.location.pathname + window.location.search, state: { restoreSearchKey: k } }) } }); }} style={{ background: 'var(--primary)', color: 'white', borderRadius: '10px', padding: '8px 12px', border: 'none', cursor: 'pointer' }}>View</button>
                                      <button onClick={() => addToCart(s)} style={{ background: '#ffd814', border: 'none', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }}>Add</button>
                                   </div>
                                </div>
                             </div>
                          </div>
                       )) }
                       {displayed.length === 0 && (
                          <div style={{ gridColumn: '1/-1', padding: '30px 10px', color: '#666' }}>
                             <b>No {selectedType} {materialLabel} Sarees Available Yet</b>
                          </div>
                       )}
                    </div>
                 </div>
              )}

           
           </div>
        );
     };

     const applyListingFilters = (items) => {
        return items.filter(i => {
           // If a specific saree type is selected, prioritize that filter
           if (selectedType) {
              const title = (i.title || '').toLowerCase();
              const typeField = (i.saree_type || i.type || '').toString().toLowerCase();
              if (!typeField.includes(selectedType.toLowerCase()) && !title.includes(selectedType.toLowerCase())) return false;
           }
           // category selection by id (e.g., 'silk') should only apply when a type is NOT explicitly selected
           if (activeCategory && !selectedType) {
              const materialLabel = (categories.find(c => c.id === activeCategory)?.name || '').replace(/\s*\(.*\)/, '').trim().toLowerCase();
              const catField = (i.material || i.category || '').toString().toLowerCase();
              if (!catField.includes(materialLabel) && !materialLabel.includes(catField)) return false;
           }
           if (listingFilters.material && i.material && !i.material.toLowerCase().includes(listingFilters.material)) return false;
           if (listingFilters.state && i.weaver_state && !i.weaver_state.toLowerCase().includes(listingFilters.state.toLowerCase())) return false;
           if (listingFilters.price) {
              if (listingFilters.price === 'under2k' && i.price > 2000) return false;
              if (listingFilters.price === '2k-5k' && (i.price < 2000 || i.price > 5000)) return false;
              if (listingFilters.price === '5k-10k' && (i.price < 5000 || i.price > 10000)) return false;
              if (listingFilters.price === 'above10k' && i.price <= 10000) return false;
           }
           if (listingFilters.rating && i.rating < listingFilters.rating) return false;
           return true;
        });
     };

     const renderProductListing = () => {
        const filtered = applyListingFilters(sarees);
        return (
           <div style={{ padding: '18px', paddingBottom: '120px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '18px' }}>
              <aside style={{ position: 'sticky', top: '90px', alignSelf: 'start' }}>
                 <div style={{ background: 'white', padding: '16px', borderRadius: '14px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                    <h4 style={{ margin: 0, color: 'var(--primary)' }}>Filters</h4>
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                       <select value={listingFilters.material} onChange={e => setListingFilters(f => ({ ...f, material: e.target.value }))}>
                          <option value="">All Materials</option>
                          <option value="silk">Silk</option>
                          <option value="cotton">Cotton</option>
                          <option value="wool">Wool</option>
                          <option value="linen">Linen</option>
                          <option value="blended">Blended</option>
                          <option value="zari">Zari</option>
                       </select>
                       <select value={listingFilters.price} onChange={e => setListingFilters(f => ({ ...f, price: e.target.value }))}>
                          <option value="">Any Price</option>
                          <option value="under2k">Under ₹2000</option>
                          <option value="2k-5k">₹2000 - ₹5000</option>
                          <option value="5k-10k">₹5000 - ₹10000</option>
                          <option value="above10k">Above ₹10000</option>
                       </select>
                       <input placeholder="State (e.g., Tamil Nadu)" value={listingFilters.state} onChange={e => setListingFilters(f => ({ ...f, state: e.target.value }))} />
                       <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setListingFilters({ material: '', price: '', state: '', rating: 0, availability: '' })} style={{ background: '#f0f0f0', color: '#777' }}>Reset</button>
                          <button onClick={() => showToast('Filters applied')} style={{ background: 'var(--primary)', color: 'white' }}>Apply</button>
                       </div>
                    </div>
                 </div>
              </aside>
              <section>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '14px' }}>
                    {filtered.map(s => (
                       <div key={s.id} className="saree-card" style={{ cursor: 'default' }}>
                          <div className="wishlist-heart" onClick={(e) => toggleWishlist(e, s)}><span style={{ color: isWishlisted(s.id) ? '#ff3e30' : '#ddd' }}>{isWishlisted(s.id) ? '❤️' : '♡'}</span></div>
                          <img src={s.image_url} alt="" style={{ height: '170px', width: '100%', objectFit: 'cover' }} />
                          <div style={{ padding: '12px' }}>
                             <b style={{ fontSize: '14px' }}>{s.title}</b>
                             <div style={{ margin: '6px 0' }}>{renderStars(s.rating)} <span style={{ fontSize: '12px', color: '#777', marginLeft: '6px' }}>{s.reviewsCount} reviews</span></div>
                             <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{s.weaver_name || s.seller || 'Artisan' } • {s.weaver_state || s.location || ''}</div>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                   <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '16px' }}>₹{s.price}</div>
                                   <div style={{ fontSize: '12px', color: '#2e7d32' }}>{s.material || s.category || ''}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                   <button onClick={() => { const k = saveSearchRestore(); navigate(`/product/${s.id}`, { state: { from: JSON.stringify({ path: window.location.pathname + window.location.search, state: { restoreSearchKey: k } }) } }); }} style={{ background: 'var(--primary)', color: 'white', borderRadius: '10px', padding: '8px 12px', border: 'none', cursor: 'pointer' }}>View</button>
                                   <button onClick={() => addToCart(s)} style={{ background: '#ffd814', border: 'none', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }}>Add</button>
                                </div>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
                 {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#bbb', marginTop: '30px' }}>No products match the filters.</p>}
              </section>
           </div>
        );
     };

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
         <h2 style={{ color: 'var(--primary)', marginBottom: '18px' }}>FAQ — General Questions</h2>
         <div style={{ background: 'white', padding: '20px', borderRadius: '14px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ marginBottom: '18px' }}>
               <h3 style={{ marginTop: 0 }}>General Questions</h3>
               <div style={{ lineHeight: 1.6 }}>
                  <b>Q1. What is Handloom Connect?</b>
                  <p>A: Handloom Connect is a marketplace that directly connects buyers with authentic handloom weavers, eliminating middlemen and ensuring fair earnings for artisans.</p>

                  <b>Q2. Are all products handmade?</b>
                  <p>A: Yes. All products listed on Handloom Connect are uploaded directly by registered weavers and artisan groups.</p>

                  <b>Q3. How do I know a product is authentic?</b>
                  <p>A: Verified weavers receive a verification badge. Product details, weaving process videos, and artisan profiles help ensure authenticity.</p>
               </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
               <h3>Orders & Payments</h3>
               <div style={{ lineHeight: 1.6 }}>
                  <b>Q4. What payment methods are accepted?</b>
                  <p>A: We accept UPI, Credit Cards, Debit Cards, Net Banking, Wallets, and other secure payment methods.</p>

                  <b>Q5. Can I change my delivery address after placing an order?</b>
                  <p>A: Yes, you can modify your delivery address before the order is shipped.</p>

                  <b>Q6. Is online payment secure?</b>
                  <p>A: Yes. All transactions are processed through secure payment gateways with encryption and fraud protection.</p>
               </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
               <h3>Shipping & Delivery</h3>
               <div style={{ lineHeight: 1.6 }}>
                  <b>Q7. How long does delivery take?</b>
                  <p>A: Delivery times vary by location and product availability. Estimated delivery dates are shown during checkout.</p>

                  <b>Q8. Can I track my order?</b>
                  <p>A: Yes. You can track your order from Order Placed to Delivered through the order tracking page.</p>

                  <b>Q9. Do you offer international shipping?</b>
                  <p>A: International shipping availability depends on the weaver and destination country.</p>
               </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
               <h3>Products</h3>
               <div style={{ lineHeight: 1.6 }}>
                  <b>Q10. Can I watch how my saree was made?</b>
                  <p>A: Yes. Many products include weaving process videos uploaded directly by the weaver.</p>

                  <b>Q11. Can I request custom-made sarees?</b>
                  <p>A: Yes. Buyers can contact participating weavers to discuss custom designs, colors, and patterns.</p>

                  <b>Q12. Why may colors look slightly different?</b>
                  <p>A: Product colors may vary slightly due to lighting conditions and screen settings.</p>
               </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
               <h3>Returns & Refunds</h3>
               <div style={{ lineHeight: 1.6 }}>
                  <b>Q13. Can I return a product?</b>
                  <p>A: Returns are subject to the seller's return policy and product condition.</p>

                  <b>Q14. When will I receive my refund?</b>
                  <p>A: Approved refunds are typically processed within 5–10 business days.</p>
               </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
               <h3>Weaver Related</h3>
               <div style={{ lineHeight: 1.6 }}>
                  <b>Q15. How do I know who made my saree?</b>
                  <p>A: Every product page displays the weaver's profile, location, experience, and story.</p>

                  <b>Q16. Can I communicate directly with a weaver?</b>
                  <p>A: Yes. Buyers can send questions and messages through the platform.</p>
               </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
               <h3>Account & Security</h3>
               <div style={{ lineHeight: 1.6 }}>
                  <b>Q17. Do I need an account to place an order?</b>
                  <p>A: Creating an account is recommended for order tracking, reviews, wishlists, and faster checkout.</p>

                  <b>Q18. How is my personal information protected?</b>
                  <p>A: We use industry-standard security measures and encryption to protect your data.</p>
               </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
               <h3>Handloom Awareness</h3>
               <div style={{ lineHeight: 1.6 }}>
                  <b>Q19. Why should I buy handloom products?</b>
                  <p>A: Handloom products are handcrafted, sustainable, culturally rich, and help support artisan communities.</p>

                  <b>Q20. How does my purchase help weavers?</b>
                  <p>A: By buying directly from weavers, you help them earn fair compensation while preserving traditional weaving techniques.</p>
               </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
               <h3>Platform-Specific FAQs</h3>
               <div style={{ lineHeight: 1.6 }}>
                  <b>Q21. What is the "Watch Process Video" feature?</b>
                  <p>A: This feature allows buyers to watch the actual weaving process video uploaded by the artisan who created the product.</p>

                  <b>Q22. What does the Verified Weaver badge mean?</b>
                  <p>A: It indicates that the weaver's identity and business details have been verified by Handloom Connect.</p>

                  <b>Q23. Can I save products for later?</b>
                  <p>A: Yes. Use the Wishlist feature to save your favorite products.</p>

                  <b>Q24. Can I compare multiple sarees?</b>
                  <p>A: Yes. The Compare feature helps you compare materials, prices, ratings, and other details side by side.</p>

                  <b>Q25. Why choose Handloom Connect instead of other marketplaces?</b>
                  <p>A: Handloom Connect focuses exclusively on authentic handloom products, direct artisan connections, weaving transparency, and fair trade practices.</p>
               </div>
            </div>
         </div>
      </div>
   );

   const renderAccount = () => {
      if (accountSubView === 'addresses') return renderAddressManager();
      if (accountSubView === 'payments') return renderPaymentHub();
      if (accountSubView === 'faq') return renderWallet();
      if (accountSubView === 'wishlist') return (
         <div className="animate__animated animate__fadeIn" style={{ padding: '20px' }}>
            <button onClick={() => setAccountSubView(null)}>← Profile</button>
            <h2 style={{ color: 'var(--primary)', margin: '20px 0' }}>My Wishlist ❤️</h2>
            <div className="saree-grid">
               {wishlist.map(s => (
                  <div key={s.id} onClick={() => { navigate(`/product/${s.id}`, { state: { from: JSON.stringify({ path: '/buyer', state: { action: 'open_wishlist' } }) } }); }} style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
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
                     { id: 'faq', label: "FAQ", icon: "❓", val: "" },
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

        const submitReview = async () => {
           if (reviewRating === 0) { showToast('Please select a rating'); return; }
           const payload = new FormData();
           payload.append('buyer_id', userId || '');
           payload.append('saree_id', selectedSaree?.id || '');
           payload.append('rating', reviewRating);
           payload.append('comment', reviewText || '');
           payload.append('after_delivery', reviewAfterDelivery ? '1' : '0');
           if (reviewFile) payload.append('photo', reviewFile);
           try {
              // Do NOT set Content-Type manually — let the browser set the multipart boundary
              await api.post('/buyer/review', payload);
              showToast('Review submitted. Thank you!');
              // remove any saved local pending review for this saree
              try {
                const key = 'pendingReviews';
                const saved = JSON.parse(localStorage.getItem(key) || '[]');
                const filtered = saved.filter(r => !(r.saree_id === (selectedSaree?.id) && r.buyer_id === userId));
                localStorage.setItem(key, JSON.stringify(filtered));
              } catch (e) {}
              // clear
              setReviewRating(0); setReviewText(''); setReviewFile(null); setReviewAfterDelivery(false);
              setView('main'); setActiveTab('account');
         } catch (e) { console.error(e); const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message || 'Failed to submit review';
            // Save locally so user doesn't lose their review; it will be reused for next purchase
            try {
                const key = 'pendingReviews';
                const saved = JSON.parse(localStorage.getItem(key) || '[]');
                // replace existing for same buyer+saree
                const existingIndex = saved.findIndex(r => r.saree_id === (selectedSaree?.id) && String(r.buyer_id) === String(userId));
                const entry = { buyer_id: userId, saree_id: selectedSaree?.id, rating: reviewRating, comment: reviewText, after_delivery: reviewAfterDelivery };
                if (existingIndex >= 0) saved[existingIndex] = entry; else saved.push(entry);
                localStorage.setItem(key, JSON.stringify(saved));
                showToast('Submitted');
            } catch (ie) { console.error('local save failed', ie); showToast(msg); }
         }
        };

        const renderReviewPage = () => {
           const item = selectedSaree || cart[0];
           if (!item) return <div style={{padding:20}}>No item selected for review.</div>;
           return (
              <div className="animate__animated animate__fadeInUp" style={{ padding: '30px', paddingBottom: '120px' }}>
                 <button onClick={() => goBack(() => setView('main'))} style={{ marginBottom: 10 }}>← Back to Results</button>
                 <h2 style={{ color: 'var(--primary)' }}>Leave a Review</h2>
                 <div style={{ background: 'white', padding: 20, borderRadius: 12, marginTop: 14 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                       <img src={item.image_url} style={{ width: 80, height: 100, objectFit: 'cover', borderRadius: 8 }} alt="" />
                       <div>
                          <div style={{ fontWeight: 800 }}>{item.title}</div>
                          <div style={{ color: 'var(--primary)', fontWeight: 700, marginTop: 6 }}>₹{item.price}</div>
                       </div>
                    </div>

                    <div style={{ marginTop: 18 }}>
                       <div style={{ fontSize: 13, marginBottom: 8 }}>Your Rating</div>
                       <div>
                          {[1,2,3,4,5].map(n => (
                             <span key={n} onClick={() => setReviewRating(n)} style={{ cursor: 'pointer', fontSize: 28, color: n <= reviewRating ? '#ffa41c' : '#ddd', marginRight: 6 }}>★</span>
                          ))}
                       </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                       <div style={{ fontSize: 13, marginBottom: 6 }}>Write a review</div>
                       <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience (e.g., fabric, color, delivery)" style={{ width: '100%', minHeight: 120, padding: 12, borderRadius: 8, border: '1px solid #eee' }} />
                    </div>

                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                       <input type="checkbox" checked={reviewAfterDelivery} onChange={e => setReviewAfterDelivery(e.target.checked)} id="after-delivery" />
                       <label htmlFor="after-delivery">I'll upload saree photo after delivery</label>
                    </div>

                    {!reviewAfterDelivery && (
                       <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 13, marginBottom: 6 }}>Upload a photo of the saree (optional)</div>
                          <input type="file" accept="image/*" onChange={e => setReviewFile(e.target.files[0])} />
                       </div>
                    )}

                    <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
                       <button onClick={submitReview} style={{ background: 'var(--primary)', color: 'white', padding: '12px 18px', borderRadius: 10 }}>Submit Review</button>
                       <button onClick={() => { goBack(() => { setView('main'); showToast('Review canceled'); }); }} style={{ background: '#f0f0f0', padding: '12px 18px', borderRadius: 10 }}>Cancel</button>
                    </div>
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
               <button onClick={() => goBack(() => { setView('main'); setActiveTab('cart'); })} style={{
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
                               <button onClick={() => { setActiveTab('account'); setView('main'); setAccountSubView('addresses'); }} style={{
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
                        // move user to review page to submit rating/review
                        setSelectedSaree(item);
                        // prefill review from local pending if present
                        try {
                           const key = 'pendingReviews';
                           const saved = JSON.parse(localStorage.getItem(key) || '[]');
                           const found = saved.find(r => r.saree_id === item.id && String(r.buyer_id) === String(userId));
                           if (found) {
                              setReviewRating(found.rating || 0);
                              setReviewText(found.comment || '');
                              setReviewAfterDelivery(Boolean(found.after_delivery));
                              showToast('Loaded saved review draft');
                           } else {
                              // try to prefill from backend previous_review provided in response (if any)
                              // but we don't have the response object here; fetch previous review directly
                              try {
                                 const res = await api.get(`/buyer/reviews/${item.id}`);
                                 const mine = (res.data.reviews || []).find(rv => String(rv.buyer_id) === String(userId) || rv.buyer_name === localStorage.getItem('userName'));
                                 if (mine) { setReviewRating(mine.rating); setReviewText(mine.comment || ''); }
                              } catch (e) { /* ignore */ }
                           }
                        } catch (e) { /* ignore */ }
                        setView('review');
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
               <div key={i.id} onClick={() => navigate(`/product/${i.id}`, { state: { from: JSON.stringify({ path: '/buyer', state: { action: 'open_cart' } }) } })} style={{ display: 'flex', gap: '20px', background: 'white', padding: '20px', borderRadius: '25px', border: '1px solid #f0f0f0', cursor: 'pointer' }}>
                  <img src={i.image_url} style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: '15px' }} alt="" />
                  <div style={{ flex: 1 }}>
                     <b style={{ fontSize: '17px' }}>{i.title}</b>
                     <p style={{ margin: '8px 0', color: 'var(--primary)', fontWeight: 'bold', fontSize: '20px' }}>₹{i.price}</p>
                     <span style={{ fontSize: '11px', color: '#2e7d32', background: '#e8f5e9', padding: '3px 8px', borderRadius: '6px' }}>Master Handloom</span>
                  </div>
                  <button style={{ width: 'auto', background: 'none', color: '#ddd', fontSize: '24px' }} onClick={(e) => { e.stopPropagation(); setCart(cart.filter(x => x.id !== i.id)); }}>✕</button>
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

         {/* order success overlay replaced by review flow */}

         {/* 🔹 REVIEW VIEW */}
         {view === 'review' && renderReviewPage()}

         {/* 🔹 DETAIL VIEW */}
         {view === "detail" && (
            <div className="animate__animated animate__fadeInUp" style={{ background: 'white', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, overflowY: 'auto' }}>
               <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'white', padding: '10px', borderRadius: '50%', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', zIndex: 10001 }} onClick={() => goBack(() => { setView("main"); setShowPaymentOptions(false); })}>←</div>
                     <div
                        className={`wishlist-heart ${isWishlisted(selectedSaree?.id) ? 'active' : ''}`}
                        onClick={(e) => { toggleWishlist(e, selectedSaree); }}
                        title={isWishlisted(selectedSaree?.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        style={{ right: 20, top: 20 }}
                     >
                        <span style={{ fontSize: 16 }}>{isWishlisted(selectedSaree?.id) ? '❤️' : '♡'}</span>
                     </div>
               <img src={selectedSaree.image_url} style={{ width: '100%', height: '320px', objectFit: 'cover' }} alt="" />
               <div style={{ padding: '25px', paddingBottom: '80px' }}>
                  <h1 style={{ color: 'var(--primary)', margin: '0 0 10px 0', fontSize: '26px', fontWeight: '800' }}>{selectedSaree.title}</h1>
                        <div style={{ marginBottom: '12px', fontSize: '13px', color: '#777' }}>
                           <span style={{ cursor: 'pointer', color: '#555' }} onClick={() => navigate('/buyer')}>Home</span>
                           {' '}›{' '}
                           <span style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 700 }} onClick={() => navigate(`/buyer?material=${encodeURIComponent((selectedSaree.material || '').replace(/\s*\(.*\)/, '').trim())}`)}>{selectedSaree.material}</span>
                           {' '}›{' '}
                           <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate(`/buyer?material=${encodeURIComponent((selectedSaree.material || '').replace(/\s*\(.*\)/, '').trim())}&saree_type=${encodeURIComponent(selectedSaree.saree_type || '')}`)}>{selectedSaree.saree_type}</span>
                        </div>
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
            {view === 'category' && renderCategoryPage()}
            {view === 'listing' && renderProductListing()}
            {activeTab === 'home' && view === 'main' && renderHome()}
            {activeTab === 'search' && view === 'main' && renderSearch()}
            {activeTab === 'cart' && view === 'main' && renderBag()}
            {activeTab === 'account' && view === 'main' && renderAccount()}
         </main>

         <nav className="bottom-nav">
            <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setView("main"); setAccountSubView(null); }}>🏠<span>Home</span></div>
            <div className={`nav-item ${activeTab === 'search' ? 'active' : ''}`} onClick={() => { setActiveTab('search'); setView("main"); setAccountSubView(null); }}>🔍<span>Search</span></div>
            <div className={`nav-item ${activeTab === 'cart' ? 'active' : ''}`} onClick={() => { setActiveTab('cart'); setView("main"); setAccountSubView(null); }}>🛍️<span>My Bag</span></div>
            <div className={`nav-item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => { setActiveTab('account'); setView("main"); setAccountSubView(null); }}>👤<span>Profile</span></div>
            <div className={`nav-item ${darkMode ? 'active' : ''}`} onClick={() => setDarkMode(d => !d)}>{darkMode ? '🌙' : '☀️'}<span>{darkMode ? 'Dark' : 'Light'}</span></div>
         </nav>

         {/* 🔹 CHECKOUT VIEW - Full page overlay */}
         {view === 'checkout' && renderAmazonCheckout()}
         {selectedOrder && renderOrderTrackingModal()}
      </div>

   );
}
