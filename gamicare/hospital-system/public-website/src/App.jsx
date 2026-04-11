import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Doctors from './pages/Doctors';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import SymptomChecker from './pages/SymptomChecker';
import Profile from './pages/Profile';
import ConsultationRoom from './pages/ConsultationRoom';
import EsewaPayment from './pages/EsewaPayment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

// Layouts
import WebsiteLayout from './components/layouts/WebsiteLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// Context
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route element={<WebsiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} /> 
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Patient Routes */}
          <Route path="/patient" element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="book-appointment" element={<BookAppointment />} />
            <Route path="appointments" element={<MyAppointments />} />
            <Route path="profile" element={<Profile />} />
            <Route path="consultation/:roomID" element={<ConsultationRoom />} />
            <Route path="pay-esewa/:appointmentId" element={<EsewaPayment />} />
            <Route path="payment-success" element={<PaymentSuccess />} />
            <Route path="payment-failure" element={<PaymentFailure />} />
          </Route>

          {/* Redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;