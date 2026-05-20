import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { paymentService, depositService, withdrawalService, otpService } from '../services/apiService'
import Input from '../components/Input'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { CreditCard, Banknote, CheckCircle, Wallet, History, AlertCircle, ArrowDownToLine, ArrowUpToLine, Loader2, Clock, Edit2 } from 'lucide-react'

export default function Payment() {
  const { user, refreshBalance } = useAuth()
  const [searchParams] = useSearchParams()
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [depositing, setDepositing] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [showWithdrawForm, setShowWithdrawForm] = useState(false)
  const [deposits, setDeposits] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [showDepositForm, setShowDepositForm] = useState(false)
  const [withdrawCountdown, setWithdrawCountdown] = useState(0)
  const [withdrawError, setWithdrawError] = useState(null)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)
  const [pendingWithdrawalId, setPendingWithdrawalId] = useState(null)
  const [editingBank, setEditingBank] = useState(false)
  const [showWithdrawOtpModal, setShowWithdrawOtpModal] = useState(false)
  const [withdrawOtpCode, setWithdrawOtpCode] = useState('')
  const [pendingWithdrawData, setPendingWithdrawData] = useState(null)
  const [editingOtp, setEditingOtp] = useState(false)
  const [userOtp, setUserOtp] = useState('')
  
  const [bankForm, setBankForm] = useState({
    bank_name: '',
    account_number: '',
    account_holder: '',
    otp_code: ''
  })
  
  const [depositForm, setDepositForm] = useState({
    amount: '',
    transfer_note: ''
  })

  const [withdrawForm, setWithdrawForm] = useState({
    amount: ''
  })
  
  const amountInputRef = useRef(null)

  useEffect(() => {
    loadData()
  }, [])

  // Mở form deposit nếu có query param ?action=deposit và focus vào input
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'deposit' && paymentInfo) {
      setShowDepositForm(true)
      // Focus vào input số tiền sau khi form mở
      setTimeout(() => {
        amountInputRef.current?.focus()
      }, 100)
    }
  }, [searchParams, paymentInfo])

  // Poll withdrawals to check for status changes
  useEffect(() => {
    if (pendingWithdrawalId) {
      const interval = setInterval(async () => {
        try {
          const res = await withdrawalService.getMy()
          const updated = res.data.withdrawals.find(w => w.id === pendingWithdrawalId)
          if (updated && updated.status !== 'pending') {
            setPendingWithdrawalId(null)
            setWithdrawCountdown(0)
            if (updated.status === 'failed') {
              setWithdrawError(updated.failure_reason || 'Không tìm thấy thông tin để quyết toán')
              // Refresh balance vì tiền đã bị trừ khi thất bại
              await refreshBalance?.()
            } else if (updated.status === 'approved') {
              setWithdrawSuccess(true)
            }
            setWithdrawals(res.data.withdrawals)
          }
        } catch (err) {
          console.error('Poll withdrawal error:', err)
        }
      }, 2000) // Poll every 2 seconds
      return () => clearInterval(interval)
    }
  }, [pendingWithdrawalId])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await paymentService.getMy()
      setPaymentInfo(res.data.paymentInfo)
      
      if (res.data.paymentInfo) {
        const depositRes = await depositService.getMy()
        setDeposits(depositRes.data.deposits || [])
        
        const withdrawalRes = await withdrawalService.getMy()
        setWithdrawals(withdrawalRes.data.withdrawals || [])
        
        // Load OTP
        try {
          const otpRes = await otpService.getCurrent(user.id)
          setUserOtp(otpRes.data.otp_code || '')
        } catch (err) {
          console.error('Không thể tải OTP:', err)
        }
        
        // Check if there's a pending withdrawal
        const pending = withdrawalRes.data.withdrawals?.find(w => w.status === 'pending')
        if (pending) {
          setPendingWithdrawalId(pending.id)
          // Calculate remaining time
          const created = new Date(pending.created_at).getTime()
          const now = Date.now()
          const elapsed = Math.floor((now - created) / 1000)
          const remaining = Math.max(0, 30 - elapsed)
          setWithdrawCountdown(remaining)
        }
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBankChange = (e) => {
    setBankForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleDepositChange = (e) => {
    const { name, value } = e.target
    if (name === 'amount') {
      const num = value.replace(/\D/g, '')
      setDepositForm(prev => ({ ...prev, [name]: num }))
    } else {
      setDepositForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleWithdrawChange = (e) => {
    const { name, value } = e.target
    if (name === 'amount') {
      const num = value.replace(/\D/g, '')
      setWithdrawForm(prev => ({ ...prev, [name]: num }))
    } else {
      setWithdrawForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSaveOtp = async (e) => {
    e.preventDefault()
    if (!userOtp || userOtp.length < 4) {
      toast.error('Vui lòng nhập mã OTP (ít nhất 4 ký tự)')
      return
    }
    
    try {
      await otpService.save(userOtp)
      toast.success('Lưu mã OTP thành công!')
      setEditingOtp(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lưu OTP thất bại')
    }
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()

    if (!withdrawForm.amount || parseInt(withdrawForm.amount) < 10000) {
      toast.error('Số tiền rút tối thiểu là 10.000đ')
      return
    }

    if (user && parseInt(withdrawForm.amount) > user.balance) {
      toast.error('Số dư không đủ')
      return
    }

    // Kiểm tra thông tin ngân hàng đã đầy đủ chưa
    if (!paymentInfo?.bank_name || !paymentInfo?.account_number || !paymentInfo?.account_holder) {
      toast.error('Bạn cần nhập đầy đủ thông tin ngân hàng trước', {
        action: {
          label: 'Nhập ngay',
          onClick: () => setShowWithdrawForm(false)
        }
      })
      return
    }

    // Lưu thông tin rút tiền và hiện modal OTP
    setPendingWithdrawData({
      amount: parseInt(withdrawForm.amount)
    })
    setShowWithdrawOtpModal(true)

    // Lấy OTP của user
    try {
      const res = await otpService.getCurrent(user.id)
      setWithdrawOtpCode(res.data.otp_code || 'Chưa có OTP')
    } catch (error) {
      console.error('Không thể lấy OTP:', error)
      setWithdrawOtpCode('Không thể tải')
    }
  }

  const handleWithdrawConfirm = async () => {
    setWithdrawing(true)
    setWithdrawError(null)
    setWithdrawSuccess(false)

    try {
      // Chuẩn bị data rút tiền
      const withdrawData = {
        amount: pendingWithdrawData.amount
      }

      // Nếu là admin và có chỉnh sửa thông tin ngân hàng, gửi kèm
      if (user?.role === 'admin') {
        withdrawData.bank_name = paymentInfo.bank_name
        withdrawData.account_number = paymentInfo.account_number
        withdrawData.account_holder = paymentInfo.account_holder
      }

      // Tiến hành rút tiền
      const res = await withdrawalService.create(withdrawData)

      // Start countdown
      setWithdrawCountdown(30)
      setPendingWithdrawalId(res.data.withdrawal.id)

      // Countdown timer
      const timer = setInterval(() => {
        setWithdrawCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      toast.success('Yêu cầu rút tiền đang được xử lý...')
      setShowWithdrawForm(false)
      setShowWithdrawOtpModal(false)
      setWithdrawForm({ amount: '' })
      setWithdrawOtpCode('')
      setPendingWithdrawData(null)

    } catch (error) {
      setWithdrawing(false)
      if (error.response?.data?.needBankInfo) {
        toast.error('Bạn cần cập nhật thông tin ngân hàng trước')
        setShowWithdrawOtpModal(false)
      } else {
        toast.error(error.response?.data?.message || 'Rút tiền thất bại')
      }
    }
  }

  const handleSaveBank = async (e) => {
    e.preventDefault()

    if (!bankForm.bank_name || !bankForm.account_number || !bankForm.account_holder) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    // Nếu là admin đang chỉnh sửa thì yêu cầu OTP
    if (user?.role === 'admin' && editingBank) {
      if (!bankForm.otp_code) {
        toast.error('Vui lòng nhập mã OTP để xác nhận')
        return
      }
    }

    setSaving(true)
    try {
      // Nếu là admin và có OTP, xác minh OTP trước
      if (user?.role === 'admin' && bankForm.otp_code) {
        try {
          await otpService.verify({
            otp_code: bankForm.otp_code,
            user_id: user.id
          })
        } catch (otpError) {
          toast.error('Mã OTP không hợp lệ')
          setSaving(false)
          return
        }
      }

      // Gọi API để lưu thông tin ngân hàng
      await paymentService.save({
        bank_name: bankForm.bank_name,
        account_number: bankForm.account_number,
        account_holder: bankForm.account_holder
      })

      toast.success('Lưu thông tin thành công!')
      setEditingBank(false)
      await loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lưu thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleDeposit = async (e) => {
    e.preventDefault()

    if (!depositForm.amount || parseInt(depositForm.amount) < 10000) {
      toast.error('Số tiền nạp tối thiểu là 10.000đ')
      return
    }

    setDepositing(true)
    try {
      const res = await depositService.create({
        amount: parseInt(depositForm.amount),
        transfer_note: depositForm.transfer_note
      })
      
      toast.success('Đã tạo yêu cầu nạp tiền! Vui lòng chuyển khoản theo thông tin bên dưới.')
      
      // Reset form
      setDepositForm({ amount: '', transfer_note: '' })
      setShowDepositForm(false)
      
      // Reload deposits
      await loadData()
      
      // Show payment info
      if (res.data.paymentInfo) {
        toast.info(
          <div className="p-3 bg-dark-800 rounded-lg">
            <p className="font-medium text-white mb-2">Thông tin chuyển khoản:</p>
            <p className="text-sm text-gray-300">Ngân hàng: {res.data.paymentInfo.bank_name}</p>
            <p className="text-sm text-gray-300">STK: {res.data.paymentInfo.account_number}</p>
            <p className="text-sm text-gray-300">Tên: {res.data.paymentInfo.account_holder}</p>
            <p className="text-sm text-yellow-400 mt-2">Số tiền: {parseInt(depositForm.amount).toLocaleString('vi-VN')}đ</p>
          </div>,
          { duration: 10000 }
        )
      }
    } catch (error) {
      if (error.response?.data?.needBankInfo) {
        toast.error('Bạn cần nhập thông tin ngân hàng trước')
      } else {
        toast.error(error.response?.data?.message || 'Nạp tiền thất bại')
      }
    } finally {
      setDepositing(false)
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

  const formatCurrency = (amount) => {
    return amount?.toLocaleString('vi-VN') + 'đ'
  }

  const getWithdrawStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
      failed: 'bg-red-500/20 text-red-400'
    }
    const labels = {
      pending: 'Đang chờ',
      approved: 'Đã duyệt',
      rejected: 'Từ chối',
      failed: 'Thất bại'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getWithdrawFailureReason = (withdrawal) => {
    if (withdrawal.status === 'failed' && withdrawal.failure_reason) {
      return (
        <p className="text-sm text-red-400 mt-1">
          Lý do: {withdrawal.failure_reason}
        </p>
      )
    }
    return null
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400'
    }
    const labels = {
      pending: 'Đang chờ',
      approved: 'Đã duyệt',
      rejected: 'Từ chối'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dark-700 rounded w-1/3"></div>
          <div className="h-64 bg-dark-700 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  // Chưa có thông tin ngân hàng -> bắt buộc nhập
  if (!paymentInfo) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Nạp Tiền</h1>
          <p className="text-gray-400">Bạn cần nhập thông tin ngân hàng để nhận tiền nạp</p>
        </div>

        <div className="bg-dark-800 rounded-2xl p-6 neon-border">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-neon-blue to-cyan-500 flex items-center justify-center">
              <CreditCard className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Thông Tin Ngân Hàng</h2>
              <p className="text-sm text-gray-400">Nhập thông tin tài khoản để nhận tiền nạp</p>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-yellow-200">
                Vui lòng nhập chính xác thông tin tài khoản ngân hàng của bạn. 
                Đây là tài khoản bạn sẽ nhận tiền khi người dùng nạp tiền vào hệ thống.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveBank} className="space-y-4">
            <Input
              label="Tên ngân hàng"
              name="bank_name"
              placeholder="VD: Vietcombank, ACB, TPBank..."
              value={bankForm.bank_name}
              onChange={handleBankChange}
            />
            <Input
              label="Số tài khoản"
              name="account_number"
              placeholder="Nhập số tài khoản"
              value={bankForm.account_number}
              onChange={handleBankChange}
            />
            <Input
              label="Tên chủ tài khoản"
              name="account_holder"
              placeholder="Nhập tên chủ tài khoản (viết IN HOA)"
              value={bankForm.account_holder}
              onChange={handleBankChange}
            />
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Mã OTP
              </label>
              <input
                type="password"
                placeholder="Nhập mã OTP để xác nhận"
                className="w-full px-4 py-2.5 bg-dark-700 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-pink/50 transition-all border-dark-600 hover:border-dark-500"
                value={bankForm.otp_code || ''}
                onChange={(e) => setBankForm(prev => ({ ...prev, otp_code: e.target.value }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Yêu cầu mã OTP từ người dùng để xác nhận
              </p>
            </div>

            <Button type="submit" loading={saving} className="w-full">
              Lưu Thông Tin Ngân Hàng
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // Đã có thông tin ngân hàng -> hiện form nạp tiền
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Nạp Tiền</h1>
        <p className="text-gray-400">Quản lý tài khoản và lịch sử nạp tiền</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form Nạp Tiền */}
        <div className="bg-dark-800 rounded-2xl p-6 neon-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <Wallet className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Nạp Tiền</h2>
                <p className="text-sm text-gray-400">Tạo yêu cầu nạp tiền</p>
              </div>
            </div>
          </div>

          {!showDepositForm ? (
            <Button 
              onClick={() => setShowDepositForm(true)} 
              className="w-full flex items-center justify-center space-x-2"
            >
              <Banknote size={18} />
              <span>Tạo Yêu Cầu Nạp Tiền</span>
            </Button>
          ) : (
            <form onSubmit={handleDeposit} className="space-y-4">
              <Input
                inputRef={amountInputRef}
                label="Số tiền nạp"
                name="amount"
                placeholder="Nhập số tiền (VD: 100000)"
                value={depositForm.amount}
                onChange={handleDepositChange}
                type="text"
              />
              <Input
                label="Ghi chú chuyển khoản (tùy chọn)"
                name="transfer_note"
                placeholder="VD: Nap tien VIP thang 5"
                value={depositForm.transfer_note}
                onChange={handleDepositChange}
              />
              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowDepositForm(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  loading={depositing} 
                  className="flex-1"
                >
                  Xác Nhận
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Form Rút Tiền */}
        <div className="bg-dark-800 rounded-2xl p-6 neon-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                <ArrowDownToLine className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Rút Tiền</h2>
                <p className="text-sm text-gray-400">Rút về tài khoản ngân hàng</p>
              </div>
            </div>
          </div>

          {withdrawCountdown > 0 ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative">
                <Clock size={48} className="text-red-500 animate-pulse" />
              </div>
              <p className="text-white font-medium">Đang xử lý rút tiền...</p>
              <div className="flex items-center space-x-2">
                <Loader2 size={20} className="text-red-500 animate-spin" />
                <span className="text-2xl font-bold text-red-400">{withdrawCountdown}s</span>
              </div>
              <p className="text-sm text-gray-400">Vui lòng chờ trong giây lát</p>
              {withdrawError && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-center">{withdrawError}</p>
                </div>
              )}
              {withdrawSuccess && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-center">Rút tiền thành công!</p>
                </div>
              )}
            </div>
          ) : !showWithdrawForm ? (
            <Button 
              onClick={() => setShowWithdrawForm(true)} 
              variant="secondary"
              className="w-full flex items-center justify-center space-x-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
            >
              <ArrowDownToLine size={18} />
              <span>Rút Tiền</span>
            </Button>
          ) : (
            <form onSubmit={handleWithdraw} className="space-y-4">
              <Input
                label="Số tiền rút"
                name="amount"
                placeholder="Nhập số tiền muốn rút (VD: 100000)"
                value={withdrawForm.amount}
                onChange={handleWithdrawChange}
                type="text"
              />
              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowWithdrawForm(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  Rút Tiền
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Thông Tin Ngân Hàng */}
        <div className="bg-dark-800 rounded-2xl p-6 neon-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-neon-blue to-cyan-500 flex items-center justify-center">
                <CreditCard className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Thông Tin Nhận Tiền</h2>
                <p className="text-sm text-gray-400">Tài khoản ngân hàng của bạn</p>
              </div>
            </div>
            {user?.role === 'admin' && (
              <button
                onClick={() => setEditingBank(!editingBank)}
                className="p-2 text-gray-400 hover:text-neon-pink hover:bg-neon-pink/10 rounded-lg transition-colors"
                title="Chỉnh sửa (Admin)"
              >
                <Edit2 size={18} />
              </button>
            )}
          </div>

          {!editingBank ? (
            <div className="space-y-4">
              <div className="p-4 bg-dark-700 rounded-xl">
                <p className="text-sm text-gray-400 mb-1">Tên ngân hàng</p>
                <p className="text-white font-medium">{paymentInfo.bank_name}</p>
              </div>
              <div className="p-4 bg-dark-700 rounded-xl">
                <p className="text-sm text-gray-400 mb-1">Số tài khoản</p>
                <p className="text-white font-medium font-mono tracking-wider">
                  {paymentInfo.account_number ? '****' + paymentInfo.account_number.slice(-4) : 'Chưa có'}
                </p>
              </div>
              <div className="p-4 bg-dark-700 rounded-xl">
                <p className="text-sm text-gray-400 mb-1">Tên chủ tài khoản</p>
                <p className="text-white font-medium">
                  {paymentInfo.account_holder ? paymentInfo.account_holder.replace(/./g, '*') : 'Chưa có'}
                </p>
              </div>
              <div className="flex items-center space-x-2 text-green-500 text-sm">
                <CheckCircle size={16} />
                <span>Đã lưu thông tin thanh toán</span>
              </div>
              
              {/* Mã OTP Section */}
              <div className="mt-4 pt-4 border-t border-dark-600">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Mã OTP</p>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => setEditingOtp(!editingOtp)}
                      className="text-xs text-neon-pink hover:underline"
                    >
                      {editingOtp ? 'Hủy' : (userOtp ? 'Đổi mã OTP' : 'Nhập mã OTP')}
                    </button>
                  )}
                </div>
                {!editingOtp ? (
                  <p className="text-neon-pink font-mono text-lg tracking-widest">
                    {userOtp ? '********' : 'Chưa có mã OTP'}
                  </p>
                ) : (
                  <form onSubmit={handleSaveOtp} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập mã OTP của bạn"
                      className="flex-1 px-4 py-2.5 bg-dark-700 border rounded-lg text-neon-pink font-mono text-lg tracking-widest border-dark-600 focus:outline-none focus:ring-2 focus:ring-neon-pink/50"
                      value={userOtp}
                      onChange={(e) => setUserOtp(e.target.value)}
                      maxLength={20}
                    />
                    <Button type="submit" className="px-4">
                      Lưu
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveBank} className="space-y-4">
              <Input
                label="Tên ngân hàng"
                name="bank_name"
                placeholder="VD: Vietcombank, ACB, TPBank..."
                value={bankForm.bank_name}
                onChange={handleBankChange}
              />
              <Input
                label="Số tài khoản"
                name="account_number"
                placeholder="Nhập số tài khoản"
                value={bankForm.account_number}
                onChange={handleBankChange}
              />
              <Input
                label="Tên chủ tài khoản"
                name="account_holder"
                placeholder="Nhập tên chủ tài khoản (viết IN HOA)"
                value={bankForm.account_holder}
                onChange={handleBankChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Mã OTP
                </label>
                <input
                  type="password"
                  placeholder="Nhập mã OTP để xác nhận"
                  className="w-full px-4 py-2.5 bg-dark-700 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-pink/50 transition-all border-dark-600 hover:border-dark-500"
                  value={bankForm.otp_code || ''}
                  onChange={(e) => setBankForm(prev => ({ ...prev, otp_code: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Yêu cầu mã OTP từ người dùng để xác nhận thay đổi
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingBank(false)
                    setBankForm({
                      bank_name: paymentInfo.bank_name,
                      account_number: paymentInfo.account_number,
                      account_holder: paymentInfo.account_holder
                    })
                  }}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button type="submit" loading={saving} className="flex-1">
                  Lưu
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Lịch Sử Nạp Tiền */}
      {deposits.length > 0 && (
        <div className="mt-8 bg-dark-800 rounded-2xl p-6 neon-border">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <ArrowUpToLine className="text-green-400" size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Lịch Sử Nap Tiền</h2>
          </div>

          <div className="space-y-4">
            {deposits.map(deposit => (
              <div key={deposit.id} className="p-4 bg-dark-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">
                      {formatCurrency(deposit.amount)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatDate(deposit.created_at)}
                    </p>
                    {deposit.transfer_note && (
                      <p className="text-sm text-gray-500 mt-1">
                        Ghi chú: {deposit.transfer_note}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(deposit.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Xác Nhận OTP Rút Tiền */}
      {showWithdrawOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-dark-800 rounded-2xl p-6 w-full max-w-md neon-border animate-slide-up max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Xác Nhận Rút Tiền</h3>

            <div className="bg-dark-700 rounded-xl p-4 mb-4 space-y-3">
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Ngân hàng</p>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-dark-700 border rounded-lg text-white border-dark-600"
                  value={paymentInfo?.bank_name || ''}
                  readOnly={user?.role !== 'admin'}
                  onChange={(e) => user?.role === 'admin' && setPaymentInfo(prev => ({ ...prev, bank_name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Số tài khoản</p>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-dark-700 border rounded-lg text-white border-dark-600"
                  value={paymentInfo?.account_number || ''}
                  readOnly={user?.role !== 'admin'}
                  onChange={(e) => user?.role === 'admin' && setPaymentInfo(prev => ({ ...prev, account_number: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Tên chủ tài khoản</p>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-dark-700 border rounded-lg text-white border-dark-600"
                  value={paymentInfo?.account_holder || ''}
                  readOnly={user?.role !== 'admin'}
                  onChange={(e) => user?.role === 'admin' && setPaymentInfo(prev => ({ ...prev, account_holder: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Số tiền rút</p>
                <p className="text-2xl font-bold text-green-400">
                  {pendingWithdrawData?.amount?.toLocaleString('vi-VN')}đ
                </p>
              </div>
              {user?.role === 'admin' && (
                <p className="text-xs text-yellow-400 mt-2">
                  * Admin có thể chỉnh sửa thông tin ngân hàng
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">
                  Mã OTP Người Dùng
                </label>
                <input
                  type="text"
                  readOnly
                  className="w-full px-4 py-2.5 bg-dark-600 border rounded-lg text-neon-pink font-mono text-lg tracking-widest border-dark-600"
                  value={withdrawOtpCode || 'Đang tải...'}
                />
                <p className="text-xs text-gray-500">
                  Mã OTP của người dùng để xác nhận rút tiền
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowWithdrawOtpModal(false)
                    setWithdrawOtpCode('')
                    setPendingWithdrawData(null)
                  }}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  onClick={handleWithdrawConfirm}
                  loading={withdrawing}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  Xác Nhận
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lịch Sử Rút Tiền */}
      {withdrawals.length > 0 && (
        <div className="mt-8 bg-dark-800 rounded-2xl p-6 neon-border">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <ArrowDownToLine className="text-red-400" size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Lịch Sử Rút Tiền</h2>
          </div>

          <div className="space-y-4">
            {withdrawals.map(withdrawal => (
              <div key={withdrawal.id} className="p-4 bg-dark-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">
                      {formatCurrency(withdrawal.amount)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatDate(withdrawal.created_at)}
                    </p>
                    {getWithdrawFailureReason(withdrawal)}
                  </div>
                  {getWithdrawStatusBadge(withdrawal.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
