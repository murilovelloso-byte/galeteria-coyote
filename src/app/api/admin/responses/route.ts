import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo"); // promotores | neutros | detratores
  const inicio = searchParams.get("inicio");
  const fim = searchParams.get("fim");
  const pagina = parseInt(searchParams.get("pagina") || "1");
  const porPagina = 20;

  const npsWhere =
    tipo === "promotores"
      ? { notaNps: { gte: 9 } }
      : tipo === "neutros"
      ? { notaNps: { gte: 7, lte: 8 } }
      : tipo === "detratores"
      ? { notaNps: { lte: 6 } }
      : {};

  const where = {
    ...npsWhere,
    ...(inicio || fim
      ? {
          criadoEm: {
            ...(inicio ? { gte: new Date(inicio) } : {}),
            ...(fim ? { lte: new Date(fim + "T23:59:59") } : {}),
          },
        }
      : {}),
    comentario: { not: null },
  };

  const [total, respostas] = await Promise.all([
    prisma.resposta.count({ where }),
    prisma.resposta.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
      select: {
        id: true,
        criadoEm: true,
        notaSabor: true,
        notaAtendimento: true,
        notaTempo: true,
        notaNps: true,
        comentario: true,
        origem: true,
      },
    }),
  ]);

  return NextResponse.json({
    respostas,
    total,
    totalPaginas: Math.ceil(total / porPagina),
    pagina,
  });
}
