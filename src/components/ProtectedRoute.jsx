import { useAuth } from './Auth/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Проверка авторизации...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}