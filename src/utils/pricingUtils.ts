import { ConfiguracaoPrecos } from '../types';

export const CONFIG_PRECOS_PADRAO: ConfiguracaoPrecos = {
  precoAvulso: 150,
  precoPacote: 500,
  sessoesPorPacote: 4,
  validadeDiasPacote: 90,
};

export const STORAGE_KEY_PRECOS = 'agenda_miofascial_config_precos_v1';

/**
 * Carrega a configuração de preços do localStorage com fallback seguro
 */
export function carregarConfiguracaoPrecos(): ConfiguracaoPrecos {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRECOS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        precoAvulso: Number(parsed.precoAvulso) > 0 ? Number(parsed.precoAvulso) : CONFIG_PRECOS_PADRAO.precoAvulso,
        precoPacote: Number(parsed.precoPacote) > 0 ? Number(parsed.precoPacote) : CONFIG_PRECOS_PADRAO.precoPacote,
        sessoesPorPacote: Number(parsed.sessoesPorPacote) > 0 ? Number(parsed.sessoesPorPacote) : CONFIG_PRECOS_PADRAO.sessoesPorPacote,
        validadeDiasPacote: Number(parsed.validadeDiasPacote) > 0 ? Number(parsed.validadeDiasPacote) : (CONFIG_PRECOS_PADRAO.validadeDiasPacote || 90),
      };
    }
  } catch (e) {
    console.error('Erro ao ler configuração de preços do localStorage:', e);
  }
  return CONFIG_PRECOS_PADRAO;
}

/**
 * Salva a configuração de preços no localStorage
 */
export function salvarConfiguracaoPrecos(config: ConfiguracaoPrecos): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRECOS, JSON.stringify(config));
  } catch (e) {
    console.error('Erro ao salvar configuração de preços no localStorage:', e);
  }
}

/**
 * Calcula o custo unitário por sessão dentro de um pacote
 */
export function calcularValorPorSessaoNoPacote(config: ConfiguracaoPrecos): number {
  if (!config.sessoesPorPacote || config.sessoesPorPacote <= 0) return 0;
  return config.precoPacote / config.sessoesPorPacote;
}

/**
 * Calcula a economia em reais que o paciente obtém ao adquirir o pacote comparado ao avulso
 */
export function calcularEconomiaTotalPacote(config: ConfiguracaoPrecos): number {
  const custoAvulsoTotal = config.precoAvulso * config.sessoesPorPacote;
  return Math.max(0, custoAvulsoTotal - config.precoPacote);
}

/**
 * Calcula a porcentagem de economia do pacote
 */
export function calcularPorcentagemEconomia(config: ConfiguracaoPrecos): number {
  const custoAvulsoTotal = config.precoAvulso * config.sessoesPorPacote;
  if (custoAvulsoTotal <= 0) return 0;
  const economia = calcularEconomiaTotalPacote(config);
  return (economia / custoAvulsoTotal) * 100;
}
