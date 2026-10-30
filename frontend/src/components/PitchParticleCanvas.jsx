import React, { useEffect, useRef } from 'react'

export function PitchParticleCanvas ({ isPaused = false }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      return () => window.removeEventListener('resize', handleResize)
    }

    // Pointer coordinates
    const pointer = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isHovered: false
    }

    const handleMouseMove = (e) => {
      pointer.targetX = e.clientX
      pointer.targetY = e.clientY
      pointer.isHovered = true
    }

    const handleMouseLeave = () => {
      pointer.isHovered = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    // 4D Particle Model: (x, y, z, w) where w is the 4th dimensional temporal phase
    const PARTICLE_COUNT = 75
    const particles = []

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.2,
        y: (Math.random() - 0.5) * height * 1.2,
        z: Math.random() * 800 + 100, // 3D depth
        w: Math.random() * Math.PI * 2, // 4D hyper-phase angle
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.5,
        vw: 0.008 + Math.random() * 0.012, // 4D temporal evolution frequency
        baseRadius: 1.5 + Math.random() * 2.2,
        colorType: i % 4 // 0: Indigo, 1: Cyan, 2: Emerald, 3: Purple
      })
    }

    let time = 0
    const FOV = 450 // Perspective camera field of view

    const render = () => {
      if (!isPaused) {
        time += 0.01

        // Smooth pointer lerp
        pointer.x += (pointer.targetX - pointer.x) * 0.05
        pointer.y += (pointer.targetY - pointer.y) * 0.05

        ctx.clearRect(0, 0, width, height)

        const centerX = width / 2
        const centerY = height / 2

        // Update & project particles
        const projected = []

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]

          // 4D temporal hyperspherical rotation:
          // x' = x * cos(w) - z * sin(w)
          // w evolves continuously across time
          p.w += p.vw
          const temporalFactor = Math.sin(p.w + time * 0.5)

          // 3D physics with subtle drift
          p.x += p.vx + temporalFactor * 0.3
          p.y += p.vy + Math.cos(p.w) * 0.2
          p.z += p.vz

          // Wrap boundaries in 3D
          if (p.z < 80) p.z = 850
          if (p.z > 850) p.z = 80
          if (p.x < -width) p.x = width
          if (p.x > width) p.x = -width
          if (p.y < -height) p.y = height
          if (p.y > height) p.y = -height

          // Subtle attraction toward pointer if hovered
          if (pointer.isHovered) {
            const dx = (pointer.x - centerX) - p.x
            const dy = (pointer.y - centerY) - p.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 320 && dist > 20) {
              p.x += (dx / dist) * 0.45
              p.y += (dy / dist) * 0.45
            }
          }

          // Perspective 3D -> 2D projection
          const scale = FOV / (FOV + p.z)
          const projX = centerX + p.x * scale
          const projY = centerY + p.y * scale
          const radius = Math.max(0.6, p.baseRadius * scale * (1 + 0.35 * temporalFactor))
          const alpha = Math.min(0.85, Math.max(0.1, (scale * 1.1) * (0.6 + 0.4 * temporalFactor)))

          projected.push({
            projX,
            projY,
            radius,
            alpha,
            colorType: p.colorType,
            z: p.z
          })
        }

        // Draw connective intent threads between close particles
        ctx.lineWidth = 0.6
        for (let i = 0; i < projected.length; i++) {
          for (let j = i + 1; j < projected.length; j++) {
            const p1 = projected[i]
            const p2 = projected[j]
            const dx = p1.projX - p2.projX
            const dy = p1.projY - p2.projY
            const distSq = dx * dx + dy * dy

            if (distSq < 11000) { // ~105px connection threshold
              const lineAlpha = (1 - Math.sqrt(distSq) / 105) * 0.18 * Math.min(p1.alpha, p2.alpha)
              ctx.strokeStyle = `rgba(99, 102, 241, ${lineAlpha})`
              ctx.beginPath()
              ctx.moveTo(p1.projX, p1.projY)
              ctx.lineTo(p2.projX, p2.projY)
              ctx.stroke()
            }
          }
        }

        // Render particles with depth-based glow
        for (let i = 0; i < projected.length; i++) {
          const p = projected[i]
          let fill = `rgba(99, 102, 241, ${p.alpha})`
          if (p.colorType === 1) fill = `rgba(6, 182, 212, ${p.alpha})`
          if (p.colorType === 2) fill = `rgba(16, 185, 129, ${p.alpha})`
          if (p.colorType === 3) fill = `rgba(168, 85, 247, ${p.alpha})`

          ctx.beginPath()
          ctx.arc(p.projX, p.projY, p.radius, 0, Math.PI * 2)
          ctx.fillStyle = fill
          ctx.fill()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isPaused])

  return (
    <div className='particle-canvas-wrapper' aria-hidden='true'>
      <canvas ref={canvasRef} />
    </div>
  )
}
