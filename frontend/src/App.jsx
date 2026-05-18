import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Collections from './pages/Collections'
import CollectionDetail from './pages/CollectionDetail'
import Payment from './pages/Payment'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import AdminDeposits from './pages/AdminDeposits'
import Users from './pages/Users'
import Payments from './pages/Payments'
import CreateCollection from './pages/CreateCollection'
import FavoriteAlbums from './pages/FavoriteAlbums'
import UpgradeVIP from './pages/UpgradeVIP'
import NotFound from './pages/NotFound'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-neon-pink border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/dang-nhap" replace />
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dang-nhap" element={<Login />} />
        <Route path="dang-ky" element={<Register />} />
        <Route path="bo-suu-tap" element={<Collections />} />
        <Route path="bo-suu-tap/:id" element={<CollectionDetail />} />
        <Route path="thanh-toan" element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } />
        <Route path="tai-khoan" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="album-yeu-thich" element={
          <ProtectedRoute>
            <FavoriteAlbums />
          </ProtectedRoute>
        } />
        <Route path="nang-cap-vip" element={
          <ProtectedRoute>
            <UpgradeVIP />
          </ProtectedRoute>
        } />
        <Route path="admin" element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="admin/nguoi-dung" element={
          <ProtectedRoute adminOnly>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="admin/thanh-toan" element={
          <ProtectedRoute adminOnly>
            <Payments />
          </ProtectedRoute>
        } />
        <Route path="admin/xac-nhan-nap-tien" element={
          <ProtectedRoute adminOnly>
            <AdminDeposits />
          </ProtectedRoute>
        } />
        <Route path="admin/tao-bo-suu-tap" element={
          <ProtectedRoute adminOnly>
            <CreateCollection />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
