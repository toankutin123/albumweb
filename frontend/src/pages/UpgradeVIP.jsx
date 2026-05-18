import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Crown, Check, Image, Shield, Sparkles, ArrowLeft } from 'lucide-react'

export default function UpgradeVIP() {
  const [loading, setLoading] = useState(false)

  const benefits = [
    { icon: Crown, text: 'Truy cập bộ sưu tập VIP độc quyền', color: 'text-yellow-500' },
    { icon: Image, text: 'Hình ảnh chất lượng cao 4K', color: 'text-neon-pink' },
    { icon: Shield, text: 'Không quảng cáo', color: 'text-neon-blue' },
    { icon: Sparkles, text: 'Ưu tiên hỗ trợ 24/7', color: 'text-neon-purple' },
  ]

  const handleUpgrade = async () => {
    setLoading(true)
    toast.success('Tính năng đang phát triển! Liên hệ admin để nâng cấp.')
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Quay lại</span>
      </Link>

      <div className="bg-dark-800 rounded-2xl overflow-hidden neon-border">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 p-8 text-center border-b border-dark-600">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
            <Crown className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Nâng Cấp VIP</h1>
          <p className="text-gray-400">Trải nghiệm tuyệt vời hơn với tài khoản VIP</p>
          <div className="mt-4">
            <span className="text-4xl font-bold text-yellow-400">100.000đ</span>
            <span className="text-gray-400 ml-2">/ 30 ngày</span>
          </div>
        </div>

        {/* Benefits */}
        <div className="p-8">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Quyền lợi khi trở thành VIP</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-dark-700 rounded-xl"
              >
                <div className={`p-3 rounded-lg bg-dark-600 ${benefit.color}`}>
                  <benefit.icon size={24} />
                </div>
                <span className="text-white">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-4 px-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Nâng cấp ngay'}
            </button>
            <p className="text-gray-500 text-sm mt-4">
              Thanh toán an toàn qua ví điện tử hoặc chuyển khoản ngân hàng
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
