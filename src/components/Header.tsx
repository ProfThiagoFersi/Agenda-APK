import React from 'react';
import { 
  Calendar, 
  CalendarDays, 
  Users, 
  Plus, 
  RefreshCw, 
  Sparkles, 
  Coins, 
  Settings2,
  Smartphone,
  Database,
  CheckCircle2,
  Package
} from 'lucide-react';
import { ConfiguracaoPrecos } from '../types';

export type AbaNavegacao = 'diaria' | 'semanal' | 'mensal' | 'pacientes';

interface HeaderProps {
  abaAtiva: AbaNavegacao;
  onAbaChange: (aba: AbaNavegacao) => void;
  onNovoAgendamento: () => void;
  onResetarDados: () => void;
  configPrecos: ConfiguracaoPrecos;
  onAbrirConfigPrecos: () => void;
  onAbrirModalInstalar: () => void;
  onAbrirModalBanco: () => void;
  isBancoZerado: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  abaAtiva,
  onAbaChange,
  onNovoAgendamento,
  onResetarDados,
  configPrecos,
  onAbrirConfigPrecos,
  onAbrirModalInstalar,
  onAbrirModalBanco,
  isBancoZerado,
  isInstallable,
  isInstalled,
}) => {
  return (
    <header id="main-header" className="bg-stone-900 text-white shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 sm:py-4 gap-2">
          {/* Logo & Clinical identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-xs font-bold text-sm sm:text-base tracking-wider border border-teal-400/30 shrink-0">
              RO
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white truncate">
                  Liberação Miofascial Renata Okoti
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] bg-emerald-950/90 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-600/50">
                  <Smartphone className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  APK Android
                </span>
                {isBancoZerado && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-stone-800 text-stone-300 font-medium px-2 py-0.5 rounded-full border border-stone-700">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    Banco Zerado
                  </span>
                )}
              </div>
              {/* Badge de Preços Clicável */}
              <button
                type="button"
                onClick={onAbrirConfigPrecos}
                title="Clique para definir valores de sessão avulsa e pacotes"
                className="flex items-center gap-1.5 sm:gap-2 mt-0.5 text-[11px] sm:text-xs text-stone-300 flex-wrap hover:opacity-90 transition-opacity cursor-pointer group text-left"
              >
                <span className="bg-stone-800 text-stone-300 group-hover:bg-stone-700 px-1.5 sm:px-2 py-0.5 rounded font-medium text-[10px] sm:text-xs border border-stone-700/80 transition-colors">
                  Avulso: <strong className="text-white">R$ {configPrecos.precoAvulso}</strong>
                </span>
                <span className="bg-teal-950/90 text-teal-300 group-hover:bg-teal-900 border border-teal-700/60 px-1.5 sm:px-2 py-0.5 rounded font-medium text-[10px] sm:text-xs transition-colors">
                  Pacote {configPrecos.sessoesPorPacote}x: <strong className="text-white">R$ {configPrecos.precoPacote}</strong>
                </span>
                <span className="text-[10px] text-teal-400 underline decoration-dotted hidden sm:inline">
                  Editar
                </span>
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Botão APK Android */}
            <button
              id="btn-instalar-apk"
              type="button"
              onClick={onAbrirModalInstalar}
              title="Empacotar ou baixar arquivo .APK autônomo para Android"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-600 hover:to-teal-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all min-h-[38px] border border-teal-500/40 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Empacotar .APK</span>
              <span className="sm:hidden">.APK</span>
            </button>

            {/* Botão Banco de Dados (Zerado / Backup) */}
            <button
              id="btn-gerenciar-banco"
              type="button"
              onClick={onAbrirModalBanco}
              title="Gerenciar Banco de Dados (Backup, Zerar ou Restaurar)"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 hover:text-white rounded-xl text-xs font-semibold border border-stone-700 transition-all min-h-[38px]"
            >
              <Database className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="hidden lg:inline">Banco de Dados</span>
              <span className="lg:hidden hidden sm:inline">Banco</span>
            </button>

            {/* Botão de Definir Valor de Sessão Avulsa e Pacote */}
            <button
              id="btn-definir-valores-precos"
              type="button"
              onClick={onAbrirConfigPrecos}
              title="Definir valor da sessão avulsa e valor de pacote com quantidade de sessões"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 hover:text-white rounded-xl text-xs font-semibold border border-stone-700 transition-all min-h-[38px]"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden md:inline">Valores</span>
            </button>

            <button
              type="button"
              onClick={onNovoAgendamento}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer min-h-[38px]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Agendamento</span>
              <span className="sm:hidden">Agendar</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar (Desktop / Tablet) */}
        <div className="hidden md:flex items-center space-x-1 overflow-x-auto pt-1 pb-3 border-t border-stone-800">
          <button
            type="button"
            onClick={() => onAbaChange('diaria')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              abaAtiva === 'diaria'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Visão Diária (Timeline)</span>
          </button>

          <button
            type="button"
            onClick={() => onAbaChange('semanal')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              abaAtiva === 'semanal'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Visão Semanal</span>
          </button>

          <button
            type="button"
            onClick={() => onAbaChange('mensal')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              abaAtiva === 'mensal'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Visão Mensal</span>
          </button>

          <button
            type="button"
            onClick={() => onAbaChange('pacientes')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              abaAtiva === 'pacientes'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pacientes & Prontuários</span>
          </button>
        </div>
      </div>
    </header>
  );
};
