"use client";

import { useMemo, useState } from "react";
import { FanFlag } from "@/components/fan-flag";
import type { StandingsProgress } from "@/lib/data";

const SERIES_COLORS = [
  "#b7d24f",
  "#5b9fd4",
  "#e07280",
  "#e0a54a",
  "#9b7bff",
  "#4cbf8a",
  "#f0c040",
  "#6ec6d8",
];

function shortWeekLabel(label: string, index: number) {
  const match = label.match(/(\d+)/);
  if (match) return `H${match[1]}`;
  return `H${index + 1}`;
}

export function StandingsPointsChart({ data }: { data: StandingsProgress }) {
  const [hover, setHover] = useState<{
    pointIndex: number;
    x: number;
  } | null>(null);

  const chart = useMemo(() => {
    // Start at origin (0 pts) before the first scored week.
    const labels = ["0", ...data.weeks.map((w, i) => shortWeekLabel(w.label, i))];
    const titleLabels = ["Başlangıç", ...data.weeks.map((w) => w.label)];
    const pointCount = labels.length;

    const width = 640;
    const height = 280;
    const pad = { top: 18, right: 16, bottom: 36, left: 36 };
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;
    const maxY = Math.max(1, ...data.series.flatMap((s) => s.totals));
    const niceMax = Math.ceil(maxY / 5) * 5 || 5;

    const xAt = (i: number) =>
      pad.left + (pointCount <= 1 ? innerW / 2 : (i / (pointCount - 1)) * innerW);
    const yAt = (v: number) => pad.top + innerH - (v / niceMax) * innerH;

    const gridYs = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
      y: pad.top + innerH * (1 - t),
      value: Math.round(niceMax * t),
    }));

    const paths = data.series.map((series, seriesIndex) => {
      const totals = [0, ...series.totals];
      const points = totals.map((total, i) => ({
        x: xAt(i),
        y: yAt(total),
        total,
      }));
      const d = points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(" ");
      return {
        ...series,
        totals,
        color: SERIES_COLORS[seriesIndex % SERIES_COLORS.length],
        d,
        points,
      };
    });

    return {
      width,
      height,
      pad,
      innerH,
      xAt,
      gridYs,
      paths,
      labels,
      titleLabels,
      pointCount,
    };
  }, [data]);

  if (data.weeks.length === 0) {
    return (
      <div className="panel standings-chart-panel">
        <div className="standings-chart-head">
          <h2 className="section-title">Puan grafiği</h2>
          <p className="muted standings-chart-sub">Hafta · kümülatif toplam</p>
        </div>
        <p className="muted" style={{ margin: 0 }}>
          Henüz puanlanmış hafta yok. Grafik ilk skor sonrası dolacak.
        </p>
      </div>
    );
  }

  const hoverTotals =
    hover == null
      ? null
      : chart.paths.map((path) => ({
          name: path.displayName,
          slug: path.slug,
          color: path.color,
          total: path.totals[hover.pointIndex] ?? 0,
        }));

  return (
    <div className="panel standings-chart-panel">
      <div className="standings-chart-head">
        <h2 className="section-title">Puan grafiği</h2>
        <p className="muted standings-chart-sub">Hafta · kümülatif toplam puan</p>
      </div>

      <div className="standings-chart-wrap">
        <svg
          className="standings-chart-svg"
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          role="img"
          aria-label="Oyuncuların haftalara göre toplam puan grafiği"
          onMouseLeave={() => setHover(null)}
        >
          {chart.gridYs.map((g) => (
            <g key={g.value}>
              <line
                x1={chart.pad.left}
                x2={chart.width - chart.pad.right}
                y1={g.y}
                y2={g.y}
                className="standings-chart-grid"
              />
              <text
                x={chart.pad.left - 8}
                y={g.y + 4}
                textAnchor="end"
                className="standings-chart-axis"
              >
                {g.value}
              </text>
            </g>
          ))}

          {chart.labels.map((label, i) => (
            <text
              key={`${label}-${i}`}
              x={chart.xAt(i)}
              y={chart.height - 12}
              textAnchor="middle"
              className="standings-chart-axis"
            >
              {label}
            </text>
          ))}

          {chart.paths.map((path) => (
            <path
              key={path.playerId}
              d={path.d}
              fill="none"
              stroke={path.color}
              strokeWidth="2.4"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="standings-chart-line"
            />
          ))}

          {chart.paths.map((path) =>
            path.points.map((point, i) => (
              <circle
                key={`${path.playerId}-${i}`}
                cx={point.x}
                cy={point.y}
                r={hover?.pointIndex === i ? 4.2 : 3}
                fill={path.color}
                className="standings-chart-dot"
              />
            )),
          )}

          {chart.labels.map((label, i) => {
            const x = chart.xAt(i);
            const prev = i === 0 ? chart.pad.left : (chart.xAt(i - 1) + x) / 2;
            const next =
              i === chart.pointCount - 1
                ? chart.width - chart.pad.right
                : (x + chart.xAt(i + 1)) / 2;
            return (
              <rect
                key={`hit-${label}-${i}`}
                x={prev}
                y={chart.pad.top}
                width={Math.max(next - prev, 1)}
                height={chart.innerH}
                fill="transparent"
                onMouseEnter={() => setHover({ pointIndex: i, x })}
              />
            );
          })}

          {hover ? (
            <line
              x1={hover.x}
              x2={hover.x}
              y1={chart.pad.top}
              y2={chart.pad.top + chart.innerH}
              className="standings-chart-hover-line"
            />
          ) : null}
        </svg>

        {hover && hoverTotals ? (
          <div
            className="standings-chart-tooltip"
            style={{ left: `${(hover.x / chart.width) * 100}%` }}
          >
            <div className="standings-chart-tooltip-title">
              {chart.titleLabels[hover.pointIndex]}
            </div>
            <ul className="standings-chart-tooltip-list">
              {[...hoverTotals]
                .sort((a, b) => b.total - a.total)
                .map((row) => (
                  <li key={row.name}>
                    <span
                      className="standings-chart-swatch"
                      style={{ background: row.color }}
                    />
                    <span>{row.name}</span>
                    <strong>{row.total}</strong>
                  </li>
                ))}
            </ul>
          </div>
        ) : null}
      </div>

      <ul className="standings-chart-legend">
        {chart.paths.map((path) => (
          <li key={path.playerId}>
            <span
              className="standings-chart-swatch"
              style={{ background: path.color }}
            />
            <FanFlag slug={path.slug} displayName={path.displayName} size={10} />
            <span>{path.displayName}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
