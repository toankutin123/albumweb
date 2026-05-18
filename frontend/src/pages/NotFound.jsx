import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-bold bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Trang Không Tồn Tại</h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-neon-pink to-neon-purple text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            <Home size={20} />
            <span>Về Trang Chủ</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-dark-800 text-white font-medium rounded-xl border border-dark-600 hover:border-neon-pink/50 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Quay Lại</span>
          </button>
        </div>
      </div>
    </div>
  )
}
