import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { calcularNps } from "@/lib/utils";

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const inicio = searchParams.get("inicio");
  const fim = searchParams.get("fim");

  const where = {
    ...(inicio || fim
      ? {
          criadoEm: {
            ...(inicio ? { gte: new Date(inicio) } : {}),
            ...(fim ? { lte: new Date(fim + "T23:59:59") } : {}),
          },
        }
      : {}),
  };

  const respostas = await prisma.resposta.findMany({ where });

  if (respostas.length === 0) {
    return NextResponse.json({
      total: 0,
      mediaSabor: 0,
      mediaAtendimento: 0,
      mediaTempo: 0,
      mediaGeral: 0,
      nps: 0,
      percentualSemProblemas: 0,
      distribuicaoNps: Array.from({ length: 11 }, (_, i) => ({ nota: i, total: 0 })),
      distribuicaoSabor: Array.from({ length: 5 }, (_, i) => ({ nota: i + 1, total: 0 })),
      distribuicaoAtendimento: Array.from({ length: 5 }, (_, i) => ({ nota: i + 1, total: 0 })),
      distribuicaoTempo: Array.from({ length: 5 }, (_, i) => ({ nota: i + 1, total: 0 })),
      evolucaoNps: [],
      destaques: [],
    });
  }

  const mediaSabor =
    respostas.reduce((s, r) => s + r.notaSabor, 0) / respostas.length;
  const mediaAtendimento =
    respostas.reduce((s, r) => s + r.notaAtendimento, 0) / respostas.length;
  const mediaTempo =
    respostas.reduce((s, r) => s + r.notaTempo, 0) / respostas.length;
  const mediaGeral = (mediaSabor + mediaAtendimento + mediaTempo) / 3;

  const nps = calcularNps(respostas.map((r) => r.notaNps));

  const semProblemas = respostas.filter((r) => r.pedidoConforme === "sim").length;
  const percentualSemProblemas = (semProblemas / respostas.length) * 100;

  // Distribuição NPS 0-10
  const distribuicaoNps = Array.from({ length: 11 }, (_, i) => ({
    nota: i,
    total: respostas.filter((r) => r.notaNps === i).length,
  }));

  // Distribuição estrelas 1-5
  const distribuicaoSabor = Array.from({ length: 5 }, (_, i) => ({
    nota: i + 1,
    total: respostas.filter((r) => r.notaSabor === i + 1).length,
  }));
  const distribuicaoAtendimento = Array.from({ length: 5 }, (_, i) => ({
    nota: i + 1,
    total: respostas.filter((r) => r.notaAtendimento === i + 1).length,
  }));
  const distribuicaoTempo = Array.from({ length: 5 }, (_, i) => ({
    nota: i + 1,
    total: respostas.filter((r) => r.notaTempo === i + 1).length,
  }));

  // Evolução NPS por dia (últimos 30 dias)
  const porDia = new Map<string, number[]>();
  for (const r of respostas) {
    const dia = r.criadoEm.toISOString().slice(0, 10);
    if (!porDia.has(dia)) porDia.set(dia, []);
    porDia.get(dia)!.push(r.notaNps);
  }
  const evolucaoNps = Array.from(porDia.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, notas]) => ({
      data,
      nps: calcularNps(notas),
      total: notas.length,
    }));

  // Contagem de destaques
  const contagemDestaques = new Map<string, number>();
  for (const r of respostas) {
    for (const d of r.destaques) {
      contagemDestaques.set(d, (contagemDestaques.get(d) || 0) + 1);
    }
  }
  const destaques = Array.from(contagemDestaques.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([nome, total]) => ({ nome, total }));

  return NextResponse.json({
    total: respostas.length,
    mediaSabor: +mediaSabor.toFixed(1),
    mediaAtendimento: +mediaAtendimento.toFixed(1),
    mediaTempo: +mediaTempo.toFixed(1),
    mediaGeral: +mediaGeral.toFixed(1),
    nps,
    percentualSemProblemas: +percentualSemProblemas.toFixed(1),
    distribuicaoNps,
    distribuicaoSabor,
    distribuicaoAtendimento,
    distribuicaoTempo,
    evolucaoNps,
    destaques,
  });
}
