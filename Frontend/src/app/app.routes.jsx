import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import Home from "../features/products/pages/Home";
import ProductDetail from "../features/products/pages/ProductDetail";
import CreateProduct from "../features/products/pages/CreateProduct";
import Dashboard from "../features/products/pages/Dashboard";
import SellerProductDetails from "../features/products/pages/SellerProductDetails";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/products/:id",
        element: <ProductDetail />
    },
    {
        path: "/products/create",
        element: (
            <ProtectedRoute requireSeller={true}>
                <CreateProduct />
            </ProtectedRoute>
        )
    },
    {
        path: "/seller/dashboard",
        element: (
            <ProtectedRoute requireSeller={true}>
                <Dashboard />
            </ProtectedRoute>
        )
    },
    {
        path: "/seller/products/:id",
        element: (
            <ProtectedRoute requireSeller={true}>
                <SellerProductDetails />
            </ProtectedRoute>
        )
    },
    {
        path: "/register",
        element: (
            <ProtectedRoute guestOnly={true}>
                <Register />
            </ProtectedRoute>
        )
    },
    {
        path: "/login",
        element: (
            <ProtectedRoute guestOnly={true}>
                <Login />
            </ProtectedRoute>
        )
    }
]);