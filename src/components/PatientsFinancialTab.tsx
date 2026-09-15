import React, { useState } from 'react';
import { Paciente, Agendamento, PacoteCliente, ConfiguracaoPrecos } from '../types';
import { PRECO_PACOTE, PRECO_AVULSO } from '../data/therapyData';
import { CONFIG_PRECOS_PADRAO } from '../utils/pricingUtils';
import { formatarMoeda, formatarDataCurta } from '../utils/dateUtils';
import { FinancialRevenueChart } from './FinancialRevenueChart';
import {
  Wallet,
  TrendingUp,
  Package,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  MessageCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Sparkles,
  Plus,
  ArrowUpRight,
  Receipt,
  Coins
} from 'lucide-react';

interface PatientsFinancialTabProps {
  pacientes: Paciente[];
  agendamentos: Agendamento[];
  onRenovarPacote: (
    pacienteId: string,
    detalhes?: {
      dataRenovacao?: string;
      formaPagamento?: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro';
      observacoes?: string;
    }
  ) => void;
  onAgendarParaPaciente: (paciente: Paciente) => void;
  configPrecos?: ConfiguracaoPrecos;
  onAbrirConfigPrecos?: () => void;
}

export const PatientsFinancialTab: React.FC<PatientsFinancialTabProps> = ({
  pacientes,
  agendamentos,
  onRenovarPacote,
  onAgendarParaPaciente,
  configPrecos = CONFIG_PRECOS_PADRAO,
  onAbrirConfigPrecos,
}) => {
  const precoAvulsoPadrao = configPrecos.precoAvulso || PRECO_AVULSO;
  const precoPacotePadrao = configPrecos.precoPacote || PRECO_PACOTE;
  const totalSessoesPacotePadrao = configPrecos.sessoesPorPacote || 4;

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'aguardando_renovacao' | 'ativo' | 'avulso' | 'vip'>('todos');
  const [ordenacao, setOrdenacao] = useState<'maior_valor' | 'mais_recente' | 'alfabetica'>('maior_valor');
  const [pacienteExpandidoId, setPacienteExpandidoId] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Estado do Modal de Renovação
  const [modalRenovacaoAberto, setModalRenovacaoAberto] = useState(false);
  const [pacienteParaRenovar, setPacienteParaRenovar] = useState<Paciente | null>(null);
  const [dataRenovacao, setDataRenovacao] = useState(new Date().toISOString().split('T')[0]);
  const [formaPagamento, setFormaPagamento] = useState<'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro'>('pix');
  const [observacoesRenovacao, setObservacoesRenovacao] = useState('');

  // Helpers de cálculo por paciente
  const calcularDadosFinanceirosPaciente = (paciente: Paciente) => {
    // 1. Pacotes ativos e arquivados
    const pacoteAtivo = paciente.pacoteAtivo;
    const historico = paciente.historicoPacotes || [];

    const totalInvestidoPacotes =
      (pacoteAtivo ? pacoteAtivo.valorTotal : 0) +
      historico.reduce((acc, p) => acc + (p.valorTotal || precoPacotePadrao), 0);

    const totalPacotesContratados = (pacoteAtivo ? 1 : 0) + historico.length;
    const totalRenovacoes = historico.length;

    // 2. Sessões avulsas realizadas ou agendadas não canceladas
    const sessoesAvulsas = agendamentos.filter(
      (a) => a.pacienteId === paciente.id && a.modalidadeCobranca === 'avulso' && a.status !== 'cancelado'
    );
    const totalInvestidoAvulso = sessoesAvulsas.reduce((acc, a) => acc + (a.valor || precoAvulsoPadrao), 0);

    // 3. Total Geral Investido
    const totalGeralInvestido = totalInvestidoPacotes + totalInvestidoAvulso;

    // Status do pacote atual
    const precisaRenovar = !!pacoteAtivo && pacoteAtivo.sessoesUtilizadas >= totalSessoesPacotePadrao;
    const pacoteEmAndamento = !!pacoteAtivo && pacoteAtivo.sessoesUtilizadas < totalSessoesPacotePadrao;
    const isAvulso = !pacoteAtivo;

    return {
      totalInvestidoPacotes,
      totalPacotesContratados,
      totalRenovacoes,
      sessoesAvulsas,
      totalInvestidoAvulso,
      totalGeralInvestido,
      precisaRenovar,
      pacoteEmAndamento,
      isAvulso,
      pacoteAtivo,
      historico
    };
  };

  // Métricas Consolidadas Globais
  const dadosConsolidados = pacientes.map((p) => ({
    paciente: p,
    financeiro: calcularDadosFinanceirosPaciente(p)
  }));

  const totalGeralAcumulado = dadosConsolidados.reduce((acc, item) => acc + item.financeiro.totalGeralInvestido, 0);
  const totalReceitaPacotes = dadosConsolidados.reduce((acc, item) => acc + item.financeiro.totalInvestidoPacotes, 0);
  const totalReceitaAvulsos = dadosConsolidados.reduce((acc, item) => acc + item.financeiro.totalInvestidoAvulso, 0);
  const totalPacotesVendidos = dadosConsolidados.reduce((acc, item) => acc + item.financeiro.totalPacotesContratados, 0);
  const pacientesAguardandoRenovacao = dadosConsolidados.filter((item) => item.financeiro.precisaRenovar);
  const totalRenovacoesEfetuadas = dadosConsolidados.reduce((acc, item) => acc + item.financeiro.totalRenovacoes, 0);

  // Filtragem e Ordenação
  const dadosFiltrados = dadosConsolidados.filter(({ paciente, financeiro }) => {
    const q = busca.toLowerCase().trim();
    const matchBusca =
      paciente.nome.toLowerCase().includes(q) ||
      paciente.telefone.toLowerCase().includes(q) ||
      paciente.queixaPrincipal.toLowerCase().includes(q);

    if (!matchBusca) return false;

    if (filtroStatus === 'aguardando_renovacao') return financeiro.precisaRenovar;
    if (filtroStatus === 'ativo') return financeiro.pacoteEmAndamento;
    if (filtroStatus === 'avulso') return financeiro.isAvulso;
    if (filtroStatus === 'vip') return financeiro.totalGeralInvestido >= 1000;

    return true;
  });

  const dadosOrdenados = [...dadosFiltrados].sort((a, b) => {
    if (ordenacao === 'maior_valor') {
      return b.financeiro.totalGeralInvestido - a.financeiro.totalGeralInvestido;
    }
    if (ordenacao === 'mais_recente') {
      return b.paciente.dataCadastro.localeCompare(a.paciente.dataCadastro);
    }
    return a.paciente.nome.localeCompare(b.paciente.nome);
  });

  const abrirModalRenovacao = (paciente: Paciente) => {
    setPacienteParaRenovar(paciente);
    setDataRenovacao(new Date().toISOString().split('T')[0]);
    setFormaPagamento('pix');
    setObservacoesRenovacao('');
    setModalRenovacaoAberto(true);
  };

  const confirmarRenovacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteParaRenovar) return;

    onRenovarPacote(pacienteParaRenovar.id, {
      dataRenovacao,
      formaPagamento,
      observacoes: observacoesRenovacao.trim() || undefined
    });

    setModalRenovacaoAberto(false);
    setPacienteParaRenovar(null);
  };

  const copiarRelatorioFinanceiro = () => {
    const linhas = [
      `📊 RESUMO FINANCEIRO - RENATA OKOTI (LIBERAÇÃO MIOFASCIAL)`,
      `Data: ${new Date().toLocaleDateString('pt-BR')}`,
      `Total Geral Investido: ${formatarMoeda(totalGeralAcumulado)}`,
      `Receita em Pacotes (4x R$ 500): ${formatarMoeda(totalReceitaPacotes)} (${totalPacotesVendidos} pacotes)`,
      `Receita em Avulsos (R$ 150): ${formatarMoeda(totalReceitaAvulsos)}`,
      `Renovações Concluídas: ${totalRenovacoesEfetuadas}`,
      `Pacientes aguardando renovação (4/4): ${pacientesAguardandoRenovacao.length}`,
      ``,
      `--- HISTÓRICO POR PACIENTE ---`,
      ...dadosConsolidados
        .sort((a, b) => b.financeiro.totalGeralInvestido - a.financeiro.totalGeralInvestido)
        .map(({ paciente, financeiro }) => {
          const status = financeiro.precisaRenovar
            ? '⚠️ 4ª Sessão Concluída (Renovar!)'
            : financeiro.pacoteAtivo
            ? `Pacote Ativo (${financeiro.pacoteAtivo.sessoesUtilizadas}/4)`
            : 'Sessões Avulsas';
          return `• ${paciente.nome}: ${formatarMoeda(financeiro.totalGeralInvestido)} | ${financeiro.totalPacotesContratados} pacote(s) | ${status}`;
        })
    ];

    navigator.clipboard.writeText(linhas.join('\n'));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const formatarMetodoPagamento = (metodo?: string) => {
    switch (metodo) {
      case 'pix':
        return 'PIX';
      case 'cartao_credito':
        return 'Cartão de Crédito';
      case 'cartao_debito':
        return 'Cartão de Débito';
      case 'dinheiro':
        return 'Dinheiro';
      default:
        return 'PIX / Não especificado';
    }
  };

  return (
    <div id="patients-financial-tab" className="space-y-4">
      {/* 4 Cards de Métricas Financeiras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Geral */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Total Geral Investido
            </span>
            <span className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5 block">
              {formatarMoeda(totalGeralAcumulado)}
            </span>
            <span className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              {pacientes.length} pacientes cadastrados
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Receita em Pacotes */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Receita em Pacotes 4x
            </span>
            <span className="text-xl sm:text-2xl font-black text-teal-800 mt-0.5 block">
              {formatarMoeda(totalReceitaPacotes)}
            </span>
            <span className="text-xs text-teal-700 mt-1 font-medium flex items-center gap-1">
              <Package className="w-3.5 h-3.5" />
              {totalPacotesVendidos} pacotes ({totalRenovacoesEfetuadas} renovações)
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Receita em Avulsos */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Atendimentos Avulsos
            </span>
            <span className="text-xl sm:text-2xl font-black text-stone-800 mt-0.5 block">
              {formatarMoeda(totalReceitaAvulsos)}
            </span>
            <span className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-stone-400" />
              R$ 150,00 por sessão
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Pacotes para Renovar Imediatamente */}
        <div className="bg-white p-4 rounded-xl border border-amber-300 shadow-xs flex items-center justify-between bg-gradient-to-br from-white to-amber-50/40">
          <div>
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
              Aguardando Renovação (4/4)
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5 block">
              {pacientesAguardandoRenovacao.length} paciente{pacientesAguardandoRenovacao.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-amber-800 font-semibold mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Potencial: {formatarMoeda(pacientesAguardandoRenovacao.length * PRECO_PACOTE)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Gráfico de Faturamento Mensal e Sessões Realizadas com Recharts */}
      <FinancialRevenueChart
        pacientes={pacientes}
        agendamentos={agendamentos}
      />

      {/* Barra de Filtros e Busca */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-stone-200 p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Busca */}
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

          {/* Ações / Copiar Resumo & Configurar Preços */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {onAbrirConfigPrecos && (
              <button
                id="btn-financeiro-config-precos"
                type="button"
                onClick={onAbrirConfigPrecos}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-300 text-teal-900 rounded-xl text-xs font-bold transition-colors min-h-[40px]"
                title="Definir valores da sessão avulsa e pacotes terapêuticos"
              >
                <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Definir Preços & Pacotes</span>
              </button>
            )}

            <button
              type="button"
              onClick={copiarRelatorioFinanceiro}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold transition-colors min-h-[40px]"
              title="Copiar relatório consolidado para a área de transferência"
            >
              {copiado ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-600" />
                  <span>Copiar Resumo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Chips de filtro e ordenação */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-stone-500 mr-1">Filtrar:</span>
            <button
              type="button"
              onClick={() => setFiltroStatus('todos')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                filtroStatus === 'todos'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Todos ({dadosConsolidados.length})
            </button>

            <button
              type="button"
              onClick={() => setFiltroStatus('aguardando_renovacao')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                filtroStatus === 'aguardando_renovacao'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Renovação Pendente ({pacientesAguardandoRenovacao.length})
            </button>

            <button
              type="button"
              onClick={() => setFiltroStatus('ativo')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                filtroStatus === 'ativo'
                  ? 'bg-teal-700 text-white'
                  : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
              }`}
            >
              Pacote em Andamento
            </button>

            <button
              type="button"
              onClick={() => setFiltroStatus('vip')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                filtroStatus === 'vip'
                  ? 'bg-purple-700 text-white'
                  : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              VIP (+R$ 1.000)
            </button>

            <button
              type="button"
              onClick={() => setFiltroStatus('avulso')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                filtroStatus === 'avulso'
                  ? 'bg-stone-700 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Apenas Avulsos
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-stone-500 font-medium">Ordenar:</span>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as any)}
              className="px-2 py-1 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="maior_valor">Maior Valor Investido</option>
              <option value="mais_recente">Mais Recentes</option>
              <option value="alfabetica">Nome (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Pacientes e Histórico Financeiro */}
      <div className="space-y-3">
        {dadosOrdenados.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-stone-200">
            <p className="text-sm text-stone-500">Nenhum paciente encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          dadosOrdenados.map(({ paciente, financeiro }) => {
            const isExpandido = pacienteExpandidoId === paciente.id;
            const isVip = financeiro.totalGeralInvestido >= 1000;

            return (
              <div
                key={paciente.id}
                className={`bg-white rounded-xl sm:rounded-2xl border transition-all ${
                  financeiro.precisaRenovar
                    ? 'border-amber-300 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 shadow-xs'
                }`}
              >
                {/* Linha Principal do Paciente */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Identificação */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-stone-900">{paciente.nome}</h3>
                        {isVip && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            Cliente VIP
                          </span>
                        )}
                        {financeiro.totalRenovacoes > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                            <RefreshCw className="w-3 h-3 text-teal-600" />
                            {financeiro.totalRenovacoes} renovação{financeiro.totalRenovacoes > 1 ? 'ões' : ''}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <span>Tel: {paciente.telefone}</span>
                        {paciente.profissao && <span>• {paciente.profissao}</span>}
                      </div>
                    </div>

                    {/* Resumo de Valores Investidos */}
                    <div className="flex items-center sm:text-right gap-4 justify-between sm:justify-end">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 block">
                          Total Investido
                        </span>
                        <span className="text-lg sm:text-xl font-black text-teal-900 block">
                          {formatarMoeda(financeiro.totalGeralInvestido)}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {financeiro.totalPacotesContratados} pacote(s) ({formatarMoeda(financeiro.totalInvestidoPacotes)})
                          {financeiro.totalInvestidoAvulso > 0 &&
                            ` + ${financeiro.sessoesAvulsas.length} avulsa(s)`}
                        </span>
                      </div>

                      {/* Botão de Renovação Rápida */}
                      <div className="flex items-center gap-2">
                        {financeiro.precisaRenovar ? (
                          <button
                            type="button"
                            onClick={() => abrirModalRenovacao(paciente)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors min-h-[40px]"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Renovar (+R$ 500)</span>
                          </button>
                        ) : financeiro.pacoteAtivo ? (
                          <button
                            type="button"
                            onClick={() => abrirModalRenovacao(paciente)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition-colors"
                            title="Adiantar renovação de pacote"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
                            <span>Renovar</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => abrirModalRenovacao(paciente)}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors min-h-[40px]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Ativar Pacote (R$ 500)</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setPacienteExpandidoId(isExpandido ? null : paciente.id)}
                          className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 border border-stone-200 transition-colors"
                          title={isExpandido ? 'Recolher detalhes' : 'Ver histórico financeiro'}
                        >
                          {isExpandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status Bar do Pacote Atual */}
                  {financeiro.pacoteAtivo ? (
                    <div className="mt-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                          <Package className="w-3.5 h-3.5 text-teal-700" />
                          <span>Pacote Vigente (4 sessões - R$ 500)</span>
                          <span className="text-[11px] text-stone-500 font-normal">
                            • Comprado em {formatarDataCurta(financeiro.pacoteAtivo.dataCompra)}
                          </span>
                        </div>
                        <span className="font-bold text-stone-900">
                          {financeiro.pacoteAtivo.sessoesUtilizadas} de 4 sessões utilizadas
                        </span>
                      </div>

                      {/* Progresso visual */}
                      <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            financeiro.precisaRenovar ? 'bg-amber-500' : 'bg-teal-600'
                          }`}
                          style={{
                            width: `${Math.min(100, (financeiro.pacoteAtivo.sessoesUtilizadas / 4) * 100)}%`
                          }}
                        />
                      </div>

                      {financeiro.precisaRenovar && (
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="text-amber-800 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            4ª e última sessão concluída. Proponha a renovação do pacote!
                          </span>

                          <a
                            href={`https://wa.me/55${paciente.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Olá ${paciente.nome}, tudo bem? Aqui é a Renata Okoti! Passando para lembrar que concluímos a 4ª sessão do seu pacote de Liberação Miofascial. Para darmos continuidade e manter os resultados, você gostaria de renovar seu pacote de 4 atendimentos (R$ 500)?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                          >
                            <MessageCircle className="w-3 h-3" />
                            Enviar convite de renovação no WhatsApp
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-stone-500 flex items-center justify-between">
                      <span>Sem pacote contratado no momento. Paciente em modalidade avulsa (R$ 150/sessão).</span>
                      <button
                        type="button"
                        onClick={() => abrirModalRenovacao(paciente)}
                        className="text-teal-700 hover:underline font-semibold"
                      >
                        Oferecer Pacote 4x
                      </button>
                    </div>
                  )}
                </div>

                {/* Seção Expandida: Linha do Tempo de Renovações e Sessões */}
                {isExpandido && (
                  <div className="border-t border-stone-200 bg-stone-50/70 p-4 sm:p-5 rounded-b-xl sm:rounded-b-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                        <Receipt className="w-4 h-4 text-teal-700" />
                        Histórico Completo de Pacotes & Renovações
                      </h4>

                      <button
                        type="button"
                        onClick={() => onAgendarParaPaciente(paciente)}
                        className="text-xs font-semibold text-teal-800 hover:underline inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Agendar Atendimento
                      </button>
                    </div>

                    {/* Ciclo Vigente */}
                    {financeiro.pacoteAtivo && (
                      <div className="p-3 bg-white rounded-xl border border-teal-300 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                            <span className="text-xs font-bold text-stone-900">
                              Pacote Atual (Ciclo Ativo)
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-teal-100 text-teal-800">
                              Em Vigência
                            </span>
                          </div>
                          <span className="text-xs font-black text-teal-800">
                            {formatarMoeda(financeiro.pacoteAtivo.valorTotal)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-stone-600 pt-1">
                          <div>
                            <span className="text-stone-400 block text-[10px]">Data de Início</span>
                            <strong className="text-stone-800">
                              {formatarDataCurta(financeiro.pacoteAtivo.dataCompra)}
                            </strong>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[10px]">Pagamento</span>
                            <strong className="text-stone-800">
                              {formatarMetodoPagamento(financeiro.pacoteAtivo.formaPagamento)}
                            </strong>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[10px]">Utilização</span>
                            <strong className="text-stone-800">
                              {financeiro.pacoteAtivo.sessoesUtilizadas} de 4 sessões concluídas
                            </strong>
                          </div>
                        </div>

                        {financeiro.pacoteAtivo.observacoes && (
                          <p className="text-[11px] text-stone-500 italic pt-1">
                            Obs: {financeiro.pacoteAtivo.observacoes}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Renovações Anteriores (Histórico Arquivado) */}
                    {financeiro.historico.length > 0 ? (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                          Ciclos Anteriores Concluídos ({financeiro.historico.length})
                        </span>

                        {financeiro.historico.map((pct, idx) => (
                          <div
                            key={pct.id || idx}
                            className="p-3 bg-white rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-stone-400" />
                                <span className="text-xs font-bold text-stone-800">
                                  Pacote Concluído - Ciclo #{financeiro.historico.length - idx}
                                </span>
                                <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                                  4/4 sessões realizadas
                                </span>
                              </div>
                              <div className="text-xs text-stone-500 flex flex-wrap gap-3">
                                <span>Início: {formatarDataCurta(pct.dataCompra)}</span>
                                {pct.dataRenovacao && (
                                  <span>• Renovado em: {formatarDataCurta(pct.dataRenovacao)}</span>
                                )}
                                <span>• {formatarMetodoPagamento(pct.formaPagamento)}</span>
                              </div>
                              {pct.observacoes && (
                                <p className="text-[11px] text-stone-500 italic">
                                  "{pct.observacoes}"
                                </p>
                              )}
                            </div>

                            <div className="sm:text-right">
                              <span className="text-xs font-black text-stone-800">
                                {formatarMoeda(pct.valorTotal || PRECO_PACOTE)}
                              </span>
                              <span className="text-[10px] text-emerald-700 font-semibold block">
                                Pago & Concluído
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : !financeiro.pacoteAtivo ? (
                      <p className="text-xs text-stone-500">Nenhum pacote contratado anteriormente.</p>
                    ) : null}

                    {/* Sessões Avulsas registradas */}
                    {financeiro.sessoesAvulsas.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-stone-200">
                        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                          Sessões Avulsas Pagas ({financeiro.sessoesAvulsas.length})
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {financeiro.sessoesAvulsas.map((sessao) => (
                            <div
                              key={sessao.id}
                              className="p-2.5 bg-white rounded-lg border border-stone-200 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold text-stone-800">
                                  {formatarDataCurta(sessao.data)} às {sessao.horario}
                                </span>
                                <span className="text-stone-500 block text-[11px]">
                                  {sessao.tipoTerapia}
                                </span>
                              </div>
                              <span className="font-bold text-stone-900">
                                {formatarMoeda(sessao.valor || PRECO_AVULSO)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Renovação de Pacote */}
      {modalRenovacaoAberto && pacienteParaRenovar && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg border border-stone-200 overflow-hidden">
            <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600/30 flex items-center justify-center border border-teal-500/40 text-teal-300 font-bold text-sm">
                  RO
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    Renovar Pacote de Atendimentos
                  </h3>
                  <p className="text-xs text-stone-300">
                    {pacienteParaRenovar.nome}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalRenovacaoAberto(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={confirmarRenovacao} className="p-5 space-y-4">
              {/* Detalhes do Plano */}
              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-teal-900 block">
                    Pacote de Liberação Miofascial
                  </span>
                  <span className="text-xs text-teal-700">
                    4 novos atendimentos clínicos
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-teal-900 block">
                    {formatarMoeda(PRECO_PACOTE)}
                  </span>
                  <span className="text-[10px] text-teal-700 font-semibold">
                    (R$ 125/sessão)
                  </span>
                </div>
              </div>

              {/* Data da Renovação */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Data da Renovação / Pagamento
                </label>
                <input
                  type="date"
                  value={dataRenovacao}
                  onChange={(e) => setDataRenovacao(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-stone-50"
                  required
                />
              </div>

              {/* Forma de Pagamento */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-stone-50"
                >
                  <option value="pix">PIX</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="dinheiro">Dinheiro</option>
                </select>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Observações / Detalhes da Renovação (Opcional)
                </label>
                <textarea
                  value={observacoesRenovacao}
                  onChange={(e) => setObservacoesRenovacao(e.target.value)}
                  rows={2}
                  placeholder="Ex: Renovação confirmada via WhatsApp, continuaremos foco em cervical..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-stone-50"
                />
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setModalRenovacaoAberto(false)}
                  className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-sm font-bold shadow-xs transition-colors"
                >
                  Confirmar Renovação (+R$ 500)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
