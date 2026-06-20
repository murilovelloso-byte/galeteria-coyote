"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { classificarNps } from "@/lib/utils";

type Metricas = {
  total: number;
  mediaSabor: number;
  mediaAtendimento: number;
  mediaTempo: number;
  mediaGeral: number;
  nps: number;
  percentualSemProblemas: number;
  distribuicaoNps: { nota: number; total: number }[];
  distribuicaoSabor: { nota: number; total: number }[];
  distribuicaoAtendimento: { nota: number; total: number }[];
  distribuicaoTempo: { nota: number; total: number }[];
  evolucaoNps: { data: string; nps: number; total: number }[];
  destaques: { nome: string; total: number }[];
};

type Resposta = {
  id: number;
  criadoEm: string;
  notaSabor: number;
  notaAtendimento: number;
  notaTempo: number;
  notaNps: number;
  comentario: string | null;
  origem: string | null;
};

type RespostasData = {
  respostas: Resposta[];
  total: number;
  totalPaginas: number;
  pagina: number;
};

const ESTRELAS = ["★", "★★", "★★★", "★★★★", "★★★★★"];

// Ícones SVG simples, sem emojis
const IconStar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#FFD700" stroke="#e6b800" strokeWidth="1">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);
const IconChart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IconFood = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
  </svg>
);
const IconPeople = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconClock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconTrend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconTarget = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconComment = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconLightbulb = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
  </svg>
);
const IconExcel = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
const IconCSV = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="16" y2="17"/>
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

function MetricCard({ titulo, valor, subtitulo, cor, icone }: {
  titulo: string; valor: string | number; subtitulo?: string; cor: string; icone: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div style={{ color: cor }}>{icone}</div>
        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: cor + "20", color: cor }}>
          {subtitulo}
        </span>
      </div>
      <p className="text-3xl font-black" style={{ color: cor }}>{valor}</p>
      <p className="text-xs text-gray-500 mt-1 font-medium">{titulo}</p>
    </div>
  );
}

function NpsBadge({ nota }: { nota: number }) {
  const cor = nota <= 6 ? "#CC0000" : nota <= 8 ? "#f59e0b" : "#16a34a";
  const label = nota <= 6 ? "Detrator" : nota <= 8 ? "Neutro" : "Promotor";
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-white" style={{ background: cor }}>
      {nota} — {label}
    </span>
  );
}

