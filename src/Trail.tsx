import { useEffect, useRef } from 'react'

const WORD = 'KVICE'

export default function Trail() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let letterIndex = 0
    let lastX = 0
    let lastY = 0
    let lastTime = 0
    const MIN_DISTANCE = 28 // pixels mínimos de movimento entre letras
    const MIN_INTERVAL = 35 // ms mínimo entre letras (rate limit)

    const handleMove = (e: MouseEvent) => {
      const now = performance.now()
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      const dist = Math.hypot(dx, dy)

      // Só cria letra se moveu o suficiente E passou tempo suficiente
      if (dist < MIN_DISTANCE || now - lastTime < MIN_INTERVAL) return

      lastX = e.clientX
      lastY = e.clientY
      lastTime = now

      const letter = document.createElement('span')
      letter.className = 'trail-letter'
      letter.textContent = WORD[letterIndex % WORD.length]
      letterIndex++

      // Posição inicial = posição do cursor
      letter.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
      letter.style.opacity = '1'

      // Pequena variação aleatória pra não ficar mecânico
      const driftX = (Math.random() - 0.5) * 30
      const driftY = (Math.random() - 0.5) * 20 - 10 // tendência leve pra cima
      const rotation = (Math.random() - 0.5) * 25

      container.appendChild(letter)

      // Anima — sobe levemente, gira e desbota
      requestAnimationFrame(() => {
        letter.style.transition = 'transform 1.2s cubic-bezier(0.2, 0.6, 0.3, 1), opacity 1.2s ease-out'
        letter.style.transform = `translate(${e.clientX + driftX}px, ${e.clientY + driftY}px) translate(-50%, -50%) rotate(${rotation}deg) scale(0.6)`
        letter.style.opacity = '0'
      })

      // Remove o elemento após a animação
      setTimeout(() => letter.remove(), 1300)
    }

    window.addEventListener('mousemove', handleMove)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      // Limpa letras restantes
      while (container.firstChild) container.removeChild(container.firstChild)
    }
  }, [])

  return <div ref={containerRef} />
}
