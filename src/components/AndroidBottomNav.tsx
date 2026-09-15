import React from 'react';
import { Calendar, CalendarDays, CalendarRange, Users, Smartphone, Database } from 'lucide-react';
import { AbaNavegacao } from './Header';

interface AndroidBottomNavProps {
  abaAtiva: AbaNavegacao;
  onAbaChange: (aba: AbaNavegacao) => void;
  onAbrirModalInstalar: () => void;
  onAbrirModalBanco: () => void;
  isInstallable: boolean;
  totalPacientes: number;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  abaAtiva,
  onAbaChange,
  onAbrirModalInstalar,
  onAbrirModalBanco,
  isInstallable,
  totalPacientes,
}) => {
  return (
    <nav 
      id="android-bottom-navigation" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900 border-t border-stone-800 text-stone-400 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-md"
    >
      <div className="grid grid-cols-5 gap-1 items-center">
        {/* Diária */}
        <button
          type="button"
          onClick={() => onAbaChange('diaria')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] ${
            abaAtiva === 'diaria'
              ? 'text-teal-300 bg-stone-800/80 font-bold scale-102'
              : 'hover:text-stone-200'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Diária</span>
        </button>

        {/* Semanal */}
        <button
          type="button"
          onClick={() => onAbaChange('semanal')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] ${
            abaAtiva === 'semanal'
              ? 'text-teal-300 bg-stone-800/80 font-bold scale-102'
              : 'hover:text-stone-200'
          }`}
        >
          <CalendarDays className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Semanal</span>
        </button>

        {/* Mensal */}
        <button
          type="button"
          onClick={() => onAbaChange('mensal')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] ${
            abaAtiva === 'mensal'
              ? 'text-teal-300 bg-stone-800/80 font-bold scale-102'
              : 'hover:text-stone-200'
          }`}
        >
          <CalendarRange className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Mensal</span>
        </button>

        {/* Pacientes */}
        <button
          type="button"
          onClick={() => onAbaChange('pacientes')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] relative ${
            abaAtiva === 'pacientes'
              ? 'text-teal-300 bg-stone-800/80 font-bold scale-102'
              : 'hover:text-stone-200'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Pacientes</span>
          {totalPacientes > 0 && (
            <span className="absolute top-1 right-2.5 w-2 h-2 bg-teal-400 rounded-full"></span>
          )}
        </button>

        {/* APK Android / Banco */}
        <button
          type="button"
          onClick={onAbrirModalInstalar}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] text-amber-400 hover:text-amber-300"
        >
          <Smartphone className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-semibold">APK</span>
        </button>
      </div>
    </nav>
  );
};
