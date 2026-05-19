import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Home, 
  Image, 
  CreditCard, 
  User, 
  LogOut, 
  Menu, 
  X,
  Crown,
  Shield,
  Heart,
  ChevronDown,
  UserCircle,
  Wallet,
  DollarSign
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/', label: 'Trang Chủ', icon: Home },
    { path: '/bo-suu-tap', label: 'Bộ Sưu Tập', icon: Image },
  ]

  const userLinks = user ? [
    { path: '/thanh-toan', label: 'Thanh Toán', icon: CreditCard },
    { path: '/tai-khoan', label: 'Tài Khoản', icon: User },
  ] : []

  return (
    <div className="min-h-screen bg-dark-900">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-pink to-neon-purple flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">
                  Album
                </span>
              </Link>

              {/* Số dư - hiện trên cả mobile */}
              {user && user.balance !== undefined && (
                <div className="md:hidden flex items-center space-x-1 px-2 py-1 rounded-lg bg-green-900/50 border border-green-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
                  </svg>
                  <span className="text-green-400 font-medium text-sm">
                    {parseFloat(user.balance).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
                    isActive(path)
                      ? 'text-neon-pink bg-neon-pink/10'
                      : 'text-gray-300 hover:text-neon-pink hover:bg-neon-pink/5'
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {user.isPremium && (
                    <div className="flex items-center space-x-1 px-3 py-1 rounded-full premium-badge">
                      <Crown size={16} />
                      <span className="text-sm font-medium">VIP</span>
                    </div>
                  )}
                  {user.balance !== undefined && (
                    <div className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-green-900/50 border border-green-700">
                      <Wallet size={16} className="text-green-400" />
                      <span className="text-green-400 font-medium">
                        {parseFloat(user.balance).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  )}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-pink to-neon-purple flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-gray-200">{user.username}</span>
                      <ChevronDown 
                        size={16} 
                        className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                      />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-dark-800 rounded-xl shadow-xl border border-dark-600 overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-dark-600">
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-gray-400 text-sm">{user.isPremium ? 'VIP Member' : 'Thành viên thường'}</p>
                          {user.balance !== undefined && (
                            <p className="text-green-400 text-sm mt-1">
                              Số dư: {parseFloat(user.balance).toLocaleString('vi-VN')}đ
                            </p>
                          )}
                        </div>
                        
                        {user.role === 'admin' && (
                          <>
                            <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider">
                              Quản Lý
                            </div>
                            <Link
                              to="/admin"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-dark-700 hover:text-neon-purple transition-colors"
                            >
                              <Shield size={18} />
                              <span>Dashboard</span>
                            </Link>
                            <Link
                              to="/admin/nguoi-dung"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-dark-700 hover:text-neon-purple transition-colors"
                            >
                              <User size={18} />
                              <span>Người Dùng</span>
                            </Link>
                            <Link
                              to="/admin/tao-bo-suu-tap"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-dark-700 hover:text-neon-purple transition-colors"
                            >
                              <Image size={18} />
                              <span>Tạo Bộ Sưu Tập</span>
                            </Link>
                            <Link
                              to="/admin/xac-nhan-nap-tien"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-dark-700 hover:text-neon-purple transition-colors"
                            >
                              <DollarSign size={18} />
                              <span>Xác Nhận Nạp Tiền</span>
                            </Link>
                            <div className="border-t border-dark-600 my-1" />
                          </>
                        )}
                        
                        <div className="py-2">
                          <Link
                            to="/tai-khoan"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-dark-700 hover:text-neon-pink transition-colors"
                          >
                            <UserCircle size={18} />
                            <span>Thông tin tài khoản</span>
                          </Link>
                          <Link
                            to="/album-yeu-thich"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-dark-700 hover:text-neon-pink transition-colors"
                          >
                            <Heart size={18} />
                            <span>Album đã thích</span>
                          </Link>
                          <Link
                            to="/thanh-toan"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-dark-700 hover:text-neon-pink transition-colors"
                          >
                            <CreditCard size={18} />
                            <span>Thông tin thanh toán</span>
                          </Link>
                          {!user.isPremium && (
                            <Link
                              to="/nang-cap-vip"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-dark-700 hover:text-neon-pink transition-colors"
                            >
                              <Crown size={18} className="text-yellow-500" />
                              <span>Nâng cấp VIP</span>
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-dark-600 py-2">
                          <button
                            onClick={() => { logout(); setDropdownOpen(false); }}
                            className="flex items-center space-x-3 w-full px-4 py-2 text-red-500 hover:bg-dark-700 transition-colors"
                          >
                            <LogOut size={18} />
                            <span>Đăng xuất</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/dang-nhap"
                    className="px-4 py-2 rounded-lg text-gray-300 hover:text-white transition-colors"
                  >
                    Đăng Nhập
                  </Link>
                  <Link
                    to="/dang-ky"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-neon-pink to-neon-purple text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    Đăng Ký
                  </Link>
                </div>
              )}
            </div>

            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-dark-800 border-t border-dark-600">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    isActive(path)
                      ? 'text-neon-pink bg-neon-pink/10'
                      : 'text-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}
              {/* User header - mobile */}
              {user && (
                <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-dark-700/50 mt-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-pink to-neon-purple flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{user.username}</p>
                    <p className="text-gray-400 text-xs">{user.isPremium ? 'VIP Member' : 'Thành viên'}</p>
                  </div>
                  {user.isPremium && (
                    <div className="px-2 py-1 rounded-full premium-badge">
                      <Crown size={14} />
                    </div>
                  )}
                </div>
              )}
              {user && user.role === 'admin' && (
                <>
                  <div className="flex items-center space-x-3 px-4 py-2 text-gray-400 text-sm uppercase tracking-wider">
                    Quản Lý
                  </div>
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                      isActive('/admin')
                        ? 'text-neon-purple bg-neon-purple/10'
                        : 'text-gray-300'
                    }`}
                  >
                    <Shield size={20} />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/admin/nguoi-dung"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                      isActive('/admin/nguoi-dung')
                        ? 'text-neon-purple bg-neon-purple/10'
                        : 'text-gray-300'
                    }`}
                  >
                    <User size={20} />
                    <span>Người Dùng</span>
                  </Link>
                  <Link
                    to="/admin/tao-bo-suu-tap"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                      isActive('/admin/tao-bo-suu-tap')
                        ? 'text-neon-purple bg-neon-purple/10'
                        : 'text-gray-300'
                    }`}
                  >
                    <Image size={20} />
                    <span>Tạo Bộ Sưu Tập</span>
                  </Link>
                  <Link
                    to="/admin/xac-nhan-nap-tien"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                      isActive('/admin/xac-nhan-nap-tien')
                        ? 'text-neon-purple bg-neon-purple/10'
                        : 'text-gray-300'
                    }`}
                  >
                    <DollarSign size={20} />
                    <span>Xác Nhận Nạp Tiền</span>
                  </Link>
                </>
              )}
              {user && (
                <>
                  {user.balance !== undefined && (
                    <div className="px-4 py-3 rounded-lg bg-green-900/30 border border-green-800 mx-2 my-2">
                      <p className="text-gray-400 text-xs">Số dư</p>
                      <p className="text-green-400 font-bold text-lg">
                        {parseFloat(user.balance).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  )}
                  <Link
                    to="/tai-khoan"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300"
                  >
                    <UserCircle size={20} />
                    <span>Tài Khoản</span>
                  </Link>
                  <Link
                    to="/album-yeu-thich"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300"
                  >
                    <Heart size={20} />
                    <span>Album Yêu Thích</span>
                  </Link>
                  <Link
                    to="/thanh-toan"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300"
                  >
                    <CreditCard size={20} />
                    <span>Thông Tin Thanh Toán</span>
                  </Link>
                  {!user.isPremium && (
                    <Link
                      to="/nang-cap-vip"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-yellow-500"
                    >
                      <Crown size={20} />
                      <span>Nâng Cấp VIP</span>
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10"
                  >
                    <LogOut size={20} />
                    <span>Đăng Xuất</span>
                  </button>
                </>
              )}
              {!user && (
                <div className="pt-4 border-t border-dark-600 space-y-2">
                  <Link
                    to="/dang-nhap"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-center text-gray-300 hover:bg-dark-700"
                  >
                    Đăng Nhập
                  </Link>
                  <Link
                    to="/dang-ky"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-center bg-gradient-to-r from-neon-pink to-neon-purple text-white font-medium"
                  >
                    Đăng Ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="pt-16">
        <Outlet />
      </main>

      <footer className="bg-dark-800 border-t border-dark-700 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-pink to-neon-purple flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">
                Album
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 Album. Nền tảng chia sẻ bộ sưu tập ảnh đẹp.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
