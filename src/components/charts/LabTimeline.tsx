'use client'

// DÍVIDA[mvp]: viewBox fixo — sem ResizeObserver (D007); responsivo via SVG scaling, não pixel-perfect

import { useState, useId } from 'react'
import type { AnalyteTrendPoint } from '@/lib/db/analytics'

interface Props {
  analyteName: string
  unit: string
  points: AnalyteTrendPoint[]
  referenceMin: number | null
  referenceMax: number | null
}

// Dimensões do SVG (coordenadas internas — SVG escala via CSS)
const W = 800
const H = 360
const PAD = { top: 40, right: 40, bottom: 60, left: 72 }
const PW = W - PAD.left - PAD.right  // largura da área de plot
const PH = H - PAD.top - PAD.bottom  // altura da área de plot

const FLAG_COLOR: Record<string, string> = {
  alto: '#ef4444',    // red-500
  baixo: '#f59e0b',   // amber-500
  normal: '#22c55e',  // green-500
  null: '#94a3b8',    // slate-400
}

function flagColor(flag: AnalyteTrendPoint['flag']): string {
  return FLAG_COLOR[flag ?? 'null']
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

function buildScales(points: AnalyteTrendPoint[], refMin: number | null, refMax: number | null) {
  const dates = points.map(p => p.date)
  const values = points.map(p => p.value)
  if (refMin !== null) values.push(refMin)
  if (refMax !== null) values.push(refMax)

  const minDate = Math.min(...dates)
  const maxDate = Math.max(...dates)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const valPad = (maxVal - minVal) * 0.15 || 1

  const xScale = (date: number): number =>
    dates.length < 2 ? PAD.left + PW / 2
      : PAD.left + ((date - minDate) / (maxDate - minDate)) * PW

  const yScale = (val: number): number =>
    PAD.top + PH - ((val - (minVal - valPad)) / ((maxVal + valPad) - (minVal - valPad))) * PH

  const yAxisValues = Array.from({ length: 5 }, (_, i) =>
    minVal - valPad + ((maxVal + valPad - (minVal - valPad)) / 4) * i
  )

  return { xScale, yScale, yAxisValues, minVal, maxVal, valPad }
}

function buildLinePath(points: AnalyteTrendPoint[], xScale: (d: number) => number, yScale: (v: number) => number): string {
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.date).toFixed(1)} ${yScale(p.value).toFixed(1)}`)
    .join(' ')
}

interface TooltipState {
  x: number
  y: number
  point: AnalyteTrendPoint
}

export default function LabTimeline({ analyteName, unit, points, referenceMin, referenceMax }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const clipId = useId()
  const gradId = useId()
  const animId = useId()

  if (points.length === 0) return null

  const { xScale, yScale, yAxisValues } = buildScales(points, referenceMin, referenceMax)
  const linePath = buildLinePath(points, xScale, yScale)

  // Calcular comprimento aproximado do path para animação
  const pathLength = points.length > 1
    ? points.reduce((acc, p, i) => {
        if (i === 0) return 0
        const prev = points[i - 1]
        const dx = xScale(p.date) - xScale(prev.date)
        const dy = yScale(p.value) - yScale(prev.value)
        return acc + Math.sqrt(dx * dx + dy * dy)
      }, 0)
    : 0

  // Banda de referência (área preenchida entre min e max)
  const refBandTop = referenceMax !== null ? yScale(referenceMax) : PAD.top
  const refBandBottom = referenceMin !== null ? yScale(referenceMin) : PAD.top + PH
  const refBandHeight = Math.max(0, refBandBottom - refBandTop)

  return (
    <div className="relative w-full select-none">
      {/* Cabeçalho */}
      <div className="flex items-baseline gap-2 mb-3">
        <h3 className="text-sm font-semibold text-slate-800 capitalize">{analyteName}</h3>
        {unit && <span className="text-xs text-slate-400">{unit}</span>}
        {points.some(p => p.flag === 'alto' || p.flag === 'baixo') && (
          <span className="ml-auto text-xs font-medium text-red-500">● fora do intervalo</span>
        )}
      </div>

      {/* SVG responsivo */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label={`Evolução de ${analyteName}`}
      >
        <defs>
          {/* Clip para limitar linha à área de plot */}
          <clipPath id={clipId}>
            <rect x={PAD.left} y={PAD.top} width={PW} height={PH} />
          </clipPath>

          {/* Gradiente sutil para a linha */}
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="1" />
          </linearGradient>

          {/* Animação de desenho da linha */}
          <style>{`
            @keyframes draw-${animId.replace(/:/g, '')} {
              from { stroke-dashoffset: ${pathLength.toFixed(0)}; }
              to   { stroke-dashoffset: 0; }
            }
            .line-${animId.replace(/:/g, '')} {
              stroke-dasharray: ${pathLength.toFixed(0)};
              stroke-dashoffset: ${pathLength.toFixed(0)};
              animation: draw-${animId.replace(/:/g, '')} 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            @keyframes fadein-dot {
              from { opacity: 0; transform: scale(0.3); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </defs>

        {/* Grid horizontal */}
        {yAxisValues.map((val, i) => (
          <g key={i}>
            <line
              x1={PAD.left} y1={yScale(val)}
              x2={PAD.left + PW} y2={yScale(val)}
              stroke="#e2e8f0" strokeWidth="1"
            />
            <text
              x={PAD.left - 8} y={yScale(val)}
              textAnchor="end" dominantBaseline="middle"
              fontSize="11" fill="#94a3b8"
            >
              {val.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Banda de referência */}
        {(referenceMin !== null || referenceMax !== null) && (
          <rect
            x={PAD.left} y={refBandTop}
            width={PW} height={refBandHeight}
            fill="#dcfce7" fillOpacity="0.5"
            clipPath={`url(#${clipId})`}
          />
        )}

        {/* Linha de referência máxima */}
        {referenceMax !== null && (
          <g>
            <line
              x1={PAD.left} y1={yScale(referenceMax)}
              x2={PAD.left + PW} y2={yScale(referenceMax)}
              stroke="#86efac" strokeWidth="1.5" strokeDasharray="6 4"
            />
            <text
              x={PAD.left + PW + 6} y={yScale(referenceMax)}
              dominantBaseline="middle" fontSize="10" fill="#86efac"
            >
              máx
            </text>
          </g>
        )}

        {/* Linha de referência mínima */}
        {referenceMin !== null && (
          <g>
            <line
              x1={PAD.left} y1={yScale(referenceMin)}
              x2={PAD.left + PW} y2={yScale(referenceMin)}
              stroke="#86efac" strokeWidth="1.5" strokeDasharray="6 4"
            />
            <text
              x={PAD.left + PW + 6} y={yScale(referenceMin)}
              dominantBaseline="middle" fontSize="10" fill="#86efac"
            >
              mín
            </text>
          </g>
        )}

        {/* Linha de tendência animada */}
        {points.length > 1 && (
          <path
            d={linePath}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            clipPath={`url(#${clipId})`}
            className={`line-${animId.replace(/:/g, '')}`}
          />
        )}

        {/* Pontos de dados */}
        {points.map((p, i) => (
          <g
            key={i}
            style={{
              cursor: 'pointer',
              animationDelay: `${1.0 + i * 0.08}s`,
              transformOrigin: `${xScale(p.date).toFixed(1)}px ${yScale(p.value).toFixed(1)}px`,
            }}
            onMouseEnter={(e) => {
              const svg = (e.currentTarget as SVGGElement).closest('svg')!
              const rect = svg.getBoundingClientRect()
              const svgX = ((xScale(p.date) / W) * rect.width) + rect.left
              const svgY = ((yScale(p.value) / H) * rect.height) + rect.top
              setTooltip({ x: svgX, y: svgY, point: p })
            }}
            onMouseLeave={() => setTooltip(null)}
          >
            {/* Halo para pontos fora de referência */}
            {(p.flag === 'alto' || p.flag === 'baixo') && (
              <circle
                cx={xScale(p.date)} cy={yScale(p.value)} r={11}
                fill={flagColor(p.flag)} fillOpacity="0.15"
              />
            )}
            <circle
              cx={xScale(p.date)} cy={yScale(p.value)} r={6}
              fill={flagColor(p.flag)}
              stroke="white" strokeWidth="2"
            />
          </g>
        ))}

        {/* Eixo X — datas */}
        {points.map((p, i) => (
          <text
            key={i}
            x={xScale(p.date)} y={PAD.top + PH + 20}
            textAnchor="middle" fontSize="11" fill="#94a3b8"
          >
            {formatDate(p.date)}
          </text>
        ))}

        {/* Borda da área de plot */}
        <rect
          x={PAD.left} y={PAD.top} width={PW} height={PH}
          fill="none" stroke="#e2e8f0" strokeWidth="1" rx="4"
        />
      </svg>

      {/* Tooltip flutuante (HTML sobre o SVG) */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 40,
            transform: 'translateY(-50%)',
          }}
        >
          <div className="font-semibold text-slate-700 capitalize">{analyteName}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: flagColor(tooltip.point.flag) }}
            />
            <span className="font-mono text-slate-800">
              {tooltip.point.value} {unit}
            </span>
          </div>
          {(tooltip.point.referenceMin !== null || tooltip.point.referenceMax !== null) && (
            <div className="text-slate-400 mt-0.5">
              ref: {tooltip.point.referenceMin ?? '–'} – {tooltip.point.referenceMax ?? '–'}
            </div>
          )}
          <div className="text-slate-400 mt-0.5">{formatDate(tooltip.point.date)}</div>
          {tooltip.point.flag && tooltip.point.flag !== 'normal' && (
            <div
              className="mt-1 font-medium uppercase tracking-wide"
              style={{ color: flagColor(tooltip.point.flag) }}
            >
              {tooltip.point.flag}
            </div>
          )}
        </div>
      )}

      {/* Legenda */}
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-green-400" /> normal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-red-400" /> acima do limite
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-400" /> abaixo do limite
        </span>
        {(referenceMin !== null || referenceMax !== null) && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-5 rounded-sm bg-green-100 border border-green-300" />
            intervalo de referência
          </span>
        )}
      </div>
    </div>
  )
}
