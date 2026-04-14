import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NotificationProvider } from "./context/NotificationContext.jsx";

/* ================= PUBLIC PAGES ================= */
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

/* ================= USER PAGES ================= */
import Dashboard from "./pages/Dashboard.jsx";
import Donor from "./pages/Donor.jsx";
import Request from "./pages/Request.jsx";
import MyRequests from "./pages/MyRequests.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import BloodCompatibility from "./pages/BloodCompatibility.jsx";
import FindDonor from "./pages/FindDonor.jsx";
import Profile from "./pages/Profile.jsx";
import EmergencyAlerts from "./pages/EmergencyAlerts.jsx";
import MyCertificates from "./pages/MyCertificates.jsx";
import MyDonations from "./pages/MyDonations.jsx";

/* 🩸 NEW CAMPS PAGE */
import Camps from "./pages/Camps.jsx";
import CampCheckin from "./pages/CampCheckin.jsx";

/* 🩸 NEW HEALTH PAGES */
import EligibilityQuiz from "./pages/EligibilityQuiz.jsx";
import BloodBankLocator from "./pages/BloodBankLocator.jsx";

/* ================= LAYOUT ================= */
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";

/* ================= ADMIN PAGES ================= */
import AdminLayout from "./admin/AdminLayout.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import AdminUsers from "./admin/AdminUsers.jsx";
import AdminDonors from "./admin/AdminDonors.jsx";
import AdminRequests from "./admin/AdminRequests.jsx";
import AdminAddDonor from "./admin/AdminAddDonor.jsx";
import ContactQueries from "./admin/ContactQueries.jsx";
import AdminBloodRequests from "./admin/AdminBloodRequests.jsx";
import AdminAlerts from "./admin/AdminAlerts.jsx";
import AdminBloodInventory from "./admin/AdminBloodInventory.jsx";
import AdminCertificates from "./admin/AdminCertificates.jsx";

/* 🩸 NEW ADMIN CAMPS */
import AdminCamps from "./admin/AdminCamps.jsx";
import AdminDonorProfile from "./admin/AdminDonorProfile.jsx";

/* 🩸 NEW ADMIN FEATURES */
import AdminAnalytics from "./admin/AdminAnalytics.jsx";
import AdminDonationVerification from "./admin/AdminDonationVerification.jsx";


function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkin/:regId" element={<CampCheckin />} />

        {/* ================= USER ROUTES ================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/donor"
          element={
            <ProtectedRoute>
              <Layout>
                <Donor />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/request"
          element={
            <ProtectedRoute>
              <Layout>
                <Request />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-requests"
          element={
            <ProtectedRoute>
              <Layout>
                <MyRequests />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Layout>
                <EmergencyAlerts />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/find-donor"
          element={
            <ProtectedRoute>
              <Layout>
                <FindDonor />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/compatibility"
          element={
            <ProtectedRoute>
              <Layout>
                <BloodCompatibility />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 🩸 NEW CAMPS ROUTE */}
        <Route
          path="/camps"
          element={
            <ProtectedRoute>
              <Layout>
                <Camps />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <Layout>
                <About />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <Layout>
                <Contact />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/donor-profile/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
  path="/my-donations"
  element={
    <ProtectedRoute>
      <Layout>
        <MyDonations />
      </Layout>
    </ProtectedRoute>
  }
/>
        {/* CERTIFICATES */}
        <Route
          path="/certificates"
          element={
            <ProtectedRoute>
              <Layout>
                <MyCertificates />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 🩸 HEALTH PAGES */}
        <Route
          path="/eligibility-quiz"
          element={
            <ProtectedRoute>
              <Layout>
                <EligibilityQuiz />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/blood-bank-locator"
          element={
            <ProtectedRoute>
              <Layout>
                <BloodBankLocator />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ROUTES ================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >

          <Route index element={<AdminDashboard />} />

          <Route path="users" element={<AdminUsers />} />
          <Route path="donors" element={<AdminDonors />} />
          <Route path="add-donor" element={<AdminAddDonor />} />
          <Route path="blood-requests" element={<AdminBloodRequests />} />
          <Route path="alerts" element={<AdminAlerts />} />
          <Route path="inventory" element={<AdminBloodInventory />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="queries" element={<ContactQueries />} />
          <Route path="certificates" element={<AdminCertificates />} />

          {/* 🩸 NEW ADMIN CAMPS ROUTE */}
          <Route path="camps" element={<AdminCamps />} />

          {/* Donor profile view */}
          <Route path="donor-profile/:id" element={<AdminDonorProfile />} />

          {/* 🩸 NEW ADMIN FEATURES */}
          <Route path="analytics"            element={<AdminAnalytics />} />
          <Route path="donation-verification" element={<AdminDonationVerification />} />

        </Route>


        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;