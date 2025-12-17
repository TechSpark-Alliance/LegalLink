import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserLogin from './pages/Authentication/User/UserLogin';
import RegisterRole from './pages/Authentication/RegisterRole';
import ClientRegister from './pages/Authentication/Client/ClientRegister';
import LawyerRegister from './pages/Authentication/Lawyer/LawyerRegister';
import ClientHome from './pages/Home/ClientHome';
import LawyerHome from './pages/Home/LawyerHome';
import VerifyLawyers from './pages/Admin/VerifyLawyers';
import UserManagement from './pages/Admin/UserManagement';
import CreateCase from './pages/Cases/CreateCase';
import CaseDetail from './pages/Cases/CaseDetail';
import ClientsList from './pages/Clients/ClientsList';
import ClientDetail from './pages/Clients/ClientDetail';
import LawyerProfile from './pages/Profile/LawyerProfile';
import ClientProfile from './pages/Profile/ClientProfile';
import RequireLawyer from './components/RequireLawyer';
import RequireClient from './components/RequireClient';
import LawyerDetail from './pages/Home/LawyerDetail';

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
          path="/home/client"
          element={
            <RequireClient>
              <ClientHome />
            </RequireClient>
          }
        />
        <Route
          path="/profile/client"
          element={
            <RequireClient>
              <ClientProfile />
            </RequireClient>
          }
        />
        <Route
          path="/lawyers/:id"
          element={
            <RequireClient>
              <LawyerDetail />
            </RequireClient>
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
          path="/lawyer/profile"
          element={
            <RequireLawyer>
              <LawyerProfile />
            </RequireLawyer>
          }
        />
        {/* legacy redirects */}
        <Route path="/home/lawyer" element={<Navigate to="/lawyer/cases" replace />} />
        <Route path="/cases/new" element={<Navigate to="/lawyer/cases/new" replace />} />
        <Route path="/cases/:id" element={<Navigate to="/lawyer/cases/:id" replace />} />
        <Route path="/cases" element={<Navigate to="/lawyer/cases" replace />} />
        <Route path="/clients/:id" element={<Navigate to="/lawyer/clients/:id" replace />} />
        <Route path="/clients" element={<Navigate to="/lawyer/clients" replace />} />
        <Route path="/admin/lawyers" element={<VerifyLawyers />} />
        <Route path="/admin/users" element={<UserManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
