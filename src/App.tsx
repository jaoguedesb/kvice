import { useState } from 'react'
import Trail from './Trail'
import Player from './Player'

interface Show {
  date: string
  month: string
  venue: string
  city: string
  status: 'available' | 'sold' | 'soon'
}

interface Track {
  id: string
  title: string
  meta: string
}

const shows: Show[] = [
  { date: '15', month: 'JUN', venue: 'Warehouse 47', city: 'São Paulo / BR', status: 'sold' },
  { date: '22', month: 'JUN', venue: 'Club Subsolo', city: 'Macapá / BR', status: 'available' },
  { date: '06', month: 'JUL', venue: 'Festival Sonora', city: 'Rio de Janeiro / BR', status: 'available' },
  { date: '20', month: 'JUL', venue: 'Galeria Underground', city: 'Brasília / BR', status: 'soon' },
  { date: '03', month: 'AUG', venue: 'Open Air Sessions', city: 'Florianópolis / BR', status: 'available' },
]

const tracks: Track[] = [
  { id: '01', title: 'Subsolo', meta: 'Original Mix · 2025' },
  { id: '02', title: 'Frequência Norte', meta: 'KVICE Edit · 2025' },
  { id: '03', title: 'Cintilante', meta: 'with Lua Mar · 2024' },
  { id: '04', title: 'Marés Baixas', meta: 'Original Mix · 2024' },
  { id: '05', title: 'Vermelho 909', meta: 'KVICE Edit · 2024' },
  { id: '06', title: 'Hora Azul', meta: 'Live Set Edit · 2023' },
]

function App() {
  const [year] = useState(new Date().getFullYear())

  return (
    <>
      <Trail />
      <Player />
      <nav className="nav">
        <div className="nav-logo">
          KVICE<span className="dot"></span>
        </div>
        <div className="nav-links">
          <a href="#about">Bio</a>
          <a href="#shows">Tour</a>
          <a href="#tracks">Sounds</a>
          <a href="#booking">Booking</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <video
            src="/unknown_2026.05.08-02.25_clip_1_clip_1.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-label="KVICE live"
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
              Next show · 15.06
            </div>
          </div>
          <h1 className="hero-title">
            KV<span className="accent">i</span>CE
          </h1>
        </div>

        <div className="scroll-cue">
          SCROLL
          <span className="line"></span>
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
              <video
                src="/dj-loop.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
              />
              <div className="about-video-overlay">
                <span className="live-tag">
                  <span className="live-dot"></span> LIVE LOOP
                </span>
              </div>
            </div>
          </div>
          <div className="about-text">
            <p>
              <strong>KVICE</strong> é DJ e produtor brasileiro, conhecido pelos sets que
              transitam entre <em>house</em>, techno e ritmos orgânicos — sempre com
              identidade própria e energia de pista cheia.
            </p>
            <p>
              Com base em Macapá, levou seu som para festivais e clubes pelo Brasil,
              construindo uma assinatura sonora que mistura groove tropical com
              estética eletrônica de raiz.
            </p>
            <p>
              Cada apresentação é uma viagem: começa devagar, escala em camadas, e
              termina em êxtase coletivo. <strong>É isso que importa.</strong>
            </p>

            <div className="about-stats">
              <div>
                <div className="stat-num">120+</div>
                <div className="stat-label">Shows realizados</div>
              </div>
              <div>
                <div className="stat-num">15</div>
                <div className="stat-label">Cidades / 3 países</div>
              </div>
              <div>
                <div className="stat-num">22</div>
                <div className="stat-label">Releases independentes</div>
              </div>
              <div>
                <div className="stat-num">2019</div>
                <div className="stat-label">Primeiro set público</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOWS */}
      <section className="section shows" id="shows">
        <p className="section-label">002 — Tour</p>
        <h2 className="section-title">Próximas<br />Datas</h2>

        <div className="show-list">
          {shows.map((show, i) => (
            <div className="show-row" key={i}>
              <div className="show-date">
                {show.date}
                <small>{show.month}</small>
              </div>
              <div className="show-venue">{show.venue}</div>
              <div className="show-city">{show.city}</div>
              <div className={`show-status ${show.status === 'sold' ? 'sold' : ''}`}>
                {show.status === 'sold' ? 'Sold Out' : show.status === 'soon' ? 'Em breve' : 'Ingressos'}
              </div>
              <div className="show-arrow">→</div>
            </div>
          ))}
        </div>
      </section>

      {/* TRACKS */}
      <section className="section" id="tracks">
        <p className="section-label">003 — Sounds</p>
        <h2 className="section-title">Faixas<br />Selecionadas</h2>

        <div className="tracks">
          {tracks.map((track) => (
            <div className="track" key={track.id}>
              <div className="track-num">/ {track.id}</div>
              <h3 className="track-title">{track.title}</h3>
              <p className="track-meta">{track.meta}</p>
              <a href="#" className="track-play">
                <span className="play-icon">▶</span>
                Listen
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* BOOKING */}
      <section className="section booking" id="booking">
        <div className="booking-content">
          <p className="booking-label">004 — Booking & Contato</p>
          <h2 className="booking-title">Quer KVICE<br />no seu line-up?</h2>
          <a href="mailto:booking@kvice.com" className="booking-email">
            booking@kvice.com
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
            <a href="#shows">Tour</a>
            <a href="#tracks">Sounds</a>
            <a href="#booking">Booking</a>
          </div>
          <div className="footer-col">
            <h4>Streaming</h4>
            <a href="#">Spotify</a>
            <a href="#">SoundCloud</a>
            <a href="#">Apple Music</a>
            <a href="#">YouTube</a>
          </div>
          <div className="footer-col">
            <h4>Social</h4>
            <a href="#">Instagram</a>
            <a href="#">TikTok</a>
            <a href="#">Beatport</a>
            <a href="#">Resident Advisor</a>
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
