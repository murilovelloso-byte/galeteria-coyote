import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { senha } = await req.json();
  const adminSenha = process.env.ADMIN_PASSWORD || "coyote@admin2024";

  if (senha !== adminSenha) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("coyote_admin_session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("coyote_admin_session");
  return res;
}
