import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  ExternalLink, 
  Zap, 
  Sparkles,
  Copy,
  Check,
  Package,
  Layers,
  Terminal,
  FolderArchive
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstalled?: boolean;
  isInstallable?: boolean;
  onTriggerInstall?: () => Promise<boolean>;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ 
  isOpen, 
  onClose,
  isInstalled: propIsInstalled,
  isInstallable: propIsInstallable,
  onTriggerInstall
}) => {
  const pwa = usePWAInstall();
  const isInstalled = propIsInstalled ?? pwa.isInstalled;
  const isInstallable = propIsInstallable ?? pwa.isInstallable;
  const triggerInstall = onTriggerInstall ?? pwa.install;

  const [abaAtiva, setAbaAtiva] = useState<'apk_autonomo' | 'instalacao_celular'>('apk_autonomo');
  const [copiadoPWABuilder, setCopiadoPWABuilder] = useState(false);
  const [copiadoComando, setCopiadoComando] = useState(false);
  const [copiadoCapacitor, setCopiadoCapacitor] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  // URL pública de produção da aplicação
  const appPublicUrl = window.location.origin;
  const pwabuilderUrl = `https://www.pwabuilder.com/?url=${encodeURIComponent(appPublicUrl)}`;

  const handleInstallClick = async () => {
    const success = await triggerInstall();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    }
  };

  const copiarTexto = (texto: string, tipo: 'url' | 'cmd' | 'cap') => {
    navigator.clipboard.writeText(texto);
    if (tipo === 'url') {
      setCopiadoPWABuilder(true);
      setTimeout(() => setCopiadoPWABuilder(false), 2000);
    } else if (tipo === 'cmd') {
      setCopiadoComando(true);
      setTimeout(() => setCopiadoComando(false), 2000);
    } else {
      setCopiadoCapacitor(true);
      setTimeout(() => setCopiadoCapacitor(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-stone-200 text-stone-900 relative my-6 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white shadow-md shrink-0 border border-teal-400/30">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-stone-900">Empacotar Arquivo .APK Autônomo</h3>
              <span className="text-[11px] font-semibold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-300">
                Android APK
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Gere seu arquivo .APK independente ou instale diretamente no smartphone
            </p>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex gap-2 pt-3 border-b border-stone-100 shrink-0">
          <button
            type="button"
            onClick={() => setAbaAtiva('apk_autonomo')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              abaAtiva === 'apk_autonomo'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>1. Baixar Arquivo .APK (Autônomo)</span>
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('instalacao_celular')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              abaAtiva === 'instalacao_celular'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>2. Instalar no Celular (WebAPK)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-4 overflow-y-auto space-y-4 pr-1 text-xs">
          {abaAtiva === 'apk_autonomo' ? (
            <div className="space-y-4">
              {/* Opção 1: PWABuilder (Recomendado - 1 Clique) */}
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-stone-800 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      ★
                    </span>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">Opção 1: Gerar .APK com 1 Clique (PWABuilder)</h4>
                      <p className="text-[11px] text-teal-800">
                        Ferramenta oficial recomendada pelo Google para compilar arquivos .APK e .AAB online.
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 shrink-0">
                    Mais Fácil
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-teal-100 text-[11px] text-stone-600 space-y-1.5">
                  <p className="font-medium text-stone-800">Como funciona em 3 passos:</p>
                  <ol className="list-decimal list-inside space-y-1 text-stone-600">
                    <li>Clique no botão abaixo para abrir o <strong>PWABuilder</strong> já com este app pré-carregado.</li>
                    <li>Clique em <strong>"Package for Stores"</strong> e escolha <strong>"Android"</strong>.</li>
                    <li>Baixe seu arquivo <strong>.APK</strong> para instalar no celular ou <strong>.AAB</strong> para a Google Play.</li>
                  </ol>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    href={pwabuilderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-600 active:scale-98 text-white rounded-xl font-bold shadow-sm transition-all text-center cursor-pointer min-h-[42px]"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir no PWABuilder & Baixar .APK</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => copiarTexto(appPublicUrl, 'url')}
                    className="px-3 py-2.5 bg-white hover:bg-stone-50 border border-teal-200 text-stone-700 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiadoPWABuilder ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-500" />}
                    <span>{copiadoPWABuilder ? 'URL Copiada!' : 'Copiar URL do App'}</span>
                  </button>
                </div>
              </div>

              {/* Opção 2: Projeto Nativo Capacitor / Android Studio */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-stone-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    2
                  </span>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">Opção 2: Compilar via Android Studio (Capacitor)</h4>
                    <p className="text-[11px] text-stone-500">
                      O projeto nativo Android completo já foi gerado na pasta <code>/android</code> deste repositório!
                    </p>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-stone-200 text-[11px] text-stone-700 space-y-1.5">
                  <p className="font-semibold text-stone-800">Passo a passo no Android Studio:</p>
                  <ol className="list-decimal list-inside space-y-1 text-stone-600">
                    <li>Exporte o projeto (via menu do AI Studio <strong>Export to ZIP</strong> ou GitHub).</li>
                    <li>Abra a pasta do projeto no seu terminal e execute:</li>
                  </ol>
                  <div className="bg-stone-900 text-stone-100 p-2.5 rounded-lg font-mono text-[11px] flex items-center justify-between gap-2 mt-1">
                    <span>npm run build:android && npx cap open android</span>
                    <button
                      type="button"
                      onClick={() => copiarTexto('npm run build:android && npx cap open android', 'cap')}
                      className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-white cursor-pointer"
                      title="Copiar comando"
                    >
                      {copiadoCapacitor ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">
                    No Android Studio, clique em <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> para gerar o arquivo .apk autônomo.
                  </p>
                </div>
              </div>

              {/* Opção 3: Bubblewrap CLI do Google */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-stone-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    3
                  </span>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">Opção 3: Linha de Comando (Bubblewrap Google CLI)</h4>
                    <p className="text-[11px] text-stone-500">
                      Gera o APK oficial Trusted Web Activity (TWA) direto pelo terminal.
                    </p>
                  </div>
                </div>

                <div className="bg-stone-900 text-stone-100 p-3 rounded-lg font-mono text-[11px] flex items-center justify-between gap-2">
                  <div className="overflow-x-auto whitespace-nowrap">
                    npx @bubblewrap/cli init --manifest={appPublicUrl}/manifest.webmanifest
                  </div>
                  <button
                    type="button"
                    onClick={() => copiarTexto(`npx @bubblewrap/cli init --manifest=${appPublicUrl}/manifest.webmanifest\nnpx @bubblewrap/cli build`, 'cmd')}
                    className="p-1.5 hover:bg-stone-800 rounded text-stone-400 hover:text-white cursor-pointer shrink-0"
                    title="Copiar comandos"
                  >
                    {copiadoComando ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {installSuccess ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-stone-900">Instalação iniciada!</h4>
                  <p className="text-xs text-stone-600 max-w-xs mx-auto">
                    O ícone da Renata Okoti foi adicionado à tela inicial e gaveta de aplicativos do seu Android.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-start gap-3 text-xs text-teal-950">
                    <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-teal-900">WebAPK Oficial do Android Habilitado</p>
                      <p className="text-teal-800 mt-0.5 leading-relaxed">
                        O próprio Android compila e instala um aplicativo nativo completo (WebAPK) que funciona sem internet, em tela cheia e com inicialização rápida.
                      </p>
                    </div>
                  </div>

                  {isInstallable ? (
                    <div className="text-center py-2 space-y-2">
                      <button
                        type="button"
                        onClick={handleInstallClick}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-teal-700 hover:bg-teal-600 active:scale-98 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer min-h-[46px]"
                      >
                        <Download className="w-5 h-5" />
                        <span>Instalar no Android Agora</span>
                      </button>
                      <p className="text-[11px] text-stone-500">
                        Instalação em 1 clique direto no seu smartphone
                      </p>
                    </div>
                  ) : isInstalled ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                      <p className="text-sm font-bold text-emerald-900">Aplicativo já instalado!</p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Você já está executando a versão de aplicativo no seu dispositivo.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                        Como instalar manualmente pelo navegador do celular:
                      </h4>

                      <div className="flex items-start gap-3 p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                        <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                          1
                        </span>
                        <p className="text-stone-700">
                          Abra este endereço no <strong>Google Chrome</strong> ou <strong>Samsung Internet</strong> do seu celular.
                        </p>
                      </div>

                      <div className="flex items-start gap-3 p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                        <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                          2
                        </span>
                        <p className="text-stone-700">
                          Toque no menu de <strong>três pontinhos (⋮)</strong> no canto superior direito.
                        </p>
                      </div>

                      <div className="flex items-start gap-3 p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                        <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                          3
                        </span>
                        <p className="text-stone-700">
                          Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Features summary of the Android APK */}
          <div className="pt-2 border-t border-stone-200">
            <h4 className="text-[11px] font-bold text-stone-800 mb-1.5">Recursos inclusos no APK:</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span>Banco de dados zerado e limpo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span>Funciona 100% offline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span>Ícone oficial na tela inicial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span>Navegação inferior nativa Android</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-stone-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
