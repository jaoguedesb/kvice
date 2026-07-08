import { memo, useEffect, useRef } from 'react'

interface LoopVideoProps {
  src: string
  ariaLabel?: string
}

function LoopVideo({ src, ariaLabel }: LoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const isVisibleRef = useRef(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.autoplay = true
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.preload = 'auto'

    const shouldPlay = () => isVisibleRef.current && document.visibilityState === 'visible'

    const safePlay = () => {
      if (!shouldPlay()) return
      video.play().catch(() => {})
    }

    const restartVideo = () => {
      if (!shouldPlay()) return
      video.currentTime = 0
      safePlay()
    }

    const resumeIfPaused = () => {
      if (!video.paused) return
      safePlay()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        safePlay()
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting

        if (entry.isIntersecting) {
          safePlay()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(video)
    video.addEventListener('pause', resumeIfPaused)
    video.addEventListener('stalled', resumeIfPaused)
    video.addEventListener('waiting', resumeIfPaused)
    video.addEventListener('suspend', resumeIfPaused)
    video.addEventListener('ended', restartVideo)
    video.addEventListener('canplay', safePlay)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    safePlay()

    return () => {
      observer.disconnect()
      video.removeEventListener('pause', resumeIfPaused)
      video.removeEventListener('stalled', resumeIfPaused)
      video.removeEventListener('waiting', resumeIfPaused)
      video.removeEventListener('suspend', resumeIfPaused)
      video.removeEventListener('ended', restartVideo)
      video.removeEventListener('canplay', safePlay)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    />
  )
}

export default memo(LoopVideo)
