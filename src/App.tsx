import { type CSSProperties, useEffect, useState } from 'react'
import Trail from './Trail'
import Player from './Player'
import LoopVideo from './LoopVideo'

type EventStatus = 'confirmed' | 'sold_out' | 'soon' | 'cancelled'

interface ApiEvent {
  date: string
  title: string
  city: string
  country: string
  venue: string
  time: string
  ticketUrl: string
  status: EventStatus
}

interface TourEvent extends ApiEvent {
  day: string
  month: string
  infoLabel: string
}

type TrackPlatform = 'spotify' | 'soundcloud' | 'youtube' | 'bandcamp' | 'external'
type TrackFilter = TrackPlatform | 'all'
type TrackType = 'track' | 'set' | 'edit' | 'playlist'

interface MusicTrack {
  order: number
  title: string
  subtitle: string
  platform: TrackPlatform
  url: string
  embedUrl?: string
  active: boolean
  type?: TrackType
  audioUrl?: string
}

interface PlayerAudioTrack {
  order?: number
  title: string
  subtitle: string
  audioUrl: string
}

const EVENTS_API_URL = 'https://script.google.com/macros/s/AKfycbyRRr5GekQkb0ZRLwQ1JPkBSDAHfah1lhAP1UzkkeZJINQkdaLkUuzwaP4del1PVz5kZg/exec'
const MUSIC_API_URL = 'https://script.google.com/macros/s/AKfycbyRRr5GekQkb0ZRLwQ1JPkBSDAHfah1lhAP1UzkkeZJINQkdaLkUuzwaP4del1PVz5kZg/exec?sheet=musicas'

const defaultTrack: PlayerAudioTrack = {
  title: 'Ayo Technology',
  subtitle: '50 Cent ft. Justin Timberlake — KVICE & Jaison Silva Remix',
  audioUrl: '/track.mp3',
}

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' })

const parseEventDate = (date: string) => {
  const [year, month, day] = date.split('T')[0].split('-').map(Number)
  return new Date(year, month - 1, day)
}

const getToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

const getStatusLabel = (status: EventStatus) => {
  if (status === 'sold_out') return 'SOLD OUT'
  if (status === 'soon') return 'EM BREVE'
  return 'INGRESSOS'
}

const normalizeEvent = (event: ApiEvent): TourEvent => {
  const date = parseEventDate(event.date)

  return {
    ...event,
    day: String(date.getDate()).padStart(2, '0'),
    month: monthFormatter.format(date).replace('.', '').toUpperCase(),
    infoLabel: `${event.city} / ${event.country} — ${event.venue}${event.time ? ` — ${event.time}` : ''}`,
  }
}

const trackFilters: { value: TrackFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'spotify', label: 'Spotify' },
  { value: 'soundcloud', label: 'SoundCloud' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'bandcamp', label: 'Bandcamp' },
]

const getPlatformLabel = (platform: TrackPlatform) => {
  if (platform === 'spotify') return 'Spotify'
  if (platform === 'soundcloud') return 'SoundCloud'
  if (platform === 'youtube') return 'YouTube'
  if (platform === 'bandcamp') return 'Bandcamp'
  return 'Plataforma'
}

const getPlatformActionLabel = (platform: TrackPlatform) => {
  if (platform === 'spotify') return 'Ouvir no Spotify'
  if (platform === 'soundcloud') return 'Ouvir no SoundCloud'
  if (platform === 'youtube') return 'Assistir no YouTube'
  if (platform === 'bandcamp') return 'Ouvir no Bandcamp'
  return 'Ouvir na plataforma'
}

const toPlayerAudioTrack = (track: MusicTrack & { audioUrl: string }): PlayerAudioTrack => ({
  order: track.order,
  title: track.title,
  subtitle: track.subtitle,
  audioUrl: track.audioUrl,
})

const bioParagraphs = [
  'Kvice é DJ e produtor musical, natural de Macapá (AP), reconhecido por sets marcados por groove, identidade e uma leitura de pista precisa. Formado pela Groove DJs em 2024, transita entre Minimal Deep Tech, Tech House, House, Melodic House & Techno e Indie Dance, construindo apresentações envolventes e de alta energia.',
  'Ao longo de sua trajetória, já dividiu palco com Vintage Culture, Greggio, Bruno Be, Jord, Zuffo, Victor Lou, Bruna Strait, Zaark, Buja, Sterium e outros nomes da cena eletrônica nacional. Também marcou presença em eventos como Laje\'s Macapá, Réveillon da Fortaleza, Maly Club, Sky Experience e Expofeira.',
  'Com identidade musical em constante evolução, Kvice vem se consolidando como um dos nomes em ascensão da região Norte e uma promessa da nova geração da música eletrônica brasileira.',
]

