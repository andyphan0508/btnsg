import { useEffect, useRef, useState } from 'react'

/** Fade-up-on-scroll wrapper; renders instantly when reduced motion is on. */
export default function Reveal({
  as: Tag = 'div',
  className = '',
  children,
  variant = 'slide-up',
  delay,
  duration,
  style,
  ...rest
}) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }

    let io = null

    const reveal = () => {
      setShown(true)
      cleanup()
    }

    // Fallback for browsers/webviews that throttle IntersectionObserver.
    const check = () => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.98) reveal()
    }

    const cleanup = () => {
      io?.disconnect()
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }

    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((en) => en.isIntersecting)) reveal()
        },
        { rootMargin: '0px 0px -5% 0px' },
      )
      io.observe(el)
    }
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check, { passive: true })
    check()

    return cleanup
  }, [])

  const customStyle = {
    ...style,
    transitionDelay: delay ? `${delay}ms` : undefined,
    transitionDuration: duration ? `${duration}ms` : undefined,
  }

  const variantClass = `rv-${variant}`

  return (
    <Tag
      ref={ref}
      className={`rv ${variantClass}${shown ? ' in' : ''}${className ? ' ' + className : ''}`}
      style={customStyle}
      {...rest}
    >
      {children}
    </Tag>
  )
}
