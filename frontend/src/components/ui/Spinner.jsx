import PropTypes from 'prop-types'

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-7 h-7 border-2',
  lg: 'w-12 h-12 border-4',
}

function Spinner({ size = 'md' }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${sizeMap[size]} rounded-full border-primary border-t-transparent animate-spin`}
    />
  )
}

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
}

export default Spinner
