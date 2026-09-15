import React, { useState, useEffect, useMemo } from 'react';
import { Agendamento, LembreteAutomatico } from '../types';
import {
  verificarEAgendarLembretesDiaSeguinte,
  salvarStatusLembreteStorage,
  marcarLembretesEmLoteStorage,
  carregarPreferenciaMinimizadoAlert,
  salvarPreferenciaMinimizadoAlert,
  gerarRoteiroTextoDia,
} from '../utils/reminderScheduler';
import {
  Bell,
  BellRing,
  Calendar,
  Clock,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  Phone,
  Package,
  Receipt,
  RotateCcw,
  Share2
} from 'lucide-react';

interface NextDayRemindersAlertProps {
  agendamentos: Agendamento[];
  dataReferencia: string; // ex: '2026-09-15'
  onVerDetalhesAgendamento?: (agendamentoId: string) => void;
  onNotificar?: (msg: string, tipo?: 'info' | 'alerta') => void;
}

export const NextDayRemindersAlert: React.FC<NextDayRemindersAlertProps> = ({
  agendamentos,
  dataReferencia,
  onVerDetalhesAgendamento,
  onNotificar,
}) => {
  const [minimizado, setMinimizado] = useState<boolean>(() => carregarPreferenciaMinimizadoAlert());
  const [copiadoRoteiro, setCopiadoRoteiro] = useState(false);
  const [mensagemExpandidaId, setMensagemExpandidaId] = useState<string | null>(null);
  const [statusVersao, setStatusVersao] = useState<number>(0);

  // Executa o agendamento e verificação automática para o dia seguinte
  const { dataAmanha, dataAmanhaFormatada, lembretes } = useMemo(() => {
    return verificarEAgendarLembretesDiaSeguinte(agendamentos, dataReferencia);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agendamentos, dataReferencia, statusVersao]);

  const totalAtendimentos = lembretes.length;
  const pendentes = lembretes.filter((l) => l.statusEnvio === 'pendente').length;
  const enviados = lembretes.filter((l) => l.statusEnvio === 'enviado').length;

  const handleToggleMinimizado = () => {
    const novoValor = !minimizado;
    setMinimizado(novoValor);
    salvarPreferenciaMinimizadoAlert(novoValor);
  };

  const handleAtualizarStatus = (lembreteId: string, novoStatus: 'pendente' | 'enviado' | 'dispensado') => {
    salvarStatusLembreteStorage(lembreteId, novoStatus);
    setStatusVersao((v) => v + 1);
    if (onNotificar) {
      if (novoStatus === 'enviado') {
        onNotificar('Lembrete marcado como enviado via WhatsApp!', 'info');
      } else {
        onNotificar('Status do lembrete alterado para pendente.', 'info');
      }
    }
  };

  const handleMarcarTodosEnviados = () => {
    const ids = lembretes.map((l) => l.id);
    marcarLembretesEmLoteStorage(ids, 'enviado');
    setStatusVersao((v) => v + 1);
    if (onNotificar) {
      onNotificar(`Todos os ${ids.length} lembretes foram marcados como enviados!`, 'info');
    }
  };

  const handleCopiarRoteiro = async () => {
    try {
      const texto = gerarRoteiroTextoDia(lembretes, dataAmanhaFormatada);
      await navigator.clipboard.writeText(texto);
      setCopiadoRoteiro(true);
      setTimeout(() => setCopiadoRoteiro(false), 2500);
      if (onNotificar) {
        onNotificar('Roteiro do dia de amanhã copiado com sucesso!', 'info');
      }
    } catch (err) {
      console.error('Erro ao copiar roteiro', err);
    }
  };

  const handleDispararWhatsApp = (lembrete: LembreteAutomatico) => {
    // Limpa telefone
    const digits = lembrete.pacienteTelefone.replace(/\D/g, '');
    const num = digits.startsWith('55') ? digits : `55${digits}`;
    const url = `https://wa.me/${num}?text=${encodeURIComponent(lembrete.mensagem)}`;

    // Abre janela do WhatsApp
    window.open(url, '_blank', 'noopener,noreferrer');

    // Marca automaticamente como enviado no localStorage
    salvarStatusLembreteStorage(lembrete.id, 'enviado');
    setStatusVersao((v) => v + 1);
  };

  const handleCopiarTexto = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      if (onNotificar) {
        onNotificar('Mensagem copiada para a área de transferência!', 'info');
      }
    } catch (err) {
      console.error('Erro ao copiar texto', err);
    }
  };

  // Se não houver nenhum atendimento para amanhã, exibimos um aviso leve e elegante
  if (totalAtendimentos === 0) {
    return (
      <div
        id="next-day-reminders-empty"
        className="bg-stone-50 border border-stone-200 rounded-xl p-3 sm:p-3.5 shadow-2xs flex items-center justify-between gap-3 text-xs text-stone-600"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-stone-200 text-stone-600 flex items-center justify-center shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-stone-800">
              Planejamento de Amanhã ({dataAmanhaFormatada}):
            </span>{' '}
            Nenhum atendimento agendado até o momento.
          </div>
        </div>
      </div>
    );
  }

  // Barra compacta persistente quando minimizado
  if (minimizado) {
    return (
      <div
        id="next-day-reminders-minimized"
        className="bg-gradient-to-r from-amber-50 to-amber-100/70 border border-amber-300 rounded-xl p-3 shadow-xs flex items-center justify-between gap-3 transition-all"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <BellRing className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-950">
                🔔 Lembretes de Amanhã ({dataAmanhaFormatada}):
              </span>
              <span className="text-[11px] font-semibold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-full border border-amber-300">
                {totalAtendimentos} {totalAtendimentos === 1 ? 'paciente' : 'pacientes'}
              </span>
              {pendentes > 0 ? (
                <span className="text-[11px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded-full border border-amber-300">
                  {pendentes} {pendentes === 1 ? 'lembrete pendente' : 'lembretes pendentes'}
                </span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  Todos enviados!
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopiarRoteiro}
            title="Copiar roteiro resumido do dia de amanhã"
            className="p-1.5 text-amber-900 hover:bg-amber-200 rounded-lg text-xs font-semibold transition-colors"
          >
            {copiadoRoteiro ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleToggleMinimizado}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
          >
            <span>Ver Lembretes</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Visualização expandida persistente
  return (
    <div
      id="next-day-reminders-persistent-alert"
      className="bg-white rounded-2xl border-2 border-amber-300 shadow-sm overflow-hidden space-y-0 animate-in fade-in duration-200"
    >
      {/* Cabeçalho do Card com Destaque de Planejamento */}
      <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-white p-3.5 sm:p-4 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs border border-amber-400">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-amber-600 text-white px-2 py-0.5 rounded-md shadow-2xs">
                Planejamento Diário de Renata
              </span>
              <span className="text-xs font-bold text-amber-950">
                {dataAmanhaFormatada}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-black text-stone-900 mt-0.5">
              Lembretes Automáticos de Amanhã ({totalAtendimentos} {totalAtendimentos === 1 ? 'Sessão' : 'Sessões'})
            </h2>
          </div>
        </div>

        {/* Ações Rápidas do Cabeçalho */}
        <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-center">
          <button
            type="button"
            onClick={handleCopiarRoteiro}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-50 text-amber-950 text-xs font-semibold shadow-2xs transition-colors"
            title="Copiar lista de atendimentos para o clipboard"
          >
            {copiadoRoteiro ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Roteiro Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-700" />
                <span>Copiar Roteiro</span>
              </>
            )}
          </button>

          {pendentes > 0 && (
            <button
              type="button"
              onClick={handleMarcarTodosEnviados}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 text-xs font-semibold transition-colors"
              title="Marcar todos os lembretes do dia como enviados"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Marcar Todos Enviados</span>
              <span className="sm:hidden">Todos Enviados</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleMinimizado}
            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-amber-200/60 rounded-lg transition-colors"
            title="Minimizar painel de lembretes"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Barra de Status e Resumo */}
      <div className="bg-amber-50/50 px-4 py-2 border-b border-amber-100 flex items-center justify-between text-xs text-stone-600 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <strong>{pendentes}</strong> pendentes
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <strong>{enviados}</strong> enviados
          </span>
        </div>

        <span className="text-[11px] text-stone-500">
          Mensagens verificadas automaticamente no localStorage para o dia seguinte.
        </span>
      </div>

      {/* Lista de Atendimentos de Amanhã */}
      <div className="p-3 sm:p-4 space-y-2.5 max-h-[380px] overflow-y-auto">
        {lembretes.map((item) => {
          const isEnviado = item.statusEnvio === 'enviado';
          const isExpandido = mensagemExpandidaId === item.id;

          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all ${
                isEnviado
                  ? 'bg-stone-50/70 border-stone-200'
                  : 'bg-white border-amber-200 hover:border-amber-300 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {/* Info do Horário e Paciente */}
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`px-2.5 py-1.5 rounded-lg text-center font-bold shrink-0 text-xs ${
                      isEnviado
                        ? 'bg-stone-200 text-stone-700'
                        : 'bg-amber-500 text-white shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.horario}</span>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                        {item.pacienteNome}
                      </h3>

                      {/* Modalidade / Pacote Badge */}
                      {item.modalidadeCobranca === 'pacote' ? (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border ${
                            item.isUltimaSessaoPacote
                              ? 'bg-amber-100 text-amber-900 border-amber-300 font-black'
                              : 'bg-teal-50 text-teal-800 border-teal-200'
                          }`}
                        >
                          <Package className="w-3 h-3" />
                          {item.isUltimaSessaoPacote
                            ? '⚠️ 4ª Sessão (Renovação)'
                            : `Pacote (${item.numeroSessaoPacote || 1}/4)`}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 inline-flex items-center gap-1">
                          <Receipt className="w-3 h-3" />
                          Avulso
                        </span>
                      )}

                      {/* Status de Envio */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          isEnviado
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {isEnviado ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Enviado
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Lembrete Pendente
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-stone-400" />
                        {item.pacienteTelefone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação por Paciente */}
                <div className="flex items-center gap-1.5 self-end sm:self-center flex-wrap">
                  {/* Botão para abrir prévia de mensagem */}
                  <button
                    type="button"
                    onClick={() => setMensagemExpandidaId(isExpandido ? null : item.id)}
                    className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg text-xs transition-colors"
                    title={isExpandido ? 'Ocultar prévia' : 'Ver texto da mensagem'}
                  >
                    {isExpandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* Botão Copiar Texto */}
                  <button
                    type="button"
                    onClick={() => handleCopiarTexto(item.mensagem)}
                    className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg text-xs transition-colors"
                    title="Copiar mensagem individual"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Toggle Status */}
                  <button
                    type="button"
                    onClick={() =>
                      handleAtualizarStatus(item.id, isEnviado ? 'pendente' : 'enviado')
                    }
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      isEnviado
                        ? 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    }`}
                    title={isEnviado ? 'Marcar como pendente' : 'Marcar como já enviado'}
                  >
                    {isEnviado ? 'Reverter' : 'Marcar Enviado'}
                  </button>

                  {/* Botão Enviar WhatsApp Direto */}
                  <button
                    type="button"
                    onClick={() => handleDispararWhatsApp(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
                    title={`Enviar WhatsApp para ${item.pacienteNome}`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Lembrete WhatsApp</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                  </button>
                </div>
              </div>

              {/* Prévia Expansível do Texto que será enviado */}
              {isExpandido && (
                <div className="mt-2.5 pt-2.5 border-t border-stone-200 text-xs space-y-1.5">
                  <span className="font-semibold text-stone-700 text-[11px] block">
                    Mensagem que será enviada:
                  </span>
                  <div className="p-2.5 bg-stone-100 rounded-lg text-stone-800 whitespace-pre-line text-xs font-mono">
                    {item.mensagem}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
