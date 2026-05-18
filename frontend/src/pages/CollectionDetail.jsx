import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { albumService, favoriteService } from '../services/apiService'
import { CollectionDetailSkeleton } from '../components/Skeleton'
import { useAuth } from '../context/AuthContext'
import { Crown, Eye, Calendar, ArrowLeft, Lock, X, ChevronLeft, ChevronRight, Trash2, Heart, ShoppingCart } from 'lucide-react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { toast } from 'sonner'

export default function CollectionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [album, setAlbum] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [isPurchased, setIsPurchased] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    loadAlbum()
  }, [id])

  const loadAlbum = async () => {
    try {
      const res = await albumService.getById(id)
      setAlbum(res.data.album)
      // Check if favorited
      if (user) {
        try {
          const favRes = await favoriteService.check(id)
          setIsFavorited(favRes.data.is_favorite)
        } catch (e) {
          // Ignore error
        }
        // Check if purchased
        try {
          const purRes = await albumService.checkPurchased(id)
          setIsPurchased(purRes.data.purchased)
        } catch (e) {
          // Ignore error
        }
      }
    } catch (error) {
      console.error('Lỗi tải album:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào yêu thích')
      return
    }

    setFavLoading(true)
    try {
      if (isFavorited) {
        await favoriteService.remove(id)
        setIsFavorited(false)
        toast.success('Đã xóa khỏi yêu thích')
      } else {
        await favoriteService.add(id)
        setIsFavorited(true)
        toast.success('Đã thêm vào yêu thích')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setFavLoading(false)
    }
  }

  const canView = () => {
    if (!album) return false
    // Free albums can be viewed by everyone
    if (album.price === 0) return true
    // Already purchased
    if (isPurchased) return true
    // Creator can always view
    if (user && album.createdById === user.id) return true
    // Admin can always view
    if (user?.role === 'admin') return true
    // Premium albums need VIP
    if (album.isPremium) return user?.isPremium
    return false
  }

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để mua album')
      return
    }

    setPurchasing(true)
    try {
      await albumService.purchase(id)
      setIsPurchased(true)
      toast.success('Mua album thành công!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mua album thất bại')
    } finally {
      setPurchasing(false)
    }
  }

  const openLightbox = (image, index) => {
    setSelectedImage(image)
    setCurrentIndex(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
    setCurrentIndex(0)
  }

  const goToPrevious = useCallback(() => {
    if (!album?.images || album.images.length === 0) return
    const newIndex = currentIndex === 0 ? album.images.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
    setSelectedImage(album.images[newIndex])
  }, [currentIndex, album])

  const goToNext = useCallback(() => {
    if (!album?.images || album.images.length === 0) return
    const newIndex = currentIndex === album.images.length - 1 ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
    setSelectedImage(album.images[newIndex])
  }, [currentIndex, album])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImage, goToPrevious, goToNext])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await albumService.delete(id)
      navigate('/bo-suu-tap')
    } catch (error) {
      console.error('Lỗi xóa album:', error)
      alert('Không thể xóa album')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const isAdmin = user?.role === 'admin'

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CollectionDetailSkeleton />
      </div>
    )
  }

  if (!album) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Không tìm thấy album</h2>
        <Button onClick={() => navigate('/bo-suu-tap')}>Quay lại</Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleFavorite}
            disabled={favLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isFavorited
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-dark-700 text-gray-300 hover:bg-dark-600 hover:text-red-400'
            }`}
          >
            <Heart size={18} className={isFavorited ? 'fill-current' : ''} />
            <span>{isFavorited ? 'Đã Yêu Thích' : 'Yêu Thích'}</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
              <span>Xóa album</span>
            </button>
          )}
        </div>
      </div>

      <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
        <img
          src={album.coverImage}
          alt={album.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://placehold.co/1200x400/1a1a1a/666?text=No+Image'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center space-x-3 mb-3">
            {album.isPremium && (
              <span className="premium-badge px-3 py-1 rounded-full flex items-center space-x-1 text-sm">
                <Crown size={14} />
                <span>VIP</span>
              </span>
            )}
            {album.genre && (
              <span className="px-3 py-1 rounded-full bg-dark-700/80 text-gray-300 text-sm">
                {album.genre}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{album.title}</h1>
          <div className="flex items-center space-x-6 text-gray-300">
            <div className="flex items-center space-x-1">
              <Eye size={18} />
              <span>{album.viewCount || 0} lượt xem</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar size={18} />
              <span>{new Date(album.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-dark-800 rounded-2xl p-6 md:p-8 mb-8 neon-border">
        <h2 className="text-xl font-semibold text-white mb-4">Mô tả</h2>
        <p className="text-gray-300 leading-relaxed">
          {album.description || 'Không có mô tả cho album này.'}
        </p>
      </div>

      {!canView() ? (
        <div className="bg-dark-800 rounded-2xl p-8 text-center neon-border">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-neon-pink to-neon-purple flex items-center justify-center mx-auto mb-6">
            <Lock className="text-white" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            {album.price > 0 ? 'Album Trả Phí' : 'Nội Dung Bị Khóa'}
          </h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            {album.price > 0 
              ? `Album này có giá ${album.price.toLocaleString('vi-VN')}đ. Mua để xem toàn bộ hình ảnh.` 
              : 'Album này yêu cầu quyền truy cập. Vui lòng mua album để xem.'
            }
          </p>
          {album.price > 0 ? (
            <Button
              onClick={handlePurchase}
              loading={purchasing}
              className="bg-gradient-to-r from-neon-pink to-neon-purple hover:opacity-90"
            >
              <ShoppingCart size={18} className="mr-2" />
              Mua Album - {album.price.toLocaleString('vi-VN')}đ
            </Button>
          ) : (
            <Link
              to="/thanh-toan"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-neon-pink to-neon-purple text-white font-semibold rounded-xl hover:opacity-90 transition-all"
            >
              <Crown size={20} />
              <span>Nâng Cấp VIP</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {album.images?.map((image, index) => (
            <button
              key={index}
              onClick={() => openLightbox(image, index)}
              className="aspect-square rounded-xl overflow-hidden neon-border hover:border-neon-pink/50 transition-all group"
            >
              <img
                src={image.url}
                alt={image.caption || `Hình ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/300x200/1a1a1a/666?text=No+Image'
                }}
              />
            </button>
          ))}
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white hover:text-neon-pink transition-colors z-10"
            onClick={closeLightbox}
          >
            <X size={32} />
          </button>

          <button
            className="absolute left-4 p-3 text-white hover:text-neon-pink hover:bg-white/10 rounded-full transition-all z-10"
            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
          >
            <ChevronLeft size={40} />
          </button>

          <button
            className="absolute right-4 p-3 text-white hover:text-neon-pink hover:bg-white/10 rounded-full transition-all z-10"
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
          >
            <ChevronRight size={40} />
          </button>

          <img
            src={selectedImage.url}
            alt={selectedImage.caption}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-4 bg-dark-900/80 px-6 py-3 rounded-full">
            {selectedImage.caption && (
              <p className="text-white text-center">
                {selectedImage.caption}
              </p>
            )}
            <span className="text-gray-400 text-sm">
              {currentIndex + 1} / {album?.images?.length || 0}
            </span>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Xóa Album</h3>
            <p className="text-gray-400 mb-6">
              Bạn có chắc muốn xóa album "{album?.title}"? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleDelete}
                loading={deleting}
                className="bg-red-500 hover:bg-red-600"
              >
                Xóa
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
