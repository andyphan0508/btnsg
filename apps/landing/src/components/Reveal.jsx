import { motion, useReducedMotion } from 'motion/react'

const VARIANTS = {
  'slide-up': {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  },
  'slide-down': {
    hidden: { opacity: 0, y: -16 },
    visible: { opacity: 1, y: 0 },
  },
  'slide-left': {
    hidden: { opacity: 0, x: 16 },
    visible: { opacity: 1, x: 0 },
  },
  'slide-right': {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0 },
  },
  'scale-up': {
    hidden: { opacity: 0, scale: 0.96, y: 12 },
    visible: { opacity: 1, scale: 1, y: 0 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
}

/**
 * Reveal: Hoạt ảnh hiển thị nhẹ nhàng khi cuộn tới vị trí phần tử.
 * Tự động hiển thị ngay (không bị ẩn) với độ nhạy cao (amount: 0.01).
 */
export default function Reveal({
  as: Component = 'div',
  className = '',
  children,
  variant = 'slide-up',
  delay = 0,
  duration = 0.45,
  viewport = { once: true, amount: 0.01 },
  whileHover,
  whileTap,
  style,
  ...rest
}) {
  const shouldReduceMotion = useReducedMotion()

  const MotionComponent = typeof Component === 'string'
    ? (motion[Component] || motion.div)
    : motion.create(Component)

  const selectedVariant = VARIANTS[variant] || VARIANTS['slide-up']

  const transition = {
    duration: shouldReduceMotion ? 0 : duration,
    delay: shouldReduceMotion ? 0 : (typeof delay === 'number' ? delay / 1000 : 0),
    ease: [0.22, 1, 0.36, 1],
  }

  if (shouldReduceMotion) {
    const Tag = Component
    return (
      <Tag className={className} style={style} {...rest}>
        {children}
      </Tag>
    )
  }

  return (
    <MotionComponent
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={selectedVariant}
      transition={transition}
      whileHover={whileHover}
      whileTap={whileTap}
      style={style}
      {...rest}
    >
      {children}
    </MotionComponent>
  )
}
