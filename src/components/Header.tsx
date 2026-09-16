import React from 'react';
import { 
  Calendar, 
  CalendarDays, 
  Users, 
  Plus, 
  Settings
} from 'lucide-react';
import { ConfiguracaoPrecos } from '../types';

export type AbaNavegacao = 'diaria' | 'semanal' | 'mensal' | 'pacientes' | 'configuracoes';

interface HeaderProps {
  abaAtiva: AbaNavegacao;
  onAbaChange: (aba: AbaNavegacao) => void;
  onNovoAgendamento: () => void;
  onResetarDados?: () => void;
  configPrecos?: ConfiguracaoPrecos;
  onAbrirConfigPrecos?: () => void;
  onAbrirModalInstalar?: () => void;
  onAbrirModalBanco?: () => void;
  isBancoZerado?: boolean;
  isInstallable?: boolean;
  isInstalled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  abaAtiva,
  onAbaChange,
  onNovoAgendamento,
}) => {
  return (
    <header id="main-header" className="bg-stone-900 text-white shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 sm:py-3.5 gap-2">
          {/* Logo & Clinical identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-xs font-bold text-sm sm:text-base tracking-wider border border-teal-400/30 shrink-0">
              RO
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                Liberação Miofascial Renata Okoti
              </h1>
              <p className="text-[11px] sm:text-xs text-stone-400 truncate">
                Agenda Clínica & Prontuários
              </p>
            </div>
          </div>

          {/* Action CTAs - Apenas Novo Agendamento para manter a tela limpa */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-novo-agendamento-topo"
              type="button"
              onClick={onNovoAgendamento}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer min-h-[38px]"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar (Desktop / Tablet) */}
        <div className="hidden md:flex items-center space-x-1 overflow-x-auto pt-1 pb-2.5 border-t border-stone-800">
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
            <span>Visão Diária</span>
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

          <button
            type="button"
            onClick={() => onAbaChange('configuracoes')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              abaAtiva === 'configuracoes'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </button>
        </div>
      </div>
    </header>
  );
};