const bioHighlights = [
  { value: 'Groove', label: 'Assinatura de pista' },
  { value: 'Norte', label: 'Raiz sonora' },
  { value: 'Live', label: 'Leitura do publico' },
  { value: 'Noite', label: 'Energia principal' },
]

const renderAnimatedText = (text: string) =>
  text.split('').map((char, index) => (
    <span
      className="bio-char"
      style={{ '--char-index': index } as CSSProperties}
      key={`${char}-${index}`}
    >
      {char === ' ' ? '\u00a0' : char}
    </span>
  ))

function App() {
  const [year] = useState(new Date().getFullYear())
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<PlayerAudioTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null)
  const [isLoadingTracks, setIsLoadingTracks] = useState(true)
  const [tracksError, setTracksError] = useState(false)
  const [activeFilter, setActiveFilter] = useState<TrackFilter>('all')
  const [events, setEvents] = useState<TourEvent[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [eventsError, setEventsError] = useState(false)
  const activeTracks = tracks.filter((track) => track.active)
  const filteredTracks = activeTracks.filter((track) => activeFilter === 'all' || track.platform === activeFilter)
  const playableTracks = activeTracks.filter((track): track is MusicTrack & { audioUrl: string } => Boolean(track.audioUrl))
  const currentTrack = selectedAudioTrack ?? defaultTrack

  useEffect(() => {
    const controller = new AbortController()

    const loadEvents = async () => {
      try {
        setIsLoadingEvents(true)
        setEventsError(false)

        const response = await fetch(EVENTS_API_URL, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Events request failed')
        }

        const data = (await response.json()) as ApiEvent[]
        const today = getToday()
        const visibleStatuses: EventStatus[] = ['confirmed', 'sold_out', 'soon']

        const upcomingEvents = data
          .filter((event) => visibleStatuses.includes(event.status))
          .filter((event) => parseEventDate(event.date) >= today)
          .sort((a, b) => parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime())
          .map(normalizeEvent)

        setEvents(upcomingEvents)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setEventsError(true)
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingEvents(false)
        }
      }
    }

    loadEvents()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const loadTracks = async () => {
      try {
        setIsLoadingTracks(true)
        setTracksError(false)

        const response = await fetch(MUSIC_API_URL, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Music request failed')
        }

        const data = (await response.json()) as MusicTrack[]
        const orderedTracks = data.sort((a, b) => a.order - b.order)

        setTracks(orderedTracks)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setTracksError(true)
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingTracks(false)
        }
      }
    }

    loadTracks()

    return () => controller.abort()
  }, [])

  const getTrackSibling = (direction: 1 | -1) => {
    const playlist = playableTracks.length > 0 ? playableTracks : []
    if (playlist.length === 0) return null

    const currentIndex = playlist.findIndex((track) => track.order === selectedAudioTrack?.order)
    const safeIndex = currentIndex === -1 ? 0 : currentIndex
    const nextIndex = (safeIndex + direction + playlist.length) % playlist.length

    return playlist[nextIndex]
  }

  const playTrack = (track: MusicTrack) => {
    setSelectedTrack(track)

    if (!track.audioUrl) {
      setIsPlaying(false)
      return
    }

    setSelectedAudioTrack(toPlayerAudioTrack({ ...track, audioUrl: track.audioUrl }))
    setIsPlaying(true)
  }

  const playNextTrack = () => {
    const nextTrack = getTrackSibling(1)
    if (!nextTrack) return

    setSelectedAudioTrack(toPlayerAudioTrack(nextTrack))
    setSelectedTrack(nextTrack)
    setIsPlaying(true)
  }

  const playPreviousTrack = () => {
    const previousTrack = getTrackSibling(-1)
    if (!previousTrack) return

    setSelectedAudioTrack(toPlayerAudioTrack(previousTrack))
    setSelectedTrack(previousTrack)
    setIsPlaying(true)
  }

  return (
    <>
      <Trail />
      <Player
        track={currentTrack}
        isPlaying={isPlaying}
        onPlayingChange={setIsPlaying}
        onNext={playNextTrack}
        onPrevious={playPreviousTrack}
      />
      <nav className="nav">
        <div className="nav-logo">
          KVICE<span className="dot"></span>
        </div>
        <div className="nav-links">
          <a href="#about">Bio</a>
          <a href="#shows">Shows</a>
          <a href="#tracks">Músicas</a>
          <a href="#booking">Contato</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <LoopVideo
            src="/unknown_2026.05.08-02.25_clip_1_clip_1.mp4"
            ariaLabel="KVICE live"
          />
        </div>

        <p className="hero-tagline">
          Underground sets &nbsp;//<br />
          electronic transmissions <br />
          from the north.
        </p>

        <div className="hero-content">
          <div className="hero-meta">
            <div className="hero-meta-block">
              <strong>DJ / PRODUCER</strong>
              Macapá — BR
            </div>
            <div className="hero-meta-block">
              <strong>SINCE 2019</strong>
              Now booking {year}/{year + 1}
            </div>
            <div className="hero-meta-block">
              <strong>LIVE</strong>
              Next level · rock it
            </div>
          </div>
          <h1 className="hero-title">
            <span className="beat-letter">K</span>
            <span className="beat-letter">V</span>
            <span className="beat-letter accent">i</span>
            <span className="beat-letter">C</span>
            <span className="beat-letter">E</span>
          </h1>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee">
        <div className="marquee-track">
          <span>
            HOUSE <span className="star">✺</span> TECHNO <span className="star">✺</span> AFRO HOUSE <span className="star">✺</span> ORGANIC <span className="star">✺</span> MELODIC <span className="star">✺</span> KVICE LIVE <span className="star">✺</span>
            HOUSE <span className="star">✺</span> TECHNO <span className="star">✺</span> AFRO HOUSE <span className="star">✺</span> ORGANIC <span className="star">✺</span> MELODIC <span className="star">✺</span> KVICE LIVE <span className="star">✺</span>
          </span>
        </div>
      </div>

      {/* ABOUT */}
      <section className="section" id="about">
        <div className="about">
          <div className="about-video-wrap">
            <p className="section-label">001 — Quem é</p>
            <div className="about-video">
              <LoopVideo src="/dj-loop.mp4" />
              <div className="about-video-overlay">
                <span className="live-tag">
                  <span className="live-dot"></span> LIVE LOOP
                </span>
              </div>
            </div>
          </div>
          <div className="about-text">
            {bioParagraphs.map((paragraph) => (
              <p className="bio-line" key={paragraph}>
                {renderAnimatedText(paragraph)}
              </p>
            ))}

            <div className="about-stats">
              {bioHighlights.map((item) => (
                <div key={item.value}>
                  <div className="stat-num">{item.value}</div>
                  <div className="stat-label">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SHOWS */}
      <section className="section shows" id="shows">
        <p className="section-label">002 — Shows</p>
        <h2 className="section-title">Próximas<br />Datas</h2>

        <div className="show-list">
          {isLoadingEvents && (
            <div className="show-row">
              <div className="show-venue">Carregando datas...</div>
            </div>
          )}

          {!isLoadingEvents && eventsError && (
            <div className="show-row">
              <div className="show-venue">Não foi possível carregar as próximas datas.</div>
            </div>
          )}

          {!isLoadingEvents && !eventsError && events.length === 0 && (
            <div className="show-row">
              <div className="show-venue">Nenhuma data confirmada no momento.</div>
            </div>
          )}

          {!isLoadingEvents && !eventsError && events.map((show) => {
            const hasTicketUrl = show.ticketUrl.trim().length > 0
            const ShowRowTag = hasTicketUrl ? 'a' : 'div'

            return (
            <ShowRowTag
              className="show-row"
              href={hasTicketUrl ? show.ticketUrl : undefined}
              target={hasTicketUrl ? '_blank' : undefined}
              rel={hasTicketUrl ? 'noreferrer' : undefined}
              key={`${show.date}-${show.venue}`}
            >
              <div className="show-date">
                {show.day}
                <small>{show.month}</small>
              </div>
              <div className="show-venue">{show.title}</div>
              <div className="show-city">{show.infoLabel}</div>
              <div className={`show-status ${show.status === 'sold_out' ? 'sold' : ''}`}>
                {getStatusLabel(show.status)}
              </div>
              <div className="show-arrow">→</div>
            </ShowRowTag>
            )
          })}
        </div>
      </section>

      {/* TRACKS */}
      <section className="section" id="tracks">
        <p className="section-label">003 — Músicas</p>
        <h2 className="section-title">Faixas<br />Selecionadas</h2>

        <div className="track-filters" aria-label="Filtrar músicas por plataforma">
          {trackFilters.map((filter) => (
            <button
              className={`track-filter ${activeFilter === filter.value ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              key={filter.value}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="tracks">
          {isLoadingTracks && (
            <div className="track track-message">
              <h3 className="track-title">Carregando faixas...</h3>
            </div>
          )}

          {!isLoadingTracks && tracksError && (
            <div className="track track-message">
              <h3 className="track-title">Não foi possível carregar as faixas.</h3>
            </div>
          )}

          {!isLoadingTracks && !tracksError && activeTracks.length === 0 && (
            <div className="track track-message">
              <h3 className="track-title">Nenhuma faixa disponível no momento.</h3>
            </div>
          )}

          {filteredTracks.map((track) => (
            <div
              className={`track ${selectedTrack?.order === track.order ? 'selected' : ''}`}
              key={`${track.order}-${track.title}`}
            >
              <div className="track-num">/ {String(track.order).padStart(2, '0')}</div>
              <div className={`track-platform ${track.platform}`}>
                {getPlatformLabel(track.platform)}
              </div>
              <h3 className="track-title">{track.title}</h3>
              <p className="track-meta">{track.subtitle}</p>
              <button
                className="track-play"
                type="button"
                onClick={() => playTrack(track)}
              >
                <span className="play-icon">▶</span>
                Listen
              </button>
            </div>
          ))}
        </div>

        {selectedTrack && (
          <div className="now-listening">
            <div className="now-listening-header">
              <p className="section-label">AGORA OUVINDO</p>
              <div className={`track-platform ${selectedTrack.platform}`}>
                {getPlatformLabel(selectedTrack.platform)}
              </div>
            </div>

            <div className="now-listening-body">
              <div>
                <h3 className="now-listening-title">{selectedTrack.title}</h3>
                <p className="now-listening-meta">{selectedTrack.subtitle}</p>
              </div>

              {selectedTrack.embedUrl ? (
                <div className="track-embed-wrap">
                  <iframe
                    className={`track-embed ${selectedTrack.platform}`}
                    src={selectedTrack.embedUrl}
                    title={`${selectedTrack.title} - ${getPlatformLabel(selectedTrack.platform)}`}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                  <p className="embed-volume-note">Volume controlado no player da plataforma.</p>
                </div>
              ) : (
                <a
                  className="platform-open"
                  href={selectedTrack.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {getPlatformActionLabel(selectedTrack.platform)}
                </a>
              )}
            </div>
          </div>
        )}
      </section>

      {/* BOOKING */}
      <section className="section booking" id="booking">
        <div className="booking-content">
          <p className="booking-label">004 — Contato</p>
          <h2 className="booking-title">Quer KVICE<br />no seu line-up?</h2>
          <a
            href="https://www.instagram.com/kvice_/"
            className="booking-instagram booking-instagram-main"
            target="_blank"
            rel="noreferrer"
          >
            @kvice_
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-logo">
            KVICE<span style={{ color: 'var(--acid)' }}>.</span>
          </div>
          <div className="footer-col">
            <h4>Navegar</h4>
            <a href="#about">Bio</a>
            <a href="#shows">Shows</a>
            <a href="#tracks">Músicas</a>
            <a href="#booking">Contato</a>
          </div>
          <div className="footer-col">
            <h4>Streaming</h4>
            <a href="https://open.spotify.com/intl-pt/artist/5TNOycf73vzlJe67BC1GoB?si=6O3XNTkuRBqziWkX9eE0nA" target="_blank" rel="noreferrer">Spotify</a>
            <a href="https://soundcloud.com/kvicew" target="_blank" rel="noreferrer">SoundCloud</a>
            <a href="https://music.apple.com/br/artist/kvice/1611941318" target="_blank" rel="noreferrer">Apple Music</a>
            <a href="https://www.youtube.com/@Kvice" target="_blank" rel="noreferrer">YouTube</a>
          </div>
          <div className="footer-col">
            <h4>Social</h4>
            <a href="https://www.instagram.com/kvice_/" target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {year} KVICE — Todos os direitos reservados</span>
          <span>Designed in BR · Built with ♪</span>
        </div>
      </footer>
    </>
  )
}

export default App
