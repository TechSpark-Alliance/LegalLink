import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserLogin from './pages/Authentication/User/UserLogin';
import RegisterRole from './pages/Authentication/RegisterRole';
import ClientRegister from './pages/Authentication/Client/ClientRegister';
import LawyerRegister from './pages/Authentication/Lawyer/LawyerRegister';
import ClientHome from './pages/Home/ClientHome';
import LawyerHome from './pages/Home/LawyerHome';
import Lawyers from './pages/Lawyers/Lawyers';
import LawyerProfile from './pages/Lawyers/LawyerProfile';
import LawyerReviews from './pages/Lawyers/LawyerReviews';
import AppointmentBooking from './pages/Lawyers/AppointmentBooking';
import VerifyLawyers from './pages/Admin/VerifyLawyers';
import UserManagement from './pages/Admin/UserManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<RegisterRole />} />
        <Route path="/register/client" element={<ClientRegister />} />
        <Route path="/register/lawyer" element={<LawyerRegister />} />
        <Route path="/home/client" element={<ClientHome />} />
        <Route path="/home/lawyer" element={<LawyerHome />} />
        <Route path="/lawyers/:id/reviews" element={<LawyerReviews />} />
        <Route path="/lawyers/:id" element={<LawyerProfile />} />
        <Route path="/lawyers" element={<Lawyers />} />
        <Route path="/lawyer/:id/book-appointment" element={<AppointmentBooking />} />
        <Route path="/admin/lawyers" element={<VerifyLawyers />} />
        <Route path="/admin/users" element={<UserManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
