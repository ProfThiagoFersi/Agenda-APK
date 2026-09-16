import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Coins, 
  Database, 
  Package, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  DollarSign,
  TrendingDown,
  Info,
  Check,
  RotateCcw
} from 'lucide-react';
import { Paciente, Agendamento, ConfiguracaoPrecos } from '../types';
import { 
  calcularValorPorSessaoNoPacote, 
  calcularEconomiaTotalPacote, 
  calcularPorcentagemEconomia,
  CONFIG_PRECOS_PADRAO
} from '../utils/pricingUtils';
import { formatarMoeda } from '../utils/dateUtils';

interface SettingsViewProps {
  configPrecos: ConfiguracaoPrecos;
  onSalvarConfigPrecos: (novaConfig: ConfiguracaoPrecos) => void;
  pacientes: Paciente[];
  agendamentos: Agendamento[];
  onZerarBanco: () => void;
  onCarregarExemplo: () => void;
  onImportarDados: (dados: { pacientes: Paciente[]; agendamentos: Agendamento[]; configPrecos?: ConfiguracaoPrecos }) => void;
  onAbrirModalInstalar: () => void;
  isInstalled: boolean;
  isInstallable: boolean;
  onTriggerInstall: () => Promise<boolean>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  configPrecos,
  onSalvarConfigPrecos,
  pacientes,
  agendamentos,
  onZerarBanco,
  onCarregarExemplo,
  onImportarDados,
  onAbrirModalInstalar,
  isInstalled,
  isInstallable,
  onTriggerInstall
}) => {
  // Estado local para edição de preços
  const [precoAvulso, setPrecoAvulso] = useState<number>(configPrecos.precoAvulso);
  const [precoPacote, setPrecoPacote] = useState<number>(configPrecos.precoPacote);
  const [sessoesPorPacote, setSessoesPorPacote] = useState<number>(configPrecos.sessoesPorPacote);
  const [validadeDiasPacote, setValidadeDiasPacote] = useState<number>(configPrecos.validadeDiasPacote || 90);
  const [salvoFeedback, setSalvoFeedback] = useState(false);

  // Confirmação de zerar banco
  const [confirmarZerar, setConfirmarZerar] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tempConfig: ConfiguracaoPrecos = {
    precoAvulso: precoAvulso > 0 ? precoAvulso : 0,
    precoPacote: precoPacote > 0 ? precoPacote : 0,
    sessoesPorPacote: sessoesPorPacote > 0 ? sessoesPorPacote : 1,
    validadeDiasPacote: validadeDiasPacote > 0 ? validadeDiasPacote : 90,
  };

  const valorPorSessao = calcularValorPorSessaoNoPacote(tempConfig);
  const economiaTotal = calcularEconomiaTotalPacote(tempConfig);
  const porcentagemEconomia = calcularPorcentagemEconomia(tempConfig);

  const handleSalvarValores = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvarConfigPrecos(tempConfig);
    setSalvoFeedback(true);
    setMensagemSucesso('Tabela de valores e pacotes atualizada com sucesso!');
    setTimeout(() => {
      setSalvoFeedback(false);
      setMensagemSucesso(null);
    }, 3000);
  };

  const handleRestaurarValoresPadrao = () => {
    setPrecoAvulso(CONFIG_PRECOS_PADRAO.precoAvulso);
    setPrecoPacote(CONFIG_PRECOS_PADRAO.precoPacote);
    setSessoesPorPacote(CONFIG_PRECOS_PADRAO.sessoesPorPacote);
    setValidadeDiasPacote(CONFIG_PRECOS_PADRAO.validadeDiasPacote || 90);
  };

  const handleExportarBackup = () => {
    const data = {
      exportadoEm: new Date().toISOString(),
      versao: '2.1.0-apk',
      clinica: 'Liberação Miofascial Renata Okoti',
      configPrecos: tempConfig,
      pacientes,
      agendamentos,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_renata_okoti_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setMensagemSucesso('Arquivo de backup baixado com sucesso!');
    setTimeout(() => setMensagemSucesso(null), 3000);
  };

  const handleArquivoSelecionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const conteudo = event.target?.result as string;
        const dados = JSON.parse(conteudo);

        if (dados && Array.isArray(dados.pacientes) && Array.isArray(dados.agendamentos)) {
          onImportarDados({
            pacientes: dados.pacientes,
            agendamentos: dados.agendamentos,
            configPrecos: dados.configPrecos,
          });
          if (dados.configPrecos) {
            setPrecoAvulso(dados.configPrecos.precoAvulso);
            setPrecoPacote(dados.configPrecos.precoPacote);
            setSessoesPorPacote(dados.configPrecos.sessoesPorPacote);
            setValidadeDiasPacote(dados.configPrecos.validadeDiasPacote || 90);
          }
          setMensagemSucesso('Backup restaurado com sucesso!');
          setTimeout(() => setMensagemSucesso(null), 3500);
        } else {
          alert('Arquivo de backup inválido ou incompatível.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo JSON. Verifique se o formato está correto.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const executarZerarBanco = () => {
    onZerarBanco();
    setConfirmarZerar(false);
    setMensagemSucesso('Banco de dados zerado e pronto para atendimentos reais!');
    setTimeout(() => setMensagemSucesso(null), 3500);
  };

  const isBancoZerado = pacientes.length === 0 && agendamentos.length === 0;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Título da Seção */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-900 text-white flex items-center justify-center shadow-xs">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">Configurações do Sistema</h2>
            <p className="text-xs text-stone-500">
              Valores de sessões, gerenciamento do banco de dados e empacotamento do APK Android
            </p>
          </div>
        </div>
      </div>

      {/* Alerta de Feedback de Sucesso */}
      {mensagemSucesso && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* 1. SEÇÃO DE VALORES E PREÇOS */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Tabela de Preços & Pacotes</h3>
              <p className="text-xs text-stone-500">Defina os valores padrão para atendimentos avulsos e pacotes de tratamento</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRestaurarValoresPadrao}
            className="text-stone-500 hover:text-stone-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Restaurar padrão R$ 150 avulso / R$ 500 pacote"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restaurar Padrões</span>
          </button>
        </div>

        <form onSubmit={handleSalvarValores} className="p-4 sm:p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Sessão Avulsa */}
            <div className="bg-stone-50/70 p-3.5 rounded-xl border border-stone-200/80">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Sessão Avulsa (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-semibold">R$</span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={precoAvulso}
                  onChange={(e) => setPrecoAvulso(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-sm font-bold text-stone-900 focus:ring-2 focus:ring-teal-700 focus:outline-hidden"
                  required
                />
              </div>
              <span className="text-[10px] text-stone-400 mt-1 block">Atendimento pontual</span>
            </div>

            {/* Pacote Total */}
            <div className="bg-stone-50/70 p-3.5 rounded-xl border border-stone-200/80">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Valor Total do Pacote (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-semibold">R$</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={precoPacote}
                  onChange={(e) => setPrecoPacote(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-sm font-bold text-teal-900 focus:ring-2 focus:ring-teal-700 focus:outline-hidden"
                  required
                />
              </div>
              <span className="text-[10px] text-stone-400 mt-1 block">Cobrado na contratação</span>
            </div>

            {/* Sessões por Pacote */}
            <div className="bg-stone-50/70 p-3.5 rounded-xl border border-stone-200/80">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Sessões por Pacote
              </label>
              <input
                type="number"
                min="1"
                max="20"
                step="1"
                value={sessoesPorPacote}
                onChange={(e) => setSessoesPorPacote(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm font-bold text-stone-900 focus:ring-2 focus:ring-teal-700 focus:outline-hidden"
                required
              />
              <span className="text-[10px] text-stone-400 mt-1 block">Ex: 4 atendimentos</span>
            </div>

            {/* Validade em Dias */}
            <div className="bg-stone-50/70 p-3.5 rounded-xl border border-stone-200/80">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Validade (Dias)
              </label>
              <input
                type="number"
                min="15"
                max="365"
                step="5"
                value={validadeDiasPacote}
                onChange={(e) => setValidadeDiasPacote(parseInt(e.target.value) || 90)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm font-bold text-stone-900 focus:ring-2 focus:ring-teal-700 focus:outline-hidden"
                required
              />
              <span className="text-[10px] text-stone-400 mt-1 block">Prazo de conclusão</span>
            </div>
          </div>

          {/* Comparativo & Economia */}
          <div className="p-3.5 bg-teal-50/70 rounded-xl border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-teal-950">
              <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
              <span>
                No pacote, cada sessão sai por <strong>{formatarMoeda(valorPorSessao)}</strong>
                {economiaTotal > 0 && (
                  <span className="ml-1 text-emerald-800 font-semibold">
                    (economia de {formatarMoeda(economiaTotal)} ou {porcentagemEconomia.toFixed(1)}% de desconto para o paciente)
                  </span>
                )}
              </span>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-700 hover:bg-teal-600 active:scale-95 text-white rounded-xl font-bold transition-all shadow-xs shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {salvoFeedback ? <Check className="w-4 h-4" /> : null}
              <span>{salvoFeedback ? 'Valores Salvos!' : 'Salvar Tabela de Valores'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* 2. SEÇÃO DE BANCO DE DADOS */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Banco de Dados & Armazenamento</h3>
              <p className="text-xs text-stone-500">
                {pacientes.length} paciente(s) e {agendamentos.length} sessão(ões) salvas com segurança no aparelho
              </p>
            </div>
          </div>
          {isBancoZerado ? (
            <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
              Banco Limpo (Zerado)
            </span>
          ) : (
            <span className="text-[11px] font-semibold bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full border border-stone-200">
              Com Dados Ativos
            </span>
          )}
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Backup */}
            <button
              type="button"
              onClick={handleExportarBackup}
              className="p-3.5 rounded-xl border border-stone-200 hover:border-teal-300 hover:bg-teal-50/40 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 mb-1.5 text-stone-900 font-bold text-xs group-hover:text-teal-900">
                <Download className="w-4 h-4 text-teal-700" />
                <span>Exportar Backup (JSON)</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Baixa uma cópia de segurança de todos os pacientes e prontuários no seu dispositivo.
              </p>
            </button>

            {/* Restaurar Backup */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 rounded-xl border border-stone-200 hover:border-teal-300 hover:bg-teal-50/40 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 mb-1.5 text-stone-900 font-bold text-xs group-hover:text-teal-900">
                <Upload className="w-4 h-4 text-teal-700" />
                <span>Restaurar Backup</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Importa um arquivo de backup previamente salvo para recuperar todos os registros.
              </p>
            </button>

            {/* Carregar Exemplo */}
            <button
              type="button"
              onClick={() => {
                if (confirm('Deseja carregar a base de demonstração? Isso substituirá os registros atuais.')) {
                  onCarregarExemplo();
                  setMensagemSucesso('Dados de demonstração carregados com sucesso!');
                  setTimeout(() => setMensagemSucesso(null), 3000);
                }
              }}
              className="p-3.5 rounded-xl border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 mb-1.5 text-stone-900 font-bold text-xs">
                <RefreshCw className="w-4 h-4 text-stone-500" />
                <span>Dados de Demonstração</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Restaura dados fictícios de exemplo com pacientes e sessões para testes.
              </p>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleArquivoSelecionado}
            accept=".json,application/json"
            className="hidden"
          />

          {/* Zerar Banco de Dados */}
          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h4 className="font-bold text-rose-950 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-700 shrink-0" />
                <span>Zerar Banco de Dados (Pronto para Início Real)</span>
              </h4>
              <p className="text-rose-800 text-[11px] mt-0.5">
                Apaga todos os agendamentos e pacientes para que você inicie a agenda clínica do zero.
              </p>
            </div>

            {confirmarZerar ? (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={executarZerarBanco}
                  className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold text-xs cursor-pointer transition-colors shadow-xs"
                >
                  Sim, Zerar Tudo
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmarZerar(false)}
                  className="px-3 py-1.5 bg-white border border-rose-300 text-rose-900 rounded-lg font-semibold text-xs cursor-pointer hover:bg-rose-100 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmarZerar(true)}
                className="px-3.5 py-1.5 bg-white hover:bg-rose-100 border border-rose-300 text-rose-800 rounded-xl font-bold transition-colors cursor-pointer shrink-0 text-center"
              >
                Zerar Banco Agora
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. SEÇÃO DE EMPACOTAMENTO E APK ANDROID */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Aplicativo Android & Empacotamento (.APK)</h3>
              <p className="text-xs text-stone-500">Opções para instalar no celular ou gerar o arquivo .APK compilado</p>
            </div>
          </div>
          {isInstalled ? (
            <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
              App Instalado no Aparelho
            </span>
          ) : (
            <span className="text-[11px] font-semibold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-300">
              Pronto para Instalação
            </span>
          )}
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Opção 1: Central de Empacotamento */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-teal-700" />
                <h4 className="font-bold text-stone-900 text-xs">Central de Empacotamento .APK</h4>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Acesse o assistente com links do PWABuilder, comandos do Google Bubblewrap e projeto nativo Capacitor já pronto em <code>/android</code>.
              </p>
              <button
                type="button"
                onClick={onAbrirModalInstalar}
                className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Abrir Central de Empacotamento</span>
              </button>
            </div>

            {/* Opção 2: Instalação Direta WebAPK */}
            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 space-y-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <h4 className="font-bold text-teal-950 text-xs">Instalação Direta no Celular (WebAPK)</h4>
              </div>
              <p className="text-[11px] text-teal-900 leading-relaxed">
                Instale o aplicativo oficial diretamente no smartphone com ícone nativo, funcionamento sem internet e suporte a tela cheia.
              </p>
              {isInstallable ? (
                <button
                  type="button"
                  onClick={onTriggerInstall}
                  className="w-full py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Instalar no Android Agora</span>
                </button>
              ) : isInstalled ? (
                <div className="py-2 text-center text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                  Aplicativo já instalado neste dispositivo
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onAbrirModalInstalar}
                  className="w-full py-2 bg-teal-800 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Ver Instruções de Instalação</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. INFORMAÇÕES DO SISTEMA */}
      <div className="text-center text-xs text-stone-400 pt-2 space-y-1">
        <p className="font-semibold text-stone-500">
          Renata Okoti • Liberação Miofascial e Terapias Manuais
        </p>
        <p className="text-[11px]">
          Versão 2.1.0 (APK & PWA Autônomo) • Armazenamento Local Seguro Offline-first
        </p>
      </div>
    </div>
  );
};
