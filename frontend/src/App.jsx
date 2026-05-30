import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateProfile from "./pages/CreateProfile";
import ViewProfile from "./pages/ViewProfile";
import EditProfile from "./pages/EditProfile";
import BookTutor from "./pages/BookTutor";
import MyBookings from "./pages/MyBookings";
import TutorSearch from "./pages/TutorSearch";
import AdminDashboard from "./pages/AdminDashboard";
import TutorPublicProfile from "./pages/TutorPublicProfile";

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/tutors" element={<TutorSearch />} />
      <Route path="/tutor/:id" element={<TutorPublicProfile />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile/create" element={<ProtectedRoute><CreateProfile /></ProtectedRoute>} />
      <Route path="/profile/me" element={<ProtectedRoute><ViewProfile /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute><ViewProfile /></ProtectedRoute>} />
      <Route path="/book/:tutor_id" element={<ProtectedRoute><BookTutor /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;