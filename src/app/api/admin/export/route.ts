import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const formato = searchParams.get("formato") || "xlsx";

  const respostas = await prisma.resposta.findMany({
    orderBy: { criadoEm: "desc" },
  });

  const dados = respostas.map((r) => ({
    ID: r.id,
    "Data/Hora": r.criadoEm.toLocaleString("pt-BR"),
    "Nota Sabor": r.notaSabor,
    "Nota Atendimento": r.notaAtendimento,
    "Nota Tempo": r.notaTempo,
    "Pedido Conforme": r.pedidoConforme,
    Destaques: r.destaques.join(", "),
    "Nota NPS": r.notaNps,
    "Tipo NPS":
      r.notaNps >= 9 ? "Promotor" : r.notaNps >= 7 ? "Neutro" : "Detrator",
    Comentário: r.comentario || "",
    Origem: r.origem || "",
  }));

  if (formato === "csv") {
    const cabecalho = Object.keys(dados[0] || {}).join(",");
    const linhas = dados.map((row) =>
      Object.values(row)
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [cabecalho, ...linhas].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="respostas-coyote.csv"`,
      },
    });
  }

  // XLSX
  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Respostas");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="respostas-coyote.xlsx"`,
    },
  });
}
