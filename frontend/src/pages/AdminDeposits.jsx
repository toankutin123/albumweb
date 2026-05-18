import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { depositService } from '../services/apiService'
import Button from '../components/Button'
import Input from '../components/Input'
import { CheckCircle, XCircle, Clock, DollarSign, CreditCard, User, Copy, Check } from 'lucide-react'

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [processing, setProcessing] = useState(null)
  const [selectedDeposit, setSelectedDeposit] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState('')

  useEffect(() => {
    loadDeposits()
  }, [filter])

  const loadDeposits = async () => {
    try {
      setLoading(true)
      const res = await depositService.getAllAdmin()
      setDeposits(res.data.deposits || [])
    } catch (error) {
      toast.error('Không thể tải danh sách')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (deposit) => {
    if (!confirm(`Duyệt yêu cầu nạp tiền của "${deposit.user?.username}" với số tiền ${deposit.amount?.toLocaleString('vi-VN')}đ?`)) return

    setProcessing(deposit.id)
    try {
      await depositService.approve(deposit.id)
      toast.success('Đã duyệt yêu cầu nạp tiền')
      loadDeposits()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Duyệt thất bại')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (deposit) => {
    if (!confirm(`Từ chối yêu cầu nạp tiền của "${deposit.user?.username}"?`)) return

    setProcessing(deposit.id)
    try {
      await depositService.reject(deposit.id)
      toast.success('Đã từ chối yêu cầu')
      loadDeposits()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Từ chối thất bại')
    } finally {
      setProcessing(null)
    }
  }

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
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

  const formatCurrency = (amount) => {
    return amount?.toLocaleString('vi-VN') + 'đ'
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400'
    }
    const icons = {
      pending: <Clock size={14} />,
      approved: <CheckCircle size={14} />,
      rejected: <XCircle size={14} />
    }
    const labels = {
      pending: 'Đang chờ',
      approved: 'Đã duyệt',
      rejected: 'Từ chối'
    }
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        <span>{labels[status]}</span>
      </span>
    )
  }

  const pendingCount = deposits.filter(d => d.status === 'pending').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Xác Nhận Nạp Tiền</h1>
            <p className="text-gray-400">Xử lý yêu cầu nạp tiền từ người dùng</p>
          </div>
          {pendingCount > 0 && (
            <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium">
              {pendingCount} yêu cầu đang chờ
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'pending', label: 'Đang chờ' },
          { key: 'approved', label: 'Đã duyệt' },
          { key: 'rejected', label: 'Từ chối' }
        ].map(status => (
          <button
            key={status.key}
            onClick={() => setFilter(status.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === status.key
                ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white'
                : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-48 bg-dark-800 rounded-xl skeleton" />
          ))}
        </div>
      ) : deposits.length === 0 ? (
        <div className="text-center py-16 bg-dark-800 rounded-xl neon-border">
          <DollarSign className="mx-auto text-gray-600 mb-4" size={64} />
          <h3 className="text-xl font-medium text-gray-400">Không có yêu cầu nạp tiền</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {deposits.map(deposit => (
            <div 
              key={deposit.id} 
              className={`bg-dark-800 rounded-xl p-6 neon-border transition-all ${
                deposit.status === 'pending' ? 'border-yellow-500/30' : ''
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                {/* Thông tin người dùng */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-neon-pink to-neon-purple flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {deposit.user?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{deposit.user?.username || 'N/A'}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(deposit.created_at)}
                    </p>
                  </div>
                </div>

                {/* Số tiền */}
                <div className="text-center lg:text-right px-6 border-l lg:border-l-0 border-dark-600">
                  <p className="text-3xl font-bold text-green-400">
                    {formatCurrency(deposit.amount)}
                  </p>
                  {getStatusBadge(deposit.status)}
                </div>
              </div>

              {/* Thông tin thanh toán */}
              {deposit.paymentInfo && (
                <div className="mt-6 p-4 bg-dark-700 rounded-xl">
                  <p className="text-sm text-gray-400 mb-3 flex items-center space-x-2">
                    <CreditCard size={16} />
                    <span>Thông tin người nhận (thông tin ngân hàng của người dùng)</span>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Ngân hàng</p>
                      <p className="text-white font-medium">{deposit.paymentInfo.bank_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Số tài khoản</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-white font-medium">{deposit.paymentInfo.account_number}</p>
                        <button
                          onClick={() => handleCopy(deposit.paymentInfo.account_number, 'stk')}
                          className="p-1 hover:bg-dark-600 rounded transition-colors"
                        >
                          {copied === 'stk' ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-gray-400" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tên chủ TK</p>
                      <p className="text-white font-medium">{deposit.paymentInfo.account_holder}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ghi chú */}
              {deposit.transfer_note && (
                <div className="mt-4 p-3 bg-dark-700/50 rounded-lg">
                  <p className="text-sm text-gray-400">
                    <span className="text-gray-500">Ghi chú:</span> {deposit.transfer_note}
                  </p>
                </div>
              )}

              {/* Actions */}
              {deposit.status === 'pending' && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    variant="success"
                    onClick={() => handleApprove(deposit)}
                    loading={processing === deposit.id}
                    className="flex items-center space-x-2"
                  >
                    <CheckCircle size={18} />
                    <span>Duyệt</span>
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleReject(deposit)}
                    loading={processing === deposit.id}
                    className="flex items-center space-x-2"
                  >
                    <XCircle size={18} />
                    <span>Từ chối</span>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
