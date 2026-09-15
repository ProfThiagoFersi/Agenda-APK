import React, { useState } from 'react';
import { Agendamento, StatusAgendamento } from '../types';
import { TIPOS_TERAPIA_CONFIG, STATUS_CONFIG, ZONAS_FASCIAIS } from '../data/therapyData';
import { BodyMapSelector } from './BodyMapSelector';
import { 
  formatarDataExtenso, 
  calcularHorarioFim, 
  formatarMoeda 
} from '../utils/dateUtils';
import { 
  X, 
  Calendar, 
  Clock, 
  Phone, 
  MessageCircle, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  PlayCircle, 
  XCircle,
  Activity,
  FileText,
  AlertTriangle,
  Package,
  RefreshCw,
  Send,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  PhoneCall
} from 'lucide-react';

interface AppointmentDetailModalProps {
  agendamento: Agendamento | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (agendamento: Agendamento) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, novoStatus: StatusAgendamento) => void;
  onRenovarPacote?: (pacienteId: string) => void;
}

type TipoMensagemWhatsApp = 'confirmacao' | 'lembrete' | 'renovacao' | 'pos_sessao';

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  agendamento,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onRenovarPacote,
}) => {
  if (!isOpen || !agendamento) return null;

  const terapiaConfig = TIPOS_TERAPIA_CONFIG[agendamento.tipoTerapia];
  const statusConfig = STATUS_CONFIG[agendamento.status];
  const horarioFim = calcularHorarioFim(agendamento.horario, agendamento.duracaoMinutos);
  const isUltimaSessao = agendamento.isUltimaSessaoPacote || (agendamento.modalidadeCobranca === 'pacote' && agendamento.numeroSessaoPacote === 4);

  // Estado da comunicação via WhatsApp
  const [tipoMensagem, setTipoMensagem] = useState<TipoMensagemWhatsApp>(
    isUltimaSessao ? 'renovacao' : 'confirmacao'
  );
  const [painelWhatsappAberto, setPainelWhatsappAberto] = useState(true);
  const [copiadoWhatsapp, setCopiadoWhatsapp] = useState(false);

  // Redução de dor calculada
  const reducaoDor = agendamento.nivelDorFinal !== undefined
    ? agendamento.nivelDorInicial - agendamento.nivelDorFinal
    : null;

  // Limpeza de número para padrão WhatsApp Brasil (+55)
  const obterNumeroLimpo = (tel: string) => {
    const digits = tel.replace(/\D/g, '');
    if (digits.startsWith('55') && digits.length >= 12) return digits;
    return `55${digits}`;
  };

  // Gerador de mensagens automáticas personalizadas para a prática de Renata Okoti
  const gerarMensagem = (tipo: TipoMensagemWhatsApp) => {
    const dataFormatada = agendamento.data.split('-').reverse().join('/');
    const primeiroNome = agendamento.pacienteNome.split(' ')[0];
    const infoSessaoPacote = agendamento.modalidadeCobranca === 'pacote'
      ? ` (Sessão ${agendamento.numeroSessaoPacote || 1} de 4 do seu pacote)`
      : '';

    switch (tipo) {
      case 'confirmacao':
        return `Olá, ${primeiroNome}! Tudo bem? Aqui é a Renata Okoti (Terapeuta Miofascial).\n\nPassando para confirmar seu atendimento marcado para ${dataFormatada} às ${agendamento.horario} (${terapiaConfig.nome})${infoSessaoPacote}.\n\nVocê confirma sua presença? Caso precise remarcar, por favor me avise com antecedência. Muito obrigada!`;

      case 'lembrete':
        return `Olá, ${primeiroNome}! Aqui é a terapeuta Renata Okoti. Passando para lembrar do seu atendimento de Liberação Miofascial em ${dataFormatada} às ${agendamento.horario}.\n\n💡 Dica importante: recomendo usar roupas confortáveis (bermuda/top para facilitar a avaliação fascial) e manter-se bem hidratado(a). Até breve!`;

      case 'renovacao':
        return `Olá, ${agendamento.pacienteNome}! Tudo bem? Aqui é a Renata Okoti.\n\nPassando para confirmar sua sessão de Liberação Miofascial em ${dataFormatada} às ${agendamento.horario}.\n\n⚠️ Lembramos com carinho que este é o 4º e último atendimento do seu pacote atual. Ao final da sessão poderemos planejar a renovação do seu pacote de 4 atendimentos (R$ 500,00) para garantir a continuidade da sua evolução terapêutica. Qualquer dúvida, estou à disposição!`;

      case 'pos_sessao':
        const recomendacoes = agendamento.recomendacoesHomeCare || 'Mantenha-se bem hidratado(a), evite esforços intensos nas próximas 24h e aplique compressa morna caso sinta sensibilidade muscular residual.';
        return `Olá, ${primeiroNome}! Foi um prazer atendê-lo(a) hoje na sessão de Liberação Miofascial.\n\n🌿 Orientações pós-atendimento (Home Care):\n${recomendacoes}\n\nQualquer desconforto residual ou dúvida, pode me mandar mensagem por aqui. Tenha uma excelente recuperação!`;

      default:
        return '';
    }
  };

  const mensagemAtual = gerarMensagem(tipoMensagem);
  const numeroDestino = obterNumeroLimpo(agendamento.pacienteTelefone);
  const linkWhatsApp = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(mensagemAtual)}`;

  const copiarTextoMensagem = async () => {
    try {
      await navigator.clipboard.writeText(mensagemAtual);
      setCopiadoWhatsapp(true);
      setTimeout(() => setCopiadoWhatsapp(false), 2500);
    } catch (err) {
      console.error('Erro ao copiar texto', err);
    }
  };

  const nomesZonas = agendamento.zonasTratadas
    .map((id) => ZONAS_FASCIAIS.find((z) => z.id === id)?.nome)
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div 
        id="appointment-detail-modal-card" 
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col my-0 sm:my-6 overflow-hidden border border-stone-200"
      >
        {/* Header */}
        <div className="bg-stone-900 text-white p-4 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.badgeClass}`}>
              <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}></span>
              {statusConfig.rotulo}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${terapiaConfig.badgeClass}`}>
              {terapiaConfig.nome}
            </span>
            {agendamento.modalidadeCobranca === 'pacote' ? (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isUltimaSessao 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold' 
                  : 'bg-teal-900/60 text-teal-300 border-teal-600/50'
              }`}>
                📦 Sessão {agendamento.numeroSessaoPacote || 1} de 4 (Pacote)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-800 text-stone-300 border border-stone-700">
                Atendimento Avulso (R$ 150)
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-white mb-1">
            {agendamento.pacienteNome}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              {formatarDataExtenso(agendamento.data)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              {agendamento.horario} às {horarioFim} ({agendamento.duracaoMinutos} min)
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-400" />
              {agendamento.pacienteTelefone}
            </span>
          </div>
        </div>

        {/* ⚠️ ALERTA EXCLUSIVO AO PROFISSIONAL: 4ª E ÚLTIMA SESSÃO DO PACOTE */}
        {isUltimaSessao && (
          <div className="bg-amber-500/15 border-b-2 border-amber-500 p-4 flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                  ⚠️ ATENÇÃO RENATA OKOTI: 4ª E ÚLTIMA SESSÃO DO PACOTE!
                </h3>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  Este é o <strong>4º atendimento</strong> do pacote contratado por <strong>{agendamento.pacienteNome}</strong>.
                  O saldo de sessões deste pacote se encerra hoje. 
                  Avise o paciente sobre a conclusão do ciclo e ofereça a <strong>renovação do pacote de 4 atendimentos por R$ 500,00</strong>.
                </p>
              </div>
            </div>

            {onRenovarPacote && (
              <button
                type="button"
                onClick={() => onRenovarPacote(agendamento.pacienteId)}
                className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Renovar Pacote (R$ 500)
              </button>
            )}
          </div>
        )}

        {/* Action Bar for Status Change & WhatsApp */}
        <div className="bg-stone-100 px-4 sm:px-6 py-3 border-b border-stone-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-stone-600 mr-1">Status:</span>
            {agendamento.status !== 'confirmado' && (
              <button
                type="button"
                onClick={() => onStatusChange(agendamento.id, 'confirmado')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white text-teal-800 text-xs font-medium border border-stone-300 hover:bg-teal-50 hover:border-teal-300 transition-colors"
              >
                <CheckCircle2 className="w-3 h-3 text-teal-600" />
                Confirmar
              </button>
            )}

            {agendamento.status !== 'em_andamento' && (
              <button
                type="button"
                onClick={() => onStatusChange(agendamento.id, 'em_andamento')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white text-amber-800 text-xs font-medium border border-stone-300 hover:bg-amber-50 hover:border-amber-300 transition-colors"
              >
                <PlayCircle className="w-3 h-3 text-amber-600" />
                Iniciar Atendimento
              </button>
            )}

            {agendamento.status !== 'realizado' && (
              <button
                type="button"
                onClick={() => onStatusChange(agendamento.id, 'realizado')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-teal-700 text-white text-xs font-medium hover:bg-teal-800 transition-colors"
              >
                <CheckCircle2 className="w-3 h-3 text-white" />
                Concluir Sessão
              </button>
            )}

            {agendamento.status !== 'cancelado' && (
              <button
                type="button"
                onClick={() => onStatusChange(agendamento.id, 'cancelado')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white text-rose-700 text-xs font-medium border border-stone-300 hover:bg-rose-50 hover:border-rose-300 transition-colors"
              >
                <XCircle className="w-3 h-3 text-rose-500" />
                Cancelar
              </button>
            )}
          </div>

          {/* Botão de Contato Rápido via WhatsApp */}
          <a
            id="whatsapp-action-bar-btn"
            href={linkWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            title={`Enviar mensagem de WhatsApp para ${agendamento.pacienteTelefone}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contato via WhatsApp</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* 💬 PAINEL DEDICADO: CONTATO VIA WHATSAPP (CONFIRMAÇÃO & LEMBRETE) */}
          <div
            id="whatsapp-communication-card"
            className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 sm:p-4 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                      Contato via WhatsApp
                    </h3>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/60">
                      {agendamento.pacienteTelefone}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-900 mt-0.5">
                    Envie automaticamente mensagem de confirmação, lembrete ou orientações para <strong>{agendamento.pacienteNome}</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPainelWhatsappAberto(!painelWhatsappAberto)}
                className="text-emerald-800 hover:text-emerald-950 p-1.5 rounded-lg hover:bg-emerald-100/60 transition-colors"
                title={painelWhatsappAberto ? 'Recolher detalhes da mensagem' : 'Expandir opções de mensagem'}
              >
                {painelWhatsappAberto ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {painelWhatsappAberto && (
              <div className="space-y-3 pt-1 border-t border-emerald-200/80">
                {/* Seletor de Tipo de Mensagem */}
                <div>
                  <label className="text-[11px] font-bold text-emerald-950 block mb-1.5 uppercase tracking-wider">
                    Selecione o Modelo de Mensagem:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTipoMensagem('confirmacao')}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-all border ${
                        tipoMensagem === 'confirmacao'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-emerald-950 border-emerald-200 hover:bg-emerald-100/60'
                      }`}
                    >
                      <span className="block font-bold truncate">🗓️ Confirmação</span>
                      <span className={`text-[10px] block opacity-90 truncate ${tipoMensagem === 'confirmacao' ? 'text-emerald-100' : 'text-emerald-800'}`}>
                        Solicitar presença
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoMensagem('lembrete')}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-all border ${
                        tipoMensagem === 'lembrete'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-emerald-950 border-emerald-200 hover:bg-emerald-100/60'
                      }`}
                    >
                      <span className="block font-bold truncate">⏰ Lembrete</span>
                      <span className={`text-[10px] block opacity-90 truncate ${tipoMensagem === 'lembrete' ? 'text-emerald-100' : 'text-emerald-800'}`}>
                        Com dicas e roupas
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoMensagem('renovacao')}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-all border ${
                        tipoMensagem === 'renovacao'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs font-bold'
                          : 'bg-white text-amber-950 border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      <span className="block font-bold truncate">
                        {isUltimaSessao ? '⚠️ 4ª Sessão' : '📦 Pacote'}
                      </span>
                      <span className={`text-[10px] block opacity-90 truncate ${tipoMensagem === 'renovacao' ? 'text-amber-100' : 'text-amber-800'}`}>
                        Aviso de renovação
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTipoMensagem('pos_sessao')}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-all border ${
                        tipoMensagem === 'pos_sessao'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-emerald-950 border-emerald-200 hover:bg-emerald-100/60'
                      }`}
                    >
                      <span className="block font-bold truncate">🌿 Pós-Sessão</span>
                      <span className={`text-[10px] block opacity-90 truncate ${tipoMensagem === 'pos_sessao' ? 'text-emerald-100' : 'text-emerald-800'}`}>
                        Home care & cuidados
                      </span>
                    </button>
                  </div>
                </div>

                {/* Prévia do Texto Gerado */}
                <div className="relative">
                  <div className="p-3 bg-white border border-emerald-200 rounded-xl text-xs text-stone-700 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                    {mensagemAtual}
                  </div>
                </div>

                {/* Botões de Ação do WhatsApp */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    {/* Botão de Cópia */}
                    <button
                      type="button"
                      onClick={copiarTextoMensagem}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors min-h-[40px]"
                    >
                      {copiadoWhatsapp ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700">Texto Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-stone-500" />
                          <span>Copiar Mensagem</span>
                        </>
                      )}
                    </button>

                    {/* Ligação Direta */}
                    <a
                      href={`tel:${agendamento.pacienteTelefone.replace(/\D/g, '')}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors min-h-[40px]"
                      title="Ligar para o número do paciente"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-stone-500" />
                      <span>Ligar</span>
                    </a>
                  </div>

                  {/* Disparo Principal no WhatsApp */}
                  <a
                    id="whatsapp-open-chat-btn"
                    href={linkWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors min-h-[42px]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enviar via WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Resumo do Pacote / Modalidade */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  {agendamento.modalidadeCobranca === 'pacote'
                    ? `Pacote Terapêutico (Sessão ${agendamento.numeroSessaoPacote || 1} de 4)`
                    : 'Atendimento Avulso'}
                </span>
                <span className="text-[11px] text-stone-500">
                  {agendamento.modalidadeCobranca === 'pacote'
                    ? 'Pacote de 4 sessões por R$ 500,00 (R$ 125/sessão)'
                    : 'Atendimento individual de R$ 150,00'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-stone-500 block">Valor Registrado</span>
              <span className="text-base font-bold text-stone-900">
                {formatarMoeda(agendamento.valor)}
              </span>
              <span className={`block text-[10px] font-semibold ${
                agendamento.pago ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {agendamento.pago ? '● Quitado / Pago' : '○ Pagamento Pendente'}
              </span>
            </div>
          </div>

          {/* Pain Scale Card */}
          <div className="bg-stone-50 rounded-xl p-3 sm:p-4 border border-stone-200">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-700" />
              Escala de Dor & Avaliação Fascial (EVA)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-center">
              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-stone-200">
                <span className="text-[11px] text-stone-500 block mb-1">Dor Pré-Sessão</span>
                <span className="text-xl sm:text-2xl font-bold text-amber-700">
                  {agendamento.nivelDorInicial}/10
                </span>
              </div>

              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-stone-200">
                <span className="text-[11px] text-stone-500 block mb-1">Dor Pós-Sessão</span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-700">
                  {agendamento.nivelDorFinal !== undefined ? `${agendamento.nivelDorFinal}/10` : '—'}
                </span>
              </div>

              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-stone-200 col-span-2 sm:col-span-1 flex flex-col justify-center">
                <span className="text-[11px] text-stone-500 block mb-1">Resultado de Alívio</span>
                {reducaoDor !== null ? (
                  <span className="text-sm font-bold text-emerald-700">
                    {reducaoDor > 0 ? `-${reducaoDor} pts de dor` : 'Sem alteração'}
                  </span>
                ) : (
                  <span className="text-xs text-stone-400">Pendente pós-atendimento</span>
                )}
              </div>
            </div>
          </div>

          {/* Fascial Body Map */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Zonas Fasciais & Pontos-Gatilho Alvo ({nomesZonas.length})
            </h3>
            <BodyMapSelector
              selectedZones={agendamento.zonasTratadas}
              onChange={() => {}}
              readOnly={true}
            />
          </div>

          {/* Clinical Notes & Conduct */}
          {(agendamento.observacoes || agendamento.condutaTerapeutica || agendamento.recomendacoesHomeCare) && (
            <div className="bg-stone-50 rounded-xl p-3 sm:p-4 border border-stone-200 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-700" />
                Evolução & Prontuário Clínico
              </h3>

              {agendamento.observacoes && (
                <div>
                  <h4 className="text-xs font-semibold text-stone-700">Queixa / Sintomas Relatados:</h4>
                  <p className="text-xs text-stone-600 mt-0.5 bg-white p-2.5 rounded border border-stone-200">
                    {agendamento.observacoes}
                  </p>
                </div>
              )}

              {agendamento.condutaTerapeutica && (
                <div>
                  <h4 className="text-xs font-semibold text-stone-700">Conduta Aplicada pelo Terapeuta:</h4>
                  <p className="text-xs text-stone-600 mt-0.5 bg-white p-2.5 rounded border border-stone-200">
                    {agendamento.condutaTerapeutica}
                  </p>
                </div>
              )}

              {agendamento.recomendacoesHomeCare && (
                <div>
                  <h4 className="text-xs font-semibold text-stone-700">Orientações Pós-Sessão (Home Care):</h4>
                  <p className="text-xs text-stone-600 mt-0.5 bg-white p-2.5 rounded border border-stone-200">
                    {agendamento.recomendacoesHomeCare}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 px-4 py-3 sm:px-6 sm:py-4 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onDelete(agendamento.id)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors min-h-[38px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Excluir Sessão
          </button>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <a
              id="whatsapp-footer-action-btn"
              href={linkWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors min-h-[42px]"
              title={`Enviar WhatsApp para ${agendamento.pacienteTelefone}`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contato via WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => onEdit(agendamento)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition-colors min-h-[42px]"
            >
              <Edit className="w-3.5 h-3.5" />
              Editar Dados
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors min-h-[42px]"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
