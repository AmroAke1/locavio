import PropTypes from 'prop-types'
import { Star } from 'lucide-react'

function StarRating({ rating, maxRating = 5, onChange }) {
  return (
    <div className="flex items-center gap-0.5" role={onChange ? 'radiogroup' : 'img'} aria-label={`Rating: ${rating} out of ${maxRating}`}>
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < rating
        return onChange ? (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            aria-label={`Rate ${i + 1} out of ${maxRating}`}
            className="focus:outline-none"
          >
            <Star
              size={18}
              className={filled ? 'text-accent fill-accent' : 'text-muted'}
            />
          </button>
        ) : (
          <Star
            key={i}
            size={16}
            className={filled ? 'text-accent fill-accent' : 'text-muted'}
          />
        )
      })}
    </div>
  )
}

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  maxRating: PropTypes.number,
  onChange: PropTypes.func,
}

export default StarRating
