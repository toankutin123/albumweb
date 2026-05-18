import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { albumService } from '../services/apiService'
import CollectionCard from '../components/CollectionCard'
import { CollectionCardSkeleton } from '../components/Skeleton'
import { Search, Image } from 'lucide-react'

export default function Collections() {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  const genre = searchParams.get('genre') || ''
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    loadAlbums()
  }, [genre, search, page])

  const loadAlbums = async () => {
    setLoading(true)
    try {
      const params = {}
      if (genre) params.genre = genre
      if (search) params.search = search

      const res = await albumService.getAll(params)
      setAlbums(res.data.albums || [])
    } catch (error) {
      console.error('Lỗi tải album:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const newParams = new URLSearchParams(searchParams)
    const searchValue = e.target.search.value
    if (searchValue) {
      newParams.set('search', searchValue)
    } else {
      newParams.delete('search')
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Bộ Sưu Tập</h1>
        <p className="text-gray-400">Khám phá bộ sưu tập ảnh đẹp nhất</p>
      </div>

      <div className="mb-8">
        <form onSubmit={handleSearch} className="max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              name="search"
              placeholder="Tìm kiếm album..."
              defaultValue={search}
              className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-pink/50 transition-colors"
            />
          </div>
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => <CollectionCardSkeleton key={i} />)}
        </div>
      ) : albums.length === 0 ? (
        <div className="text-center py-16">
          <Image className="mx-auto text-gray-600 mb-4" size={64} />
          <h3 className="text-xl font-medium text-gray-400 mb-2">Không tìm thấy album</h3>
          <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {albums.map(album => (
            <CollectionCard key={album.id} collection={album} />
          ))}
        </div>
      )}
    </div>
  )
}
