import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { FireOverlayProps } from '../types/overlays'

const FireOverlay = memo(function FireOverlay({ visible }: FireOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fire-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="fire-video-wrapper"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <video
              className="fire-video"
              autoPlay
              muted
              playsInline
              preload="none"
            >
              <source src="/videos/fire-celebration.mp4" type="video/mp4" />
            </video>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

export default FireOverlay
