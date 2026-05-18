export default function Textarea({ 
  label, 
  error, 
  className = '', 
  ...props 
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-2.5 bg-dark-700 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-pink/50 transition-all resize-none ${
          error ? 'border-red-500' : 'border-dark-600 hover:border-dark-500'
        }`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
