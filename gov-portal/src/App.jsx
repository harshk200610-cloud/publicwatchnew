import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GovAuthProvider, useGovAuth } from './context/GovAuthContext';
import './styles/gov.css';

import GovLanding from './pages/GovLanding';
import { GovLogin, GovRegister } from './pages/GovAuth';
import GovDashboard from './pages/GovDashboard';

function PrivateRoute({ children }) {
  const { authority } = useGovAuth();
  return authority ? children : <Navigate to="/gov/login" replace />;
}

function PublicRoute({ children }) {
  const { authority } = useGovAuth();
  return authority ? <Navigate to="/gov/dashboard" replace /> : children;
}

export default function App() {
  return (
    <GovAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/gov" />} />
          <Route path="/gov" element={<PublicRoute><GovLanding /></PublicRoute>} />
          <Route path="/gov/login" element={<PublicRoute><GovLogin /></PublicRoute>} />
          <Route path="/gov/register" element={<PublicRoute><GovRegister /></PublicRoute>} />
          <Route path="/gov/dashboard" element={<PrivateRoute><GovDashboard /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/gov" />} />
        </Routes>
      </BrowserRouter>
    </GovAuthProvider>
  );
}
