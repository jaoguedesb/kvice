import { useEffect, useRef, useState } from 'react'

const TRACK = {
  title: 'Ayo Technology',
  artist: '50 Cent ft. Justin Timberlake — KVICE & Jaison Silva Remix',
  src: '/track.mp3',
}

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const frameRef = useRef<number | null>(null)
  const beatRef = useRef(0)
  const energyRef = useRef(0)
  const dropRef = useRef(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showHint, setShowHint] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)

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

  // Autoplay no mount (mudo, pra navegador deixar)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 0.7
    audio.muted = true

    const tryPlay = async () => {
      try {
        await audio.play()
        setIsPlaying(true)
      } catch {
        // Se falhar, espera primeira interação do usuário pra tentar de novo
        const onFirst = async () => {
          try {
            await audio.play()
            setIsPlaying(true)
          } catch {}
          window.removeEventListener('click', onFirst)
          window.removeEventListener('touchstart', onFirst)
          window.removeEventListener('keydown', onFirst)
        }
        window.addEventListener('click', onFirst, { once: true })
        window.addEventListener('touchstart', onFirst, { once: true })
        window.addEventListener('keydown', onFirst, { once: true })
      }
    }
    tryPlay()
  }, [])

  // Esconde o hint depois que usuário ativa som ou após 8s
  useEffect(() => {
    if (hasInteracted) {
      setShowHint(false)
      return
    }
    const timer = setTimeout(() => setShowHint(false), 8000)
    return () => clearTimeout(timer)
  }, [hasInteracted])

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
        setIsPlaying(true)
      } catch {}
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    const audio = audioRef.current
    if (!audio) return
    setHasInteracted(true)
    audio.muted = !audio.muted
    setIsMuted(audio.muted)
    // Se o som tava mudo e ele clicou, garante que está tocando
    if (!audio.muted && audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  return (
    <div className={`player ${isPlaying && !isMuted ? 'is-playing' : ''}`}>
      <audio ref={audioRef} src={TRACK.src} loop preload="auto" />

      <button
        className={`player-btn ${isPlaying ? 'playing' : ''}`}
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pausar' : 'Tocar'}
      >
        {isPlaying ? (
          <svg viewBox="0 0 14 14"><rect x="2" y="1" width="3" height="12" /><rect x="9" y="1" width="3" height="12" /></svg>
        ) : (
          <svg viewBox="0 0 14 14"><polygon points="2,1 13,7 2,13" /></svg>
        )}
      </button>

      <div className="player-info">
        <div className="player-title">{TRACK.title}</div>
        <div className="player-artist">{TRACK.artist}</div>
      </div>

      <div className="player-eq" aria-hidden="true">
        <span></span><span></span><span></span><span></span>
      </div>

      <button
        className="player-mute"
        onClick={toggleMute}
        aria-label={isMuted ? 'Ativar som' : 'Mutar'}
      >
        {isMuted ? (
          <svg viewBox="0 0 14 14"><path d="M7 2 L4 5 H1 V9 H4 L7 12 V2 Z M9 5 L13 9 M13 5 L9 9" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" /></svg>
        ) : (
          <svg viewBox="0 0 14 14"><path d="M7 2 L4 5 H1 V9 H4 L7 12 V2 Z" /><path d="M10 4 Q12 7 10 10 M11.5 2.5 Q14 7 11.5 11.5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" /></svg>
        )}
      </button>

      {showHint && isMuted && (
        <div className="player-unmute-hint">► TAP PARA SOM</div>
      )}
    </div>
  )
}
