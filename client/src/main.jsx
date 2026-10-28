import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import { ShopInfoProvider } from './context/ShopInfoContext';
import { ProductsProvider } from './context/ProductsContext';
import { LangProvider } from './i18n';
import './styles.css';

// ธีมหน้าเว็บ: 'minimal' (ค่าเริ่มต้น) หรือ 'aurora' จำไว้ในเบราว์เซอร์ของผู้ใช้
try {
  document.documentElement.classList.toggle('minimal', localStorage.getItem('theme-style') !== 'aurora');
} catch {
  document.documentElement.classList.add('minimal');
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LangProvider>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <ShopInfoProvider>
              <WishlistProvider>
                <ToastProvider>
                  <App />
                </ToastProvider>
              </WishlistProvider>
            </ShopInfoProvider>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  </React.StrictMode>
);
