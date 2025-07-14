import { useState } from 'react'

// Sample mobile-optimized button component
const MobileButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  fullWidth = false,
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false)

  const baseClasses = 'font-semibold rounded-xl transition-all duration-200 touch-manipulation'
  
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white shadow-lg',
    secondary: 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 active:bg-blue-100',
  }
  
  const sizeClasses = {
    sm: 'py-2 px-4 text-sm min-h-[40px]',
    md: 'py-3 px-6 text-base min-h-[44px]',
    lg: 'py-4 px-8 text-lg min-h-[52px]',
  }
  
  const widthClasses = fullWidth ? 'w-full' : ''
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${disabledClasses}`}
      onClick={onClick}
      disabled={disabled}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      style={{
        transform: isPressed ? 'scale(0.98)' : 'scale(1)',
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export default MobileButton
