import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Crown, Eye, Heart } from 'lucide-react'
import { favoriteService } from '../services/apiService'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'

export default function CollectionCard({ collection, showFavorite = true }) {
  const { user } = useAuth()
  const [isFavorited, setIsFavorited] = useState(collection.is_favorited || false)
  const [loading, setLoading] = useState(false)

  const handleFavorite = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào yêu thích')
      return
    }

    setLoading(true)
    try {
      if (isFavorited) {
        await favoriteService.remove(collection.id)
        setIsFavorited(false)
        toast.success('Đã xóa khỏi yêu thích')
      } else {
        await favoriteService.add(collection.id)
        setIsFavorited(true)
        toast.success('Đã thêm vào yêu thích')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link
      to={`/bo-suu-tap/${collection.id}`}
      className="collection-card block bg-dark-800 rounded-xl overflow-hidden neon-border group relative"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={collection.coverImage}
          alt={collection.title}
          className="card-image w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://placehold.co/400x300/1a1a1a/666?text=No+Image'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-60" />
        
        {collection.isPremium && (
          <div className="absolute top-3 right-3 premium-badge px-3 py-1 rounded-full flex items-center space-x-1">
            <Crown size={14} />
            <span className="text-xs font-medium">VIP</span>
          </div>
        )}

        {collection.price > 0 && (
          <div className="absolute top-3 left-12 px-3 py-1 rounded-full bg-neon-pink/90 text-white text-xs font-medium flex items-center">
            {collection.price.toLocaleString('vi-VN')}đ
          </div>
        )}

        {showFavorite && (
          <button
            onClick={handleFavorite}
            disabled={loading}
            className={`absolute top-3 left-3 p-2 rounded-full transition-all ${
              isFavorited
                ? 'bg-red-500 text-white'
                : 'bg-dark-900/70 text-gray-300 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart
              size={18}
              className={isFavorited ? 'fill-current' : ''}
            />
          </button>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-semibold text-white truncate pr-16">
            {collection.title}
          </h3>
        </div>
      </div>

      <div className="p-4">
        <p className="text-gray-400 text-sm line-clamp-2 mb-3">
          {collection.description || 'Không có mô tả'}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          {collection.genre && (
            <span className="px-2 py-1 rounded bg-dark-700 text-gray-300">
              {collection.genre}
            </span>
          )}
          <div className="flex items-center space-x-1 text-gray-500">
            <Eye size={16} />
            <span>{collection.viewCount || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
