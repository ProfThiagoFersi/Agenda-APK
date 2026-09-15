import React, { useState } from 'react';
import { Agendamento } from '../types';
import { STATUS_CONFIG } from '../data/therapyData';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface MonthlyViewProps {
  agendamentos: Agendamento[];
  onSelectData: (data: string) => void;
  onNovoAgendamentoNoDia: (data: string) => void;
  dataAtiva: string;
}

const DIAS_SEMANA_NOMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  agendamentos,
  onSelectData,
  onNovoAgendamentoNoDia,
  dataAtiva,
}) => {
  const [ano, setAno] = useState<number>(2026);
  const [mes, setMes] = useState<number>(8); // 8 = Setembro (0-indexado)

  const primeiroDiaDoMes = new Date(ano, mes, 1);
  const ultimoDiaDoMes = new Date(ano, mes + 1, 0);
  const totalDias = ultimoDiaDoMes.getDate();
  const diaSemanaInicio = primeiroDiaDoMes.getDay(); // 0 = Domingo

  const mudarMes = (delta: number) => {
    let novoMes = mes + delta;
    let novoAno = ano;
    if (novoMes < 0) {
      novoMes = 11;
      novoAno -= 1;
    } else if (novoMes > 11) {
      novoMes = 0;
      novoAno += 1;
    }
    setMes(novoMes);
    setAno(novoAno);
  };

  const mesNome = primeiroDiaDoMes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Cria células do grid (espaços vazios antes do dia 1 + dias do mês)
  const celulas = [];
  for (let i = 0; i < diaSemanaInicio; i++) {
    celulas.push(null);
  }
  for (let d = 1; d <= totalDias; d++) {
    const diaFormatado = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    celulas.push({ dia: d, dataStr: diaFormatado });
  }

  return (
    <div id="monthly-view" className="space-y-4">
      {/* Month Header Navigation */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => mudarMes(-1)}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setAno(2026);
              setMes(8);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-teal-900 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => mudarMes(1)}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <h3 className="text-base font-bold text-stone-900 ml-2 capitalize">
            {mesNome}
          </h3>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50 text-center py-2.5">
          {DIAS_SEMANA_NOMES.map((d) => (
            <span key={d} className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {d}
            </span>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-stone-100">
          {celulas.map((celula, idx) => {
            if (!celula) {
              return <div key={`empty-${idx}`} className="bg-stone-50/50 min-h-[95px] p-2" />;
            }

            const { dia, dataStr } = celula;
            const sessoesNesteDia = agendamentos.filter((a) => a.data === dataStr);
            const isHoje = dataStr === '2026-09-15';
            const isSelecionado = dataStr === dataAtiva;

            return (
              <div
                key={dataStr}
                onClick={() => onSelectData(dataStr)}
                className={`min-h-[64px] sm:min-h-[100px] p-1 sm:p-2 flex flex-col justify-between transition-colors cursor-pointer group hover:bg-teal-50/30 ${
                  isHoje ? 'bg-teal-50/60 font-bold' : ''
                } ${isSelecionado ? 'ring-2 ring-teal-600 bg-teal-50/80 ring-inset' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[11px] sm:text-xs font-semibold ${
                      isHoje
                        ? 'bg-teal-700 text-white'
                        : isSelecionado
                        ? 'bg-teal-600 text-white'
                        : 'text-stone-700 group-hover:text-stone-900'
                    }`}
                  >
                    {dia}
                  </span>

                  {sessoesNesteDia.length > 0 && (
                    <span className="text-[9px] sm:text-[10px] font-bold text-teal-800 bg-teal-100 px-1 sm:px-1.5 py-0.2 rounded-full">
                      {sessoesNesteDia.length}
                    </span>
                  )}
                </div>

                {/* Mobile session indicators (dots) */}
                <div className="flex sm:hidden items-center justify-center gap-0.5 my-1">
                  {sessoesNesteDia.slice(0, 3).map((s) => {
                    const statusCfg = STATUS_CONFIG[s.status];
                    return (
                      <span
                        key={s.id}
                        className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`}
                      />
                    );
                  })}
                  {sessoesNesteDia.length > 3 && (
                    <span className="text-[8px] text-teal-800 font-bold leading-none">+</span>
                  )}
                </div>

                {/* Desktop session preview chips */}
                <div className="hidden sm:block space-y-1 my-1">
                  {sessoesNesteDia.slice(0, 2).map((s) => {
                    const statusCfg = STATUS_CONFIG[s.status];
                    return (
                      <div
                        key={s.id}
                        className="text-[10px] px-1.5 py-0.5 rounded truncate font-medium bg-white border border-stone-200 text-stone-800 flex items-center gap-1 shadow-2xs"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor} shrink-0`}></span>
                        <span className="truncate">{s.horario} {s.pacienteNome.split(' ')[0]}</span>
                      </div>
                    );
                  })}
                  {sessoesNesteDia.length > 2 && (
                    <span className="text-[9px] text-stone-400 font-semibold pl-1">
                      +{sessoesNesteDia.length - 2} mais
                    </span>
                  )}
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex justify-end transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNovoAgendamentoNoDia(dataStr);
                    }}
                    className="p-1 rounded text-stone-400 hover:text-teal-700 hover:bg-stone-100"
                    title="Novo agendamento neste dia"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda Drawer on Mobile */}
      {dataAtiva && (
        <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-stone-100">
            <div>
              <span className="text-xs text-stone-500 font-medium block uppercase tracking-wider">
                Dia selecionado
              </span>
              <h4 className="text-sm font-bold text-stone-900">
                {dataAtiva.split('-').reverse().join('/')}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onNovoAgendamentoNoDia(dataAtiva)}
              className="inline-flex items-center gap-1 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white px-3 py-2 rounded-xl transition-all min-h-[38px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agendar neste dia</span>
            </button>
          </div>

          {agendamentos.filter((a) => a.data === dataAtiva).length > 0 ? (
            <div className="space-y-2">
              {agendamentos
                .filter((a) => a.data === dataAtiva)
                .sort((a, b) => a.horario.localeCompare(b.horario))
                .map((ag) => (
                  <div
                    key={ag.id}
                    onClick={() => onSelectData(dataAtiva)}
                    className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-stone-900">{ag.horario}</span>
                        <span className="text-xs font-semibold text-stone-800">{ag.pacienteNome}</span>
                      </div>
                      <span className="text-[11px] text-stone-500">
                        {ag.modalidadeCobranca === 'pacote'
                          ? `Pacote: Sessão ${ag.numeroSessaoPacote || 1}/4`
                          : 'Avulso (R$ 150)'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-teal-800">
                      R$ {ag.valor}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500 py-1">
              Nenhuma sessão agendada para esta data. Toque no botão acima para agendar.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
