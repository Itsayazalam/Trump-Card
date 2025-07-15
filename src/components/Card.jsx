import { SUIT_SYMBOLS, SUIT_COLORS } from '../utils/gameConstants'

function Card({ 
  card, 
  onClick, 
  isPlayable = true, 
  isSelected = false, 
  size = 'md',
  showBack = false 
}) {
  if (!card && !showBack) return null

  const sizeClasses = {
    sm: 'w-12 h-16 text-xs',
    md: 'w-16 h-24 text-sm',
    lg: 'w-20 h-30 text-base',
    xl: 'w-24 h-36 text-lg'
  }

  const handleClick = () => {
    if (isPlayable && onClick && card) {
      onClick(card)
    }
  }

  if (showBack) {
    return (
      <div className={`${sizeClasses[size]} bg-blue-600 rounded-lg border-2 border-blue-700 flex items-center justify-center cursor-default shadow-md`}>
        <div className="text-white text-2xl">🎴</div>
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      className={`
        ${sizeClasses[size]} 
        bg-white rounded-lg border-2 shadow-md flex flex-col items-center justify-between p-1 transition-all duration-200
        ${isPlayable && onClick ? 'cursor-pointer hover:shadow-lg active:scale-95' : 'cursor-default'}
        ${isSelected ? 'border-blue-500 bg-blue-50 transform -translate-y-2 -scale-105' : 'border-gray-300'}
        ${!isPlayable ? 'opacity-50' : ''}
      `}
    >
      {/* Top corner */}
      <div className={`self-start ${SUIT_COLORS[card.suit]} font-bold leading-none`}>
        <div className="text-center">
          <div>{card.value}</div>
          <div className="text-xs">{SUIT_SYMBOLS[card.suit]}</div>
        </div>
      </div>

      {/* Center symbol
      <div className={`${SUIT_COLORS[card.suit]} text-2xl`}>
        {SUIT_SYMBOLS[card.suit]}
      </div> */}

      <div className={`self-end transform rotate-180 ${SUIT_COLORS[card.suit]} font-bold leading-none`}>
        <div className="text-center">
          <div>{card.value}</div>
          <div className="text-xs">{SUIT_SYMBOLS[card.suit]}</div>
        </div>
      </div>
    </div>
  )
}

export default Card
