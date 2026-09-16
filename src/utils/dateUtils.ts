export function formatarDataExtenso(dataStr: string): string {
  try {
    const [ano, mes, dia] = dataStr.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dataStr;
  }
}

export function formatarDataCurta(dataStr: string): string {
  try {
    const [ano, mes, dia] = dataStr.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  } catch {
    return dataStr;
  }
}

export function formatarDiaSemanaCurto(dataStr: string): string {
  try {
    const [ano, mes, dia] = dataStr.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    return data.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', '');
  } catch {
    return '';
  }
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

export function calcularHorarioFim(horarioInicio: string, duracaoMinutos: number): string {
  const [h, m] = horarioInicio.split(':').map(Number);
  const totalMin = h * 60 + m + duracaoMinutos;
  const fimH = Math.floor(totalMin / 60) % 24;
  const fimM = totalMin % 60;
  return `${String(fimH).padStart(2, '0')}:${String(fimM).padStart(2, '0')}`;
}

export function obterHojeString(): string {
  // Retorna a data atual do sistema Android / dispositivo
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function somarDias(dataStr: string, dias: number): string {
  const [ano, mes, dia] = dataStr.split('-').map(Number);
  const d = new Date(ano, mes - 1, dia);
  d.setDate(d.getDate() + dias);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function gerarMensagemWhatsApp(
  pacienteNome: string,
  dataStr: string,
  horarioStr: string,
  tipoTerapiaNome: string
): string {
  const dataFormatada = formatarDataExtenso(dataStr);
  const texto = `Olá ${pacienteNome}! Tudo bem? 🌿\n\nConfirmando o seu agendamento de *Terapia Miofascial*:\n🗓 *Data:* ${dataFormatada}\n⏰ *Horário:* ${horarioStr}\n🎯 *Foco:* ${tipoTerapiaNome}\n\n📍 *Recomendações:* Venha com roupas leves e confortáveis (bermuda, regata ou top de academia) e lembre-se de manter uma boa hidratação antes da sessão.\n\nPor favor, responda confirmando sua presença! Caso precise remarcar, avise com antecedência.`;
  return encodeURIComponent(texto);
}
