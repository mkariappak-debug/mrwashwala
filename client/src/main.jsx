import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { AdminAuthProvider } from './context/AdminAuthContext.jsx';
import { AdminBranchProvider } from './context/AdminBranchContext.jsx';
import "./index.css";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <AdminBranchProvider>
          <ScrollToTop />
          <App />
        </AdminBranchProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </StrictMode>
);