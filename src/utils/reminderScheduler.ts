import { Agendamento, LembreteAutomatico, EstadoLembretesStorage } from '../types';
import { TIPOS_TERAPIA_CONFIG } from '../data/therapyData';

export const STORAGE_KEY_LEMBRETES = 'agenda_miofascial_lembretes_auto_v2';
export const STORAGE_KEY_LEMBRETES_PREFS = 'agenda_miofascial_lembretes_prefs_v2';

/**
 * Calcula a data do dia seguinte no formato YYYY-MM-DD
 */
export function obterDataDiaSeguinte(dataReferencia: string): string {
  // Parsing seguro de YYYY-MM-DD
  const partes = dataReferencia.split('-');
  const ano = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const dia = parseInt(partes[2], 10);

  const dataObj = new Date(ano, mes, dia);
  dataObj.setDate(dataObj.getDate() + 1);

  const a = dataObj.getFullYear();
  const m = String(dataObj.getMonth() + 1).padStart(2, '0');
  const d = String(dataObj.getDate()).padStart(2, '0');

  return `${a}-${m}-${d}`;
}

/**
 * Formata data no formato brasileiro legível com dia da semana (ex: Quarta-feira, 16/09)
 */
export function formatarDataDiaSemana(dataStr: string): string {
  const partes = dataStr.split('-');
  const ano = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const dia = parseInt(partes[2], 10);

  const dataObj = new Date(ano, mes, dia);
  const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const diaSemana = diasSemana[dataObj.getDay()];

  return `${diaSemana}, ${String(dia).padStart(2, '0')}/${String(mes + 1).padStart(2, '0')}`;
}

/**
 * Gera mensagem de lembrete personalizada e polida para o paciente
 */
export function gerarMensagemLembreteAmanha(agendamento: Agendamento, dataAmanhaFormatada: string): string {
  const primeiroNome = agendamento.pacienteNome.split(' ')[0];
  const terapiaConfig = TIPOS_TERAPIA_CONFIG[agendamento.tipoTerapia] || { nome: 'Liberação Miofascial' };
  const isUltimaSessao = agendamento.isUltimaSessaoPacote || (agendamento.modalidadeCobranca === 'pacote' && agendamento.numeroSessaoPacote === 4);

  let detalhePacote = '';
  if (agendamento.modalidadeCobranca === 'pacote') {
    if (isUltimaSessao) {
      detalhePacote = ` (⚠️ 4ª e última sessão do seu ciclo de pacote)`;
    } else {
      detalhePacote = ` (Sessão ${agendamento.numeroSessaoPacote || 1} de 4 do seu pacote)`;
    }
  }

  let msg = `Olá, ${primeiroNome}! Tudo bem? Aqui é a Renata Okoti (Terapeuta Miofascial).\n\n`;
  msg += `Passando para confirmar seu atendimento agendado para amanhã, ${dataAmanhaFormatada}, às ${agendamento.horario} (${terapiaConfig.nome})${detalhePacote}.\n\n`;

  if (isUltimaSessao) {
    msg += `💡 Lembrando carinhosamente que ao final da sessão de amanhã poderemos planejar a renovação do seu pacote de 4 sessões (R$ 500,00) para garantir a continuidade dos seus resultados!\n\n`;
  }

  msg += `Recomendações:\n`;
  msg += `• Use roupas confortáveis e flexíveis (bermuda/top facilitam a palpação fascial)\n`;
  msg += `• Mantenha-se bem hidratado(a) antes do atendimento\n\n`;
  msg += `Por favor, responda confirmando sua presença! Caso precise de algum ajuste, me avise o quanto antes. Tenha um ótimo descanso e até amanhã! 🌿`;

  return msg;
}

/**
 * Lê o mapa de status dos lembretes do localStorage
 */
export function carregarStatusLembretesStorage(): Record<string, 'pendente' | 'enviado' | 'dispensado'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEMBRETES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Erro ao ler status dos lembretes do localStorage:', e);
  }
  return {};
}

/**
 * Salva o status de um lembrete específico no localStorage
 */
export function salvarStatusLembreteStorage(
  lembreteId: string,
  novoStatus: 'pendente' | 'enviado' | 'dispensado'
): Record<string, 'pendente' | 'enviado' | 'dispensado'> {
  try {
    const atual = carregarStatusLembretesStorage();
    const atualizado = { ...atual, [lembreteId]: novoStatus };
    localStorage.setItem(STORAGE_KEY_LEMBRETES, JSON.stringify(atualizado));
    return atualizado;
  } catch (e) {
    console.error('Erro ao salvar status do lembrete:', e);
    return {};
  }
}

/**
 * Marca uma lista de lembretes como enviados em lote
 */
