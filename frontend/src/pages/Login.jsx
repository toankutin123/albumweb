import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import Input from '../components/Input'
import Button from '../components/Button'
import { User, Lock, ArrowRight } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!username || !password) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    setLoading(true)
    try {
      await login(username, password)
      toast.success('Đăng nhập thành công!')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent mb-2">
            Chào Mừng Trở Lại
          </h1>
          <p className="text-gray-400">Đăng nhập để tiếp tục trải nghiệm</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-800 rounded-2xl p-8 neon-border space-y-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-gray-300 mb-2">
              <User size={18} />
              <span className="text-sm font-medium">Tên đăng nhập</span>
            </div>
            <Input
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-gray-300 mb-2">
              <Lock size={18} />
              <span className="text-sm font-medium">Mật khẩu</span>
            </div>
            <Input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" loading={loading} className="w-full">
            <span>Đăng Nhập</span>
            <ArrowRight size={18} />
          </Button>

          <div className="text-center">
            <p className="text-gray-400">
              Chưa có tài khoản?{' '}
              <Link to="/dang-ky" className="text-neon-pink hover:text-neon-purple transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>

        </form>
      </div>
    </div>
  )
}
