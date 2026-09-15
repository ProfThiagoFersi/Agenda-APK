import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  X, 
  Share2, 
  ShieldCheck, 
  ExternalLink, 
  Zap, 
  Sparkles,
  Info
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-stone-200 text-stone-900 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white shadow-md shrink-0 border border-teal-400/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-stone-900">Aplicativo Android (APK)</h3>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                Pronto para Instalar
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Liberação Miofascial Renata Okoti no seu smartphone
            </p>
          </div>
        </div>

        {installSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-stone-900">Instalação iniciada!</h4>
            <p className="text-xs text-stone-600 max-w-xs mx-auto">
              O ícone da Renata Okoti foi adicionado à tela inicial e gaveta de aplicativos do seu Android.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Status card */}
            <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-start gap-3 text-xs text-teal-950">
              <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-teal-900">WebAPK Oficial do Android Habilitado</p>
                <p className="text-teal-800 mt-0.5 leading-relaxed">
                  O Android compila e instala um aplicativo nativo completo (WebAPK) que funciona sem internet, em tela cheia e com inicialização rápida.
                </p>
              </div>
            </div>

            {/* Direct install CTA if prompt is ready */}
            {isInstallable ? (
              <div className="text-center py-2 space-y-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-teal-700 hover:bg-teal-600 active:scale-98 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer min-h-[46px]"
                >
                  <Download className="w-5 h-5" />
                  <span>Instalar APK no Android Agora</span>
                </button>
                <p className="text-[11px] text-stone-500">
                  Instalação com 1 clique direto no seu smartphone
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
              /* Manual instructions for Android & Mobile browsers */
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Como instalar no Android (Passo a Passo):
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="text-stone-700">
                      No navegador do celular (ex: <strong>Google Chrome</strong> ou <strong>Samsung Internet</strong>), toque no menu de <strong>três pontinhos (⋮)</strong> no canto superior direito.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="text-stone-700">
                      Selecione a opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="text-stone-700">
                      Confirme em <strong>"Instalar"</strong>. O Android gerará o APK nativo e colocará o ícone na sua gaveta de apps e tela de início.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Features summary of the Android APK version */}
            <div className="pt-3 border-t border-stone-200">
              <h4 className="text-xs font-bold text-stone-800 mb-2">Vantagens do APK no Android:</h4>
              <ul className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                <li className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span>Acesso direto da tela inicial</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span>Funciona 100% offline</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span>Tela cheia sem barra de link</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span>Banco de dados local rápido</span>
                </li>
              </ul>
            </div>

            {/* Note about APK packaging */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-600 leading-relaxed">
              <strong className="text-stone-800 block mb-0.5">Deseja empacotar como arquivo .APK autônomo?</strong>
              Este sistema possui manifesto PWA padrão W3C e service worker. Você pode usar a ferramenta oficial do Google <em>Bubblewrap CLI</em> ou o <em>PWABuilder.com</em> para compilar um arquivo <code>.apk</code> ou <code>.aab</code> assinado para distribuição direta ou Google Play Store.
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
