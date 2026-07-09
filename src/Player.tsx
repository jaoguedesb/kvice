import { type CSSProperties, type MouseEvent, useEffect, useRef, useState } from 'react'

interface PlayerTrack {
  id?: string
  order?: number
  title: string
  subtitle: string
  audioUrl: string
}

interface PlayerProps {
  track: PlayerTrack
  isPlaying: boolean
  onPlayingChange: (isPlaying: boolean) => void
  onNext: () => void
  onPrevious: () => void
}

const formatTime = (time: number) => {
  if (!Number.isFinite(time)) return '0:00'

  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export default function Player({
  track,
  isPlaying,
  onPlayingChange,
  onNext,
  onPrevious,
}: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const frameRef = useRef<number | null>(null)
  const beatRef = useRef(0)
  const energyRef = useRef(0)
  const dropRef = useRef(0)
  const [isMuted, setIsMuted] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isPlayerCollapsed, setIsPlayerCollapsed] = useState(false)
  const trackKey = track.id ?? String(track.order ?? track.title)

  const ensureAudioAnalyser = async () => {
    const audio = audioRef.current
    if (!audio) return null

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 128
      analyserRef.current.smoothingTimeConstant = 0.72
      dataRef.current = new Uint8Array(analyserRef.current.frequencyBinCount)
    }

    if (!sourceRef.current && analyserRef.current && audioContextRef.current) {
      sourceRef.current = audioContextRef.current.createMediaElementSource(audio)
      sourceRef.current.connect(analyserRef.current)
      analyserRef.current.connect(audioContextRef.current.destination)
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }

    return analyserRef.current
  }

  const stopBeatAnimation = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
    beatRef.current = 0
    energyRef.current = 0
    dropRef.current = 0
    document.body.classList.remove('audio-reactive-active')
    document.documentElement.style.setProperty('--beat', '0')
    document.documentElement.style.setProperty('--beat-low', '0')
    document.documentElement.style.setProperty('--beat-mid', '0')
    document.documentElement.style.setProperty('--drop', '0')
  }

  const startBeatAnimation = async () => {
    const analyser = await ensureAudioAnalyser()
    const data = dataRef.current
    if (!analyser || !data || frameRef.current) return

    document.body.classList.add('audio-reactive-active')

    const tick = () => {
      analyser.getByteFrequencyData(data)

      const average = (from: number, to: number) => {
        let total = 0
        const end = Math.min(to, data.length)
        for (let i = from; i < end; i += 1) total += data[i]
        return total / Math.max(1, end - from) / 255
      }

      const low = average(1, 12)
      const mid = average(12, 36)
      const high = average(36, data.length)
      const beat = Math.min(1, low * 1.35 + mid * 0.35)
      const energy = Math.min(1, low * 0.58 + mid * 0.3 + high * 0.12)
      const impact = Math.max(0, energy - energyRef.current - 0.08)

      beatRef.current = beatRef.current * 0.68 + beat * 0.32
      energyRef.current = energyRef.current * 0.9 + energy * 0.1
      dropRef.current = Math.max(dropRef.current * 0.82, Math.min(1, impact * 7.5))

      document.documentElement.style.setProperty('--beat', beatRef.current.toFixed(3))
      document.documentElement.style.setProperty('--beat-low', low.toFixed(3))
      document.documentElement.style.setProperty('--beat-mid', mid.toFixed(3))
      document.documentElement.style.setProperty('--drop', dropRef.current.toFixed(3))
      frameRef.current = requestAnimationFrame(tick)
    }

    tick()
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = volume
    audio.muted = isMuted
  }, [volume, isMuted])

  useEffect(() => {
    if (hasInteracted) {
      setShowHint(false)
      return
    }
    const timer = setTimeout(() => setShowHint(false), 8000)
    return () => clearTimeout(timer)
  }, [hasInteracted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    setCurrentTime(0)
    setDuration(0)
    audio.load()

    if (isPlaying) {
      audio.play().catch(() => onPlayingChange(false))
    }
  }, [trackKey, track.audioUrl])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration || 0)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('durationchange', updateDuration)
    audio.addEventListener('ended', onNext)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('durationchange', updateDuration)
      audio.removeEventListener('ended', onNext)
    }
  }, [onNext, trackKey])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying && audio.paused) {
      audio.play().catch(() => onPlayingChange(false))
    }

    if (!isPlaying && !audio.paused) {
      audio.pause()
    }
  }, [isPlaying, onPlayingChange])

  useEffect(() => {
    if (isPlaying && !isMuted) {
      startBeatAnimation()
    } else {
      stopBeatAnimation()
    }

    return stopBeatAnimation
  }, [isPlaying, isMuted])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    setHasInteracted(true)
    if (audio.paused) {
      try {
        await audio.play()
        onPlayingChange(true)
      } catch {}
    } else {
      audio.pause()
      onPlayingChange(false)
    }
  }

  const toggleMute = (e: MouseEvent) => {
    e.stopPropagation()
    const audio = audioRef.current
    if (!audio) return
    setHasInteracted(true)
    audio.muted = !audio.muted
    setIsMuted(audio.muted)
  }

  const seekTo = (value: string) => {
    const audio = audioRef.current
    if (!audio) return

    const nextTime = Number(value)
    audio.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const changeVolume = (value: string) => {
    const audio = audioRef.current
    const nextVolume = Number(value)

    setVolume(nextVolume)

    if (!audio) return

    audio.volume = nextVolume
    audio.muted = nextVolume === 0
    setIsMuted(audio.muted)
    setHasInteracted(true)
  }

  return (
    <>
    <div className={`player ${isPlaying && !isMuted ? 'is-playing' : ''} ${isPlayerCollapsed ? 'is-collapsed' : ''}`}>
      <audio ref={audioRef} src={track.audioUrl} preload="auto" />

      <div className="player-track">
        <div className="player-title-eq" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <div className="player-info">
          <div className="player-title">{track.title}</div>
          <div className="player-artist">{track.subtitle}</div>
        </div>
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button
            className="player-skip"
            onClick={onPrevious}
            aria-label="Música anterior"
            type="button"
          >
            <svg viewBox="0 0 18 18"><path d="M4 3 H6 V15 H4 Z M7 9 L15 3.8 V14.2 Z" /></svg>
          </button>

          <button
            className={`player-btn ${isPlaying ? 'playing' : ''}`}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar' : 'Tocar'}
            type="button"
          >
            {isPlaying ? (
              <svg viewBox="0 0 14 14"><rect x="2" y="1" width="3" height="12" /><rect x="9" y="1" width="3" height="12" /></svg>
            ) : (
              <svg viewBox="0 0 14 14"><polygon points="2,1 13,7 2,13" /></svg>
            )}
          </button>

          <button
            className="player-skip"
            onClick={onNext}
            aria-label="Próxima música"
            type="button"
          >
            <svg viewBox="0 0 18 18"><path d="M3 3.8 L11 9 L3 14.2 Z M12 3 H14 V15 H12 Z" /></svg>
          </button>
        </div>

        <div className="player-progress-wrap">
          <span className="player-time">{formatTime(currentTime)}</span>
          <input
            className="player-progress"
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => seekTo(event.target.value)}
            aria-label="Progresso da música"
            style={{ '--progress': `${duration ? (currentTime / duration) * 100 : 0}%` } as CSSProperties}
          />
          <span className="player-time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-side">
        <div className="player-eq" aria-hidden="true">
          <span></span><span></span><span></span><span></span>
        </div>

        <button
          className="player-mute"
          onClick={toggleMute}
          aria-label={isMuted ? 'Ativar som' : 'Mutar'}
          type="button"
        >
          {isMuted ? (
            <svg viewBox="0 0 14 14"><path d="M7 2 L4 5 H1 V9 H4 L7 12 V2 Z M9 5 L13 9 M13 5 L9 9" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" /></svg>
          ) : (
            <svg viewBox="0 0 14 14"><path d="M7 2 L4 5 H1 V9 H4 L7 12 V2 Z" /><path d="M10 4 Q12 7 10 10 M11.5 2.5 Q14 7 11.5 11.5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" /></svg>
          )}
        </button>

        <input
          className="player-volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(event) => changeVolume(event.target.value)}
          aria-label="Volume"
          style={{ '--volume': `${(isMuted ? 0 : volume) * 100}%` } as CSSProperties}
        />

        <button
          className="player-collapse"
          onClick={() => setIsPlayerCollapsed(true)}
          aria-label="Minimizar player"
          type="button"
        >
          <svg viewBox="0 0 16 16"><path d="M3.2 5.4 L8 10.2 L12.8 5.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      {showHint && isMuted && (
        <div className="player-unmute-hint">► TAP PARA SOM</div>
      )}
    </div>

    <button
      className={`player-expand ${isPlayerCollapsed ? 'is-visible' : ''}`}
      onClick={() => setIsPlayerCollapsed(false)}
      aria-label="Expandir player"
      type="button"
    >
      <svg viewBox="0 0 16 16"><path d="M3.2 10.6 L8 5.8 L12.8 10.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      PLAYER
    </button>
    </>
  )
}
