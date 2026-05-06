import { memo } from 'react'

const BackgroundVideo = memo(function BackgroundVideo() {
  return (
    <>
      {/* Background video */}
      <video
        className="bg-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/videos/bg-coals.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlays */}
      <div className="bg-overlay-gradient-vertical" />
      <div className="bg-overlay-gradient-radial" />
    </>
  )
})

export default BackgroundVideo
