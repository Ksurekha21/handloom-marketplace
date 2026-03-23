import { BrowserRouter, Routes, Route } from "react-router-dom";

import Language from "./pages/Language";
import Role from "./pages/RoleSelect";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Weaver from "./pages/Weaver";
import Supplier from "./pages/Supplier";
import Buyer from "./pages/Buyer";
import SupplierMarketplace from "./pages/SupplierMarketplace";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Language />} />
        <Route path="/role" element={<Role />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/weaver" element={<Weaver />} />
        <Route path="/supplier" element={<Supplier />} />
        <Route path="/buyer" element={<Buyer />} />
         <Route
          path="/supplier-marketplace"
          element={<SupplierMarketplace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
