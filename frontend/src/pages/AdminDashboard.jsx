import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { userService, albumService } from '../services/apiService'
import { Users, Image, Crown, TrendingUp, ArrowRight } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    totalAlbums: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [userStats, albumStats] = await Promise.all([
        userService.getStats(),
        albumService.getAll({ limit: 1 })
      ])
      setStats({
        totalUsers: userStats.data.stats?.total_users || 0,
        premiumUsers: userStats.data.stats?.total_admins || 0,
        totalAlbums: albumStats.data.albums?.length || 0
      })
    } catch (error) {
      console.error('Lỗi tải thống kê:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, title, value, subtext, color }) => (
    <div className="bg-dark-800 rounded-xl p-6 neon-border">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center mb-4`}>
        <Icon className="text-white" size={24} />
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-gray-400 text-sm">{title}</p>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
  )

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-dark-700 rounded mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-dark-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Xem tổng quan hệ thống</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Tổng Người Dùng"
          value={stats.totalUsers}
          color="from-neon-pink to-neon-purple"
        />
        <StatCard
          icon={Image}
          title="Tổng Album"
          value={stats.totalAlbums}
          color="from-neon-blue to-cyan-500"
        />
        <StatCard
          icon={Crown}
          title="Quản Trị Viên"
          value={stats.premiumUsers}
          color="from-yellow-500 to-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-800 rounded-xl p-6 neon-border">
          <h2 className="text-xl font-bold text-white mb-6">Quản Lý Nhanh</h2>
          <div className="space-y-3">
            <Link
              to="/admin/nguoi-dung"
              className="flex items-center justify-between p-4 bg-dark-700 rounded-xl hover:bg-dark-600 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <Users className="text-neon-pink" size={20} />
                <span className="text-white">Quản lý người dùng</span>
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-neon-pink transition-colors" size={20} />
            </Link>
            
            <Link
              to="/tao-album"
              className="flex items-center justify-between p-4 bg-dark-700 rounded-xl hover:bg-dark-600 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <Image className="text-neon-blue" size={20} />
                <span className="text-white">Tạo album mới</span>
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-neon-blue transition-colors" size={20} />
            </Link>
          </div>
        </div>

        <div className="bg-dark-800 rounded-xl p-6 neon-border">
          <h2 className="text-xl font-bold text-white mb-6">Thống Kê Nhanh</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <Users className="text-neon-pink" size={20} />
                <span className="text-gray-300">Tổng người dùng</span>
              </div>
              <span className="text-white font-bold">{stats.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-dark-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <Image className="text-neon-blue" size={20} />
                <span className="text-gray-300">Tổng album</span>
              </div>
              <span className="text-white font-bold">{stats.totalAlbums}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
