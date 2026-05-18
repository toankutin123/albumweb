import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { albumService } from '../services/apiService'
import Input from '../components/Input'
import Textarea from '../components/Textarea'
import Button from '../components/Button'
import { Image, Plus, Trash2, FolderOpen } from 'lucide-react'

export default function CreateCollection() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    genre: '',
    isPremium: false,
    price: 0
  })
  const [images, setImages] = useState([{ url: '', caption: '' }])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageChange = (index, field, value) => {
    const newImages = [...images]
    newImages[index][field] = value
    setImages(newImages)
  }

  const addImage = () => {
    setImages([...images, { url: '', caption: '' }])
  }

  const removeImage = (index) => {
    if (images.length > 1) {
      setImages(images.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.coverImage) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    const validImageUrls = images.filter(img => img.url.trim()).map(img => img.url)

    setLoading(true)
    try {
      await albumService.create({
        title: formData.title,
        description: formData.description,
        coverImage: formData.coverImage,
        genre: formData.genre,
        isPremium: formData.isPremium,
        price: formData.price,
        imageUrls: validImageUrls
      })
      toast.success('Tạo album thành công!')
      navigate('/bo-suu-tap')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Tạo album thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tạo Album Mới</h1>
        <p className="text-gray-400">Thêm album ảnh mới vào hệ thống</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-dark-800 rounded-2xl p-6 neon-border space-y-5">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <FolderOpen className="w-5 h-5 mr-2 text-neon-pink" />
            Thông Tin Cơ Bản
          </h2>

          <Input
            label="Tiêu đề *"
            name="title"
            placeholder="Nhập tiêu đề album"
            value={formData.title}
            onChange={handleChange}
          />

          <Textarea
            label="Mô tả"
            name="description"
            placeholder="Mô tả về album..."
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Thể loại"
              name="genre"
              placeholder="VD: Thời trang, Phong cảnh..."
              value={formData.genre}
              onChange={handleChange}
            />

            <Input
              label="Link ảnh bìa *"
              name="coverImage"
              placeholder="https://..."
              value={formData.coverImage}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Giá bán
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  name="price"
                  min="0"
                  placeholder="0 = Miễn phí"
                  value={formData.price || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  className="flex-1 px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-pink/50 focus:border-neon-pink/50"
                />
                <span className="text-gray-400">đ</span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, price: 0 }))}
                  className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                    formData.price === 0 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                      : 'bg-dark-700 text-gray-400 border border-dark-600 hover:border-gray-500'
                  }`}
                >
                  Free
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.price === 0 ? 'Album miễn phí' : `Giá: ${formData.price.toLocaleString('vi-VN')}đ`}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isPremium"
                name="isPremium"
                checked={formData.isPremium}
                onChange={handleChange}
                className="w-5 h-5 rounded border-dark-600 bg-dark-700 text-neon-pink focus:ring-neon-pink/50"
              />
              <label htmlFor="isPremium" className="text-gray-300">
                Album VIP (chỉ thành viên VIP mới xem được)
              </label>
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-2xl p-6 neon-border">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Image className="w-5 h-5 mr-2 text-neon-pink" />
              Hình Ảnh Trong Album
            </h2>
            <Button type="button" variant="secondary" size="sm" onClick={addImage}>
              <Plus size={16} className="mr-1" />
              Thêm Ảnh
            </Button>
          </div>

          <p className="text-sm text-gray-400 mb-4">
            Thêm nhiều ảnh vào album của bạn. Mỗi album có thể chứa nhiều ảnh khác nhau.
          </p>

          <div className="space-y-4">
            {images.map((image, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-dark-700 rounded-xl">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-dark-600 flex-shrink-0">
                  {image.url ? (
                    <img
                      src={image.url}
                      alt={`Preview ${index}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/96x96/1a1a1a/666?text=No+Image'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="text-gray-500" size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <Input
                    placeholder="Link hình ảnh"
                    value={image.url}
                    onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                  />
                  <Input
                    placeholder="Chú thích (tùy chọn)"
                    value={image.caption}
                    onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  disabled={images.length === 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Hủy
          </Button>
          <Button type="submit" loading={loading}>
            Tạo Album
          </Button>
        </div>
      </form>
    </div>
  )
}
