import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { userService, otpService } from '../services/apiService'
import { UserTableSkeleton } from '../components/Skeleton'
import Button from '../components/Button'
import Input from '../components/Input'
import { useAuth } from '../context/AuthContext'
import { Search, Edit, Trash2, X, CreditCard, Shield, User, Key } from 'lucide-react'

export default function Users() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({
    role: 'user',
    bank_name: '',
    account_number: '',
    account_holder: '',
    is_verified: false,
    otp_code: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const res = await userService.getAll()
      setUsers(res.data.users || [])
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (user) => {
    setEditingUser(user)
    setEditForm({
      role: user.role,
      bank_name: user.payment_info?.bank_name || '',
      account_number: user.payment_info?.account_number || '',
      account_holder: user.payment_info?.account_holder || '',
      is_verified: user.payment_info?.is_verified || false,
      otp_code: 'Đang tải...'
    })

    // Lấy OTP của user
    try {
      const res = await otpService.getCurrent(user.id)
      setEditForm(prev => ({ 
        ...prev, 
        otp_code: res.data.otp_code || 'Chưa có OTP' 
      }))
    } catch (error) {
      console.error('Không thể lấy OTP:', error)
      setEditForm(prev => ({ ...prev, otp_code: 'Không thể tải' }))
    }
  }

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await userService.update(editingUser.id, {
        role: editForm.role,
        is_verified: editForm.is_verified,
        bank_name: editForm.bank_name,
        account_number: editForm.account_number,
        account_holder: editForm.account_holder
      })
      toast.success('Cập nhật thành công!')
      setEditingUser(null)
      loadUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (userId, username) => {
    if (!confirm(`Bạn có chắc muốn xóa người dùng "${username}"?`)) return
    
    try {
      await userService.delete(userId)
      toast.success('Xóa người dùng thành công')
      loadUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xóa thất bại')
    }
  }

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Quản Lý Người Dùng</h1>
        <p className="text-gray-400">Xem và chỉnh sửa thông tin người dùng</p>
      </div>

      <div className="bg-dark-800 rounded-xl p-6 neon-border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-pink/50"
              />
            </div>
          </div>
          <div className="text-sm text-gray-400 flex items-center">
            Tổng: <span className="text-white font-bold ml-2">{filteredUsers.length}</span> người dùng
          </div>
        </div>
      </div>

      {loading ? (
        <UserTableSkeleton />
      ) : (
        <div className="bg-dark-800 rounded-xl overflow-hidden neon-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Người dùng</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Vai trò</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Thông tin thanh toán</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Ngày tạo</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-pink to-neon-purple flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.username?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-sm text-gray-400">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.payment_info ? (
                        <div className="text-sm">
                          <p className="text-gray-300">{user.payment_info.bank_name}</p>
                          <p className="text-gray-500">{user.payment_info.account_number}</p>
                          {user.payment_info.is_verified ? (
                            <span className="text-green-500 text-xs">Đã xác nhận</span>
                          ) : (
                            <span className="text-yellow-500 text-xs">Chưa xác nhận</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Chưa có</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-gray-400 hover:text-neon-pink hover:bg-neon-pink/10 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-dark-800 rounded-2xl p-6 w-full max-w-md neon-border animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <User size={20} />
                Chỉnh sửa: {editingUser.username}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Thông tin tài khoản */}
              <div className="bg-dark-700 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Shield size={16} className="text-neon-pink" />
                  Thông tin tài khoản
                </h4>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-400">Vai trò</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-dark-600 border border-dark-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-pink/50"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* Thông tin thanh toán */}
              <div className="bg-dark-700 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <CreditCard size={16} className="text-neon-blue" />
                  Thông tin thanh toán
                </h4>
                
                {editForm.bank_name || currentUser?.role === 'admin' ? (
                  <>
                    <Input
                      label="Tên ngân hàng"
                      value={editForm.bank_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bank_name: e.target.value }))}
                    />
                    <Input
                      label="Số tài khoản"
                      value={editForm.account_number}
                      onChange={(e) => setEditForm(prev => ({ ...prev, account_number: e.target.value }))}
                    />
                    <Input
                      label="Tên chủ tài khoản"
                      value={editForm.account_holder}
                      onChange={(e) => setEditForm(prev => ({ ...prev, account_holder: e.target.value }))}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Mã OTP</label>
                      <input
                        type="text"
                        readOnly
                        className="w-full px-4 py-2.5 bg-dark-600 border border-dark-500 rounded-lg text-neon-pink font-mono text-lg tracking-widest"
                        value={editForm.otp_code || 'Đang tải...'}
                      />
                    </div>
                    <div className="flex items-center space-x-3 mt-2">
                      <input
                        type="checkbox"
                        id="isVerified"
                        checked={editForm.is_verified}
                        onChange={(e) => setEditForm(prev => ({ ...prev, is_verified: e.target.checked }))}
                        className="w-5 h-5 rounded border-dark-500 bg-dark-600 text-neon-green focus:ring-neon-green/50"
                      />
                      <label htmlFor="isVerified" className="text-gray-300">Xác nhận thanh toán</label>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-4">
                    Người dùng chưa cung cấp thông tin thanh toán
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button variant="secondary" onClick={() => setEditingUser(null)} className="flex-1" disabled={saving}>
                Hủy
              </Button>
              <Button onClick={handleUpdate} className="flex-1" loading={saving}>
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
