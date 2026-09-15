import React, { useState, useEffect } from 'react';
import { ConfiguracaoPrecos } from '../types';
import {
  CONFIG_PRECOS_PADRAO,
  calcularValorPorSessaoNoPacote,
  calcularEconomiaTotalPacote,
  calcularPorcentagemEconomia,
} from '../utils/pricingUtils';
import { formatarMoeda } from '../utils/dateUtils';
import {
  X,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  TrendingDown,
  Check,
  RotateCcw,
  Info,
  ShieldCheck,
  Coins
} from 'lucide-react';

interface PricingConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  configAtual: ConfiguracaoPrecos;
  onSalvar: (novaConfig: ConfiguracaoPrecos) => void;
}

export const PricingConfigModal: React.FC<PricingConfigModalProps> = ({
  isOpen,
  onClose,
  configAtual,
  onSalvar,
}) => {
  const [precoAvulso, setPrecoAvulso] = useState<number>(configAtual.precoAvulso);
  const [precoPacote, setPrecoPacote] = useState<number>(configAtual.precoPacote);
  const [sessoesPorPacote, setSessoesPorPacote] = useState<number>(configAtual.sessoesPorPacote);
  const [sucesso, setSucesso] = useState(false);

  // Sincronizar quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setPrecoAvulso(configAtual.precoAvulso);
      setPrecoPacote(configAtual.precoPacote);
      setSessoesPorPacote(configAtual.sessoesPorPacote);
      setSucesso(false);
    }
  }, [isOpen, configAtual]);

  if (!isOpen) return null;

  const tempConfig: ConfiguracaoPrecos = {
    precoAvulso: precoAvulso > 0 ? precoAvulso : 0,
    precoPacote: precoPacote > 0 ? precoPacote : 0,
    sessoesPorPacote: sessoesPorPacote > 0 ? sessoesPorPacote : 1,
  };

  const valorPorSessaoNoPacote = calcularValorPorSessaoNoPacote(tempConfig);
  const economiaTotal = calcularEconomiaTotalPacote(tempConfig);
  const pctEconomia = calcularPorcentagemEconomia(tempConfig);

  const handleRestaurarPadrao = () => {
    setPrecoAvulso(CONFIG_PRECOS_PADRAO.precoAvulso);
    setPrecoPacote(CONFIG_PRECOS_PADRAO.precoPacote);
    setSessoesPorPacote(CONFIG_PRECOS_PADRAO.sessoesPorPacote);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (precoAvulso <= 0 || precoPacote <= 0 || sessoesPorPacote <= 0) {
      alert('Por favor, informe valores válidos maiores que zero.');
      return;
    }

    onSalvar({
      precoAvulso,
      precoPacote,
      sessoesPorPacote,
    });

    setSucesso(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div
      id="pricing-config-modal-backdrop"
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        id="pricing-config-modal"
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Cabeçalho do Modal */}
        <div className="bg-stone-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/90 text-white flex items-center justify-center shadow-xs border border-teal-400/40">
              <Coins className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Tabela de Valores & Pacotes
              </h2>
              <p className="text-xs text-stone-300">
                Configure os preços padrão para Renata Okoti
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário de Configuração */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {/* Card 1: Valor da Sessão Avulsa */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="input-preco-avulso"
                className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Valor da Sessão Avulsa (R$)
              </label>
              <span className="text-[11px] text-stone-500 font-medium">
                Atendimento único
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-stone-500 font-bold text-sm">
                R$
              </span>
              <input
                id="input-preco-avulso"
                type="number"
                min="1"
                step="5"
                value={precoAvulso}
                onChange={(e) => setPrecoAvulso(Number(e.target.value))}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-base font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-stone-50"
                placeholder="150"
              />
            </div>
            <p className="text-[11px] text-stone-500">
              Aplicado a pacientes sem pacote ativo ou em atendimentos avulsos isolados.
            </p>
          </div>

          {/* Card 2: Valor do Pacote & Quantidade de Sessões */}
          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-teal-700" />
              <h3 className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                Estrutura do Pacote Terapêutico
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Quantidade de Sessões */}
              <div className="space-y-1.5">
                <label
                  htmlFor="input-qtd-sessoes"
                  className="text-xs font-bold text-teal-950 block"
                >
                  Qtd. de Sessões no Pacote
                </label>
                <div className="relative">
                  <input
                    id="input-qtd-sessoes"
                    type="number"
                    min="1"
                    max="50"
                    step="1"
                    value={sessoesPorPacote}
                    onChange={(e) => setSessoesPorPacote(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-teal-300 rounded-xl text-base font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                    placeholder="4"
                  />
                </div>

                {/* Botões de Atalho Rápidos */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[3, 4, 5, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSessoesPorPacote(num)}
                      className={`px-2 py-1 text-xs rounded-lg font-bold border transition-colors ${
                        sessoesPorPacote === num
                          ? 'bg-teal-700 text-white border-teal-700'
                          : 'bg-white text-teal-900 border-teal-200 hover:bg-teal-100/60'
                      }`}
                    >
                      {num}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor Total do Pacote */}
              <div className="space-y-1.5">
                <label
                  htmlFor="input-preco-pacote"
                  className="text-xs font-bold text-teal-950 block"
                >
                  Valor Total do Pacote (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-stone-500 font-bold text-sm">
                    R$
                  </span>
                  <input
                    id="input-preco-pacote"
                    type="number"
                    min="1"
                    step="10"
                    value={precoPacote}
                    onChange={(e) => setPrecoPacote(Number(e.target.value))}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-teal-300 rounded-xl text-base font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                    placeholder="500"
                  />
                </div>
                <span className="text-[11px] text-teal-800 font-medium block">
                  Cobrado no início do ciclo
                </span>
              </div>
            </div>

            {/* Simulação em Tempo Real do Pacote */}
            <div className="bg-white rounded-xl p-3 border border-teal-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span>Custo individual por sessão no pacote:</span>
                <span className="font-bold text-teal-800 text-sm">
                  {formatarMoeda(valorPorSessaoNoPacote)} / atendimento
                </span>
              </div>

              <div className="flex items-center justify-between text-stone-600 pt-1 border-t border-stone-100">
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                  Economia para o paciente:
                </span>
                <span className="font-bold text-emerald-700">
                  {formatarMoeda(economiaTotal)} ({pctEconomia.toFixed(1)}% OFF)
                </span>
              </div>
            </div>
          </div>

          {/* Dica Informativa */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5 text-xs text-stone-600">
            <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <span>
              As alterações serão salvas localmente no navegador (<strong>localStorage</strong>) e utilizadas como valor padrão para novos atendimentos, renovações e métricas financeiras.
            </span>
          </div>

          {/* Ações do Rodapé */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={handleRestaurarPadrao}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão (R$ 150 / R$ 500 / 4x)</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all"
              >
                {sucesso ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>Salvo!</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Salvar Configuração</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
