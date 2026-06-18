import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      notaSabor,
      notaAtendimento,
      notaTempo,
      pedidoConforme,
      destaques,
      notaNps,
      comentario,
      origem,
    } = body;

    if (
      typeof notaSabor !== "number" ||
      typeof notaAtendimento !== "number" ||
      typeof notaTempo !== "number" ||
      !pedidoConforme ||
      !Array.isArray(destaques) ||
      typeof notaNps !== "number"
    ) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const resposta = await prisma.resposta.create({
      data: {
        notaSabor,
        notaAtendimento,
        notaTempo,
        pedidoConforme,
        destaques,
        notaNps,
        comentario: comentario || null,
        ip,
        origem: origem || "direto",
      },
    });

    return NextResponse.json({ id: resposta.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
