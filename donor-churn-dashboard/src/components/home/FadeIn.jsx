/**
 * FadeIn — whileInView 페이드 래퍼
 */
import { motion } from 'framer-motion'

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 28,
  className = '',
  as = 'div',
}) {
  const Comp = motion[as] || motion.div
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </Comp>
  )
}
