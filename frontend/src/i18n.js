const base = {
  // Role selection
  selectRole: "Select Role",
  weaver: "Weaver",
  supplier: "Raw Material Supplier",
  buyer: "Buyer",

  // Auth
  login: "Login",
  register: "Register",
  email: "Email",
  password: "Password",
  name: "Name",
  state: "State",
  role: "Role",
  idProof: "Upload ID Proof",

  // ✅ ADD THEM HERE (THIS IS THE PLACE)
  noAccount: "Don’t have an account? Register",
  already: "Already registered? Login here",

  // Common
  logout: "Logout",
  upload: "Upload",
  add: "Add",
  cart: "Cart",

  // Weaver
  welcomeWeaver: "Welcome Weaver",
  sareesUploaded: "Sarees Uploaded",
  sareesSold: "Sarees Sold",
  totalRevenue: "Total Revenue",
  uploadSaree: "Upload Saree",
  sareeName: "Saree Name",
  sareeType: "Saree Type",
  rawCost: "Raw Material Cost",
  sellingPrice: "Selling Price",

  // Supplier
  welcomeSupplier: "Welcome Supplier",
  materialsListed: "Materials Listed",
  soldQuantity: "Sold Quantity",
  addMaterial: "Add Raw Material",
  materialType: "Material Type",
  quantity: "Quantity (kg)",
  pricePerKg: "Price per kg",

  // Buyer
  welcomeBuyer: "Hello Buyer",
  aiInsight: "AI Insight",
  fairPrice: "Fair Price",
  addToCart: "Add to Cart"
};

const translations = {
  en: base,
  te: base,
  ta: base,
  hi: base,
  kn: base,
  ml: base,
  bn: base,
  gu: base,
  mr: base,
  pa: base,
  or: base,
  as: base,
  sa: base,
  ne: base,
  ur: base,
  fr: base,
  es: base,
  de: base,
  it: base,
  pt: base
};

export const t = (key) => {
  const lang = localStorage.getItem("lang") || "en";
  return translations[lang]?.[key] || translations.en[key];
};
