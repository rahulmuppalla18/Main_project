// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Services from "./pages/Services";
import Booking from "./pages/Booking";
import BookingConfirmation from "./pages/BookingConfirmation";

import Signup from "./pages/Signup";
import Login from "./pages/Login";

import ProviderDashboard from "./pages/ProviderDashboard";

import ProtectedRoute from "./Components/ProtectedRoute";
import Layout from "./Components/Layout";
export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>

          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/booking/:serviceId" element={<Booking />} />
          <Route path="/booking/confirmation" element={<BookingConfirmation />} />

          {/* Auth Pages */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Pages */}
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Layout>
    </Router>
  );
}
