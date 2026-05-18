import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { albumService } from '../services/apiService'
import CollectionCard from '../components/CollectionCard'
import { CollectionCardSkeleton } from '../components/Skeleton'
import { Sparkles, Crown, ArrowRight, Image } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const [albums, setAlbums] = useState([])
  const [premiumAlbums, setPremiumAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadAlbums()
  }, [])

  const loadAlbums = async () => {
    try {
      const [allRes, premiumRes] = await Promise.all([
        albumService.getAll({ limit: 6 }),
        albumService.getAll({ premium: true, limit: 6 })
      ])
      setAlbums(allRes.data.albums || [])
      setPremiumAlbums(premiumRes.data.albums || [])
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/20 via-dark-900 to-neon-purple/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-pink/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/30 rounded-full blur-[120px]" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-dark-800/50 border border-neon-pink/30 mb-6">
            <Sparkles className="text-neon-pink" size={16} />
            <span className="text-sm text-gray-300">Nền tảng chia sẻ ảnh đẹp</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-neon-pink via-purple-400 to-neon-purple bg-clip-text text-transparent">
              Album
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Khám phá bộ sưu tập ảnh đẹp, cập nhật xu hướng thời trang và phong cách sống. 
            Đăng ký ngay để trở thành thành viên VIP!
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/bo-suu-tap"
              className="group px-8 py-4 bg-gradient-to-r from-neon-pink to-neon-purple text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center space-x-2"
            >
              <Image size={20} />
              <span>Xem Bộ Sưu Tập</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            {!user && (
              <Link
                to="/dang-ky"
                className="px-8 py-4 bg-dark-800 text-white font-semibold rounded-xl border border-dark-600 hover:border-neon-pink/50 transition-all flex items-center space-x-2"
              >
                <Crown size={20} />
                <span>Đăng Ký VIP</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-neon-pink to-neon-purple flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white">Bộ Sưu Tập Nổi Bật</h2>
          </div>
          <Link
            to="/bo-suu-tap"
            className="text-neon-pink hover:text-neon-purple transition-colors flex items-center space-x-1"
          >
            <span>Xem tất cả</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(6)].map((_, i) => <CollectionCardSkeleton key={i} />)
          ) : (
            albums.map(album => (
              <CollectionCard key={album.id} collection={album} />
            ))
          )}
        </div>
      </section>

      {premiumAlbums.length > 0 && (
        <section className="bg-dark-800/50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Crown className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Bộ Sưu Tập VIP</h2>
                  <p className="text-sm text-gray-400">Dành riêng cho thành viên cao cấp</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                [...Array(3)].map((_, i) => <CollectionCardSkeleton key={i} />)
              ) : (
                premiumAlbums.map(album => (
                  <CollectionCard key={album.id} collection={album} />
                ))
              )}
            </div>

            {!user?.isPremium && (
              <div className="mt-8 text-center">
                <Link
                  to="/thanh-toan"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                >
                  <Crown size={20} />
                  <span>Nâng Cấp VIP Ngay</span>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-800 rounded-xl p-6 neon-border text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-pink to-neon-purple flex items-center justify-center mx-auto mb-4">
              <Image size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Bộ Sưu Tập Đa Dạng</h3>
            <p className="text-gray-400">Hàng nghìn bộ sưu tập ảnh chất lượng cao</p>
          </div>
          
          <div className="bg-dark-800 rounded-xl p-6 neon-border text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-blue to-cyan-500 flex items-center justify-center mx-auto mb-4">
              <Crown size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Thành Viên VIP</h3>
            <p className="text-gray-400">Trải nghiệm độc quyền với nhiều ưu đãi</p>
          </div>
          
          <div className="bg-dark-800 rounded-xl p-6 neon-border text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-green to-emerald-500 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Cập Nhật Liên Tục</h3>
            <p className="text-gray-400">Nội dung mới được cập nhật hàng ngày</p>
          </div>
        </div>
      </section>
    </div>
  )
}
