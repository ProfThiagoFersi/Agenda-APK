import React from 'react';
import { Agendamento, StatusAgendamento } from '../types';
import { TIPOS_TERAPIA_CONFIG, STATUS_CONFIG, ZONAS_FASCIAIS } from '../data/therapyData';
import { 
  formatarDataExtenso, 
  calcularHorarioFim, 
  formatarMoeda, 
  somarDias 
} from '../utils/dateUtils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MessageCircle, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Package
} from 'lucide-react';

interface DailyTimelineViewProps {
  dataSelecionada: string;
  onDataChange: (data: string) => void;
  agendamentos: Agendamento[];
  onSelectAgendamento: (agendamento: Agendamento) => void;
  onNovoAgendamentoNoHorario: (horario: string) => void;
  onQuickStatusChange: (id: string, status: StatusAgendamento) => void;
}

const HORARIOS_DIA = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export const DailyTimelineView: React.FC<DailyTimelineViewProps> = ({
  dataSelecionada,
  onDataChange,
  agendamentos,
  onSelectAgendamento,
  onNovoAgendamentoNoHorario,
  onQuickStatusChange,
}) => {
  // Filtra agendamentos do dia selecionado
  const agendamentosDoDia = agendamentos.filter((a) => a.data === dataSelecionada);

  // Ordena por horário
  const agendamentosOrdenados = [...agendamentosDoDia].sort((a, b) =>
    a.horario.localeCompare(b.horario)
  );

  // Métricas do dia
  const totalSessoes = agendamentosDoDia.length;
  const concluidas = agendamentosDoDia.filter((a) => a.status === 'realizado').length;
  const ultimasSessoesHoje = agendamentosDoDia.filter(
    (a) => a.isUltimaSessaoPacote || (a.modalidadeCobranca === 'pacote' && a.numeroSessaoPacote === 4)
  );

  return (
    <div id="daily-timeline-view" className="space-y-3 sm:space-y-4">
      {/* Date Navigation & Day Summary Bar */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-stone-200 p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          {/* Navigation */}
          <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onDataChange(somarDias(dataSelecionada, -1))}
                className="p-2 text-stone-600 hover:text-stone-900 active:bg-stone-200 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Dia Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onDataChange('2026-09-15')}
                className="px-3 py-2 text-xs font-semibold text-stone-700 hover:text-teal-900 active:bg-stone-200 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors min-h-[40px]"
              >
                Hoje
              </button>

              <button
                type="button"
                onClick={() => onDataChange(somarDias(dataSelecionada, 1))}
                className="p-2 text-stone-600 hover:text-stone-900 active:bg-stone-200 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Próximo Dia"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200">
              <CalendarIcon className="w-4 h-4 text-teal-700 shrink-0" />
              <input
                type="date"
                value={dataSelecionada}
                onChange={(e) => onDataChange(e.target.value)}
                className="text-xs sm:text-sm font-semibold text-stone-900 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Metrics of the Day */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 rounded-lg text-stone-700 font-medium">
              <span className="font-bold text-stone-900">{totalSessoes}</span>
              <span>sessões</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-bold">{concluidas}</span>
              <span>feitas</span>
            </div>
            {ultimasSessoesHoje.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>{ultimasSessoesHoje.length} em última (4/4)!</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-stone-100 text-[11px] sm:text-xs font-medium text-stone-500 capitalize flex items-center justify-between">
          <span className="truncate">{formatarDataExtenso(dataSelecionada)}</span>
          <span className="text-stone-400 shrink-0 ml-2">Renata Okoti</span>
        </div>
      </div>

      {/* Hourly Timeline Grid */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-stone-200 shadow-xs divide-y divide-stone-100 overflow-hidden">
        {HORARIOS_DIA.map((hora) => {
          // Busca agendamentos correspondentes a este bloco de horário
          const horaNum = parseInt(hora.split(':')[0], 10);
          const sessoesNesteBloco = agendamentosOrdenados.filter((item) => {
            const itemHora = parseInt(item.horario.split(':')[0], 10);
            return itemHora === horaNum;
          });

          return (
            <div
              key={hora}
              className="flex min-h-[85px] hover:bg-stone-50/40 transition-colors group"
            >
              {/* Hour Column */}
              <div className="w-14 sm:w-16 p-2 sm:p-3 border-r border-stone-100 flex flex-col justify-start items-center text-center bg-stone-50/60 shrink-0">
                <span className="text-xs font-bold text-stone-700 tracking-tight">{hora}</span>
                <span className="text-[10px] text-stone-400">h</span>
              </div>

              {/* Slots Column */}
              <div className="flex-1 p-2 sm:p-3 min-w-0">
                {sessoesNesteBloco.length > 0 ? (
                  <div className="space-y-2">
                    {sessoesNesteBloco.map((agendamento) => {
                      const terapiaConfig = TIPOS_TERAPIA_CONFIG[agendamento.tipoTerapia];
                      const statusConfig = STATUS_CONFIG[agendamento.status];
                      const horarioFim = calcularHorarioFim(
                        agendamento.horario,
                        agendamento.duracaoMinutos
                      );

                      const isUltimaSessao = agendamento.isUltimaSessaoPacote || 
                        (agendamento.modalidadeCobranca === 'pacote' && agendamento.numeroSessaoPacote === 4);

                      const whatsappMsg = encodeURIComponent(
                        isUltimaSessao
                          ? `Olá ${agendamento.pacienteNome}! Passando para confirmar sua 4ª e última sessão de Liberação Miofascial com Renata Okoti hoje às ${agendamento.horario}.`
                          : `Olá ${agendamento.pacienteNome}! Confirmando sua sessão com Renata Okoti hoje às ${agendamento.horario}.`
                      );

                      return (
                        <div
                          key={agendamento.id}
                          onClick={() => onSelectAgendamento(agendamento)}
                          className={`p-3 bg-white rounded-xl border transition-all cursor-pointer relative ${
                            isUltimaSessao
                              ? 'border-amber-400 bg-amber-50/30 ring-1 ring-amber-400 shadow-sm'
                              : 'border-stone-200 hover:border-teal-400 hover:shadow-md'
                          }`}
                        >
                          {/* Banner de Aviso de 4ª Sessão se for o caso */}
                          {isUltimaSessao && (
                            <div className="mb-2 p-1.5 bg-amber-500/15 border border-amber-400/50 rounded-lg text-amber-900 text-[11px] font-bold flex items-center justify-between gap-1">
                              <span className="flex items-center gap-1.5 leading-tight">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                ⚠️ 4ª E ÚLTIMA SESSÃO DO PACOTE - Renovar pacote (R$ 500)!
                              </span>
                              <span className="bg-amber-600 text-white px-1.5 py-0.5 rounded text-[9px] uppercase font-extrabold shrink-0">
                                4/4
                              </span>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            {/* Patient info & tags */}
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span className="font-bold text-stone-900 text-sm hover:text-teal-700">
                                  {agendamento.pacienteNome}
                                </span>

                                {/* Badge de Pacote ou Avulso */}
                                {agendamento.modalidadeCobranca === 'pacote' ? (
                                  <span className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                    isUltimaSessao
                                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                                      : 'bg-teal-50 text-teal-800 border-teal-200'
                                  }`}>
                                    <Package className="w-3 h-3" />
                                    Pacote: {agendamento.numeroSessaoPacote || 1}/4
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full border bg-stone-100 text-stone-700 border-stone-200">
                                    Avulso (R$ 150)
                                  </span>
                                )}

                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full border ${terapiaConfig.badgeClass}`}
                                >
                                  {terapiaConfig.nome}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusConfig.badgeClass}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`}></span>
                                  {statusConfig.rotulo}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 sm:gap-3 text-xs text-stone-500 flex-wrap">
                                <span className="flex items-center gap-1 font-medium text-stone-700">
                                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                                  {agendamento.horario} - {horarioFim}
                                </span>
                                <span className="flex items-center gap-1 text-stone-600">
                                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                                  EVA: <strong className="text-stone-800">{agendamento.nivelDorInicial}/10</strong>
                                  {agendamento.nivelDorFinal !== undefined && (
                                    <span className="text-emerald-700 font-bold ml-1">
                                      → Pós: {agendamento.nivelDorFinal}/10
                                    </span>
                                  )}
                                </span>
                              </div>

                              {/* Zonas Tratadas Badges */}
                              {agendamento.zonasTratadas.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                  <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                                    Fáscia:
                                  </span>
                                  {agendamento.zonasTratadas.slice(0, 3).map((zId) => {
                                    const z = ZONAS_FASCIAIS.find((item) => item.id === zId);
                                    return (
                                      <span
                                        key={zId}
                                        className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-medium"
                                      >
                                        {z ? z.nome.split('&')[0] : zId}
                                      </span>
                                    );
                                  })}
                                  {agendamento.zonasTratadas.length > 3 && (
                                    <span className="text-[10px] text-stone-400 font-medium">
                                      +{agendamento.zonasTratadas.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Right side: Price & WhatsApp Touch Action */}
                            <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                              <div className="text-left sm:text-right mr-1">
                                <span className="text-xs font-bold text-stone-900 block">
                                  {agendamento.modalidadeCobranca === 'pacote' 
                                    ? 'Incluso no Pacote' 
                                    : formatarMoeda(agendamento.valor)}
                                </span>
                                <span className={`text-[10px] font-medium ${agendamento.pago ? 'text-emerald-700' : 'text-amber-600'}`}>
                                  {agendamento.pago ? 'Quitado' : 'Pendente'}
                                </span>
                              </div>

                              {/* WhatsApp Direct Link with >=44px touch area */}
                              <a
                                href={`https://wa.me/55${agendamento.pacienteTelefone.replace(/\D/g, '')}?text=${whatsappMsg}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                title="Enviar lembrete via WhatsApp"
                                className="min-h-[44px] min-w-[44px] px-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white active:scale-95 transition-all flex items-center justify-center gap-1 border border-emerald-200"
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-xs font-semibold sm:hidden">WhatsApp</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNovoAgendamentoNoHorario(hora)}
                    className="w-full h-full min-h-[48px] border border-dashed border-stone-200 rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-stone-400 hover:text-teal-700 hover:border-teal-300 hover:bg-teal-50/40 active:bg-teal-100/50 transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Disponível às {hora} • Toque para agendar</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
