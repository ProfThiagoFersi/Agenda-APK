import React from 'react';
import { TipoTerapia, StatusAgendamento, FiltrosAgenda } from '../types';
import { TIPOS_TERAPIA_CONFIG, STATUS_CONFIG } from '../data/therapyData';
import { Search, Filter, X } from 'lucide-react';

interface AppointmentFiltersProps {
  filtros: FiltrosAgenda;
  onChange: (novosFiltros: FiltrosAgenda) => void;
  onLimpar: () => void;
}

export const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  filtros,
  onChange,
  onLimpar,
}) => {
  const temFiltroAtivo =
    (filtros.status && filtros.status !== 'todos') ||
    (filtros.tipoTerapia && filtros.tipoTerapia !== 'todos') ||
    (filtros.buscaPaciente && filtros.buscaPaciente.trim() !== '');

  return (
    <div id="appointment-filters-card" className="bg-white rounded-xl sm:rounded-2xl border border-stone-200 p-2.5 sm:p-3.5 shadow-xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 sm:top-2.5" />
          <input
            type="text"
            value={filtros.buscaPaciente || ''}
            onChange={(e) => onChange({ ...filtros, buscaPaciente: e.target.value })}
            placeholder="Buscar por paciente, queixa ou conduta..."
            className="w-full pl-9 pr-3 py-2 sm:py-1.5 text-base sm:text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-stone-50 min-h-[42px] sm:min-h-0"
          />
        </div>

        {/* Dropdowns row on mobile */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          {/* Status filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
            <label className="text-[10px] sm:text-xs font-semibold text-stone-500 sm:text-stone-600 uppercase sm:normal-case shrink-0">
              Status
            </label>
            <select
              value={filtros.status || 'todos'}
              onChange={(e) =>
                onChange({
                  ...filtros,
                  status: e.target.value as StatusAgendamento | 'todos',
                })
              }
              className="w-full text-xs sm:text-xs px-2 sm:px-2.5 py-2 sm:py-1.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[40px] sm:min-h-0"
            >
              <option value="todos">Todos os Status</option>
              {Object.entries(STATUS_CONFIG).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.rotulo}
                </option>
              ))}
            </select>
          </div>

          {/* Therapy type filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
            <label className="text-[10px] sm:text-xs font-semibold text-stone-500 sm:text-stone-600 uppercase sm:normal-case shrink-0">
              Técnica
            </label>
            <select
              value={filtros.tipoTerapia || 'todos'}
              onChange={(e) =>
                onChange({
                  ...filtros,
                  tipoTerapia: e.target.value as TipoTerapia | 'todos',
                })
              }
              className="w-full text-xs sm:text-xs px-2 sm:px-2.5 py-2 sm:py-1.5 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[40px] sm:min-h-0 truncate"
            >
              <option value="todos">Todas Técnicas</option>
              {Object.entries(TIPOS_TERAPIA_CONFIG).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear filter button */}
        {temFiltroAtivo && (
          <button
            type="button"
            onClick={onLimpar}
            className="inline-flex items-center justify-center gap-1 text-xs text-rose-600 hover:text-rose-700 px-3 py-2 rounded-xl hover:bg-rose-50 border border-rose-200 sm:border-transparent transition-colors shrink-0 min-h-[38px] sm:min-h-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpar filtros</span>
          </button>
        )}
      </div>
    </div>
  );
};
