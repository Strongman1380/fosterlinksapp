import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

// Lazy load components for better performance
const Login = React.lazy(() => import('../pages/auth/Login'));
const Register = React.lazy(() => import('../pages/auth/Register'));
const Dashboard = React.lazy(() => import('../pages/dashboard/Dashboard'));
const YouthProfiles = React.lazy(() => import('../pages/youth/YouthProfiles'));
const YouthDetail = React.lazy(() => import('../pages/youth/YouthDetail'));
const FosterParents = React.lazy(() => import('../pages/dashboard/FosterParents'));
const Reports = React.lazy(() => import('../pages/dashboard/Reports'));
const UserManagement = React.lazy(() => import('../pages/dashboard/UserManagement'));
const MedicationLog = React.lazy(() => import('./MedicationLog'));
const ThemeSettings = React.lazy(() => import('./ThemeSettings'));
const AgencySettings = React.lazy(() => import('./AgencySettings'));
const NotFound = React.lazy(() => import('../pages/NotFound'));
const Unauthorized = React.lazy(() => import('../pages/Unauthorized'));

// Loading fallback component
const LoadingFallback = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: 2
    }}
  >
    <CircularProgress size={40} />
    <Box>Loading...</Box>
  </Box>
);

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div>Loading authentication...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  // If user has the required role, render the protected content
  if (userRole && allowedRoles.includes(userRole)) {
    console.log(`User has required role: ${userRole}, allowing access`);
    return <>{children}</>;
  }

  // If user doesn't have the required role, redirect to unauthorized
  console.log(`User role ${userRole} not in allowed roles: ${allowedRoles.join(', ')}`);
  return <Navigate to="/unauthorized" />;
};

// Main router component
const AppRouter: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Default route - redirect to login if not authenticated */}
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['admin', 'worker', 'foster_parent']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Redirect root to login for easier access */}
        <Route path="" element={<Navigate to="/login" />} />
        
        {/* Admin routes */}
        <Route path="/user-management" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={['admin', 'worker']}>
            <Reports />
          </ProtectedRoute>
        } />
        
        <Route path="/reports-overview" element={
          <ProtectedRoute allowedRoles={['admin', 'worker']}>
            <Reports />
          </ProtectedRoute>
        } />
        
        {/* Worker and Admin routes */}
        <Route path="/youth-profiles" element={
          <ProtectedRoute allowedRoles={['admin', 'worker']}>
            <YouthProfiles />
          </ProtectedRoute>
        } />
        
        <Route path="/youth-profiles/:id" element={
          <ProtectedRoute allowedRoles={['admin', 'worker', 'foster_parent']}>
            <YouthDetail />
          </ProtectedRoute>
        } />
        
        <Route path="/foster-parents" element={
          <ProtectedRoute allowedRoles={['admin', 'worker']}>
            <FosterParents />
          </ProtectedRoute>
        } />
        
        {/* Foster Parent routes */}
        <Route path="/my-youth" element={
          <ProtectedRoute allowedRoles={['foster_parent']}>
            <YouthProfiles />
          </ProtectedRoute>
        } />
        
        <Route path="/medication-logs/:youthId" element={
          <ProtectedRoute allowedRoles={['admin', 'worker', 'foster_parent']}>
            <MedicationLog />
          </ProtectedRoute>
        } />
        
        {/* Settings routes */}
        <Route path="/theme-settings" element={
          <ProtectedRoute allowedRoles={['admin', 'worker', 'foster_parent']}>
            <ThemeSettings />
          </ProtectedRoute>
        } />
        
        <Route path="/agency-settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AgencySettings />
          </ProtectedRoute>
        } />
        
        {/* Unauthorized route */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRouter;