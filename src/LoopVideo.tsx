import { memo, useEffect, useRef } from 'react'

interface LoopVideoProps {
  src: string
  /** Versão menor do vídeo, usada em telas até 768px. */
  mobileSrc?: string
  /** Imagem exibida enquanto o vídeo não carrega (primeiro frame). */
  poster?: string
  ariaLabel?: string
}

const MOBILE_QUERY = '(max-width: 768px)'

function LoopVideo({ src, mobileSrc, poster, ariaLabel }: LoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const resolvedSrc = mobileSrc && window.matchMedia(MOBILE_QUERY).matches ? mobileSrc : src
    let isVisible = false
    let hasSource = video.getAttribute('src') === resolvedSrc

    video.muted = true
    video.loop = true
    video.playsInline = true

    const shouldPlay = () => isVisible && document.visibilityState === 'visible'

    const safePlay = () => {
      if (!hasSource || !shouldPlay()) return
      video.play().catch(() => {})
    }

    // O arquivo só começa a baixar quando o vídeo chega perto da tela,
    // e o vídeo pausa (para de decodificar) quando sai dela.
    const sync = () => {
      if (shouldPlay()) {
        if (!hasSource) {
          hasSource = true
          video.src = resolvedSrc
        }
        safePlay()
      } else if (!video.paused) {
        video.pause()
      }
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        sync()
      },
      { rootMargin: '200px 0px' },
    )

    observer.observe(video)
    video.addEventListener('pause', resumeIfPaused)
    video.addEventListener('stalled', resumeIfPaused)
    video.addEventListener('waiting', resumeIfPaused)
    video.addEventListener('suspend', resumeIfPaused)
    video.addEventListener('ended', restartVideo)
    video.addEventListener('canplay', safePlay)
    document.addEventListener('visibilitychange', sync)

    return () => {
      observer.disconnect()
      video.removeEventListener('pause', resumeIfPaused)
      video.removeEventListener('stalled', resumeIfPaused)
      video.removeEventListener('waiting', resumeIfPaused)
      video.removeEventListener('suspend', resumeIfPaused)
      video.removeEventListener('ended', restartVideo)
      video.removeEventListener('canplay', safePlay)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [src, mobileSrc])

  return (
    <video
      ref={videoRef}
      loop
      muted
      playsInline
      preload="none"
      poster={poster}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    />
  )
}

export default memo(LoopVideo)
