import React, { useState, useEffect } from 'react';
import { Agendamento, Paciente, TipoTerapia, StatusAgendamento, ModalidadeCobranca, ConfiguracaoPrecos } from '../types';
import { TIPOS_TERAPIA_CONFIG, STATUS_CONFIG, PRECO_AVULSO, PRECO_PACOTE } from '../data/therapyData';
import { CONFIG_PRECOS_PADRAO } from '../utils/pricingUtils';
import { formatarMoeda } from '../utils/dateUtils';
import { BodyMapSelector } from './BodyMapSelector';
import { X, Calendar, Clock, DollarSign, User, AlertCircle, Sparkles, Package, AlertTriangle, CheckCircle } from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    agendamento: Omit<Agendamento, 'id' | 'criadoEm'>, 
    novoPaciente?: Omit<Paciente, 'id' | 'dataCadastro'>,
    atualizarPacotePaciente?: { pacienteId: string; sessoesUtilizadas: number; novoPacote?: boolean }
  ) => void;
  agendamentoParaEditar?: Agendamento | null;
  pacientes: Paciente[];
  dataInicial?: string;
  horarioInicial?: string;
  configPrecos?: ConfiguracaoPrecos;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  agendamentoParaEditar,
  pacientes,
  dataInicial = '2026-09-15',
  horarioInicial = '09:00',
  configPrecos = CONFIG_PRECOS_PADRAO,
}) => {
  const precoAvulsoPadrao = configPrecos.precoAvulso || PRECO_AVULSO;
  const precoPacotePadrao = configPrecos.precoPacote || PRECO_PACOTE;
  const totalSessoesPacotePadrao = configPrecos.sessoesPorPacote || 4;
  const precoRateioSessaoPacote = Math.round(precoPacotePadrao / totalSessoesPacotePadrao);

  const [pacienteId, setPacienteId] = useState<string>('');
  const [isNovoPaciente, setIsNovoPaciente] = useState<boolean>(false);
  const [novoNome, setNovoNome] = useState<string>('');
  const [novoTelefone, setNovoTelefone] = useState<string>('');
  const [novoEmail, setNovoEmail] = useState<string>('');
  const [novaQueixa, setNovaQueixa] = useState<string>('');

  const [data, setData] = useState<string>(dataInicial);
  const [horario, setHorario] = useState<string>(horarioInicial);
  const [duracaoMinutos, setDuracaoMinutos] = useState<number>(60);
  const [tipoTerapia, setTipoTerapia] = useState<TipoTerapia>('manual');
  const [zonasTratadas, setZonasTratadas] = useState<string[]>(['cervical', 'trapezio']);
  const [nivelDorInicial, setNivelDorInicial] = useState<number>(6);
  const [nivelDorFinal, setNivelDorFinal] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<StatusAgendamento>('agendado');
  
  // Modalidade de Cobrança: Avulso ou Pacote
  const [modalidadeCobranca, setModalidadeCobranca] = useState<ModalidadeCobranca>('avulso');
  const [numeroSessaoPacote, setNumeroSessaoPacote] = useState<number>(1);
  const [comprarNovoPacote, setComprarNovoPacote] = useState<boolean>(false);

  const [valor, setValor] = useState<number>(precoAvulsoPadrao);
  const [pago, setPago] = useState<boolean>(false);
  const [metodoPagamento, setMetodoPagamento] = useState<Agendamento['metodoPagamento']>('pendente');
  const [observacoes, setObservacoes] = useState<string>('');
  const [condutaTerapeutica, setCondutaTerapeutica] = useState<string>('');
  const [recomendacoesHomeCare, setRecomendacoesHomeCare] = useState<string>('');
  const [erro, setErro] = useState<string>('');

  // Paciente selecionado atualmente
  const pacienteSelecionado = pacientes.find((p) => p.id === pacienteId);
  const pacoteAtivo = pacienteSelecionado?.pacoteAtivo;
  const temPacoteDisponivel = pacoteAtivo && pacoteAtivo.sessoesUtilizadas < pacoteAtivo.totalSessoes;

  useEffect(() => {
    if (agendamentoParaEditar) {
      setPacienteId(agendamentoParaEditar.pacienteId);
      setIsNovoPaciente(false);
      setData(agendamentoParaEditar.data);
      setHorario(agendamentoParaEditar.horario);
      setDuracaoMinutos(agendamentoParaEditar.duracaoMinutos);
      setTipoTerapia(agendamentoParaEditar.tipoTerapia);
      setZonasTratadas(agendamentoParaEditar.zonasTratadas || []);
      setNivelDorInicial(agendamentoParaEditar.nivelDorInicial);
      setNivelDorFinal(agendamentoParaEditar.nivelDorFinal);
      setStatus(agendamentoParaEditar.status);
      setModalidadeCobranca(agendamentoParaEditar.modalidadeCobranca || 'avulso');
      setNumeroSessaoPacote(agendamentoParaEditar.numeroSessaoPacote || 1);
      setValor(agendamentoParaEditar.valor);
      setPago(agendamentoParaEditar.pago);
      setMetodoPagamento(agendamentoParaEditar.metodoPagamento || 'pendente');
      setObservacoes(agendamentoParaEditar.observacoes || '');
      setCondutaTerapeutica(agendamentoParaEditar.condutaTerapeutica || '');
      setRecomendacoesHomeCare(agendamentoParaEditar.recomendacoesHomeCare || '');
    } else {
      setData(dataInicial);
      setHorario(horarioInicial);
      if (pacientes.length > 0 && !pacienteId) {
        setPacienteId(pacientes[0].id);
      }
      setStatus('confirmado');
    }
  }, [agendamentoParaEditar, isOpen, dataInicial, horarioInicial, pacientes]);

  // Atualiza automaticamente as opções de pacote quando troca de paciente
  useEffect(() => {
    if (agendamentoParaEditar) return;

    if (pacienteSelecionado?.pacoteAtivo && pacienteSelecionado.pacoteAtivo.sessoesUtilizadas < totalSessoesPacotePadrao) {
      // Paciente tem pacote com sessões restantes!
      const proxSessao = pacienteSelecionado.pacoteAtivo.sessoesUtilizadas + 1;
      setModalidadeCobranca('pacote');
      setNumeroSessaoPacote(proxSessao);
      setValor(precoRateioSessaoPacote); // Rateio do pacote
      setPago(true);
      setMetodoPagamento('pacote_incluso');
      setComprarNovoPacote(false);
    } else {
      // Sem pacote ativo por padrão sugere avulso
      setModalidadeCobranca('avulso');
      setValor(precoAvulsoPadrao);
      setPago(false);
      setMetodoPagamento('pendente');
      setComprarNovoPacote(false);
    }
  }, [pacienteId, pacienteSelecionado, agendamentoParaEditar, precoAvulsoPadrao, precoRateioSessaoPacote, totalSessoesPacotePadrao]);

  const handleModalidadeChange = (modo: ModalidadeCobranca) => {
    setModalidadeCobranca(modo);
    if (modo === 'avulso') {
      setValor(precoAvulsoPadrao);
      setMetodoPagamento('pendente');
      setPago(false);
      setComprarNovoPacote(false);
    } else {
      if (temPacoteDisponivel && pacoteAtivo) {
        setNumeroSessaoPacote(pacoteAtivo.sessoesUtilizadas + 1);
        setValor(precoRateioSessaoPacote);
        setPago(true);
        setMetodoPagamento('pacote_incluso');
      } else {
        // Novo pacote contratado
        setNumeroSessaoPacote(1);
        setValor(precoPacotePadrao);
        setPago(true);
        setMetodoPagamento('pix');
        setComprarNovoPacote(true);
      }
    }
  };

  if (!isOpen) return null;

  const isUltimaSessaoCalculada = modalidadeCobranca === 'pacote' && numeroSessaoPacote === totalSessoesPacotePadrao;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    let nomeFinal = '';
    let telefoneFinal = '';

    if (isNovoPaciente) {
      if (!novoNome.trim()) {
        setErro('Por favor, informe o nome do paciente.');
        return;
      }
      if (!novoTelefone.trim()) {
        setErro('Por favor, informe o telefone/WhatsApp do paciente.');
        return;
      }
      nomeFinal = novoNome.trim();
      telefoneFinal = novoTelefone.trim();
    } else {
      const p = pacientes.find((pac) => pac.id === pacienteId);
      if (!p) {
        setErro('Selecione um paciente cadastrado ou cadastre um novo.');
        return;
      }
      nomeFinal = p.nome;
      telefoneFinal = p.telefone;
    }

    if (!data || !horario) {
      setErro('Informe a data e o horário da sessão.');
      return;
    }

    const payload: Omit<Agendamento, 'id' | 'criadoEm'> = {
      pacienteId: isNovoPaciente ? `pac_${Date.now()}` : pacienteId,
      pacienteNome: nomeFinal,
      pacienteTelefone: telefoneFinal,
      data,
      horario,
      duracaoMinutos: Number(duracaoMinutos),
      tipoTerapia,
      zonasTratadas,
      nivelDorInicial: Number(nivelDorInicial),
      nivelDorFinal: nivelDorFinal !== undefined ? Number(nivelDorFinal) : undefined,
      status,
      modalidadeCobranca,
      numeroSessaoPacote: modalidadeCobranca === 'pacote' ? numeroSessaoPacote : undefined,
      isUltimaSessaoPacote: isUltimaSessaoCalculada,
      valor: Number(valor),
      pago,
      metodoPagamento,
      observacoes: isUltimaSessaoCalculada 
        ? `[4ª E ÚLTIMA SESSÃO DO PACOTE] ${observacoes}`.trim() 
        : observacoes,
      condutaTerapeutica,
      recomendacoesHomeCare
    };

    const novoPacPayload = isNovoPaciente
      ? {
          nome: novoNome.trim(),
          telefone: novoTelefone.trim(),
          email: novoEmail.trim() || undefined,
          queixaPrincipal: novaQueixa.trim() || 'Queixa não informada',
          pacoteAtivo: modalidadeCobranca === 'pacote' || comprarNovoPacote ? {
            id: `pct_${Date.now()}`,
            totalSessoes: totalSessoesPacotePadrao,
            sessoesUtilizadas: 1,
            valorTotal: precoPacotePadrao,
            dataCompra: data,
            ativo: true
          } : undefined
        }
      : undefined;

    // Se deduz do pacote de paciente existente
    let atualizarPacote: { pacienteId: string; sessoesUtilizadas: number; novoPacote?: boolean } | undefined = undefined;
    if (!isNovoPaciente && !agendamentoParaEditar) {
      if (modalidadeCobranca === 'pacote') {
        if (comprarNovoPacote) {
          atualizarPacote = {
            pacienteId,
            sessoesUtilizadas: 1,
            novoPacote: true
          };
        } else if (pacoteAtivo) {
          atualizarPacote = {
            pacienteId,
            sessoesUtilizadas: Math.min(totalSessoesPacotePadrao, pacoteAtivo.sessoesUtilizadas + 1),
            novoPacote: false
          };
        }
      }
    }

    onSave(payload, novoPacPayload, atualizarPacote);
    onClose();
  };

  const getDescricaoDor = (nivel: number) => {
    if (nivel === 0) return '0 - Sem dor / Confortável';
    if (nivel <= 2) return `${nivel} - Leve (desconforto brando)`;
    if (nivel <= 4) return `${nivel} - Moderada (tensão palpável)`;
    if (nivel <= 6) return `${nivel} - Incômoda (limita movimento)`;
    if (nivel <= 8) return `${nivel} - Severa (dor aguda/queimação)`;
    return `${nivel} - Insuportável (espasmo constante)`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div 
        id="appointment-modal-card" 
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] flex flex-col my-0 sm:my-8 overflow-hidden border border-stone-200"
      >
        {/* Modal Header */}
        <div className="bg-stone-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-teal-600/30 flex items-center justify-center border border-teal-500/40 text-teal-300 font-bold text-xs sm:text-sm">
              RO
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white leading-tight">
                {agendamentoParaEditar ? 'Editar Sessão Miofascial' : 'Novo Atendimento - Renata Okoti'}
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-400">
                Sessão avulsa (R$ 150) ou Pacote 4x (R$ 500)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {erro && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Paciente Section */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                <User className="w-4 h-4 text-teal-700" />
                <span>Identificação do Paciente</span>
              </label>

              {!agendamentoParaEditar && (
                <button
                  type="button"
                  onClick={() => setIsNovoPaciente(!isNovoPaciente)}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 underline underline-offset-2"
                >
                  {isNovoPaciente ? '← Escolher paciente existente' : '+ Cadastrar novo paciente'}
                </button>
              )}
            </div>

            {isNovoPaciente ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Silveira"
                    className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={novoTelefone}
                    onChange={(e) => setNovoTelefone(e.target.value)}
                    placeholder="(11) 99999-8888"
                    className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">E-mail (opcional)</label>
                  <input
                    type="email"
                    value={novoEmail}
                    onChange={(e) => setNovoEmail(e.target.value)}
                    placeholder="carlos@email.com"
                    className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Queixa Principal / Histórico</label>
                  <input
                    type="text"
                    value={novaQueixa}
                    onChange={(e) => setNovaQueixa(e.target.value)}
                    placeholder="Ex: Tensão lombar irradiada"
                    className="w-full text-sm px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <select
                  value={pacienteId}
                  onChange={(e) => setPacienteId(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {pacientes.map((pac) => {
                    const statusPacote = pac.pacoteAtivo && pac.pacoteAtivo.sessoesUtilizadas < 4
                      ? `[Pacote: ${pac.pacoteAtivo.sessoesUtilizadas}/4]`
                      : '[Avulso / Sem pacote]';
                    return (
                      <option key={pac.id} value={pac.id}>
                        {pac.nome} • {statusPacote} - {pac.telefone}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {/* SELEÇÃO DO MODELO DE ATENDIMENTO: AVULSO R$ 150 vs PACOTE R$ 500 */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-teal-700" />
              <span>Modalidade de Cobrança & Controle de Pacote</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {/* Option 1: Avulso */}
              <div
                onClick={() => handleModalidadeChange('avulso')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  modalidadeCobranca === 'avulso'
                    ? 'bg-white border-teal-600 ring-2 ring-teal-500/30 shadow-xs'
                    : 'bg-white/60 border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">Atendimento Avulso</span>
                  <span className="text-sm font-bold text-teal-800">{formatarMoeda(precoAvulsoPadrao)}</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  1 atendimento individual de liberação miofascial sem vínculo a pacote.
                </p>
              </div>

              {/* Option 2: Pacote Atendimentos */}
              <div
                onClick={() => handleModalidadeChange('pacote')}
                className={`p-3 rounded-xl border cursor-pointer transition-all relative ${
                  modalidadeCobranca === 'pacote'
                    ? 'bg-teal-50/80 border-teal-600 ring-2 ring-teal-500/30 shadow-xs'
                    : 'bg-white/60 border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-900">Pacote {totalSessoesPacotePadrao} Atendimentos</span>
                    <span className="bg-teal-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {formatarMoeda(precoPacotePadrao)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">{formatarMoeda(precoRateioSessaoPacote)}/sessão</span>
                </div>
                <p className="text-[11px] text-stone-600 mt-1">
                  {temPacoteDisponivel
                    ? `Cliente possui pacote ativo: ${pacoteAtivo?.sessoesUtilizadas}/${totalSessoesPacotePadrao} utilizadas.`
                    : 'Contratar ou utilizar pacote terapêutico com dedução automática.'}
                </p>
              </div>
            </div>

            {/* Se modalidade for PACOTE: Mostra a contagem e alerta da última sessão */}
            {modalidadeCobranca === 'pacote' && (
              <div className="mt-3 pt-3 border-t border-stone-200 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="font-semibold text-stone-700">
                    Número do Atendimento no Pacote:
                  </span>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalSessoesPacotePadrao }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNumeroSessaoPacote(num)}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                          numeroSessaoPacote === num
                            ? num === totalSessoesPacotePadrao
                              ? 'bg-amber-600 text-white ring-2 ring-amber-300 shadow-xs scale-105'
                              : 'bg-teal-700 text-white ring-2 ring-teal-300 shadow-xs scale-105'
                            : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {num}ª
                      </button>
                    ))}
                  </div>
                </div>

                {/* ⚠️ ALERTA EXCLUSIVO DA ÚLTIMA SESSÃO PARA A PROFISSIONAL RENATA OKOTI */}
                {isUltimaSessaoCalculada ? (
                  <div className="p-3 bg-amber-500/10 border-2 border-amber-500 text-amber-900 rounded-xl flex items-start gap-2.5 animate-pulse">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                        ⚠️ ATENÇÃO RENATA OKOTI: {totalSessoesPacotePadrao}ª E ÚLTIMA SESSÃO DO PACOTE!
                      </h4>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Esta é a última sessão do pacote de {totalSessoesPacotePadrao} atendimentos deste cliente. 
                        <strong> Lembre-se de avisar o cliente durante ou ao final do atendimento e ofertar a renovação do pacote ({formatarMoeda(precoPacotePadrao)} por mais {totalSessoesPacotePadrao} sessões).</strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span>
                        Sessão <strong>{numeroSessaoPacote} de {totalSessoesPacotePadrao}</strong> do pacote.
                      </span>
                    </div>
                    <span className="text-[11px] text-teal-700 font-medium">
                      Restam {totalSessoesPacotePadrao - numeroSessaoPacote} {totalSessoesPacotePadrao - numeroSessaoPacote === 1 ? 'sessão' : 'sessões'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date, Time & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Data da Sessão</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Horário de Início</label>
              <input
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Duração</label>
              <select
                value={duracaoMinutos}
                onChange={(e) => setDuracaoMinutos(Number(e.target.value))}
                className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={45}>45 minutos</option>
                <option value={50}>50 minutos</option>
                <option value={60}>60 minutos (Padrão)</option>
                <option value={90}>90 minutos (Completa)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusAgendamento)}
                className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              >
                {Object.entries(STATUS_CONFIG).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.rotulo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo de Terapia Miofascial */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
              Técnica Aplicada
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(TIPOS_TERAPIA_CONFIG) as TipoTerapia[]).map((key) => {
                const item = TIPOS_TERAPIA_CONFIG[key];
                const isSelected = tipoTerapia === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTipoTerapia(key)}
                    className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/70 shadow-xs ring-1 ring-teal-500'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <span className="font-semibold text-stone-900 block">{item.nome}</span>
                    <span className="text-[10px] text-stone-500 block truncate">{item.descricao}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Anatomical Fascial Map Selector */}
          <div>
            <BodyMapSelector
              selectedZones={zonasTratadas}
              onChange={setZonasTratadas}
            />
          </div>

          {/* Escala Visual Analógica de Dor (EVA) */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-800">
                Nível de Dor / Tensão Pré-Sessão (EVA 0-10)
              </label>
              <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                {getDescricaoDor(nivelDorInicial)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={nivelDorInicial}
              onChange={(e) => setNivelDorInicial(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>

          {/* Financeiro e Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Valor Registrado (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-stone-400 text-sm">R$</span>
                <input
                  type="number"
                  min="0"
                  value={valor}
                  onChange={(e) => setValor(Number(e.target.value))}
                  className="w-full text-sm pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Forma de Pagamento</label>
              <select
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value as Agendamento['metodoPagamento'])}
                className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="pacote_incluso">Incluso no Pacote (Já Quitado)</option>
                <option value="pix">PIX</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="dinheiro">Dinheiro em Espécie</option>
                <option value="pendente">Pendente de Pagamento</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pago}
                  onChange={(e) => setPago(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-stone-300 focus:ring-teal-500"
                />
                <span className="text-xs font-medium text-stone-800">
                  Pagamento Confirmado
                </span>
              </label>
            </div>
          </div>

          {/* Observações & Conduta */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Observações Clínicas / Queixas
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Tensão aumentada em trapézio. Informar sobre a 4ª sessão do pacote se aplicável."
              className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-stone-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors min-h-[44px] flex items-center justify-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-xs transition-colors min-h-[44px] flex items-center justify-center ${
                isUltimaSessaoCalculada
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-teal-700 hover:bg-teal-800'
              }`}
            >
              {agendamentoParaEditar ? 'Salvar Alterações' : 'Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
