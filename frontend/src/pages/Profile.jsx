import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import authService from '../services/authService'
import Button from '../components/Button'
import Input from '../components/Input'
import { Crown, User, Calendar, Shield, CreditCard, Building2, Hash, UserCircle } from 'lucide-react'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await authService.getMe()
      setProfile(res.data.user)
    } catch (error) {
      toast.error('Không thể tải thông tin profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="w-24 h-24 rounded-full bg-dark-700" />
          <div className="h-8 w-48 bg-dark-700 rounded" />
          <div className="h-32 bg-dark-700 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tài Khoản Của Tôi</h1>
        <p className="text-gray-400">Quản lý thông tin cá nhân</p>
      </div>

      <div className="bg-dark-800 rounded-2xl p-8 neon-border mb-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-neon-pink to-neon-purple flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {profile?.username?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{profile?.username}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <Crown size={16} className={profile?.isPremium ? "text-yellow-500" : "text-gray-500"} />
              <span className={profile?.isPremium ? "text-yellow-400 font-medium" : "text-gray-400"}>
                {profile?.isPremium ? 'VIP Member' : 'Thành viên thường'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-4 p-4 bg-dark-700 rounded-xl">
            <User className="text-neon-pink" size={20} />
            <div>
              <p className="text-sm text-gray-400">Tên đăng nhập</p>
              <p className="text-white font-medium">{profile?.username}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-dark-700 rounded-xl">
            <Crown className={profile?.isPremium ? "text-yellow-500" : "text-gray-500"} size={20} />
            <div>
              <p className="text-sm text-gray-400">Hạng thành viên</p>
              <p className={profile?.isPremium ? "text-yellow-400 font-medium" : "text-gray-400"}>
                {profile?.isPremium ? 'VIP Member' : 'Thành viên thường'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-dark-700 rounded-xl">
            <Calendar className="text-yellow-500" size={20} />
            <div>
              <p className="text-sm text-gray-400">Ngày tham gia</p>
              <p className="text-white">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : 'N/A'}
              </p>
            </div>
          </div>

          {profile?.role === 'admin' && (
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 rounded-xl border border-neon-purple/30">
              <Shield className="text-neon-purple" size={20} />
              <div>
                <p className="text-sm text-neon-purple">Quyền hạn</p>
                <p className="text-white font-medium">Quản trị viên</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thông tin ngân hàng */}
      <div className="bg-dark-800 rounded-2xl p-8 neon-border mb-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard className="text-neon-blue" size={20} />
          Thông tin thanh toán
        </h3>
        
        {profile?.payment_info?.bank_name ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-dark-700 rounded-xl">
              <Building2 className="text-neon-pink" size={20} />
              <div>
                <p className="text-sm text-gray-400">Tên ngân hàng</p>
                <p className="text-white font-medium">{profile.payment_info.bank_name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-dark-700 rounded-xl">
              <Hash className="text-neon-blue" size={20} />
              <div>
                <p className="text-sm text-gray-400">Số tài khoản</p>
                <p className="text-white font-medium">{profile.payment_info.account_number}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-dark-700 rounded-xl">
              <UserCircle className="text-neon-purple" size={20} />
              <div>
                <p className="text-sm text-gray-400">Tên chủ tài khoản</p>
                <p className="text-white font-medium">{profile.payment_info.account_holder}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-dark-700 rounded-xl">
              <div className="flex items-center justify-center w-5 h-5">
                {profile.payment_info.is_verified ? (
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                ) : (
                  <span className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-black font-bold">!</span>
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-400">Trạng thái</p>
                <p className={profile.payment_info.is_verified ? "text-green-400 font-medium" : "text-yellow-400 font-medium"}>
                  {profile.payment_info.is_verified ? 'Đã xác nhận' : 'Chờ xác nhận'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-dark-700 rounded-xl p-6 text-center">
            <CreditCard className="mx-auto text-gray-500 mb-3" size={40} />
            <p className="text-gray-400">Chưa có thông tin thanh toán</p>
            <p className="text-gray-500 text-sm mt-1">Vui lòng liên hệ quản trị viên để thêm thông tin</p>
          </div>
        )}
      </div>

      <div className="bg-dark-800 rounded-2xl p-6 neon-border">
        <h3 className="text-lg font-semibold text-white mb-4">Lưu Ý</h3>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <p className="text-yellow-200 text-sm">
            Để cập nhật thông tin cá nhân (họ tên, số điện thoại), vui lòng liên hệ 
            <span className="font-semibold text-yellow-400"> quản trị viên </span> 
            để được hỗ trợ. Thông tin của bạn sẽ được xác nhận trước khi cập nhật.
          </p>
        </div>
      </div>
    </div>
  )
}
