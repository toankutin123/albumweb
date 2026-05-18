import { Crown, Clock, CheckCircle, XCircle } from 'lucide-react'

const statusConfig = {
  pending: {
    label: 'Đang chờ',
    icon: Clock,
    className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
  },
  approved: {
    label: 'Đã duyệt',
    icon: CheckCircle,
    className: 'bg-green-500/20 text-green-500 border-green-500/30'
  },
  rejected: {
    label: 'Từ chối',
    icon: XCircle,
    className: 'bg-red-500/20 text-red-500 border-red-500/30'
  }
}

export function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      <Icon size={12} />
      <span>{config.label}</span>
    </span>
  )
}

export function PremiumBadge() {
  return (
    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full premium-badge">
      <Crown size={14} />
      <span className="text-sm font-medium">VIP</span>
    </div>
  )
}
