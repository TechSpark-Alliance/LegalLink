import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserLogin from './pages/Authentication/User/UserLogin';
import RegisterRole from './pages/Authentication/RegisterRole';
import ClientRegister from './pages/Authentication/Client/ClientRegister';
import LawyerRegister from './pages/Authentication/Lawyer/LawyerRegister';
import ClientHome from './pages/Home/ClientHome';
import LawyerHome from './pages/Home/LawyerHome';
import Lawyers from './pages/Lawyers/Lawyers';
import LawyerBio from './pages/Lawyers/LawyerBio';
import LawyerProfileDashboard from './pages/Profile/LawyerProfile';
import LawyerReviews from './pages/Lawyers/LawyerReviews';
import AppointmentBooking from './pages/Lawyers/AppointmentBooking';
import LawyerConversations from './pages/Conversations/LawyerConversations';
import VerifyLawyers from './pages/Admin/VerifyLawyers';
import UserManagement from './pages/Admin/UserManagement';
import Appointment from './pages/Appointment/Appointment';
import ClientConversations from './pages/Conversations/ClientConversations';
import CreateCase from './pages/Cases/CreateCase';
import CaseDetail from './pages/Cases/CaseDetail';
import ClientsList from './pages/Clients/ClientsList';
import ClientDetail from './pages/Clients/ClientDetail';
import LawyerAppointments from './pages/Lawyers/LawyerAppointments';
import RequireLawyer from './components/RequireLawyer';
import RequireClient from './components/RequireClient';
import ClientProfile from './pages/Profile/ClientProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<RegisterRole />} />
        <Route path="/register/client" element={<ClientRegister />} />
        <Route path="/register/lawyer" element={<LawyerRegister />} />
        <Route
          path="/client/home"
          element={
            <RequireClient>
              <ClientHome />
            </RequireClient>
          }
        />
        <Route
          path="/home/lawyer"
          element={
            <RequireLawyer>
              <LawyerHome />
            </RequireLawyer>
          }
        />
        <Route
          path="/lawyer/cases"
          element={
            <RequireLawyer>
              <LawyerHome />
            </RequireLawyer>
          }
        />
        <Route
          path="/lawyer/cases/new"
          element={
            <RequireLawyer>
              <CreateCase />
            </RequireLawyer>
          }
        />
        <Route
          path="/lawyer/cases/:id"
          element={
            <RequireLawyer>
              <CaseDetail />
            </RequireLawyer>
          }
        />
        <Route
          path="/lawyer/clients"
          element={
            <RequireLawyer>
              <ClientsList />
            </RequireLawyer>
          }
        />
        <Route
          path="/lawyer/clients/:id"
          element={
            <RequireLawyer>
              <ClientDetail />
            </RequireLawyer>
          }
        />
        <Route
          path="/lawyer/appointments"
          element={
            <RequireLawyer>
              <LawyerAppointments />
            </RequireLawyer>
          }
        />
        <Route
          path="/lawyer/profile"
          element={
            <RequireLawyer>
              <LawyerProfileDashboard />
            </RequireLawyer>
          }
        />
        <Route
          path="/client/profile"
          element={
            <RequireClient>
              <ClientProfile />
            </RequireClient>
          }
        />
        <Route
          path="/lawyer/conversations"
          element={
            <RequireLawyer>
              <LawyerConversations />
            </RequireLawyer>
          }
        />
        <Route path="/client/lawyers/lawyer/:id/reviews" element={<LawyerReviews />} />
        <Route path="/client/lawyers/lawyer/:id" element={<LawyerBio />} />
        <Route path="/client/lawyers" element={<Lawyers />} />
        <Route path="/client/lawyers/lawyer/:id/book-appointment" element={<AppointmentBooking />} />
        <Route path="/client/appointment" element={<Appointment />} />
        <Route path="/client/conversations" element={<ClientConversations />} />
        <Route path="/client/conversations/chat/:chatId/lawyer/:lawyerId" element={<ClientConversations />} />
        <Route path="/admin/lawyers" element={<VerifyLawyers />} />
        <Route path="/admin/users" element={<UserManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
