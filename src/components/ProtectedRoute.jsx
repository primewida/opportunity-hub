import { Navigate } from 'react-router';
import { useApp } from '../context/AppContext';

export default function ProtectedRoute({ children }) {
  const { auth, authLoading } = useApp();

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
