import React, { useState, useEffect } from 'react';
import { 
  Agendamento, 
  Paciente, 
  StatusAgendamento, 
  FiltrosAgenda,
  ConfiguracaoPrecos
} from './types';
import { 
  PACIENTES_INICIAIS, 
  AGENDAMENTOS_INICIAIS,
  PRECO_PACOTE
} from './data/therapyData';
import { carregarConfiguracaoPrecos, salvarConfiguracaoPrecos } from './utils/pricingUtils';
import { formatarMoeda } from './utils/dateUtils';
import { Header, AbaNavegacao } from './components/Header';
import { QuickStats } from './components/QuickStats';
import { AppointmentFilters } from './components/AppointmentFilters';
import { DailyTimelineView } from './components/DailyTimelineView';
import { WeeklyView } from './components/WeeklyView';
import { MonthlyView } from './components/MonthlyView';
import { PatientsView } from './components/PatientsView';
import { AppointmentModal } from './components/AppointmentModal';
import { AppointmentDetailModal } from './components/AppointmentDetailModal';
import { PricingConfigModal } from './components/PricingConfigModal';
import { NextDayRemindersAlert } from './components/NextDayRemindersAlert';

const STORAGE_PACIENTES = 'agenda_miofascial_pacientes_v3';
const STORAGE_AGENDAMENTOS = 'agenda_miofascial_agendamentos_v3';

