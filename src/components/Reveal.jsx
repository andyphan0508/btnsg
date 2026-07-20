import { useEffect, useRef, useState } from 'react'

/** Fade-up-on-scroll wrapper; renders instantly when reduced motion is on. */
export default function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
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
      // Reveal once the element has entered (or passed) the viewport, so fast
      // scrolling can never leave an element permanently hidden above the fold.
      if (el.getBoundingClientRect().top < window.innerHeight * 0.95) reveal()
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
        { rootMargin: '0px 0px -8% 0px' },
      )
      io.observe(el)
    }
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check, { passive: true })
    check()

    return cleanup
  }, [])

  return (
    <Tag ref={ref} className={`rv${shown ? ' in' : ''}${className ? ' ' + className : ''}`} {...rest}>
      {children}
    </Tag>
  )
}
