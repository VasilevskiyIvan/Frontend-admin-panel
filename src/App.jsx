import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './components/Auth/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import AddBlockPage from './pages/AddBlockPage'
import EditBlockPage from './pages/EditBlockPage'
import BlockSelectPage from './pages/BlockSelectPage'
import Mailing from './pages/MailingPage'
import LoginPage from './pages/LoginPage'
import './App.css'

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/blocks/new" element={
            <ProtectedRoute>
              <AddBlockPage />
            </ProtectedRoute>
          } />
          <Route path="/blocks/select" element={
            <ProtectedRoute>
              <BlockSelectPage />
            </ProtectedRoute>
          } />
          <Route path="/blocks/edit/:blockId" element={
            <ProtectedRoute>
              <EditBlockPage />
            </ProtectedRoute>
          } />
          <Route path="/broadcast" element={
            <ProtectedRoute>
              <Mailing />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  )
}