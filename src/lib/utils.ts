import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calcularNps(respostas: number[]): number {
  if (respostas.length === 0) return 0;
  const promotores = respostas.filter((n) => n >= 9).length;
  const detratores = respostas.filter((n) => n <= 6).length;
  return Math.round(((promotores - detratores) / respostas.length) * 100);
}

export function classificarNps(nps: number): { label: string; color: string } {
  if (nps >= 75) return { label: "Zona de Excelência", color: "#16a34a" };
  if (nps >= 50) return { label: "Zona de Qualidade", color: "#2563eb" };
  if (nps >= 0) return { label: "Zona de Melhoria", color: "#d97706" };
  return { label: "Zona Crítica", color: "#dc2626" };
}
