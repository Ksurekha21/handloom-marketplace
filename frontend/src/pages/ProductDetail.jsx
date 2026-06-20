import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import './Dashboard.css';

export default function ProductDetail(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try{
        const res = await api.get(`/buyer/product/${id}`);
        setProduct(res.data.product);
      }catch(e){ console.error(e); }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  const addToBagAndGotoBag = () => {
    try {
      const cur = JSON.parse(localStorage.getItem('cart') || '[]');
      if (!cur.find(i => i.id === product.id)) {
        cur.push({ ...product, quantity: 1 });
        localStorage.setItem('cart', JSON.stringify(cur));
      }
    } catch (e) { console.error(e); }
    // navigate to buyer and open bag
    navigate('/buyer', { state: { action: 'open_cart' } });
  }

  const buyNowGotoCheckout = () => {
    // place this single product into cart (overwrite selection) and open checkout
    try {
      const cur = JSON.parse(localStorage.getItem('cart') || '[]');
      // ensure product is present
      if (!cur.find(i => i.id === product.id)) cur.push({ ...product, quantity: 1 });
      localStorage.setItem('cart', JSON.stringify(cur));
    } catch (e) { console.error(e); }
    navigate('/buyer', { state: { action: 'checkout', product } });
  }

  if(loading) return <div style={{padding:20}}>Loading...</div>;
  if(!product) return <div style={{padding:20}}>Product not found.</div>;

  const location = useLocation();
  const from = location && location.state && location.state.from;

  const goBack = () => {
    // Prefer explicit origin payload if provided (ensures returning to search/wishlist/bag),
    // otherwise fall back to browser history, then Buyer search tab.
    try {
      if (from) {
        try {
          const parsed = typeof from === 'string' ? JSON.parse(from) : from;
          if (parsed && parsed.path) {
            navigate(parsed.path, { state: parsed.state || {} });
            return;
          }
        } catch (e) {
          // not JSON — fallthrough to string navigate
        }
        navigate(from);
        return;
      }
    } catch (e) { /* ignore */ }

    try {
      if (window.history && window.history.length > 1) { navigate(-1); return; }
    } catch (e) { /* ignore */ }

    // fallback: open buyer in search tab
    navigate('/buyer', { state: { action: 'open_search' } });
  };

  return (
    <div style={{padding:20}}>
      <button onClick={goBack} style={{marginBottom:10}}>← Back</button>
      <div className="product-grid">
        <div className="gallery">
          <img src={product.images && product.images.length ? product.images[0] : product.image_url} alt="" style={{width:'100%', borderRadius:12}} />
          <div style={{display:'flex',gap:8,marginTop:8}}>
            {(product.images && product.images.slice(0,4)).map((u,i)=> (
              <img key={i} src={u} style={{width:80,height:80,objectFit:'cover',borderRadius:8,cursor:'pointer'}} alt="" />
            ))}
          </div>
          {product.video_url && (
            <div style={{marginTop:14}}>
              <button onClick={() => setVideoOpen(true)} className="premium-card">Watch How This Saree Was Made 🎬</button>
            </div>
          )}
        </div>
        <div className="details">
          <h2>{product.title}</h2>
          <div style={{color:'var(--primary)',fontSize:20,fontWeight:800}}>₹{product.price}</div>
          <div style={{marginTop:8,color:'#666'}}>{product.material} • {product.saree_type}</div>
          <div style={{marginTop:10}}><b>Color:</b> {product.color || 'N/A'}</div>
          {/* Removed Length/Width/Weight as requested */}
          <div style={{marginTop:10}}>
            <h4>About this saree</h4>
            <p style={{whiteSpace:'pre-wrap'}}>{product.description || 'No description provided.'}</p>
          </div>

          <div style={{marginTop:12, padding:12, borderRadius:12, background:'#fff', boxShadow:'var(--shadow)'}}>
            <h4>Weaver</h4>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:64,height:64,background:'#f2f2f2',borderRadius:8}}></div>
              <div>
                <div style={{fontWeight:700}}>{product.weaver.name}</div>
                <div style={{color:'#666'}}>{product.weaver.village || ''} • {product.weaver.state}</div>
              </div>
            </div>
          </div>

          <div style={{marginTop:12}}>
            <h4>Customer Reviews ({product.reviews.length})</h4>
            {product.reviews.length === 0 && <div>No reviews yet.</div>}
            {product.reviews.map(r => (
              <div key={r.id} style={{padding:10, borderRadius:10, background:'#fff', marginTop:8}}>
                <div style={{fontWeight:700}}>{r.buyer_name} • <span style={{fontWeight:500,color:'#777'}}>{r.rating}★</span></div>
                <div style={{color:'#666',fontSize:13}}>{r.comment}</div>
                <div style={{fontSize:11,color:'#aaa',marginTop:6}}>{new Date(r.created_at).toLocaleDateString()}</div>
              </div>
            ))}
            <div className="horizontal-action-row" style={{ display: 'flex', gap: 12, marginTop: 18 }}>
              <button onClick={buyNowGotoCheckout} style={{ background: '#ffa41c', color: 'black', padding: '10px 16px', borderRadius: 10 }}>Buy Now</button>
              <button onClick={addToBagAndGotoBag} style={{ background: '#ffd814', color: 'black', padding: '10px 16px', borderRadius: 10 }}>Add to Bag</button>
            </div>
          </div>
        </div>
      </div>

      {videoOpen && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:6000}}>
          <div style={{width:'80%',maxWidth:900}}>
            <video src={product.video_url} controls style={{width:'100%'}} />
            <div style={{textAlign:'right',marginTop:8}}><button onClick={() => setVideoOpen(false)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