export default function App() {
  // Configuração dinâmica de preços (avulso vs pacote e quantidade de sessões)
  const [configPrecos, setConfigPrecos] = useState<ConfiguracaoPrecos>(() => carregarConfiguracaoPrecos());
  const [isModalPricingOpen, setIsModalPricingOpen] = useState<boolean>(false);

  // Estado de Pacientes e Agendamentos persistidos em localStorage
  const [pacientes, setPacientes] = useState<Paciente[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PACIENTES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao ler pacientes do localStorage:', e);
    }
    return PACIENTES_INICIAIS;
  });

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AGENDAMENTOS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao ler agendamentos do localStorage:', e);
    }
    return AGENDAMENTOS_INICIAIS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PACIENTES, JSON.stringify(pacientes));
    } catch (e) {
      console.error('Erro ao salvar pacientes:', e);
    }
  }, [pacientes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_AGENDAMENTOS, JSON.stringify(agendamentos));
    } catch (e) {
      console.error('Erro ao salvar agendamentos:', e);
    }
  }, [agendamentos]);

  // Controle de Navegação e Datas
  const [abaAtiva, setAbaAtiva] = useState<AbaNavegacao>('diaria');
  const [dataSelecionada, setDataSelecionada] = useState<string>('2026-09-15');

  // Filtros
  const [filtros, setFiltros] = useState<FiltrosAgenda>({
    status: 'todos',
    tipoTerapia: 'todos',
    buscaPaciente: '',
  });

  // Modais
  const [isModalNovoAgendamentoOpen, setIsModalNovoAgendamentoOpen] = useState(false);
  const [agendamentoParaEditar, setAgendamentoParaEditar] = useState<Agendamento | null>(null);
  const [agendamentoDetalhe, setAgendamentoDetalhe] = useState<Agendamento | null>(null);
  const [horarioPredefinido, setHorarioPredefinido] = useState<string>('09:00');
  const [dataPredefinida, setDataPredefinida] = useState<string>('2026-09-15');

  // Feedback Notification
  const [notificacao, setNotificacao] = useState<{ mensagem: string; tipo?: 'info' | 'alerta' } | null>(null);

  const mostrarNotificacao = (mensagem: string, tipo: 'info' | 'alerta' = 'info') => {
    setNotificacao({ mensagem, tipo });
    setTimeout(() => {
      setNotificacao(null);
    }, 4500);
  };

  // Filtragem dos agendamentos
  const agendamentosFiltrados = agendamentos.filter((a) => {
    if (filtros.status && filtros.status !== 'todos' && a.status !== filtros.status) {
      return false;
    }
    if (filtros.tipoTerapia && filtros.tipoTerapia !== 'todos' && a.tipoTerapia !== filtros.tipoTerapia) {
      return false;
    }
    if (filtros.buscaPaciente && filtros.buscaPaciente.trim() !== '') {
      const q = filtros.buscaPaciente.toLowerCase();
      const matchNome = a.pacienteNome.toLowerCase().includes(q);
      const matchObs = a.observacoes?.toLowerCase().includes(q) || false;
      const matchConduta = a.condutaTerapeutica?.toLowerCase().includes(q) || false;
      if (!matchNome && !matchObs && !matchConduta) return false;
    }
    return true;
  });

  // Manipulação de Agendamentos e Dedução de Pacote
  const handleSalvarAgendamento = (
    dadosAgendamento: Omit<Agendamento, 'id' | 'criadoEm'>,
    novoPaciente?: Omit<Paciente, 'id' | 'dataCadastro'>,
    atualizarPacotePaciente?: { pacienteId: string; sessoesUtilizadas: number; novoPacote?: boolean }
  ) => {
    // Se um novo paciente foi cadastrado junto
    if (novoPaciente) {
      const novoPac: Paciente = {
        ...novoPaciente,
        id: dadosAgendamento.pacienteId,
        dataCadastro: new Date().toISOString().split('T')[0],
      };
      setPacientes((prev) => [novoPac, ...prev]);
    }

    // Se deve atualizar o pacote do paciente
    if (atualizarPacotePaciente) {
      setPacientes((prev) =>
        prev.map((p) => {
          if (p.id !== atualizarPacotePaciente.pacienteId) return p;

          if (atualizarPacotePaciente.novoPacote) {
            return {
              ...p,
              pacoteAtivo: {
                id: `pct_${Date.now()}`,
                totalSessoes: configPrecos.sessoesPorPacote,
                sessoesUtilizadas: atualizarPacotePaciente.sessoesUtilizadas,
                valorTotal: configPrecos.precoPacote,
                dataCompra: dadosAgendamento.data,
                ativo: true,
              }
            };
          }

          if (p.pacoteAtivo) {
            return {
              ...p,
              pacoteAtivo: {
                ...p.pacoteAtivo,
                sessoesUtilizadas: atualizarPacotePaciente.sessoesUtilizadas
              }
            };
          }
          return p;
        })
      );
    }

    if (agendamentoParaEditar) {
      // Atualização
      const atualizados = agendamentos.map((item) =>
        item.id === agendamentoParaEditar.id
          ? { ...item, ...dadosAgendamento }
          : item
      );
      setAgendamentos(atualizados);
      mostrarNotificacao('Atendimento atualizado com sucesso!');
      setAgendamentoParaEditar(null);
      if (agendamentoDetalhe?.id === agendamentoParaEditar.id) {
        setAgendamentoDetalhe({ ...agendamentoParaEditar, ...dadosAgendamento });
      }
    } else {
      // Criação
      const novoId = `ag_${Date.now()}`;
      const novo: Agendamento = {
        ...dadosAgendamento,
        id: novoId,
        criadoEm: new Date().toISOString(),
      };
      setAgendamentos((prev) => [novo, ...prev]);

      // Se for a 4ª sessão do pacote, exibe notificação de alerta explícita para Renata Okoti
      if (dadosAgendamento.modalidadeCobranca === 'pacote' && dadosAgendamento.numeroSessaoPacote === 4) {
        mostrarNotificacao(
          `⚠️ Atenção Renata Okoti: Esta é a 4ª e última sessão do pacote de ${dadosAgendamento.pacienteNome}! Lembre-se de ofertar renovação (R$ 500).`,
          'alerta'
        );
      } else if (dadosAgendamento.modalidadeCobranca === 'pacote') {
        mostrarNotificacao(
          `Sessão ${dadosAgendamento.numeroSessaoPacote}/4 deduzida do pacote de ${dadosAgendamento.pacienteNome}.`,
          'info'
        );
      } else {
        mostrarNotificacao(`Atendimento avulso (R$ 150,00) agendado com sucesso!`);
      }
    }
  };

  const handleRenovarPacote = (
    pacienteId: string,
    detalhes?: {
      dataRenovacao?: string;
      formaPagamento?: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro';
      observacoes?: string;
    }
  ) => {
    const paciente = pacientes.find((p) => p.id === pacienteId);
    if (!paciente) return;

    const dataHoje = detalhes?.dataRenovacao || new Date().toISOString().split('T')[0];

    setPacientes((prev) =>
      prev.map((p) => {
        if (p.id !== pacienteId) return p;

        const historicoAnterior = p.historicoPacotes || [];
        const historicoAtualizado = p.pacoteAtivo
          ? [
              {
                ...p.pacoteAtivo,
                ativo: false,
                dataRenovacao: dataHoje,
              },
              ...historicoAnterior,
            ]
          : historicoAnterior;

        return {
          ...p,
          pacoteAtivo: {
            id: `pct_${Date.now()}`,
            totalSessoes: configPrecos.sessoesPorPacote,
            sessoesUtilizadas: 0,
            valorTotal: configPrecos.precoPacote,
            dataCompra: dataHoje,
            ativo: true,
            formaPagamento: detalhes?.formaPagamento || 'pix',
            observacoes: detalhes?.observacoes,
          },
          historicoPacotes: historicoAtualizado,
        };
      })
    );

    mostrarNotificacao(
      `Pacote de ${configPrecos.sessoesPorPacote} atendimentos (${formatarMoeda(configPrecos.precoPacote)}) renovado com sucesso para ${paciente.nome}! Histórico financeiro e novo ciclo iniciados.`,
      'info'
    );
  };

  const handleSalvarConfigPrecos = (novaConfig: ConfiguracaoPrecos) => {
    salvarConfiguracaoPrecos(novaConfig);
    setConfigPrecos(novaConfig);
    mostrarNotificacao(
      `Tabela de preços atualizada com sucesso: Avulso R$ ${novaConfig.precoAvulso} | Pacote (${novaConfig.sessoesPorPacote}x) R$ ${novaConfig.precoPacote}`,
      'info'
    );
  };

  const handleStatusChange = (id: string, novoStatus: StatusAgendamento) => {
    setAgendamentos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: novoStatus } : a))
    );
    if (agendamentoDetalhe && agendamentoDetalhe.id === id) {
      setAgendamentoDetalhe({ ...agendamentoDetalhe, status: novoStatus });
    }
    mostrarNotificacao(`Status alterado para "${novoStatus.toUpperCase()}".`);
  };

  const handleExcluirAgendamento = (id: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este agendamento?')) {
      setAgendamentos((prev) => prev.filter((a) => a.id !== id));
      setAgendamentoDetalhe(null);
      mostrarNotificacao('Sessão excluída da agenda.');
    }
  };

  const handleCadastrarNovoPaciente = (novo: Omit<Paciente, 'id' | 'dataCadastro'>) => {
    const novoPac: Paciente = {
      ...novo,
      id: `pac_${Date.now()}`,
      dataCadastro: new Date().toISOString().split('T')[0],
    };
    setPacientes((prev) => [novoPac, ...prev]);
    mostrarNotificacao(`Paciente ${novo.nome} cadastrado com sucesso!`);
  };

  const handleAgendarParaPaciente = (paciente: Paciente) => {
    setAgendamentoParaEditar(null);
    setDataPredefinida(dataSelecionada);
    setHorarioPredefinido('09:00');
    setIsModalNovoAgendamentoOpen(true);
  };

  const abrirNovoAgendamentoNoHorario = (horario: string) => {
    setAgendamentoParaEditar(null);
    setDataPredefinida(dataSelecionada);
    setHorarioPredefinido(horario);
    setIsModalNovoAgendamentoOpen(true);
  };

  const abrirNovoAgendamentoNoDia = (dia: string) => {
    setAgendamentoParaEditar(null);
    setDataPredefinida(dia);
    setHorarioPredefinido('09:00');
    setIsModalNovoAgendamentoOpen(true);
  };

  const handleEditarAgendamento = (ag: Agendamento) => {
    setAgendamentoDetalhe(null);
    setAgendamentoParaEditar(ag);
    setDataPredefinida(ag.data);
    setHorarioPredefinido(ag.horario);
    setIsModalNovoAgendamentoOpen(true);
  };

  const handleResetarDados = () => {
    if (window.confirm('Deseja restaurar os dados originais da clínica de Renata Okoti?')) {
      setPacientes(PACIENTES_INICIAIS);
      setAgendamentos(AGENDAMENTOS_INICIAIS);
      localStorage.removeItem(STORAGE_PACIENTES);
      localStorage.removeItem(STORAGE_AGENDAMENTOS);
      mostrarNotificacao('Dados originais restaurados com sucesso.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-teal-200">
      {/* Top Header with Navigation Tabs */}
      <Header
        abaAtiva={abaAtiva}
        onAbaChange={setAbaAtiva}
        onNovoAgendamento={() => {
          setAgendamentoParaEditar(null);
          setDataPredefinida(dataSelecionada);
          setHorarioPredefinido('09:00');
          setIsModalNovoAgendamentoOpen(true);
        }}
        onResetarDados={handleResetarDados}
        configPrecos={configPrecos}
        onAbrirConfigPrecos={() => setIsModalPricingOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Toast Notification */}
        {notificacao && (
          <div className={`fixed bottom-5 right-5 z-50 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 max-w-md ${
            notificacao.tipo === 'alerta'
              ? 'bg-amber-600 border-amber-400 text-white animate-bounce'
              : 'bg-stone-900 border-stone-700 text-white'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              notificacao.tipo === 'alerta' ? 'bg-white' : 'bg-teal-400'
            }`}></span>
            <span>{notificacao.mensagem}</span>
          </div>
        )}

        {/* Quick Clinical Metrics */}
        <QuickStats
          agendamentos={agendamentos}
          dataHoje={dataSelecionada}
        />

        {/* 🔔 Alerta Persistente e Agendamento Automático de Lembretes para o Dia Seguinte */}
        <NextDayRemindersAlert
          agendamentos={agendamentos}
          dataReferencia={dataSelecionada}
          onVerDetalhesAgendamento={(id) => {
            const ag = agendamentos.find((a) => a.id === id);
            if (ag) setAgendamentoDetalhe(ag);
          }}
          onNotificar={mostrarNotificacao}
        />

        {/* Global Appointment Filters */}
        {abaAtiva !== 'pacientes' && (
          <AppointmentFilters
            filtros={filtros}
            onChange={setFiltros}
            onLimpar={() =>
              setFiltros({
                status: 'todos',
                tipoTerapia: 'todos',
                buscaPaciente: '',
              })
            }
          />
        )}

        {/* View Switching */}
        {abaAtiva === 'diaria' && (
          <DailyTimelineView
            dataSelecionada={dataSelecionada}
            onDataChange={setDataSelecionada}
            agendamentos={agendamentosFiltrados}
            onSelectAgendamento={setAgendamentoDetalhe}
            onNovoAgendamentoNoHorario={abrirNovoAgendamentoNoHorario}
            onQuickStatusChange={handleStatusChange}
          />
        )}

        {abaAtiva === 'semanal' && (
          <WeeklyView
            dataReferencia={dataSelecionada}
            onDataChange={setDataSelecionada}
            agendamentos={agendamentosFiltrados}
            onSelectAgendamento={setAgendamentoDetalhe}
            onNovoAgendamentoNoDia={abrirNovoAgendamentoNoDia}
          />
        )}

        {abaAtiva === 'mensal' && (
          <MonthlyView
            agendamentos={agendamentosFiltrados}
            onSelectData={(data) => {
              setDataSelecionada(data);
              setAbaAtiva('diaria');
            }}
            onNovoAgendamentoNoDia={abrirNovoAgendamentoNoDia}
            dataAtiva={dataSelecionada}
          />
        )}

        {abaAtiva === 'pacientes' && (
          <PatientsView
            pacientes={pacientes}
            agendamentos={agendamentos}
            onNovoPaciente={handleCadastrarNovoPaciente}
            onAgendarParaPaciente={handleAgendarParaPaciente}
            onSelectAgendamento={setAgendamentoDetalhe}
            onRenovarPacote={handleRenovarPacote}
            configPrecos={configPrecos}
            onAbrirConfigPrecos={() => setIsModalPricingOpen(true)}
          />
        )}
      </main>

      {/* Modal Criar / Editar Agendamento */}
      <AppointmentModal
        isOpen={isModalNovoAgendamentoOpen}
        onClose={() => {
          setIsModalNovoAgendamentoOpen(false);
          setAgendamentoParaEditar(null);
        }}
        onSave={handleSalvarAgendamento}
        agendamentoParaEditar={agendamentoParaEditar}
        pacientes={pacientes}
        dataInicial={dataPredefinida}
        horarioInicial={horarioPredefinido}
        configPrecos={configPrecos}
      />

      {/* Modal Detalhes da Sessão & Evolução */}
      <AppointmentDetailModal
        agendamento={agendamentoDetalhe}
        isOpen={!!agendamentoDetalhe}
        onClose={() => setAgendamentoDetalhe(null)}
        onEdit={handleEditarAgendamento}
        onDelete={handleExcluirAgendamento}
        onStatusChange={handleStatusChange}
        onRenovarPacote={handleRenovarPacote}
      />

      {/* Modal de Configuração de Preços & Pacotes (Sessão Avulsa vs Pacote com Quantidade de Sessões) */}
      <PricingConfigModal
        isOpen={isModalPricingOpen}
        onClose={() => setIsModalPricingOpen(false)}
        configAtual={configPrecos}
        onSalvar={handleSalvarConfigPrecos}
      />
    </div>
  );
}
