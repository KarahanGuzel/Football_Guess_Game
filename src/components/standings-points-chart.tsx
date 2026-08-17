"use client";

import { useMemo, useState } from "react";
import { FanFlag } from "@/components/fan-flag";
import type { StandingsProgress } from "@/lib/data";

const SERIES_COLORS = [
  "#c6e06a",
  "#5b9fd4",
  "#e07280",
  "#e0a54a",
  "#9b7bff",
  "#5dca96",
  "#f0c040",
  "#6ec6d8",
];

function shortWeekLabel(label: string, index: number) {
  const match = label.match(/(\d+)/);
  if (match) return `H${match[1]}`;
  return `H${index + 1}`;
}

export function StandingsPointsChart({ data }: { data: StandingsProgress }) {
  const [active, setActive] = useState<{
    pointIndex: number;
    x: number;
  } | null>(null);

  const chart = useMemo(() => {
    const labels = ["0", ...data.weeks.map((w, i) => shortWeekLabel(w.label, i))];
    const titleLabels = ["0. hafta", ...data.weeks.map((w) => w.label)];
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

  // Mobile summary defaults to latest week; desktop tooltip only on hover/tap
  const fallback =
    chart.pointCount > 0
      ? {
          pointIndex: chart.pointCount - 1,
          x: chart.xAt(chart.pointCount - 1),
        }
      : null;
  const selected = active ?? fallback;

  function selectPoint(pointIndex: number) {
    setActive({ pointIndex, x: chart.xAt(pointIndex) });
  }

  if (data.weeks.length === 0) {
    return (
      <div className="panel standings-chart-panel">
        <div className="standings-chart-head">
          <h2 className="section-title">Sezon grafiği</h2>
          <p className="muted standings-chart-sub">
            0. haftadan bugüne toplam puan
          </p>
        </div>
        <p className="muted" style={{ margin: 0 }}>
          Henüz puanlanmış hafta yok. İlk skor sonrası grafik dolacak.
        </p>
      </div>
    );
  }

  const selectedTotals =
    selected == null
      ? null
      : chart.paths.map((path) => ({
          name: path.displayName,
          slug: path.slug,
          color: path.color,
          total: path.totals[selected.pointIndex] ?? 0,
        }));

  return (
    <div className="panel standings-chart-panel">
      <div className="standings-chart-head">
        <h2 className="section-title">Sezon grafiği</h2>
        <p className="muted standings-chart-sub">
          0. haftadan bugüne toplam puan
        </p>
      </div>

      <div
        className="standings-chart-weeks"
        role="tablist"
        aria-label="Hafta seç"
      >
        {chart.labels.map((label, i) => (
          <button
            key={`${label}-${i}`}
            type="button"
            role="tab"
            className={`standings-chart-week-chip${
              selected?.pointIndex === i ? " standings-chart-week-chip-active" : ""
            }`}
            aria-selected={selected?.pointIndex === i}
            onClick={() => selectPoint(i)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="standings-chart-wrap">
        <svg
          className="standings-chart-svg"
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          role="img"
          aria-label="Sezon boyunca kümülatif toplam puan grafiği"
          onMouseLeave={() => setActive(null)}
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
                r={selected?.pointIndex === i ? 4.2 : 3}
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
                className="standings-chart-hit"
                onMouseEnter={() => selectPoint(i)}
                onPointerDown={(event) => {
                  event.preventDefault();
                  selectPoint(i);
                }}
              />
            );
          })}

          {active ? (
            <line
              x1={active.x}
              x2={active.x}
              y1={chart.pad.top}
              y2={chart.pad.top + chart.innerH}
              className="standings-chart-hover-line"
            />
          ) : null}
        </svg>

        {active && selectedTotals ? (
          <div
            className="standings-chart-tooltip standings-chart-tooltip-desktop"
            style={{ left: `${(active.x / chart.width) * 100}%` }}
          >
            <div className="standings-chart-tooltip-title">
              {chart.titleLabels[active.pointIndex]}
            </div>
            <ul className="standings-chart-tooltip-list">
              {[...selectedTotals]
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

      {selected && selectedTotals ? (
        <div className="standings-chart-mobile-summary">
          <div className="standings-chart-tooltip-title">
            {chart.titleLabels[selected.pointIndex]}
          </div>
          <ul className="standings-chart-tooltip-list">
            {[...selectedTotals]
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
