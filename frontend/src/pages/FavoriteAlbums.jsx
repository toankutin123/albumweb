import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { favoriteService } from '../services/apiService'
import { Heart, Image, Crown } from 'lucide-react'

export default function FavoriteAlbums() {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      const res = await favoriteService.getAll()
      setAlbums(res.data.favorites || [])
    } catch (error) {
      toast.error('Không thể tải album yêu thích')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-dark-700 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Album Yêu Thích</h1>
        <p className="text-gray-400">Những album bạn đã lưu</p>
      </div>

      {albums.length === 0 ? (
        <div className="bg-dark-800 rounded-2xl p-12 text-center neon-border">
          <Heart className="mx-auto text-gray-500 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-white mb-2">Chưa có album yêu thích</h3>
          <p className="text-gray-400 mb-6">Hãy khám phá và lưu lại những album bạn thích</p>
          <Link
            to="/bo-suu-tap"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-pink to-neon-purple text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            <Image size={20} />
            Khám phá album
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <Link
              key={album.id}
              to={`/bo-suu-tap/${album.id}`}
              className="group bg-dark-800 rounded-2xl overflow-hidden neon-border hover:border-neon-pink/50 transition-all"
            >
              <div className="relative h-48 bg-dark-700">
                {album.coverImage ? (
                  <img
                    src={album.coverImage}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="text-gray-600" size={48} />
                  </div>
                )}
                {album.isPremium && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-yellow-500/90 flex items-center gap-1">
                    <Crown size={14} />
                    <span className="text-xs font-medium text-black">VIP</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white group-hover:text-neon-pink transition-colors line-clamp-1">
                  {album.title}
                </h3>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                  {album.description}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Image size={14} />
                    {album.images?.length || 0} ảnh
                  </span>
                  {album.genre && (
                    <span className="px-2 py-0.5 rounded bg-dark-700 text-xs">
                      {album.genre}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
