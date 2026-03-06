"use client"

import { useEffect, useRef, useCallback } from "react"

/* ═══════════════════════════════════════════════════════════
   Hybrid Vortex + Wireframe Orb  ·  Pure HTML5 Canvas
   - Spiraling vortex particles orbit around a 3D wireframe sphere
   - Wireframe sphere with plasma shimmer, electric arcs, orbital rings
   - Mouse/touch influences gravity center and sphere rotation
   - Outer: cyan spirals → mid: red transition → core: wireframe orb
   ═══════════════════════════════════════════════════════════ */

const PARTICLE_COUNT_DESKTOP = 900
const PARTICLE_COUNT_MOBILE = 450
const TRAIL_LENGTH = 6

// ── Vortex particle type ──
interface VortexParticle {
  x: number; y: number
  vx: number; vy: number
  size: number; baseSpeed: number
  orbitRadius: number; angle: number
  layer: number
  trail: { x: number; y: number }[]
  life: number; maxLife: number; brightness: number
}

// ── Sphere point type ──
interface Point3D {
  x: number; y: number; z: number
  ox: number; oy: number; oz: number
}

interface Arc {
  startIdx: number; endIdx: number
  life: number; maxLife: number; intensity: number
}

export function OrbCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, active: false })
  const animRef = useRef<number>(0)
  const timeRef = useRef(0)
  const sizeRef = useRef({ w: 0, h: 0 })

  // Vortex refs
  const vortexRef = useRef<VortexParticle[]>([])

  // Sphere refs
  const spherePointsRef = useRef<Point3D[]>([])
  const ringPointsRef = useRef<Point3D[][]>([])
  const arcsRef = useRef<Arc[]>([])
  const sphereRadiusRef = useRef(0)

  // ── Spawn a vortex particle ──
  const spawnParticle = useCallback((w: number, h: number, forceOuter?: boolean): VortexParticle => {
    const cx = w > 768 ? w * 0.65 : w / 2
    const cy = w > 768 ? h * 0.45 : h * 0.3
    const maxR = Math.min(w, h) * 0.42
    const sphereR = maxR * 0.47

    const layerRoll = forceOuter ? 0 : Math.random()
    let layer: number
    let orbitRadius: number

    if (layerRoll < 0.6) {
      layer = 0
      orbitRadius = maxR * (0.55 + Math.random() * 0.45)
    } else if (layerRoll < 0.9) {
      layer = 1
      orbitRadius = maxR * (0.3 + Math.random() * 0.25)
    } else {
      layer = 2
      // Keep inner particles outside the sphere
      orbitRadius = sphereR + Math.random() * (maxR * 0.15)
    }

    const angle = Math.random() * Math.PI * 2
    const x = cx + Math.cos(angle) * orbitRadius
    const y = cy + Math.sin(angle) * orbitRadius

    const speed = (0.3 + Math.random() * 0.8) * (layer === 2 ? 2.2 : layer === 1 ? 1.5 : 1)
    const vx = -Math.sin(angle) * speed
    const vy = Math.cos(angle) * speed

    return {
      x, y, vx, vy,
      size: layer === 2 ? 0.4 + Math.random() * 0.8 : layer === 1 ? 0.6 + Math.random() * 1.2 : 0.5 + Math.random() * 1.0,
      baseSpeed: speed, orbitRadius, angle, layer,
      trail: [], life: 0,
      maxLife: 300 + Math.random() * 600,
      brightness: 0.4 + Math.random() * 0.6,
    }
  }, [])

  // ── Init vortex particles ──
  const initParticles = useCallback((w: number, h: number) => {
    const isMobile = w <= 768
    const count = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP
    const particles: VortexParticle[] = []
    for (let i = 0; i < count; i++) {
      const p = spawnParticle(w, h)
      p.life = Math.random() * p.maxLife
      for (let t = 0; t < TRAIL_LENGTH; t++) {
        p.trail.push({ x: p.x, y: p.y })
      }
      particles.push(p)
    }
    vortexRef.current = particles
  }, [spawnParticle])

  // ── Init wireframe sphere ──
  const initSphere = useCallback((radius: number, isMobile: boolean) => {
    sphereRadiusRef.current = radius
    const points: Point3D[] = []
    const rings: Point3D[][] = [[], [], []]

    const count = isMobile ? 220 : 380
    const goldenRatio = (1 + Math.sqrt(5)) / 2
    for (let i = 0; i < count; i++) {
      const theta = Math.acos(1 - (2 * (i + 0.5)) / count)
      const phi = (2 * Math.PI * i) / goldenRatio
      const x = radius * Math.sin(theta) * Math.cos(phi)
      const y = radius * Math.sin(theta) * Math.sin(phi)
      const z = radius * Math.cos(theta)
      points.push({ x, y, z, ox: x, oy: y, oz: z })
    }

    for (let r = 0; r < 3; r++) {
      const ringRadius = radius * (1.15 + r * 0.18)
      const ringCount = isMobile ? (60 + r * 12) : (100 + r * 20)
      for (let i = 0; i < ringCount; i++) {
        const angle = (i / ringCount) * Math.PI * 2
        const x = ringRadius * Math.cos(angle)
        const y = 0
        const z = ringRadius * Math.sin(angle)
        rings[r].push({ x, y, z, ox: x, oy: y, oz: z })
      }
    }

    spherePointsRef.current = points
    ringPointsRef.current = rings
    arcsRef.current = []
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let dpr = window.devicePixelRatio || 1

    const resize = () => {
      dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current.w = rect.width
      sizeRef.current.h = rect.height
      const maxR = Math.min(rect.width, rect.height) * 0.42
      const sphereR = maxR * 0.47
      const isMobile = rect.width <= 768
      initSphere(sphereR, isMobile)
      if (vortexRef.current.length === 0) {
        initParticles(rect.width, rect.height)
      }
    }

    // ── 3D helpers ──
    const rotateX = (p: Point3D, a: number): Point3D => {
      const c = Math.cos(a), s = Math.sin(a)
      return { ...p, y: p.y * c - p.z * s, z: p.y * s + p.z * c }
    }
    const rotateY = (p: Point3D, a: number): Point3D => {
      const c = Math.cos(a), s = Math.sin(a)
      return { ...p, x: p.x * c + p.z * s, z: -p.x * s + p.z * c }
    }
    const rotateZ = (p: Point3D, a: number): Point3D => {
      const c = Math.cos(a), s = Math.sin(a)
      return { ...p, x: p.x * c - p.y * s, y: p.x * s + p.y * c }
    }
    const project = (p: Point3D, cx: number, cy: number, fov: number) => {
      const scale = fov / (fov + p.z)
      return { x: p.x * scale + cx, y: p.y * scale + cy, scale, z: p.z }
    }

    const lightningPath = (x1: number, y1: number, x2: number, y2: number, depth: number): [number, number][] => {
      if (depth <= 0) return [[x1, y1], [x2, y2]]
      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * 14 * depth
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * 14 * depth
      const left = lightningPath(x1, y1, midX, midY, depth - 1)
      const right = lightningPath(midX, midY, x2, y2, depth - 1)
      return [...left, ...right.slice(1)]
    }

    let lastArcTime = 0

    const animate = () => {
      const { w, h } = sizeRef.current
      if (w === 0 || h === 0) { animRef.current = requestAnimationFrame(animate); return }

      const t = timeRef.current
      timeRef.current += 0.007

      // Smooth mouse
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06

      const baseCX = w > 768 ? w * 0.65 : w / 2
      const baseCY = w > 768 ? h * 0.45 : h * 0.3
      const maxR = Math.min(w, h) * 0.42
      const sphereR = sphereRadiusRef.current
      const fov = Math.min(w, h) * 1.5

      const gravX = baseCX + (mouseRef.current.x - 0.5) * w * 0.12
      const gravY = baseCY + (mouseRef.current.y - 0.5) * h * 0.12

      const mouseRotY = (mouseRef.current.x - 0.5) * 0.6
      const mouseRotX = (mouseRef.current.y - 0.5) * 0.4
      const autoRotY = t * 0.5
      const autoRotX = Math.sin(t * 0.25) * 0.15

      // Fade previous frame (trail effect)
      ctx.fillStyle = "rgba(5, 5, 8, 0.13)"
      ctx.fillRect(0, 0, w, h)

      // ════════════════════════════════════════
      //  WIREFRAME SPHERE (renders in center)
      // ════════════════════════════════════════

      const corePulse = 0.7 + Math.sin(t * 2.5) * 0.3

      // Subtle glow behind sphere
      const halo = ctx.createRadialGradient(gravX, gravY, 0, gravX, gravY, sphereR * 3.5)
      halo.addColorStop(0, `rgba(0, 229, 255, ${0.12 * corePulse})`)
      halo.addColorStop(0.3, `rgba(0, 229, 255, ${0.05 * corePulse})`)
      halo.addColorStop(0.6, `rgba(230, 57, 70, ${0.02 * corePulse})`)
      halo.addColorStop(1, "rgba(0, 0, 0, 0)")
      ctx.fillStyle = halo
      ctx.fillRect(0, 0, w, h)

      // Core glow
      const coreSize = sphereR * 0.5 * corePulse
      const coreGrad = ctx.createRadialGradient(gravX, gravY, 0, gravX, gravY, coreSize)
      coreGrad.addColorStop(0, `rgba(0, 229, 255, ${0.18 * corePulse})`)
      coreGrad.addColorStop(0.5, `rgba(0, 229, 255, ${0.06 * corePulse})`)
      coreGrad.addColorStop(1, "rgba(0, 0, 0, 0)")
      ctx.fillStyle = coreGrad
      ctx.beginPath()
      ctx.arc(gravX, gravY, coreSize, 0, Math.PI * 2)
      ctx.fill()

      // ── Sphere points with plasma distortion ──
      const projectedPoints: { x: number; y: number; scale: number; z: number }[] = []

      spherePointsRef.current.forEach((pt) => {
        const n1 = Math.sin(pt.ox * 0.015 + t * 2.5) * 2.5
        const n2 = Math.cos(pt.oy * 0.02 + t * 2) * 2
        const n3 = Math.sin(pt.oz * 0.018 + t * 1.8) * 2.2
        const n4 = Math.sin(pt.ox * 0.04 + pt.oy * 0.03 + t * 4) * 1
        const n5 = Math.cos(pt.oz * 0.035 + t * 3.5) * 1

        let p: Point3D = {
          x: pt.ox + n1 + n4, y: pt.oy + n2 + n5, z: pt.oz + n3,
          ox: pt.ox, oy: pt.oy, oz: pt.oz,
        }

        p = rotateY(p, autoRotY + mouseRotY)
        p = rotateX(p, autoRotX + mouseRotX)

        const proj = project(p, gravX, gravY, fov)
        projectedPoints.push(proj)

        const size = Math.max(0.4, 2.2 * proj.scale)
        const alpha = Math.max(0.08, Math.min(0.9, (proj.z + 200) / 400))
        const colorPhase = Math.sin(pt.ox * 0.01 + pt.oy * 0.01 + t * 1.5)
        const r = Math.round(0 + 230 * Math.max(0, -colorPhase * 0.3))
        const g = Math.round(229 * Math.max(0, colorPhase * 0.5 + 0.5))
        const b = Math.round(255 * Math.max(0.4, colorPhase * 0.3 + 0.6))

        ctx.beginPath()
        ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        ctx.fill()

        if (proj.scale > 0.85 && size > 1.2) {
          const ptGlow = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, size * 3.5)
          ptGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.15})`)
          ptGlow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
          ctx.fillStyle = ptGlow
          ctx.fillRect(proj.x - size * 3.5, proj.y - size * 3.5, size * 7, size * 7)
        }
      })

      // ── Sphere connections ──
      const connDist = w <= 768 ? 52 : 46
      for (let i = 0; i < projectedPoints.length; i++) {
        for (let j = i + 1; j < projectedPoints.length; j++) {
          const dx = projectedPoints[i].x - projectedPoints[j].x
          const dy = projectedPoints[i].y - projectedPoints[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < connDist) {
            const alpha = (1 - dist / connDist) * 0.15 * Math.min(projectedPoints[i].scale, projectedPoints[j].scale)
            ctx.beginPath()
            ctx.moveTo(projectedPoints[i].x, projectedPoints[i].y)
            ctx.lineTo(projectedPoints[j].x, projectedPoints[j].y)
            ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // ── Electric arcs on sphere ──
      const arcInterval = mouseRef.current.active ? 0.18 : 0.5
      if (t - lastArcTime > arcInterval && projectedPoints.length > 10) {
        lastArcTime = t
        const startIdx = Math.floor(Math.random() * projectedPoints.length)
        let endIdx = Math.floor(Math.random() * projectedPoints.length)
        let tries = 0
        while (endIdx === startIdx && tries < 5) { endIdx = Math.floor(Math.random() * projectedPoints.length); tries++ }
        arcsRef.current.push({
          startIdx, endIdx, life: 0,
          maxLife: 10 + Math.random() * 12,
          intensity: 0.4 + Math.random() * 0.5,
        })
      }

      arcsRef.current = arcsRef.current.filter((arc) => arc.life < arc.maxLife)
      arcsRef.current.forEach((arc) => {
        arc.life++
        const p1 = projectedPoints[arc.startIdx % projectedPoints.length]
        const p2 = projectedPoints[arc.endIdx % projectedPoints.length]
        if (!p1 || !p2) return

        const progress = arc.life / arc.maxLife
        const fadeAlpha = arc.intensity * (progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8)
        if (fadeAlpha < 0.01) return

        const path = lightningPath(p1.x, p1.y, p2.x, p2.y, 3)

        ctx.beginPath()
        ctx.moveTo(path[0][0], path[0][1])
        for (let k = 1; k < path.length; k++) ctx.lineTo(path[k][0], path[k][1])
        ctx.strokeStyle = `rgba(0, 229, 255, ${fadeAlpha * 0.25})`
        ctx.lineWidth = 3
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(path[0][0], path[0][1])
        for (let k = 1; k < path.length; k++) ctx.lineTo(path[k][0], path[k][1])
        ctx.strokeStyle = `rgba(180, 240, 255, ${fadeAlpha * 0.7})`
        ctx.lineWidth = 1
        ctx.stroke()

        if (Math.random() < 0.25 && path.length > 3) {
          const branchIdx = Math.floor(Math.random() * (path.length - 2)) + 1
          const branchEnd = [
            path[branchIdx][0] + (Math.random() - 0.5) * 22,
            path[branchIdx][1] + (Math.random() - 0.5) * 22,
          ]
          ctx.beginPath()
          ctx.moveTo(path[branchIdx][0], path[branchIdx][1])
          ctx.lineTo(branchEnd[0], branchEnd[1])
          ctx.strokeStyle = `rgba(230, 57, 70, ${fadeAlpha * 0.4})`
          ctx.lineWidth = 0.7
          ctx.stroke()
        }
      })

      // ── Orbital rings around the sphere ──
      ringPointsRef.current.forEach((ring, ringIdx) => {
        const tiltAngles = [
          { x: 0.5, y: 0, z: 0 },
          { x: -0.3, y: 0.8, z: 0.2 },
          { x: 0.1, y: -0.5, z: -0.15 },
        ]
        const ringSpeed = [0.7, -0.5, 0.35]

        const prevPoints: { x: number; y: number; alpha: number; scale: number }[] = []
        ring.forEach((pt) => {
          let p: Point3D = { ...pt }
          p = rotateY(p, t * ringSpeed[ringIdx])
          p = rotateX(p, tiltAngles[ringIdx].x)
          p = rotateY(p, tiltAngles[ringIdx].y)
          p = rotateZ(p, tiltAngles[ringIdx].z)
          p = rotateY(p, autoRotY + mouseRotY)
          p = rotateX(p, autoRotX + mouseRotX)

          const proj = project(p, gravX, gravY, fov)
          const alpha = Math.max(0.02, Math.min(0.35, (proj.z + 200) / 500)) * proj.scale
          prevPoints.push({ x: proj.x, y: proj.y, alpha, scale: proj.scale })
        })

        for (let i = 1; i < prevPoints.length; i++) {
          const p1 = prevPoints[i - 1]
          const p2 = prevPoints[i]
          const alpha = Math.min(p1.alpha, p2.alpha)
          if (alpha > 0.01) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            const colors = [
              `rgba(0, 229, 255, ${alpha})`,
              `rgba(230, 57, 70, ${alpha * 0.8})`,
              `rgba(0, 229, 255, ${alpha * 0.6})`,
            ]
            ctx.strokeStyle = colors[ringIdx]
            ctx.lineWidth = ringIdx === 0 ? 1.2 : 0.8
            ctx.stroke()
          }
        }
        // Close ring
        if (prevPoints.length > 1) {
          const first = prevPoints[0]
          const last = prevPoints[prevPoints.length - 1]
          const alpha = Math.min(first.alpha, last.alpha)
          if (alpha > 0.01) {
            ctx.beginPath()
            ctx.moveTo(last.x, last.y)
            ctx.lineTo(first.x, first.y)
            const colors = [
              `rgba(0, 229, 255, ${alpha})`,
              `rgba(230, 57, 70, ${alpha * 0.8})`,
              `rgba(0, 229, 255, ${alpha * 0.6})`,
            ]
            ctx.strokeStyle = colors[ringIdx]
            ctx.lineWidth = ringIdx === 0 ? 1.2 : 0.8
            ctx.stroke()
          }
        }

        // Energy particle on ring
        const energyIdx = Math.floor((t * ringSpeed[ringIdx] * 12 + ringIdx * 20) % prevPoints.length)
        const ep = prevPoints[Math.abs(energyIdx) % prevPoints.length]
        if (ep && ep.alpha > 0.04) {
          const epSize = 2.5 * ep.scale
          const epGlow = ctx.createRadialGradient(ep.x, ep.y, 0, ep.x, ep.y, epSize * 4)
          epGlow.addColorStop(0, ringIdx === 1 ? "rgba(230, 57, 70, 0.5)" : "rgba(0, 229, 255, 0.5)")
          epGlow.addColorStop(0.5, ringIdx === 1 ? "rgba(230, 57, 70, 0.1)" : "rgba(0, 229, 255, 0.1)")
          epGlow.addColorStop(1, "rgba(0, 0, 0, 0)")
          ctx.fillStyle = epGlow
          ctx.fillRect(ep.x - epSize * 4, ep.y - epSize * 4, epSize * 8, epSize * 8)
          ctx.beginPath()
          ctx.arc(ep.x, ep.y, epSize, 0, Math.PI * 2)
          ctx.fillStyle = "rgba(255, 255, 255, 0.85)"
          ctx.fill()
        }
      })

      // ════════════════════════════════════════
      //  VORTEX PARTICLES (spiral around sphere)
      // ════════════════════════════════════════

      const particles = vortexRef.current

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        const dx = gravX - p.x
        const dy = gravY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const dirX = dx / dist
        const dirY = dy / dist

        const gravStrength = 0.5 + (maxR * 0.25) / (dist + 10)
        const tangentX = -dirY
        const tangentY = dirX

        // Repel particles from getting too close to sphere
        const minDist = sphereR * 1.5
        let repelX = 0, repelY = 0
        if (dist < minDist) {
          const repelForce = (minDist - dist) / minDist * 0.5
          repelX = -dirX * repelForce
          repelY = -dirY * repelForce
        }

        const inwardPull = dist > minDist ? 0.006 + (p.layer === 2 ? 0.002 : p.layer === 1 ? 0.004 : 0.005) : 0

        p.vx += tangentX * gravStrength * 0.11 + dirX * inwardPull + repelX
        p.vy += tangentY * gravStrength * 0.11 + dirY * inwardPull + repelY

        const damping = 0.986
        p.vx *= damping
        p.vy *= damping

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        const maxSpeed = p.layer === 2 ? 4.5 : p.layer === 1 ? 3 : 2.2
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed
          p.vy = (p.vy / speed) * maxSpeed
        }

        p.x += p.vx
        p.y += p.vy

        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > TRAIL_LENGTH) p.trail.shift()
        p.life++

        if (dist < sphereR * 0.5 || p.life > p.maxLife || p.x < -50 || p.x > w + 50 || p.y < -50 || p.y > h + 50) {
          const np = spawnParticle(w, h, true)
          particles[i] = np
          for (let tt = 0; tt < TRAIL_LENGTH; tt++) np.trail.push({ x: np.x, y: np.y })
          continue
        }

        // Color based on distance
        const distRatio = Math.min(1, dist / maxR)
        const fadeIn = Math.min(1, p.life / 30)
        const baseBrightness = p.brightness * fadeIn

        let r: number, g: number, b: number, alpha: number

        if (distRatio > 0.5) {
          const tt = (distRatio - 0.5) / 0.5
          r = Math.round(0 + 30 * (1 - tt))
          g = Math.round(180 + 49 * tt)
          b = 255
          alpha = baseBrightness * (0.4 + tt * 0.4)
        } else if (distRatio > 0.2) {
          const tt = (distRatio - 0.2) / 0.3
          r = Math.round(230 * (1 - tt))
          g = Math.round(57 * (1 - tt) + 200 * tt)
          b = Math.round(70 * (1 - tt) + 255 * tt)
          alpha = baseBrightness * (0.5 + (1 - tt) * 0.3)
        } else {
          const tt = distRatio / 0.2
          r = Math.round(255 - 25 * tt)
          g = Math.round(255 - 55 * tt)
          b = Math.round(255 - 30 * tt)
          alpha = baseBrightness * (0.6 + (1 - tt) * 0.3)
        }

        // Draw trail
        if (p.trail.length > 1) {
          for (let tt = 1; tt < p.trail.length; tt++) {
            const trailAlpha = (tt / p.trail.length) * alpha * 0.3
            const trailSize = p.size * (tt / p.trail.length) * 0.6
            ctx.beginPath()
            ctx.arc(p.trail[tt].x, p.trail[tt].y, trailSize, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${trailAlpha})`
            ctx.fill()
          }
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        ctx.fill()

        // Particle glow
        if (baseBrightness > 0.5 && distRatio < 0.55) {
          const glowSize = p.size * (2.5 + (1 - distRatio) * 2.5)
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize)
          glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.25})`)
          glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      animRef.current = requestAnimationFrame(animate)
    }

    // ── Events ──
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.targetX = (e.clientX - rect.left) / rect.width
      mouseRef.current.targetY = (e.clientY - rect.top) / rect.height
      mouseRef.current.active = true
    }
    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0.5
      mouseRef.current.targetY = 0.5
      mouseRef.current.active = false
    }
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        const rect = canvas.getBoundingClientRect()
        mouseRef.current.targetX = (touch.clientX - rect.left) / rect.width
        mouseRef.current.targetY = (touch.clientY - rect.top) / rect.height
        mouseRef.current.active = true
        // Prevent scroll only when touching the canvas area
        e.preventDefault()
      }
    }
    const handleTouchEnd = () => {
      mouseRef.current.targetX = 0.5
      mouseRef.current.targetY = 0.5
      mouseRef.current.active = false
    }

    resize()
    const resizeObserver = new ResizeObserver(() => {
      resize()
      initParticles(sizeRef.current.w, sizeRef.current.h)
    })
    resizeObserver.observe(canvas)
    animRef.current = requestAnimationFrame(animate)

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd)

    return () => {
      cancelAnimationFrame(animRef.current)
      resizeObserver.disconnect()
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [initParticles, initSphere, spawnParticle])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      aria-hidden="true"
    />
  )
}
