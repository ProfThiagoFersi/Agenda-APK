import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Paciente, Agendamento } from '../types';
import { PRECO_PACOTE, PRECO_AVULSO } from '../data/therapyData';
import { formatarMoeda } from '../utils/dateUtils';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Activity,
  Award,
  Package,
  Receipt,
  Layers,
  BarChart3,
  Sparkles
} from 'lucide-react';

export type PeriodoOpcao = '3_meses' | '6_meses' | '12_meses' | 'ano_2026';
export type TipoGrafico = 'combinado' | 'faturamento' | 'sessoes';

interface FinancialRevenueChartProps {
  pacientes: Paciente[];
  agendamentos: Agendamento[];
}

interface DadosMes {
  anoMes: string; // "2026-04"
  rotuloCurto: string; // "Abr/26"
  rotuloCompleto: string; // "Abril 2026"
  receitaPacotes: number;
  qtdPacotes: number;
  receitaAvulso: number;
  qtdAvulsos: number;
  faturamentoTotal: number;
  sessoesRealizadas: number;
  ticketMedio: number;
}

const NOMES_MESES_CURTO = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const NOMES_MESES_COMPLETO = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const FinancialRevenueChart: React.FC<FinancialRevenueChartProps> = ({
  pacientes,
  agendamentos,
}) => {
  const [periodo, setPeriodo] = useState<PeriodoOpcao>('6_meses');
  const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>('combinado');

  // Gerar lista de meses para o período selecionado (Base: Setembro de 2026)
  const mesesPeriodo = useMemo(() => {
    // Data de referência: 15/09/2026
    const refAno = 2026;
    const refMes = 8; // 0-indexed (8 = Setembro)

    const listaMeses: { ano: number; mes: number; anoMes: string }[] = [];

    let qtdMeses = 6;
    if (periodo === '3_meses') qtdMeses = 3;
    else if (periodo === '6_meses') qtdMeses = 6;
    else if (periodo === '12_meses') qtdMeses = 12;
    else if (periodo === 'ano_2026') {
      // De Jan/2026 até Set/2026 (ou Dez)
      for (let m = 0; m <= 8; m++) {
        const mesStr = String(m + 1).padStart(2, '0');
        listaMeses.push({
          ano: 2026,
          mes: m,
          anoMes: `2026-${mesStr}`,
        });
      }
      return listaMeses;
    }

    for (let i = qtdMeses - 1; i >= 0; i--) {
      const d = new Date(refAno, refMes - i, 1);
      const a = d.getFullYear();
      const m = d.getMonth();
      const mesStr = String(m + 1).padStart(2, '0');
      listaMeses.push({
        ano: a,
        mes: m,
        anoMes: `${a}-${mesStr}`,
      });
    }

    return listaMeses;
  }, [periodo]);

  // Consolidar dados mensais de faturamento e sessões
  const dadosGrafico: DadosMes[] = useMemo(() => {
    return mesesPeriodo.map(({ ano, mes, anoMes }) => {
      // 1. Receita e quantidade de Pacotes vendidos/renovados no mês
      let receitaPacotes = 0;
      let qtdPacotes = 0;

      pacientes.forEach((pac) => {
        // Pacote ativo
        if (pac.pacoteAtivo && pac.pacoteAtivo.dataCompra) {
          if (pac.pacoteAtivo.dataCompra.startsWith(anoMes)) {
            receitaPacotes += pac.pacoteAtivo.valorTotal || PRECO_PACOTE;
            qtdPacotes += 1;
          }
        }

        // Histórico de pacotes
        (pac.historicoPacotes || []).forEach((pct) => {
          const dataRef = pct.dataRenovacao || pct.dataCompra;
          if (dataRef && dataRef.startsWith(anoMes)) {
            receitaPacotes += pct.valorTotal || PRECO_PACOTE;
            qtdPacotes += 1;
          }
        });
      });

      // 2. Receita de Sessões Avulsas e Total de Sessões Realizadas
      let receitaAvulso = 0;
      let qtdAvulsos = 0;
      let sessoesRealizadas = 0;

      agendamentos.forEach((ag) => {
        if (ag.data && ag.data.startsWith(anoMes)) {
          // Sessões realizadas ou em andamento
          if (ag.status !== 'cancelado') {
            sessoesRealizadas += 1;

            if (ag.modalidadeCobranca === 'avulso') {
              receitaAvulso += ag.valor || PRECO_AVULSO;
              qtdAvulsos += 1;
            }
          }
        }
      });

      const faturamentoTotal = receitaPacotes + receitaAvulso;
      const ticketMedio = sessoesRealizadas > 0 ? faturamentoTotal / sessoesRealizadas : 0;
      const rotuloCurto = `${NOMES_MESES_CURTO[mes]}/${String(ano).slice(2)}`;
      const rotuloCompleto = `${NOMES_MESES_COMPLETO[mes]} de ${ano}`;

      return {
        anoMes,
        rotuloCurto,
        rotuloCompleto,
        receitaPacotes,
        qtdPacotes,
        receitaAvulso,
        qtdAvulsos,
        faturamentoTotal,
        sessoesRealizadas,
        ticketMedio,
      };
    });
  }, [mesesPeriodo, pacientes, agendamentos]);

  // Estatísticas agregadas do período selecionado
  const estatisticas = useMemo(() => {
    const totalFaturamento = dadosGrafico.reduce((acc, d) => acc + d.faturamentoTotal, 0);
    const totalSessoes = dadosGrafico.reduce((acc, d) => acc + d.sessoesRealizadas, 0);
    const totalPacotes = dadosGrafico.reduce((acc, d) => acc + d.qtdPacotes, 0);
    const totalAvulsos = dadosGrafico.reduce((acc, d) => acc + d.qtdAvulsos, 0);
    const qtdMeses = dadosGrafico.length || 1;

    const mediaMensalFaturamento = totalFaturamento / qtdMeses;
    const mediaMensalSessoes = totalSessoes / qtdMeses;

    // Melhor mês
    let melhorMes = dadosGrafico[0] || null;
    dadosGrafico.forEach((d) => {
      if (!melhorMes || d.faturamentoTotal > melhorMes.faturamentoTotal) {
        melhorMes = d;
      }
    });

    return {
      totalFaturamento,
      totalSessoes,
      totalPacotes,
      totalAvulsos,
      mediaMensalFaturamento,
      mediaMensalSessoes,
      melhorMes,
    };
  }, [dadosGrafico]);

  // Custom Tooltip estilizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DadosMes = payload[0].payload;
      return (
        <div className="bg-stone-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-xl border border-stone-700 text-xs min-w-[210px] space-y-2">
          <div className="flex items-center justify-between border-b border-stone-700 pb-1.5">
            <span className="font-bold text-stone-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              {data.rotuloCompleto}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-900/80 text-teal-200 font-bold border border-teal-700/50">
              {data.sessoesRealizadas} sessões
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-stone-400 block">
              Faturamento Total
            </span>
            <span className="text-base font-black text-emerald-400">
              {formatarMoeda(data.faturamentoTotal)}
            </span>
          </div>

          <div className="space-y-1 pt-1 border-t border-stone-800 text-[11px]">
            <div className="flex items-center justify-between text-stone-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-500 inline-block"></span>
                Pacotes 4x ({data.qtdPacotes}):
              </span>
              <span className="font-semibold text-white">
                {formatarMoeda(data.receitaPacotes)}
              </span>
            </div>

            <div className="flex items-center justify-between text-stone-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                Avulsos ({data.qtdAvulsos}):
              </span>
              <span className="font-semibold text-white">
                {formatarMoeda(data.receitaAvulso)}
              </span>
            </div>

            {data.sessoesRealizadas > 0 && (
              <div className="flex items-center justify-between text-stone-400 pt-1 text-[10px]">
                <span>Ticket médio / sessão:</span>
                <span className="text-stone-300 font-medium">
                  {formatarMoeda(data.ticketMedio)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="financial-revenue-chart-card"
      className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-4"
    >
      {/* Header do Gráfico com Controles de Período e Tipo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Evolução Mensal: Faturamento & Sessões
              </h3>
              <p className="text-xs text-stone-500">
                Acompanhamento de receita e fluxo de atendimentos de Renata Okoti
              </p>
            </div>
          </div>
        </div>

        {/* Controles de Período e Tipo de Visualização */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Período */}
          <div className="inline-flex bg-stone-100 p-1 rounded-xl text-xs font-semibold text-stone-600">
            <button
              type="button"
              onClick={() => setPeriodo('3_meses')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                periodo === '3_meses'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'hover:text-stone-900'
              }`}
            >
              3 Meses
            </button>
            <button
              type="button"
              onClick={() => setPeriodo('6_meses')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                periodo === '6_meses'
                  ? 'bg-white text-teal-900 shadow-xs font-bold'
                  : 'hover:text-stone-900'
              }`}
            >
              6 Meses
            </button>
            <button
              type="button"
              onClick={() => setPeriodo('12_meses')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                periodo === '12_meses'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'hover:text-stone-900'
              }`}
            >
              12 Meses
            </button>
            <button
              type="button"
              onClick={() => setPeriodo('ano_2026')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                periodo === 'ano_2026'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'hover:text-stone-900'
              }`}
            >
              Ano 2026
            </button>
          </div>

          {/* Seletor de Modo de Exibição */}
          <div className="inline-flex bg-stone-100 p-1 rounded-xl text-xs font-semibold text-stone-600">
            <button
              type="button"
              onClick={() => setTipoGrafico('combinado')}
              title="Faturamento (Barras) + Sessões (Linha)"
              className={`px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-all ${
                tipoGrafico === 'combinado'
                  ? 'bg-white text-teal-900 shadow-xs font-bold'
                  : 'hover:text-stone-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-teal-700" />
              <span>Combinado</span>
            </button>
            <button
              type="button"
              onClick={() => setTipoGrafico('faturamento')}
              title="Apenas Faturamento detalhado"
              className={`px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-all ${
                tipoGrafico === 'faturamento'
                  ? 'bg-white text-teal-900 shadow-xs font-bold'
                  : 'hover:text-stone-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Faturamento</span>
            </button>
            <button
              type="button"
              onClick={() => setTipoGrafico('sessoes')}
              title="Apenas Evolução de Sessões"
              className={`px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-all ${
                tipoGrafico === 'sessoes'
                  ? 'bg-white text-teal-900 shadow-xs font-bold'
                  : 'hover:text-stone-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              <span>Sessões</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Resumo Rápido do Período */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
          <span className="text-[11px] font-semibold text-stone-500 block">
            Faturamento no Período
          </span>
          <span className="text-base sm:text-lg font-black text-stone-900 mt-0.5 block">
            {formatarMoeda(estatisticas.totalFaturamento)}
          </span>
          <span className="text-[11px] text-teal-700 font-medium">
            {estatisticas.totalPacotes} pacotes • {estatisticas.totalAvulsos} avulsos
          </span>
        </div>

        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
          <span className="text-[11px] font-semibold text-stone-500 block">
            Sessões Realizadas
          </span>
          <span className="text-base sm:text-lg font-black text-stone-900 mt-0.5 block">
            {estatisticas.totalSessoes} atendimentos
          </span>
          <span className="text-[11px] text-stone-500">
            Média de {estatisticas.mediaMensalSessoes.toFixed(1)} / mês
          </span>
        </div>

        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
          <span className="text-[11px] font-semibold text-stone-500 block">
            Média Mensal
          </span>
          <span className="text-base sm:text-lg font-black text-teal-800 mt-0.5 block">
            {formatarMoeda(estatisticas.mediaMensalFaturamento)}
          </span>
          <span className="text-[11px] text-stone-500">
            por mês no período
          </span>
        </div>

        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
          <span className="text-[11px] font-semibold text-stone-500 block">
            Melhor Mês
          </span>
          <span className="text-base sm:text-lg font-black text-emerald-700 mt-0.5 block truncate">
            {estatisticas.melhorMes?.rotuloCurto || '—'}
          </span>
          <span className="text-[11px] text-emerald-800 font-semibold">
            {estatisticas.melhorMes ? formatarMoeda(estatisticas.melhorMes.faturamentoTotal) : '—'}
          </span>
        </div>
      </div>

      {/* Área do Gráfico Recharts */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {tipoGrafico === 'combinado' ? (
            <ComposedChart
              data={dadosGrafico}
              margin={{ top: 15, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0eeee" vertical={false} />
              <XAxis
                dataKey="rotuloCurto"
                tick={{ fontSize: 11, fill: '#78716c' }}
                axisLine={{ stroke: '#e7e5e4' }}
                tickLine={false}
              />
              {/* Eixo Esquerdo: Faturamento em R$ */}
              <YAxis
                yAxisId="left"
                orientation="left"
                tickFormatter={(val) => `R$${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                tick={{ fontSize: 11, fill: '#0f766e' }}
                axisLine={false}
                tickLine={false}
              />
              {/* Eixo Direito: Quantidade de Sessões */}
              <YAxis
                yAxisId="right"
                orientation="right"
                allowDecimals={false}
                tickFormatter={(val) => `${val}`}
                tick={{ fontSize: 11, fill: '#d97706' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                formatter={(value) => <span className="text-stone-700 font-medium">{value}</span>}
              />
              {/* Barras: Faturamento Total */}
              <Bar
                yAxisId="left"
                dataKey="faturamentoTotal"
                name="Faturamento (R$)"
                fill="#0f766e"
                radius={[6, 6, 0, 0]}
                maxBarSize={42}
              />
              {/* Linha: Sessões Realizadas */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sessoesRealizadas"
                name="Sessões Realizadas"
                stroke="#d97706"
                strokeWidth={3}
                dot={{ r: 4, fill: '#d97706', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#b45309' }}
              />
            </ComposedChart>
          ) : tipoGrafico === 'faturamento' ? (
            <BarChart
              data={dadosGrafico}
              margin={{ top: 15, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0eeee" vertical={false} />
              <XAxis
                dataKey="rotuloCurto"
                tick={{ fontSize: 11, fill: '#78716c' }}
                axisLine={{ stroke: '#e7e5e4' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(val) => `R$${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                tick={{ fontSize: 11, fill: '#0f766e' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                formatter={(value) => <span className="text-stone-700 font-medium">{value}</span>}
              />
              <Bar
                dataKey="receitaPacotes"
                stackId="a"
                name="Pacotes 4x (R$)"
                fill="#0f766e"
                radius={[0, 0, 0, 0]}
                maxBarSize={42}
              />
              <Bar
                dataKey="receitaAvulso"
                stackId="a"
                name="Atendimentos Avulsos (R$)"
                fill="#14b8a6"
                radius={[6, 6, 0, 0]}
                maxBarSize={42}
              />
            </BarChart>
          ) : (
            <AreaChart
              data={dadosGrafico}
              margin={{ top: 15, right: 10, left: -10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="corSessoes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0eeee" vertical={false} />
              <XAxis
                dataKey="rotuloCurto"
                tick={{ fontSize: 11, fill: '#78716c' }}
                axisLine={{ stroke: '#e7e5e4' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#78716c' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                formatter={(value) => <span className="text-stone-700 font-medium">{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="sessoesRealizadas"
                name="Sessões Realizadas"
                stroke="#0f766e"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#corSessoes)"
                dot={{ r: 4, fill: '#0f766e', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legenda Explicativa & Destaque Terapêutico */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs text-stone-500">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-teal-700 inline-block"></span>
            Receita de Pacotes (R$ 500 / 4 sessões)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block"></span>
            Sessões Realizadas
          </span>
        </div>

        <span className="text-[11px] text-stone-400">
          Dados atualizados em tempo real conforme agendamentos e renovações.
        </span>
      </div>
    </div>
  );
};
