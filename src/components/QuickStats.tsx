import React from 'react';
import { Agendamento } from '../types';
import { formatarMoeda } from '../utils/dateUtils';
import { CalendarCheck, Package, AlertTriangle, DollarSign } from 'lucide-react';

interface QuickStatsProps {
  agendamentos: Agendamento[];
  dataHoje: string;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ agendamentos, dataHoje }) => {
  const sessoesHoje = agendamentos.filter((a) => a.data === dataHoje);
  const totalHoje = sessoesHoje.length;
  const sessoesPacoteHoje = sessoesHoje.filter((a) => a.modalidadeCobranca === 'pacote').length;
  const sessoesAvulsasHoje = sessoesHoje.filter((a) => a.modalidadeCobranca === 'avulso').length;

  const ultimasSessoesHoje = sessoesHoje.filter(
    (a) => a.isUltimaSessaoPacote || (a.modalidadeCobranca === 'pacote' && a.numeroSessaoPacote === 4)
  );

  const faturamentoHoje = sessoesHoje
    .filter((a) => a.status !== 'cancelado')
    .reduce((acc, a) => acc + (a.modalidadeCobranca === 'avulso' ? a.valor : 125), 0);

  return (
    <div id="quick-stats-bar" className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
      {/* 1. Total de atendimentos */}
      <div className="bg-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-stone-200 shadow-xs flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 shrink-0">
          <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-stone-500 block truncate">
            Hoje
          </span>
          <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
            <span className="text-lg sm:text-xl font-bold text-stone-900">{totalHoje}</span>
            <span className="text-[10px] sm:text-[11px] text-stone-500 truncate">
              sessões
            </span>
          </div>
        </div>
      </div>

      {/* 2. Modalidades: Pacote vs Avulso */}
      <div className="bg-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-stone-200 shadow-xs flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200 shrink-0">
          <Package className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-stone-500 block truncate">
            Pacotes vs Avulso
          </span>
          <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
            <span className="text-lg sm:text-xl font-bold text-teal-900">{sessoesPacoteHoje}p</span>
            <span className="text-[10px] sm:text-[11px] text-stone-500 truncate">
              • {sessoesAvulsasHoje} avulso(s)
            </span>
          </div>
        </div>
      </div>

      {/* 3. ⚠️ Alerta de 4ª Sessão do Pacote */}
      <div className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border shadow-xs flex items-center gap-2 sm:gap-3 ${
        ultimasSessoesHoje.length > 0
          ? 'bg-amber-500/10 border-amber-400 text-amber-950'
          : 'bg-white border-stone-200 text-stone-900'
      }`}>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
          ultimasSessoesHoje.length > 0
            ? 'bg-amber-500 text-white animate-pulse'
            : 'bg-stone-100 text-stone-500'
        }`}>
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-600 block truncate">
            Avisos 4ª Sessão
          </span>
          <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
            <span className={`text-lg sm:text-xl font-black ${
              ultimasSessoesHoje.length > 0 ? 'text-amber-700' : 'text-stone-700'
            }`}>
              {ultimasSessoesHoje.length}
            </span>
            <span className="text-[10px] sm:text-[11px] text-stone-500 truncate">
              {ultimasSessoesHoje.length > 0 ? 'última(s) hoje!' : 'nenhuma'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Honorários do dia */}
      <div className="bg-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-stone-200 shadow-xs flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-stone-500 block truncate">
            Honorário Estimado
          </span>
          <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
            <span className="text-base sm:text-xl font-bold text-emerald-700">
              {formatarMoeda(faturamentoHoje)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
