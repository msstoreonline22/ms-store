import { Route, Routes } from "react-router-dom";

import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";

import Home from "../pages/Home.jsx";
import Shop from "../pages/Shop.jsx";
import ProductDetails from "../pages/ProductDetails.jsx";
import Cart from "../pages/Cart.jsx";
import Checkout from "../pages/Checkout.jsx";
import OrderSuccess from "../pages/OrderSuccess.jsx";
import TrackOrder from "../pages/TrackOrder.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import MyOrders from "../pages/MyOrders.jsx";
import NotFound from "../pages/NotFound.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminRoute from "./AdminRoute.jsx";

import AdminLayout from "../pages/admin/AdminLayout.jsx";
import Dashboard from "../pages/admin/Dashboard.jsx";
import Products from "../pages/admin/Products.jsx";
import ProductForm from "../pages/admin/ProductForm.jsx";
import Orders from "../pages/admin/Orders.jsx";
import OrderDetails from "../pages/admin/OrderDetails.jsx";
import Offers from "../pages/admin/Offers.jsx";
import DiscountCodes from "../pages/admin/DiscountCodes.jsx";
import Customers from "../pages/admin/Customers.jsx";
import Analytics from "../pages/admin/Analytics.jsx";
import Settings from "../pages/admin/Settings.jsx";

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ms-cream text-ms-dark">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/products/:slug" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/my-orders" element={<MyOrders />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<PublicLayout />} />

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="offers" element={<Offers />} />
          <Route path="discount-codes" element={<DiscountCodes />} />
          <Route path="customers" element={<Customers />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}