export function marcarLembretesEmLoteStorage(
  lembreteIds: string[],
  status: 'pendente' | 'enviado' | 'dispensado'
): Record<string, 'pendente' | 'enviado' | 'dispensado'> {
  try {
    const atual = carregarStatusLembretesStorage();
    const atualizado = { ...atual };
    lembreteIds.forEach((id) => {
      atualizado[id] = status;
    });
    localStorage.setItem(STORAGE_KEY_LEMBRETES, JSON.stringify(atualizado));
    return atualizado;
  } catch (e) {
    console.error('Erro ao salvar lembretes em lote:', e);
    return {};
  }
}

/**
 * Carrega preferência de visualização (se o alerta está minimizado ou expandido)
 */
export function carregarPreferenciaMinimizadoAlert(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEMBRETES_PREFS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return !!parsed.minimizado;
    }
  } catch (e) {
    // ignora
  }
  return false;
}

/**
 * Salva preferência de minimizado no localStorage
 */
export function salvarPreferenciaMinimizadoAlert(minimizado: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_LEMBRETES_PREFS, JSON.stringify({ minimizado }));
  } catch (e) {
    // ignora
  }
}

/**
 * Função principal do scheduler:
 * Verifica a agenda para o dia seguinte, cruza com o localStorage e gera a lista de lembretes automáticos
 */
export function verificarEAgendarLembretesDiaSeguinte(
  agendamentos: Agendamento[],
  dataReferencia: string
): {
  dataAmanha: string;
  dataAmanhaFormatada: string;
  lembretes: LembreteAutomatico[];
} {
  const dataAmanha = obterDataDiaSeguinte(dataReferencia);
  const dataAmanhaFormatada = formatarDataDiaSemana(dataAmanha);
  const statusStorage = carregarStatusLembretesStorage();

  // Filtrar agendamentos ativos de amanhã
  const agendamentosAmanha = agendamentos
    .filter((a) => a.data === dataAmanha && a.status !== 'cancelado')
    .sort((a, b) => a.horario.localeCompare(b.horario));

  const lembretes: LembreteAutomatico[] = agendamentosAmanha.map((ag) => {
    const lembreteId = `lembrete_${ag.id}_${dataAmanha}`;
    const statusAtual = statusStorage[lembreteId] || 'pendente';
    const msg = gerarMensagemLembreteAmanha(ag, dataAmanhaFormatada);

    return {
      id: lembreteId,
      agendamentoId: ag.id,
      pacienteId: ag.pacienteId,
      pacienteNome: ag.pacienteNome,
      pacienteTelefone: ag.pacienteTelefone,
      data: dataAmanha,
      horario: ag.horario,
      duracaoMinutos: ag.duracaoMinutos,
      tipoTerapia: ag.tipoTerapia,
      modalidadeCobranca: ag.modalidadeCobranca,
      numeroSessaoPacote: ag.numeroSessaoPacote,
      totalSessoesPacote: 4,
      isUltimaSessaoPacote: ag.isUltimaSessaoPacote || (ag.modalidadeCobranca === 'pacote' && ag.numeroSessaoPacote === 4),
      statusEnvio: statusAtual,
      mensagem: msg,
      atualizadoEm: new Date().toISOString(),
    };
  });

  return {
    dataAmanha,
    dataAmanhaFormatada,
    lembretes,
  };
}

/**
 * Gera um roteiro consolidado do dia de amanhã para Renata Okoti
 */
export function gerarRoteiroTextoDia(
  lembretes: LembreteAutomatico[],
  dataAmanhaFormatada: string
): string {
  let texto = `📋 *ROTEIRO CLÍNICO DE AMANHÃ - RENATA OKOTI*\n`;
  texto += `🗓️ ${dataAmanhaFormatada} • Total: ${lembretes.length} atendimentos\n\n`;

  lembretes.forEach((item, index) => {
    const statusEmoji = item.statusEnvio === 'enviado' ? '✅' : '⏳';
    const cobranca = item.modalidadeCobranca === 'pacote'
      ? `Pacote (Sessão ${item.numeroSessaoPacote || 1}/4${item.isUltimaSessaoPacote ? ' ⚠️ RENOVAR' : ''})`
      : 'Avulso';

    texto += `${index + 1}. *${item.horario}* - ${item.pacienteNome}\n`;
    texto += `   📞 Tel: ${item.pacienteTelefone}\n`;
    texto += `   🏷️ ${cobranca} | Status Lembrete: ${statusEmoji} ${item.statusEnvio.toUpperCase()}\n\n`;
  });

  texto += `_Gerado automaticamente pelo Sistema de Agendamento Renata Okoti._`;
  return texto;
}
