import PropTypes from 'prop-types'

const variantClasses = {
  default: 'bg-accent text-espresso',
  success: 'bg-success text-white',
  warning: 'bg-yellow-500 text-white',
  danger: 'bg-danger text-white',
  muted: 'bg-muted text-white',
}

function Badge({ children, variant = 'default' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  )
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'danger', 'muted']),
}

export default Badge
