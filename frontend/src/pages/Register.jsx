import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import Input from '../components/Input'
import Button from '../components/Button'
import { User, Lock, ArrowRight } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.username || !formData.password) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)
    try {
      await register({
        username: formData.username,
        password: formData.password
      })
      toast.success('Đăng ký thành công!')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent mb-2">
            Tạo Tài Khoản Mới
          </h1>
          <p className="text-gray-400">Tham gia cộng đồng Album</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-800 rounded-2xl p-8 neon-border space-y-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-gray-300 mb-2">
              <User size={18} />
              <span className="text-sm font-medium">Tên đăng nhập <span className="text-red-500">*</span></span>
            </div>
            <Input
              name="username"
              placeholder="Nhập tên đăng nhập"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-gray-300 mb-2">
              <Lock size={18} />
              <span className="text-sm font-medium">Mật khẩu <span className="text-red-500">*</span></span>
            </div>
            <Input
              type="password"
              name="password"
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-gray-300 mb-2">
              <Lock size={18} />
              <span className="text-sm font-medium">Xác nhận mật khẩu <span className="text-red-500">*</span></span>
            </div>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" loading={loading} className="w-full">
            <span>Đăng Ký</span>
            <ArrowRight size={18} />
          </Button>

          <div className="text-center">
            <p className="text-gray-400">
              Đã có tài khoản?{' '}
              <Link to="/dang-nhap" className="text-neon-pink hover:text-neon-purple transition-colors">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
