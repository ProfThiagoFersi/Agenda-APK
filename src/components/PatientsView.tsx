import React, { useState } from 'react';
import { Paciente, Agendamento, ConfiguracaoPrecos } from '../types';
import { TIPOS_TERAPIA_CONFIG, STATUS_CONFIG, PRECO_PACOTE, PRECO_AVULSO } from '../data/therapyData';
import { CONFIG_PRECOS_PADRAO } from '../utils/pricingUtils';
import { formatarDataCurta, formatarMoeda } from '../utils/dateUtils';
import { PatientsFinancialTab } from './PatientsFinancialTab';
import { 
  Search, 
  UserPlus, 
  Phone, 
  Briefcase, 
  MessageCircle, 
  FileText, 
  Activity,
  Plus,
  Package,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Wallet,
  Receipt,
  Sparkles,
  ArrowRight,
  Coins
} from 'lucide-react';

interface PatientsViewProps {
  pacientes: Paciente[];
  agendamentos: Agendamento[];
  onNovoPaciente: (paciente: Omit<Paciente, 'id' | 'dataCadastro'>) => void;
  onAgendarParaPaciente: (paciente: Paciente) => void;
  onSelectAgendamento: (agendamento: Agendamento) => void;
  onRenovarPacote: (
    pacienteId: string,
    detalhes?: {
      dataRenovacao?: string;
      formaPagamento?: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro';
      observacoes?: string;
    }
  ) => void;
  configPrecos?: ConfiguracaoPrecos;
  onAbrirConfigPrecos?: () => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  pacientes,
  agendamentos,
  onNovoPaciente,
  onAgendarParaPaciente,
  onSelectAgendamento,
  onRenovarPacote,
  configPrecos = CONFIG_PRECOS_PADRAO,
  onAbrirConfigPrecos,
}) => {
  const [busca, setBusca] = useState<string>('');
  const [pacienteSelecionadoId, setPacienteSelecionadoId] = useState<string | null>(null);
  const [modalNovoPaciente, setModalNovoPaciente] = useState<boolean>(false);
  const [abaMobile, setAbaMobile] = useState<'lista' | 'prontuario'>('lista');
  const [subAbaPrincipal, setSubAbaPrincipal] = useState<'prontuarios' | 'financeiro'>('prontuarios');

  // Quantidade de pacientes precisando de renovação de pacote
  const pacAguardandoRenovacao = pacientes.filter(
    (p) => p.pacoteAtivo && p.pacoteAtivo.sessoesUtilizadas >= 4
  );

  const calcularTotalInvestidoPaciente = (p: Paciente) => {
    const totalPacotes =
      (p.pacoteAtivo ? p.pacoteAtivo.valorTotal : 0) +
      (p.historicoPacotes || []).reduce((acc, pct) => acc + (pct.valorTotal || PRECO_PACOTE), 0);
    const totalAvulso = agendamentos
      .filter((a) => a.pacienteId === p.id && a.modalidadeCobranca === 'avulso' && a.status !== 'cancelado')
      .reduce((acc, a) => acc + (a.valor || PRECO_AVULSO), 0);
    return totalPacotes + totalAvulso;
  };

  // Form states for new patient
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [profissao, setProfissao] = useState('');
  const [queixaPrincipal, setQueixaPrincipal] = useState('');
  const [observacoesClinicas, setObservacoesClinicas] = useState('');
  const [iniciarComPacote, setIniciarComPacote] = useState(true);

  const pacientesFiltrados = pacientes.filter((p) => {
    const q = busca.toLowerCase();
    return (
      p.nome.toLowerCase().includes(q) ||
      p.telefone.toLowerCase().includes(q) ||
      p.queixaPrincipal.toLowerCase().includes(q)
    );
  });

  const handleSalvarPaciente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) return;
    onNovoPaciente({
      nome: nome.trim(),
      telefone: telefone.trim(),
      email: email.trim() || undefined,
      profissao: profissao.trim() || undefined,
      queixaPrincipal: queixaPrincipal.trim() || 'Sem queixa informada',
      observacoesClinicas: observacoesClinicas.trim() || undefined,
      pacoteAtivo: iniciarComPacote ? {
        id: `pct_${Date.now()}`,
        totalSessoes: 4,
        sessoesUtilizadas: 0,
        valorTotal: PRECO_PACOTE,
        dataCompra: new Date().toISOString().split('T')[0],
        ativo: true
      } : undefined
    });
    setNome('');
    setTelefone('');
    setEmail('');
    setProfissao('');
    setQueixaPrincipal('');
    setObservacoesClinicas('');
    setIniciarComPacote(true);
    setModalNovoPaciente(false);
  };

  const pacienteAtivo = pacientes.find((p) => p.id === pacienteSelecionadoId);
  const historicoSessoes = pacienteAtivo
    ? agendamentos
        .filter((a) => a.pacienteId === pacienteAtivo.id)
        .sort((a, b) => `${b.data} ${b.horario}`.localeCompare(`${a.data} ${a.horario}`))
    : [];

  const selecionarPaciente = (id: string) => {
    setPacienteSelecionadoId(id);
    setAbaMobile('prontuario');
  };

  return (
    <div id="patients-view" className="space-y-3 sm:space-y-4">
      {/* Sub-Aba Superior: Alternar entre Prontuários e Financeiro */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-stone-100 p-1 rounded-xl">
          <button
            type="button"
            id="tab-sub-prontuarios"
            onClick={() => setSubAbaPrincipal('prontuarios')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all min-h-[38px] ${
              subAbaPrincipal === 'prontuarios'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-4 h-4 text-teal-700" />
            <span>Pacientes & Prontuários</span>
            <span className="text-[10px] sm:text-xs px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 font-bold">
              {pacientes.length}
            </span>
          </button>

          <button
            type="button"
            id="tab-sub-financeiro"
            onClick={() => setSubAbaPrincipal('financeiro')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all min-h-[38px] ${
              subAbaPrincipal === 'financeiro'
                ? 'bg-white text-teal-900 shadow-xs ring-1 ring-teal-600/30'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Wallet className="w-4 h-4 text-teal-700" />
            <span>Financeiro & Pacotes</span>
            {pacAguardandoRenovacao.length > 0 && (
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white font-black animate-pulse">
                {pacAguardandoRenovacao.length}
              </span>
            )}
          </button>
        </div>

        {subAbaPrincipal === 'prontuarios' && (
          <button
            type="button"
            onClick={() => setModalNovoPaciente(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors min-h-[40px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Paciente</span>
          </button>
        )}
      </div>

      {subAbaPrincipal === 'financeiro' ? (
        /* Renderiza a Aba de Controle Financeiro, Renovações e Totais Investidos */
        <PatientsFinancialTab
          pacientes={pacientes}
          agendamentos={agendamentos}
          onRenovarPacote={onRenovarPacote}
          onAgendarParaPaciente={onAgendarParaPaciente}
          configPrecos={configPrecos}
          onAbrirConfigPrecos={onAbrirConfigPrecos}
        />
      ) : (
        <>
          {/* Top action bar: Busca para Prontuários */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-stone-200 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por paciente, telefone ou queixa..."
                className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-stone-50 min-h-[42px] sm:min-h-0"
              />
            </div>
          </div>

      {/* Mobile Sub-Navigation Tabs between List and Record */}
      <div className="flex lg:hidden bg-stone-200/70 p-1 rounded-xl gap-1">
        <button
          type="button"
          onClick={() => setAbaMobile('lista')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center ${
            abaMobile === 'lista'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Lista ({pacientesFiltrados.length})
        </button>
        <button
          type="button"
          onClick={() => {
            if (!pacienteSelecionadoId && pacientes.length > 0) {
              setPacienteSelecionadoId(pacientes[0].id);
            }
            setAbaMobile('prontuario');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center ${
            abaMobile === 'prontuario'
              ? 'bg-white text-teal-800 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {pacienteAtivo ? `Prontuário: ${pacienteAtivo.nome.split(' ')[0]}` : 'Prontuário'}
        </button>
      </div>

      {/* Main Grid: Patients List & Selected Clinical Record */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Patients Cards (7 cols on lg) */}
        <div className={`lg:col-span-7 space-y-3 ${abaMobile === 'prontuario' ? 'hidden lg:block' : 'block'}`}>
          {pacientesFiltrados.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl sm:rounded-2xl border border-stone-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-100">
                <UserPlus className="w-6 h-6" />
              </div>
              {pacientes.length === 0 ? (
                <>
                  <h4 className="text-base font-bold text-stone-900">Banco de Dados Zerado (Limpo)</h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Nenhum paciente cadastrado ainda. O sistema está pronto para começar seu atendimento clínico profissional.
                  </p>
                  <button
                    type="button"
                    onClick={() => setModalNovoPaciente(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar Primeiro Paciente</span>
                  </button>
                </>
              ) : (
                <p className="text-sm text-stone-500">Nenhum paciente encontrado para "{busca}".</p>
              )}
            </div>
          ) : (
            pacientesFiltrados.map((paciente) => {
              const totalAtendimentos = agendamentos.filter((a) => a.pacienteId === paciente.id).length;
              const isSelected = pacienteSelecionadoId === paciente.id;
              const pacote = paciente.pacoteAtivo;
              const isPacoteCompleto = pacote && pacote.sessoesUtilizadas >= 4;
              const isNaUltima = pacote && pacote.sessoesUtilizadas === 3;

              return (
                <div
                  key={paciente.id}
                  onClick={() => selecionarPaciente(paciente.id)}
                  className={`p-3.5 sm:p-4 bg-white rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-teal-600 ring-2 ring-teal-500/20 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-stone-900">{paciente.nome}</h4>
                        {paciente.profissao && (
                          <span className="inline-flex items-center gap-1 text-xs text-stone-500">
                            <Briefcase className="w-3 h-3 text-stone-400" />
                            {paciente.profissao}
                          </span>
                        )}
                      </div>

                      {/* Package indicator badge */}
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        {pacote ? (
                          isPacoteCompleto ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              <AlertTriangle className="w-3 h-3 text-amber-700" />
                              Pacote Concluído (4/4) • Renovar R$ 500
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                              isNaUltima
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-teal-50 text-teal-800 border-teal-200'
                            }`}>
                              <Package className="w-3 h-3" />
                              Pacote Ativo: {pacote.sessoesUtilizadas}/4 utilizadas
                              {isNaUltima && ' (⚠️ Última sessão!)'}
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                            Cliente Avulso (R$ 150/sessão)
                          </span>
                        )}
                      </div>

                      {/* Financial investment badge */}
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                          <Wallet className="w-3 h-3 text-stone-500" />
                          Investido: {formatarMoeda(calcularTotalInvestidoPaciente(paciente))}
                        </span>
                        {(paciente.historicoPacotes?.length || 0) > 0 && (
                          <span className="text-[10px] text-teal-700 font-bold">
                            • {(paciente.historicoPacotes?.length || 0) + (paciente.pacoteAtivo ? 1 : 0)}º pacote
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
                      {totalAtendimentos} histórico(s)
                    </span>
                  </div>

                  {/* Queixa principal */}
                  <div className="mt-2.5 p-2 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                    <span className="font-semibold text-stone-700 block">Queixa Miofascial:</span>
                    <p className="text-stone-600 line-clamp-2 mt-0.5">{paciente.queixaPrincipal}</p>
                  </div>

                  {/* Contact info & Action row with comfortable touch targets */}
                  <div className="mt-3 flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-stone-100 text-xs">
                    <div className="flex items-center gap-3 text-stone-600">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        {paciente.telefone}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/55${paciente.telefone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl text-emerald-700 hover:bg-emerald-50 border border-emerald-200 min-h-[38px] min-w-[38px] flex items-center justify-center"
                        title="Conversar no WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAgendarParaPaciente(paciente);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition-colors min-h-[38px]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agendar Sessão</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Patient Details & Clinical Record History (5 cols on lg) */}
        <div className={`lg:col-span-5 ${abaMobile === 'lista' ? 'hidden lg:block' : 'block'}`}>
          {pacienteAtivo ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs sticky top-4 space-y-4">
              <div className="border-b border-stone-200 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 block">
                  Prontuário de Liberação Miofascial
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-1">{pacienteAtivo.nome}</h3>
                <div className="flex flex-wrap gap-3 text-xs text-stone-500 mt-1">
                  <span>Tel: {pacienteAtivo.telefone}</span>
                  {pacienteAtivo.email && <span>{pacienteAtivo.email}</span>}
                </div>
              </div>

              {/* Pacote Status Box & Renewal Action */}
              <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-teal-900">
                    <Package className="w-4 h-4 text-teal-700" />
                    <span>Controle de Pacote (4 Atendimentos)</span>
                  </div>
                  <span className="text-xs font-extrabold text-teal-900">
                    R$ 500,00
                  </span>
                </div>

                {pacienteAtivo.pacoteAtivo ? (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-stone-600">Sessões realizadas:</span>
                      <strong className="text-stone-900">
                        {pacienteAtivo.pacoteAtivo.sessoesUtilizadas} de 4 sessões
                      </strong>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pacienteAtivo.pacoteAtivo.sessoesUtilizadas >= 4
                            ? 'bg-amber-500'
                            : 'bg-teal-600'
                        }`}
                        style={{
                          width: `${Math.min(100, (pacienteAtivo.pacoteAtivo.sessoesUtilizadas / 4) * 100)}%`
                        }}
                      />
                    </div>

                    {pacienteAtivo.pacoteAtivo.sessoesUtilizadas >= 4 ? (
                      <div className="mt-2.5 p-2 bg-amber-100 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-center justify-between gap-2">
                        <span className="font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          4ª sessão concluída!
                        </span>
                        <button
                          type="button"
                          onClick={() => onRenovarPacote(pacienteAtivo.id)}
                          className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Renovar (+4 por R$ 500)
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 text-[11px] text-stone-600 flex items-center justify-between">
                        <span>Restam {4 - pacienteAtivo.pacoteAtivo.sessoesUtilizadas} sessões no pacote.</span>
                        {pacienteAtivo.pacoteAtivo.sessoesUtilizadas === 3 && (
                          <span className="text-amber-800 font-bold">⚠️ Próxima é a 4ª sessão!</span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-stone-600">Cliente sem pacote ativo.</span>
                    <button
                      type="button"
                      onClick={() => onRenovarPacote(pacienteAtivo.id)}
                      className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-bold transition-colors"
                    >
                      Ativar Pacote 4x (R$ 500)
                    </button>
                  </div>
                )}
              </div>

              {/* Resumo Financeiro e Histórico de Investimento do Paciente */}
              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-teal-700" />
                    Investimento Acumulado
                  </span>
                  <span className="text-sm font-extrabold text-teal-900">
                    {formatarMoeda(calcularTotalInvestidoPaciente(pacienteAtivo))}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-600 pt-0.5">
                  <span>
                    {(pacienteAtivo.historicoPacotes?.length || 0) + (pacienteAtivo.pacoteAtivo ? 1 : 0)} ciclo(s) de pacotes
                  </span>
                  <button
                    type="button"
                    onClick={() => setSubAbaPrincipal('financeiro')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors"
                  >
                    <span>Ver no Financeiro</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Patient Observations */}
              {pacienteAtivo.observacoesClinicas && (
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-xs">
                  <span className="font-bold text-amber-900 block mb-1">Notas de Avaliação Fascial:</span>
                  <p className="text-amber-800">{pacienteAtivo.observacoesClinicas}</p>
                </div>
              )}

              {/* History of sessions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5 flex items-center justify-between">
                  <span>Sessões Registradas ({historicoSessoes.length})</span>
                  <button
                    type="button"
                    onClick={() => onAgendarParaPaciente(pacienteAtivo)}
                    className="text-teal-700 hover:underline capitalize"
                  >
                    + Novo Atendimento
                  </button>
                </h4>

                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {historicoSessoes.length === 0 ? (
                    <p className="text-xs text-stone-400 py-4 text-center">Nenhuma sessão registrada para este paciente.</p>
                  ) : (
                    historicoSessoes.map((s) => {
                      const terapiaConfig = TIPOS_TERAPIA_CONFIG[s.tipoTerapia];
                      const statusConfig = STATUS_CONFIG[s.status];

                      return (
                        <div
                          key={s.id}
                          onClick={() => onSelectAgendamento(s)}
                          className="p-3 bg-stone-50 hover:bg-white rounded-xl border border-stone-200 hover:border-teal-400 transition-colors cursor-pointer space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-800">
                              {formatarDataCurta(s.data)} às {s.horario}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusConfig.badgeClass}`}>
                              {statusConfig.rotulo}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-teal-800 font-medium">{terapiaConfig.nome}</span>
                            <span className="text-stone-600 font-semibold">
                              {s.modalidadeCobranca === 'pacote' 
                                ? `Pacote (${s.numeroSessaoPacote || 1}/4)` 
                                : `Avulso (${formatarMoeda(s.valor)})`}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-stone-500 pt-1">
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3 text-amber-600" />
                              Dor: <strong>{s.nivelDorInicial}/10</strong>
                              {s.nivelDorFinal !== undefined && (
                                <span className="text-emerald-700 font-bold"> → {s.nivelDorFinal}/10</span>
                              )}
                            </span>
                          </div>

                          {s.condutaTerapeutica && (
                            <p className="text-[11px] text-stone-500 line-clamp-1 italic">
                              "{s.condutaTerapeutica}"
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-400">
              <FileText className="w-8 h-8 mx-auto mb-2 text-stone-300" />
              <p className="text-sm font-medium">Selecione um paciente ao lado para visualizar seu prontuário, controle de pacote e histórico de sessões.</p>
            </div>
          )}
        </div>
      </div>
      </>
    )}

      {/* Modal Cadastro de Novo Paciente */}
      {modalNovoPaciente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-stone-200">
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold">Novo Paciente - Renata Okoti</h3>
              <button
                type="button"
                onClick={() => setModalNovoPaciente(false)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarPaciente} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do paciente"
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 98888-7777"
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Profissão / Ocupação</label>
                  <input
                    type="text"
                    value={profissao}
                    onChange={(e) => setProfissao(e.target.value)}
                    placeholder="Ex: Designer, Atleta"
                    className="w-full text-sm px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Queixa Principal / Tensão Fascial *</label>
                <textarea
                  rows={2}
                  required
                  value={queixaPrincipal}
                  onChange={(e) => setQueixaPrincipal(e.target.value)}
                  placeholder="Ex: Dor cervical irradiada, contratura lombar crônica..."
                  className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Pacote option checkbox */}
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={iniciarComPacote}
                    onChange={(e) => setIniciarComPacote(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-stone-300 focus:ring-teal-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-teal-900 block">
                      Iniciar com Pacote de 4 Atendimentos (R$ 500,00)
                    </span>
                    <span className="text-[11px] text-teal-700">
                      O sistema deduzirá automaticamente cada atendimento e avisará na 4ª sessão.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovoPaciente(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Salvar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
