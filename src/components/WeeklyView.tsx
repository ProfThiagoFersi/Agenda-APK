import React from 'react';
import { Agendamento } from '../types';
import { TIPOS_TERAPIA_CONFIG, STATUS_CONFIG } from '../data/therapyData';
import { 
  formatarDataCurta, 
  formatarDiaSemanaCurto, 
  somarDias, 
  formatarMoeda 
} from '../utils/dateUtils';
import { ChevronLeft, ChevronRight, Plus, Clock, Activity } from 'lucide-react';

interface WeeklyViewProps {
  dataReferencia: string;
  onDataChange: (data: string) => void;
  agendamentos: Agendamento[];
  onSelectAgendamento: (agendamento: Agendamento) => void;
  onNovoAgendamentoNoDia: (data: string) => void;
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  dataReferencia,
  onDataChange,
  agendamentos,
  onSelectAgendamento,
  onNovoAgendamentoNoDia,
}) => {
  // Encontra a segunda-feira da semana de dataReferencia
  const [ano, mes, dia] = dataReferencia.split('-').map(Number);
  const dataObj = new Date(ano, mes - 1, dia);
  const diaSemana = dataObj.getDay(); // 0 = Domingo, 1 = Segunda, ...
  const diffParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
  
  const segundaDataObj = new Date(ano, mes - 1, dia + diffParaSegunda);
  const diasDaSemana: string[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(segundaDataObj);
    d.setDate(segundaDataObj.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    diasDaSemana.push(`${y}-${m}-${day}`);
  }

  const navegarSemana = (dias: number) => {
    onDataChange(somarDias(dataReferencia, dias));
  };

  return (
    <div id="weekly-view" className="space-y-3 sm:space-y-4">
      {/* Week Header Navigation */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-stone-200 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => navegarSemana(-7)}
            className="p-2 text-stone-600 hover:text-stone-900 active:bg-stone-200 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Semana Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDataChange('2026-09-15')}
            className="px-3 py-2 text-xs font-semibold text-stone-700 hover:text-teal-900 active:bg-stone-200 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors min-h-[40px]"
          >
            Semana Atual
          </button>

          <button
            type="button"
            onClick={() => navegarSemana(7)}
            className="p-2 text-stone-600 hover:text-stone-900 active:bg-stone-200 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Próxima Semana"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs sm:text-sm font-bold text-stone-900 ml-1 sm:ml-2">
            {formatarDataCurta(diasDaSemana[0])} a {formatarDataCurta(diasDaSemana[6])}
          </span>
        </div>

        <div className="text-xs text-stone-500 font-medium flex items-center justify-between sm:justify-end">
          <span>{agendamentos.filter((a) => diasDaSemana.includes(a.data)).length} sessões nesta semana</span>
          <span className="sm:hidden text-[11px] text-teal-700 font-semibold">← Deslize os dias →</span>
        </div>
      </div>

      {/* Quick Day Chips on Mobile for 1-tap navigation */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {diasDaSemana.map((diaStr) => {
          const sessoesCount = agendamentos.filter((a) => a.data === diaStr).length;
          const isHoje = diaStr === '2026-09-15';
          const diaNome = formatarDiaSemanaCurto(diaStr);
          const diaNum = diaStr.split('-')[2];

          return (
            <button
              key={`chip-${diaStr}`}
              type="button"
              onClick={() => {
                const el = document.getElementById(`week-day-${diaStr}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              }}
              className={`flex-1 min-w-[46px] py-1.5 px-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center ${
                isHoje
                  ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                  : 'bg-white text-stone-700 border-stone-200 active:bg-stone-100'
              }`}
            >
              <span className="text-[10px] font-bold uppercase">{diaNome.slice(0, 3)}</span>
              <span className="text-xs font-black">{diaNum}</span>
              {sessoesCount > 0 && (
                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isHoje ? 'bg-amber-300' : 'bg-teal-600'}`}></span>
              )}
            </button>
          );
        })}
      </div>

      {/* 7 Days: Horizontal swipe on mobile, 7 columns on desktop */}
      <div className="flex md:grid md:grid-cols-7 gap-3 overflow-x-auto pb-3 snap-x snap-mandatory md:overflow-visible no-scrollbar">
        {diasDaSemana.map((diaStr) => {
          const sessoesDoDia = agendamentos
            .filter((a) => a.data === diaStr)
            .sort((a, b) => a.horario.localeCompare(b.horario));

          const isHoje = diaStr === '2026-09-15';
          const diaNome = formatarDiaSemanaCurto(diaStr);

          return (
            <div
              key={diaStr}
              id={`week-day-${diaStr}`}
              className={`flex flex-col bg-white rounded-xl border transition-all w-[85vw] sm:w-[320px] md:w-auto shrink-0 snap-center md:shrink ${
                isHoje
                  ? 'border-teal-400 ring-2 ring-teal-300 shadow-xs'
                  : 'border-stone-200'
              }`}
            >
              {/* Day Column Header */}
              <div
                className={`p-3 border-b text-center rounded-t-xl ${
                  isHoje ? 'bg-teal-50/80 border-teal-200' : 'bg-stone-50 border-stone-100'
                }`}
              >
                <span className={`text-[11px] font-bold block uppercase tracking-wider ${
                  isHoje ? 'text-teal-900' : 'text-stone-500'
                }`}>
                  {diaNome}
                </span>
                <span className={`text-base font-bold block ${
                  isHoje ? 'text-teal-700' : 'text-stone-800'
                }`}>
                  {formatarDataCurta(diaStr)}
                </span>

                <div className="mt-1 flex items-center justify-center gap-1 text-[11px] text-stone-500">
                  <span>{sessoesDoDia.length} sessão(ões)</span>
                </div>
              </div>

              {/* Day Sessions List */}
              <div className="p-2 space-y-2 flex-1 min-h-[160px] max-h-[500px] overflow-y-auto">
                {sessoesDoDia.map((agendamento) => {
                  const terapiaConfig = TIPOS_TERAPIA_CONFIG[agendamento.tipoTerapia];
                  const statusConfig = STATUS_CONFIG[agendamento.status];

                  return (
                    <div
                      key={agendamento.id}
                      onClick={() => onSelectAgendamento(agendamento)}
                      className="p-2.5 bg-stone-50 hover:bg-white rounded-xl border border-stone-200 hover:border-teal-400 hover:shadow-xs active:scale-[0.99] cursor-pointer transition-all text-left space-y-1.5 group"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-stone-800 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {agendamento.horario}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}
                          title={statusConfig.rotulo}
                        ></span>
                      </div>

                      <div className="flex items-center justify-between gap-1 text-[10px]">
                        <div className="font-semibold text-xs text-stone-900 truncate group-hover:text-teal-700">
                          {agendamento.pacienteNome}
                        </div>
                        {agendamento.modalidadeCobranca === 'pacote' && (
                          agendamento.isUltimaSessaoPacote || agendamento.numeroSessaoPacote === 4 ? (
                            <span className="text-[9px] bg-amber-500 text-white font-black px-1.5 py-0.5 rounded shrink-0 animate-pulse">
                              4/4 ÚLTIMA
                            </span>
                          ) : (
                            <span className="text-[9px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded shrink-0">
                              {agendamento.numeroSessaoPacote || 1}/4
                            </span>
                          )
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-stone-500">
                        <span className="truncate max-w-[120px] text-teal-800 font-medium">
                          {terapiaConfig.nome}
                        </span>
                        <span className="font-semibold text-stone-700">
                          {formatarMoeda(agendamento.valor)}
                        </span>
                      </div>

                      <div className="text-[10px] text-stone-500 flex items-center gap-1">
                        <Activity className="w-2.5 h-2.5 text-amber-600" />
                        <span>EVA: {agendamento.nivelDorInicial}/10</span>
                      </div>
                    </div>
                  );
                })}

                {/* Add Session button on this day */}
                <button
                  type="button"
                  onClick={() => onNovoAgendamentoNoDia(diaStr)}
                  className="w-full py-2.5 min-h-[42px] border border-dashed border-stone-200 hover:border-teal-300 hover:bg-teal-50/50 active:bg-teal-100 rounded-xl text-[11px] font-medium text-stone-400 hover:text-teal-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agendar neste dia</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
