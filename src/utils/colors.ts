import { scaleLinear } from 'd3-scale';
import type { GradientConfig } from '../types';

export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
}

export function interpolateColor(color1: string, color2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);
  return rgbToHex(
    r1 + (r2 - r1) * t,
    g1 + (g2 - g1) * t,
    b1 + (b2 - b1) * t,
  );
}

export function createColorScale(
  gradient: GradientConfig,
  domain: [number, number],
) {
  const scale = scaleLinear<string>()
    .domain(domain)
    .range([gradient.startColor, gradient.endColor])
    .clamp(true);
  return scale;
}

export function getRegionColor(
  value: number | undefined,
  minVal: number,
  maxVal: number,
  gradient: GradientConfig,
  noDataColor = '#111827',
): string {
  if (value === undefined || value === null) return noDataColor;
  if (minVal === maxVal) return gradient.endColor;
  const t = (value - minVal) / (maxVal - minVal);
  return interpolateColor(gradient.startColor, gradient.endColor, t);
}

export function generateGradientStops(gradient: GradientConfig, steps = 10): string[] {
  const stops: string[] = [];
  for (let i = 0; i <= steps; i++) {
    stops.push(interpolateColor(gradient.startColor, gradient.endColor, i / steps));
  }
  return stops;
}
