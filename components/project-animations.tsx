"use client"

import { useEffect, useRef } from "react"

// ─── Aurus: floating gold/silver/platinum token coins with price tickers ───
export function AurusAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const tokens = [
      { label: "XAU", color: "#FFD700", price: 1923.45, x: 0, y: 0, vy: 0, phase: 0 },
      { label: "XAG", color: "#C0C0C0", price: 23.81, x: 0, y: 0, vy: 0, phase: 1.2 },
      { label: "XPT", color: "#E5E4E2", price: 912.6, x: 0, y: 0, vy: 0, phase: 2.4 },
    ]

    tokens.forEach((t, i) => {
      t.x = canvas.width * (0.22 + i * 0.28)
      t.y = canvas.height * 0.45
    })

    // Flowing particles
    const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = []
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * 800,
        y: Math.random() * 400,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        life: Math.random() * 100,
        maxLife: 100 + Math.random() * 100,
      })
    }

    let frame = 0
    let raf: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Background
      ctx.fillStyle = "#050508"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Grid lines
      ctx.strokeStyle = "rgba(0,229,255,0.04)"
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }

      // Particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life++
        if (p.life > p.maxLife) { p.life = 0; p.x = Math.random() * canvas.width; p.y = Math.random() * canvas.height }
        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.5
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,229,255,${alpha})`
        ctx.fill()
      })

      // Price chart line (bottom)
      ctx.beginPath()
      ctx.strokeStyle = "rgba(0,229,255,0.25)"
      ctx.lineWidth = 1.5
      for (let x = 0; x < canvas.width; x += 4) {
        const y = canvas.height * 0.82 + Math.sin((x / canvas.width) * Math.PI * 6 + frame * 0.02) * 12 + Math.sin(x * 0.05 + frame * 0.01) * 5
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Tokens
      tokens.forEach((t, i) => {
        const bobY = t.y + Math.sin(frame * 0.03 + t.phase) * 8
        const radius = 36

        // Glow
        const grd = ctx.createRadialGradient(t.x, bobY, 0, t.x, bobY, radius * 2)
        grd.addColorStop(0, `${t.color}33`)
        grd.addColorStop(1, "transparent")
        ctx.beginPath()
        ctx.arc(t.x, bobY, radius * 2, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        // Coin circle
        ctx.beginPath()
        ctx.arc(t.x, bobY, radius, 0, Math.PI * 2)
        ctx.fillStyle = "#0d0d14"
        ctx.fill()
        ctx.strokeStyle = t.color
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Inner ring
        ctx.beginPath()
        ctx.arc(t.x, bobY, radius - 6, 0, Math.PI * 2)
        ctx.strokeStyle = `${t.color}44`
        ctx.lineWidth = 1
        ctx.stroke()

        // Label
        ctx.fillStyle = t.color
        ctx.font = "bold 12px monospace"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(t.label, t.x, bobY)

        // Price below coin
        ctx.fillStyle = "rgba(0,229,255,0.7)"
        ctx.font = "10px monospace"
        ctx.fillText(`$${t.price.toFixed(2)}`, t.x, bobY + radius + 14)

        // Connector line to chart
        ctx.beginPath()
        ctx.moveTo(t.x, bobY + radius + 24)
        ctx.lineTo(t.x, canvas.height * 0.78)
        ctx.strokeStyle = `${t.color}20`
        ctx.lineWidth = 1
        ctx.setLineDash([3, 5])
        ctx.stroke()
        ctx.setLineDash([])
      })

      // Top label
      ctx.fillStyle = "rgba(0,229,255,0.5)"
      ctx.font = "11px monospace"
      ctx.textAlign = "left"
      ctx.textBaseline = "top"
      ctx.fillText("AURUS / TOKENIZED METALS", 16, 16)

      frame++
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize) }
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

// ─── Synthetix: flowing liquidity pool with asset nodes ───
export function SynthetixAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener("resize", resize)

    const nodes = [
      { label: "sUSD", x: 0.5, y: 0.35, r: 28, color: "#00e5ff" },
      { label: "sBTC", x: 0.2, y: 0.6,  r: 22, color: "#F7931A" },
      { label: "sETH", x: 0.38, y: 0.7, r: 22, color: "#627EEA" },
      { label: "sLINK", x: 0.62, y: 0.7, r: 20, color: "#2A5ADA" },
      { label: "sGLD", x: 0.8, y: 0.6,  r: 22, color: "#FFD700" },
    ]

    const flowParticles: { fromIdx: number; toIdx: number; t: number; speed: number }[] = []
    const edges = [[0,1],[0,2],[0,3],[0,4],[1,2],[2,3],[3,4]]
    edges.forEach(e => {
      for (let i = 0; i < 2; i++) {
        flowParticles.push({ fromIdx: e[0], toIdx: e[1], t: Math.random(), speed: 0.003 + Math.random() * 0.003 })
      }
    })

    let frame = 0
    let raf: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#050508"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Grid
      ctx.strokeStyle = "rgba(0,229,255,0.04)"
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke() }
      for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke() }

      const w = canvas.width, h = canvas.height

      // Draw edges
      edges.forEach(([a, b]) => {
        const na = nodes[a], nb = nodes[b]
        ctx.beginPath()
        ctx.moveTo(na.x * w, na.y * h)
        ctx.lineTo(nb.x * w, nb.y * h)
        ctx.strokeStyle = "rgba(0,229,255,0.08)"
        ctx.lineWidth = 1
        ctx.stroke()
      })

      // Flow particles on edges
      flowParticles.forEach(p => {
        p.t += p.speed
        if (p.t > 1) p.t = 0
        const na = nodes[p.fromIdx], nb = nodes[p.toIdx]
        const px = na.x * w + (nb.x * w - na.x * w) * p.t
        const py = na.y * h + (nb.y * h - na.y * h) * p.t
        ctx.beginPath()
        ctx.arc(px, py, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(0,229,255,0.8)"
        ctx.fill()
      })

      // Draw nodes
      nodes.forEach((n, i) => {
        const bob = Math.sin(frame * 0.025 + i * 1.1) * 5
        const nx = n.x * w, ny = n.y * h + bob

        // Glow
        const grd = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.r * 2.5)
        grd.addColorStop(0, `${n.color}30`)
        grd.addColorStop(1, "transparent")
        ctx.beginPath(); ctx.arc(nx, ny, n.r * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = grd; ctx.fill()

        // Circle
        ctx.beginPath(); ctx.arc(nx, ny, n.r, 0, Math.PI * 2)
        ctx.fillStyle = "#0d0d14"; ctx.fill()
        ctx.strokeStyle = n.color; ctx.lineWidth = 1.5; ctx.stroke()

        ctx.fillStyle = n.color
        ctx.font = `bold ${i === 0 ? 11 : 10}px monospace`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(n.label, nx, ny)
      })

      // Liquidity pool indicator bar
      const barW = canvas.width * 0.5
      const barX = (canvas.width - barW) / 2
      const barY = canvas.height * 0.88
      ctx.fillStyle = "rgba(0,229,255,0.06)"
      ctx.beginPath(); ctx.roundRect(barX, barY, barW, 8, 4); ctx.fill()
      const fill = (Math.sin(frame * 0.01) * 0.1 + 0.65) * barW
      const lGrd = ctx.createLinearGradient(barX, 0, barX + fill, 0)
      lGrd.addColorStop(0, "#00e5ff"); lGrd.addColorStop(1, "#0077ff")
      ctx.fillStyle = lGrd
      ctx.beginPath(); ctx.roundRect(barX, barY, fill, 8, 4); ctx.fill()

      ctx.fillStyle = "rgba(0,229,255,0.4)"
      ctx.font = "10px monospace"
      ctx.textAlign = "center"
      ctx.fillText("LIQUIDITY POOL", canvas.width / 2, barY - 10)

      ctx.fillStyle = "rgba(0,229,255,0.5)"
      ctx.font = "11px monospace"
      ctx.textAlign = "left"
      ctx.textBaseline = "top"
      ctx.fillText("SYNTHETIX / SYNTHETIC ASSETS", 16, 16)

      frame++
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize) }
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

// ─── Trading Bot: live order book + scrolling execution log ───
export function TradingBotAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener("resize", resize)

    let frame = 0
    let raf: number

    const logLines = [
      "ORDER FILLED  BTC/USDT  +0.142 @ 43218.50",
      "SIGNAL LONG   ETH/USDT  RSI:28.4  MACD:↑",
      "ORDER PLACED  ETH/USDT  0.85 @ 2281.40",
      "STOP ADJUSTED BTC/USDT  42800 → 43100",
      "ORDER FILLED  SOL/USDT  +4.5 @ 98.72",
      "SIGNAL SHORT  BNB/USDT  RSI:74.1  OB",
      "ORDER FILLED  BTC/USDT  -0.08 @ 43510.00",
      "PNL +$1,248.30  24H VOLUME $2.4M",
    ]
    let logOffset = 0

    // Candlestick data
    const candles: { o: number; h: number; l: number; c: number }[] = []
    let price = 43200
    for (let i = 0; i < 28; i++) {
      const o = price
      price += (Math.random() - 0.48) * 120
      const c = price
      const h = Math.max(o, c) + Math.random() * 60
      const l = Math.min(o, c) - Math.random() * 60
      candles.push({ o, h, l, c })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#050508"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Grid
      ctx.strokeStyle = "rgba(0,229,255,0.04)"
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke() }
      for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke() }

      const w = canvas.width, h = canvas.height
      const chartH = h * 0.48
      const chartY = h * 0.06
      const chartW = w

      // Candlestick chart
      const prices = candles.flatMap(c => [c.h, c.l])
      const minP = Math.min(...prices), maxP = Math.max(...prices)
      const scaleY = (p: number) => chartY + chartH - ((p - minP) / (maxP - minP)) * chartH
      const candleW = (chartW / candles.length) * 0.6
      const step = chartW / candles.length

      candles.forEach((c, i) => {
        const x = i * step + step / 2
        const isUp = c.c >= c.o
        const color = isUp ? "#00e5ff" : "#e63946"
        const alpha = 0.5 + (i / candles.length) * 0.5

        ctx.strokeStyle = `rgba(${isUp ? "0,229,255" : "230,57,70"},${alpha})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x, scaleY(c.h))
        ctx.lineTo(x, scaleY(c.l))
        ctx.stroke()

        ctx.fillStyle = `rgba(${isUp ? "0,229,255" : "230,57,70"},${alpha})`
        const top = scaleY(Math.max(c.o, c.c))
        const bodyH = Math.max(1, Math.abs(scaleY(c.o) - scaleY(c.c)))
        ctx.fillRect(x - candleW / 2, top, candleW, bodyH)
      })

      // Scrolling price line
      ctx.beginPath()
      ctx.strokeStyle = "rgba(0,229,255,0.5)"
      ctx.lineWidth = 1.5
      candles.forEach((c, i) => {
        const x = i * step + step / 2
        const y = scaleY(c.c)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()

      // Divider
      ctx.strokeStyle = "rgba(0,229,255,0.08)"
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, h * 0.57); ctx.lineTo(w, h * 0.57); ctx.stroke()

      // Execution log
      const lineH = 16
      const logStartY = h * 0.6
      const visibleLines = Math.floor((h * 0.35) / lineH)
      logOffset = (logOffset + 0.008) % logLines.length

      for (let i = 0; i < visibleLines + 1; i++) {
        const idx = Math.floor((logOffset + i)) % logLines.length
        const line = logLines[idx]
        const frac = (logOffset + i) % 1
        const y = logStartY + i * lineH - frac * lineH

        const isFilled = line.includes("FILLED") || line.includes("PNL")
        const isSignal = line.includes("SIGNAL")
        ctx.fillStyle = isFilled
          ? `rgba(0,229,255,0.85)`
          : isSignal
          ? `rgba(255,215,0,0.7)`
          : `rgba(180,200,220,0.45)`
        ctx.font = "10px monospace"
        ctx.textAlign = "left"
        ctx.textBaseline = "top"
        ctx.fillText(`> ${line}`, 14, y)
      }

      // Stats bar at bottom
      const stats = ["PNL +$1,248", "WIN 68%", "VOL $2.4M", "EXEC 0.3ms"]
      stats.forEach((s, i) => {
        const bx = (w / stats.length) * i
        const bw = w / stats.length
        ctx.fillStyle = "rgba(0,229,255,0.05)"
        ctx.fillRect(bx + 4, h - 28, bw - 8, 22)
        ctx.fillStyle = "rgba(0,229,255,0.6)"
        ctx.font = "10px monospace"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(s, bx + bw / 2, h - 17)
      })

      ctx.fillStyle = "rgba(0,229,255,0.5)"
      ctx.font = "11px monospace"
      ctx.textAlign = "left"
      ctx.textBaseline = "top"
      ctx.fillText("AUTO-TRADING BOT / BTC-USDT", 14, 10)

      frame++
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize) }
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
