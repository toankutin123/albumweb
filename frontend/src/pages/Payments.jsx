import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { paymentService } from '../services/apiService'
import Button from '../components/Button'
import { StatusBadge } from '../components/StatusBadge'
import { CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    loadPayments()
  }, [filter])

  const loadPayments = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {}
      const res = await paymentService.getAll(params)
      setPayments(res.data.payments || [])
    } catch (error) {
      toast.error('Không thể tải danh sách thanh toán')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id, status) => {
    const action = status === 'approved' ? 'duyệt' : 'từ chối'
    if (!confirm(`Bạn có chắc muốn ${action} yêu cầu này?`)) return

    setProcessing(id)
    try {
      await paymentService.updateStatus(id, { status })
      toast.success(`Đã ${action} yêu cầu thanh toán`)
      loadPayments()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setProcessing(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa yêu cầu này?')) return

    try {
      await paymentService.delete(id)
      toast.success('Xóa yêu cầu thành công')
      loadPayments()
    } catch (error) {
      toast.error('Xóa thất bại')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Quản Lý Thanh Toán</h1>
        <p className="text-gray-400">Xử lý yêu cầu thanh toán từ người dùng</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'approved', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === status
                ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white'
                : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
            }`}
          >
            {status === 'all' ? 'Tất cả' :
             status === 'pending' ? 'Đang chờ' :
             status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-dark-800 rounded-xl skeleton" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 bg-dark-800 rounded-xl neon-border">
          <DollarSign className="mx-auto text-gray-600 mb-4" size={64} />
          <h3 className="text-xl font-medium text-gray-400">Không có yêu cầu thanh toán</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map(payment => (
            <div key={payment.id} className="bg-dark-800 rounded-xl p-6 neon-border">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-neon-pink to-neon-purple flex items-center justify-center">
                      <span className="text-white font-bold">
                        {payment.user?.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{payment.user?.username || 'N/A'}</p>
                      <p className="text-sm text-gray-400">{payment.user?.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Ngân hàng</p>
                      <p className="text-white">{payment.bankName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Số TK</p>
                      <p className="text-white">{payment.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Chủ TK</p>
                      <p className="text-white">{payment.accountHolder}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Số tiền</p>
                      <p className="text-green-500 font-medium">
                        {payment.amount?.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>

                  {payment.transferNote && (
                    <p className="text-sm text-gray-400 mt-3">
                      <span className="text-gray-500">Ghi chú:</span> {payment.transferNote}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-3">
                  <StatusBadge status={payment.status} />
                  <p className="text-xs text-gray-500">
                    {formatDate(payment.createdAt)}
                  </p>

                  {payment.status === 'pending' && (
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleUpdateStatus(payment.id, 'approved')}
                        loading={processing === payment.id}
                        className="flex items-center space-x-1"
                      >
                        <CheckCircle size={16} />
                        <span>Duyệt</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleUpdateStatus(payment.id, 'rejected')}
                        loading={processing === payment.id}
                        className="flex items-center space-x-1"
                      >
                        <XCircle size={16} />
                        <span>Từ chối</span>
                      </Button>
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(payment.id)}
                    className="text-red-400 hover:text-red-500"
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