function Relatorio({ metricas }: { metricas: Metricas }) {
  const dicas: { tipo: "atencao" | "positivo" | "dica"; titulo: string; texto: string }[] = [];

  const piorNota = Math.min(metricas.mediaSabor, metricas.mediaAtendimento, metricas.mediaTempo);
  const melhorNota = Math.max(metricas.mediaSabor, metricas.mediaAtendimento, metricas.mediaTempo);

  if (metricas.nps >= 75) {
    dicas.push({ tipo: "positivo", titulo: "Excelente reputação", texto: `Seu NPS de ${metricas.nps} indica que a grande maioria dos clientes recomendaria a galeteria. Continue mantendo esse padrão de qualidade.` });
  } else if (metricas.nps >= 50) {
    dicas.push({ tipo: "positivo", titulo: "Boa reputação", texto: `NPS ${metricas.nps} — a maioria dos clientes está satisfeita. Para chegar à excelência, foque nos clientes que deram nota 7 ou 8 e entenda o que falta para eles se tornarem promotores.` });
  } else if (metricas.nps >= 0) {
    dicas.push({ tipo: "atencao", titulo: "Reputação em zona de melhoria", texto: `NPS ${metricas.nps} — há um número considerável de clientes insatisfeitos. Leia os comentários negativos e identifique padrões. Pequenas melhorias consistentes elevam bastante esse número.` });
  } else {
    dicas.push({ tipo: "atencao", titulo: "Alerta: muitos clientes insatisfeitos", texto: `NPS ${metricas.nps} — mais clientes detratores do que promotores. Priorize ler todos os comentários e agir rapidamente sobre os problemas mais citados.` });
  }

  if (metricas.mediaSabor === piorNota && metricas.mediaSabor < 4) {
    dicas.push({ tipo: "atencao", titulo: "Sabor precisa de atenção", texto: `Nota ${metricas.mediaSabor}/5 no sabor. Os clientes estão sinalizando que o produto não está atingindo as expectativas. Revise temperos, ponto de cocção e padronização das receitas.` });
  } else if (metricas.mediaSabor === melhorNota) {
    dicas.push({ tipo: "positivo", titulo: "Sabor é o grande destaque", texto: `Nota ${metricas.mediaSabor}/5 no sabor — seu ponto mais forte. Use isso no marketing: depoimentos e fotos dos produtos têm grande potencial de atração.` });
  }

  if (metricas.mediaAtendimento === piorNota && metricas.mediaAtendimento < 4) {
    dicas.push({ tipo: "atencao", titulo: "Atendimento pode melhorar", texto: `Nota ${metricas.mediaAtendimento}/5 no atendimento. Considere treinamento da equipe focado em cordialidade, agilidade no contato e resolução de problemas na hora.` });
  }

  if (metricas.mediaTempo === piorNota && metricas.mediaTempo < 4) {
    dicas.push({ tipo: "atencao", titulo: "Tempo de preparo/entrega é um problema", texto: `Nota ${metricas.mediaTempo}/5 na rapidez. Clientes estão esperando mais do que gostariam. Avalie o processo de produção e se a equipe está dimensionada corretamente para os horários de pico.` });
  }

  if (metricas.percentualSemProblemas < 80) {
    dicas.push({ tipo: "atencao", titulo: "Pedidos com erros frequentes", texto: `Apenas ${metricas.percentualSemProblemas}% dos pedidos chegaram sem problemas. Revise o processo de conferência antes da entrega e crie um checklist para a equipe.` });
  } else if (metricas.percentualSemProblemas >= 95) {
    dicas.push({ tipo: "positivo", titulo: "Pedidos muito confiáveis", texto: `${metricas.percentualSemProblemas}% dos pedidos entregues corretamente. Isso gera confiança e reduz retrabalho. Mantenha esse padrão.` });
  }

  if (metricas.destaques.length > 0) {
    const top = metricas.destaques[0];
    dicas.push({ tipo: "dica", titulo: `"${top.nome}" é o que mais se destaca`, texto: `${top.total} clientes citaram "${top.nome}" como o principal ponto positivo. Reforce isso na comunicação e garanta que seja consistente em todos os pedidos.` });
  }

  if (metricas.total < 10) {
    dicas.push({ tipo: "dica", titulo: "Colete mais avaliações", texto: `Com ${metricas.total} respostas, os dados ainda são poucos para conclusões definitivas. Incentive os clientes a responder via QR Code nas embalagens, balcão e redes sociais.` });
  }

  const corTipo = { atencao: "#CC0000", positivo: "#16a34a", dica: "#2563eb" };
  const labelTipo = { atencao: "Ponto de atenção", positivo: "Ponto positivo", dica: "Dica estratégica" };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
      <div className="flex items-center gap-2 mb-5">
        <div style={{ color: "#CC0000" }}><IconLightbulb /></div>
        <h3 className="font-bold text-gray-800 text-sm">Análise e Recomendações para o Negócio</h3>
      </div>

      {metricas.total === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Sem dados suficientes para análise. Colete as primeiras avaliações.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dicas.map((d, i) => (
            <div key={i} className="rounded-xl p-4 border-l-4" style={{
              borderColor: corTipo[d.tipo],
              background: corTipo[d.tipo] + "08"
            }}>
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: corTipo[d.tipo] }}>
                {labelTipo[d.tipo]}
              </span>
              <p className="font-bold text-gray-800 text-sm mt-1">{d.titulo}</p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{d.texto}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [respostasData, setRespostasData] = useState<RespostasData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [pagina, setPagina] = useState(1);

  const buscarMetricas = useCallback(async () => {
    const params = new URLSearchParams();
    if (inicio) params.set("inicio", inicio);
    if (fim) params.set("fim", fim);
    const res = await fetch(`/api/admin/metrics?${params}`);
    if (res.status === 401) { router.push("/admin/login"); return; }
    setMetricas(await res.json());
  }, [inicio, fim, router]);

  const buscarRespostas = useCallback(async () => {
    const params = new URLSearchParams({ pagina: String(pagina) });
    if (inicio) params.set("inicio", inicio);
    if (fim) params.set("fim", fim);
    if (tipoFiltro !== "todos") params.set("tipo", tipoFiltro);
    const res = await fetch(`/api/admin/responses?${params}`);
    if (res.ok) setRespostasData(await res.json());
  }, [inicio, fim, tipoFiltro, pagina]);

  useEffect(() => {
    setCarregando(true);
    Promise.all([buscarMetricas(), buscarRespostas()]).finally(() => setCarregando(false));
  }, [buscarMetricas, buscarRespostas]);

  const sair = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  };

  const exportar = (formato: "xlsx" | "csv") => window.open(`/api/admin/export?formato=${formato}`, "_blank");

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8f8" }}>
        <div className="text-center">
          <Image src="/logo-final.png" alt="Galeteria Coyote" width={100} height={100} className="mx-auto mb-3 animate-pulse" />
          <p className="text-gray-500 text-sm">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const npsInfo = metricas ? classificarNps(metricas.nps) : null;

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 shadow-md" style={{ background: "linear-gradient(135deg, #CC0000, #990000)" }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo-final.png" alt="Galeteria Coyote" width={44} height={44} />
            <div>
              <p className="text-white font-black text-sm leading-tight">GALETERIA COYOTE</p>
              <p className="text-white/60 text-xs">Painel de Satisfação</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => exportar("xlsx")}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition cursor-pointer"
              style={{ background: "rgba(22,163,74,0.85)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <IconExcel /> Exportar Excel
            </button>
            <button onClick={() => exportar("csv")}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition cursor-pointer"
              style={{ background: "rgba(37,99,235,0.85)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <IconCSV /> Exportar CSV
            </button>
            <button onClick={sair}
              className="px-3 py-2 rounded-xl text-xs font-bold text-white/80 hover:text-white border border-white/20 hover:border-white/40 transition cursor-pointer">
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Período — De</label>
            <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Até</label>
            <input type="date" value={fim} onChange={(e) => setFim(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
          </div>
          <button onClick={() => { setInicio(""); setFim(""); }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 cursor-pointer">
            Limpar filtro
          </button>
          <div className="ml-auto flex gap-2 sm:hidden">
            <button onClick={() => exportar("xlsx")} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer" style={{ background: "#16a34a" }}>
              <IconExcel /> Excel
            </button>
            <button onClick={() => exportar("csv")} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer" style={{ background: "#2563eb" }}>
              <IconCSV /> CSV
            </button>
          </div>
        </div>

        {metricas && (
          <>
            {/* Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              <MetricCard titulo="Nota Geral dos Clientes" valor={`${metricas.mediaGeral}/5`} subtitulo={`${metricas.total} avaliações`} cor="#CC0000" icone={<IconStar />} />
              <MetricCard titulo="Índice de Indicação (NPS)" valor={metricas.nps} subtitulo={npsInfo?.label || ""} cor={npsInfo?.color || "#CC0000"} icone={<IconChart />} />
              <MetricCard titulo="Nota do Sabor" valor={`${metricas.mediaSabor}/5`} subtitulo="estrelas" cor="#e65c00" icone={<IconFood />} />
              <MetricCard titulo="Nota do Atendimento" valor={`${metricas.mediaAtendimento}/5`} subtitulo="estrelas" cor="#7c3aed" icone={<IconPeople />} />
              <MetricCard titulo="Nota da Rapidez" valor={`${metricas.mediaTempo}/5`} subtitulo="estrelas" cor="#0891b2" icone={<IconClock />} />
              <MetricCard titulo="Pedidos sem Problema" valor={`${metricas.percentualSemProblemas}%`} subtitulo="conformidade" cor="#16a34a" icone={<IconCheck />} />
            </div>

            {/* Relatório de insights */}
            <Relatorio metricas={metricas} />

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-red-600"><IconTrend /></div>
                  <h3 className="font-bold text-gray-800 text-sm">Como a satisfação mudou ao longo do tempo</h3>
                </div>
                {metricas.evolucaoNps.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={metricas.evolucaoNps}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="data" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis domain={[-100, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: unknown) => [`NPS: ${v}`, ""]} labelFormatter={(l) => `Data: ${l}`} />
                      <Line type="monotone" dataKey="nps" stroke="#CC0000" strokeWidth={2} dot={{ fill: "#CC0000", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-44 flex items-center justify-center text-gray-400 text-sm">Sem dados suficientes</div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-red-600"><IconTarget /></div>
                  <h3 className="font-bold text-gray-800 text-sm">Quantos clientes indicariam a galeteria (0 a 10)</h3>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={metricas.distribuicaoNps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="nota" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: unknown) => [`${v} clientes`, ""]} />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                      {metricas.distribuicaoNps.map((entry, i) => (
                        <Cell key={i} fill={entry.nota <= 6 ? "#CC0000" : entry.nota <= 8 ? "#f59e0b" : "#16a34a"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#CC0000" }} /> Insatisfeitos (0–6)</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#f59e0b" }} /> Neutros (7–8)</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#16a34a" }} /> Satisfeitos (9–10)</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 text-sm mb-4">Avaliação do Sabor dos Produtos</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={metricas.distribuicaoSabor}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="nota" tickFormatter={(v) => ESTRELAS[v - 1]} tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: unknown) => [`${v} clientes`, ""]} labelFormatter={(l) => ESTRELAS[Number(l) - 1]} />
                    <Bar dataKey="total" fill="#e65c00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 text-sm mb-4">Avaliação do Atendimento</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={metricas.distribuicaoAtendimento}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="nota" tickFormatter={(v) => ESTRELAS[v - 1]} tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: unknown) => [`${v} clientes`, ""]} labelFormatter={(l) => ESTRELAS[Number(l) - 1]} />
                    <Bar dataKey="total" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 text-sm mb-4">Avaliação da Rapidez no Preparo / Entrega</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={metricas.distribuicaoTempo}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="nota" tickFormatter={(v) => ESTRELAS[v - 1]} tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: unknown) => [`${v} clientes`, ""]} labelFormatter={(l) => ESTRELAS[Number(l) - 1]} />
                    <Bar dataKey="total" fill="#0891b2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 text-sm mb-4">O que os clientes mais destacaram</h3>
                {metricas.destaques.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {metricas.destaques.map((d, i) => {
                      const pct = (d.total / metricas.destaques[0].total) * 100;
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 w-28 shrink-0 truncate">{d.nome}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #CC0000, #FFD700)" }} />
                          </div>
                          <span className="text-xs font-bold text-gray-700 w-6 text-right">{d.total}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Sem dados</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Comentários */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <div className="text-gray-500"><IconComment /></div>
              <h3 className="font-bold text-gray-800 text-sm">O que os clientes estão falando</h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "Todos", value: "todos" },
                { label: "Satisfeitos (9–10)", value: "promotores" },
                { label: "Neutros (7–8)", value: "neutros" },
                { label: "Insatisfeitos (0–6)", value: "detratores" },
              ].map((f) => (
                <button key={f.value} onClick={() => { setTipoFiltro(f.value); setPagina(1); }}
                  className="px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer"
                  style={{ background: tipoFiltro === f.value ? "#CC0000" : "#f3f4f6", color: tipoFiltro === f.value ? "#fff" : "#374151" }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {respostasData && respostasData.respostas.length > 0 ? (
            <>
              <div className="flex flex-col gap-3">
                {respostasData.respostas.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl border border-gray-100" style={{ background: "#f9fafb" }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <NpsBadge nota={r.notaNps} />
                        <span className="text-xs text-gray-400">
                          Sabor {r.notaSabor}★ · Atend. {r.notaAtendimento}★ · Rapidez {r.notaTempo}★
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400">
                          {new Date(r.criadoEm).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {r.origem && <span className="text-xs text-gray-300">via {r.origem}</span>}
                      </div>
                    </div>
                    {r.comentario && (
                      <p className="text-sm text-gray-700 italic">&ldquo;{r.comentario}&rdquo;</p>
                    )}
                  </div>
                ))}
              </div>
              {respostasData.totalPaginas > 1 && (
                <div className="flex items-center justify-center gap-2 mt-5">
                  <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1}
                    className="px-3 py-1 rounded-lg text-sm border disabled:opacity-40 cursor-pointer hover:bg-gray-50">←</button>
                  <span className="text-sm text-gray-600">{pagina} / {respostasData.totalPaginas}</span>
                  <button onClick={() => setPagina((p) => Math.min(respostasData.totalPaginas, p + 1))} disabled={pagina === respostasData.totalPaginas}
                    className="px-3 py-1 rounded-lg text-sm border disabled:opacity-40 cursor-pointer hover:bg-gray-50">→</button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">
              Nenhum comentário encontrado com os filtros selecionados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
