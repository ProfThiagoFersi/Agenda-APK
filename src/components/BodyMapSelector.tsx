import React, { useState } from 'react';
import { ZONAS_FASCIAIS } from '../data/therapyData';
import { Check } from 'lucide-react';

interface BodyMapSelectorProps {
  selectedZones: string[];
  onChange: (zones: string[]) => void;
  readOnly?: boolean;
}

export const BodyMapSelector: React.FC<BodyMapSelectorProps> = ({
  selectedZones,
  onChange,
  readOnly = false,
}) => {
  const [viewFilter, setViewFilter] = useState<'todas' | 'posterior' | 'anterior'>('todas');

  const toggleZone = (id: string) => {
    if (readOnly) return;
    if (selectedZones.includes(id)) {
      onChange(selectedZones.filter((z) => z !== id));
    } else {
      onChange([...selectedZones, id]);
    }
  };

  const filteredZones = ZONAS_FASCIAIS.filter((z) => {
    if (viewFilter === 'todas') return true;
    return z.vista === viewFilter || z.vista === 'ambas';
  });

  return (
    <div id="body-map-selector-container" className="rounded-xl bg-stone-50 border border-stone-200 p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Mapeamento de Fáscia & Pontos-Gatilho
          </span>
          <span className="text-xs bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-full">
            {selectedZones.length} selecionada(s)
          </span>
        </div>

        <div className="inline-flex rounded-lg bg-stone-200 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setViewFilter('todas')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              viewFilter === 'todas'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setViewFilter('posterior')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              viewFilter === 'posterior'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Cadeia Posterior
          </button>
          <button
            type="button"
            onClick={() => setViewFilter('anterior')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              viewFilter === 'anterior'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Cadeia Anterior
          </button>
        </div>
      </div>

      {/* Visual Diagram Representation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-white rounded-lg border border-stone-200 p-3 mb-3">
        {/* Silhouette Visual Card */}
        <div className="flex justify-around items-center py-2 bg-stone-50/80 rounded-lg border border-dashed border-stone-200 text-center">
          {/* Posterior Chain Mini Guide */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-stone-500 block">Vista Posterior</span>
            <div className="relative w-28 h-44 mx-auto bg-stone-200/50 rounded-full flex flex-col items-center justify-between p-2 border border-stone-300">
              {/* Head / Cervical */}
              <button
                type="button"
                disabled={readOnly}
                onClick={() => toggleZone('cervical')}
                title="Cervical & Suboccipitais"
                className={`w-6 h-6 rounded-full text-[9px] font-bold flex items-center justify-center transition-all ${
                  selectedZones.includes('cervical')
                    ? 'bg-teal-600 text-white ring-2 ring-teal-300 scale-110'
                    : 'bg-stone-300 text-stone-700 hover:bg-teal-200'
                }`}
              >
                C
              </button>

              {/* Trapezius / Rhomboids */}
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleZone('trapezio')}
                  title="Trapézio"
                  className={`w-5 h-5 rounded text-[8px] font-bold flex items-center justify-center transition-all ${
                    selectedZones.includes('trapezio')
                      ? 'bg-teal-600 text-white ring-2 ring-teal-300 scale-110'
                      : 'bg-stone-300 text-stone-700 hover:bg-teal-200'
                  }`}
                >
                  T
                </button>
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleZone('romboides')}
                  title="Romboides"
                  className={`w-5 h-5 rounded text-[8px] font-bold flex items-center justify-center transition-all ${
                    selectedZones.includes('romboides')
                      ? 'bg-teal-600 text-white ring-2 ring-teal-300 scale-110'
                      : 'bg-stone-300 text-stone-700 hover:bg-teal-200'
                  }`}
                >
                  R
                </button>
              </div>

              {/* Lombar / Glúteos */}
              <div className="flex flex-col gap-1 items-center">
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleZone('lombar')}
                  title="Lombar"
                  className={`w-12 h-4 rounded text-[8px] font-bold flex items-center justify-center transition-all ${
                    selectedZones.includes('lombar')
                      ? 'bg-teal-600 text-white ring-2 ring-teal-300'
                      : 'bg-stone-300 text-stone-700 hover:bg-teal-200'
                  }`}
                >
                  Lombar
                </button>
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleZone('gluteos')}
                  title="Glúteos"
                  className={`w-10 h-4 rounded text-[8px] font-bold flex items-center justify-center transition-all ${
                    selectedZones.includes('gluteos')
                      ? 'bg-teal-600 text-white ring-2 ring-teal-300'
                      : 'bg-stone-300 text-stone-700 hover:bg-teal-200'
                  }`}
                >
                  Glúteo
                </button>
              </div>

              {/* Isquios & Panturrilhas */}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleZone('isquiotibiais')}
                  title="Isquiotibiais"
                  className={`w-5 h-6 rounded text-[8px] font-bold flex items-center justify-center transition-all ${
                    selectedZones.includes('isquiotibiais')
                      ? 'bg-teal-600 text-white ring-2 ring-teal-300'
                      : 'bg-stone-300 text-stone-700 hover:bg-teal-200'
                  }`}
                >
                  Coxa
                </button>
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleZone('panturrilha')}
                  title="Panturrilha"
                  className={`w-5 h-6 rounded text-[8px] font-bold flex items-center justify-center transition-all ${
                    selectedZones.includes('panturrilha')
                      ? 'bg-teal-600 text-white ring-2 ring-teal-300'
                      : 'bg-stone-300 text-stone-700 hover:bg-teal-200'
                  }`}
                >
                  Pantu
                </button>
              </div>
            </div>
          </div>

          {/* Anterior Chain Mini Guide */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-stone-500 block">Vista Anterior</span>
            <div className="relative w-28 h-44 mx-auto bg-stone-200/50 rounded-full flex flex-col items-center justify-between p-2 border border-stone-300">
              {/* Escalenos / Cervical Anterior */}
              <button
                type="button"
                disabled={readOnly}
                onClick={() => toggleZone('escalenos')}
                title="Escalenos & ECOM"
                className={`w-6 h-6 rounded-full text-[8px] font-bold flex items-center justify-center transition-all ${
                  selectedZones.includes('escalenos')
                    ? 'bg-teal-600 text-white ring-2 ring-teal-300 scale-110'
                    : 'bg-stone-300 text-stone-700 hover:bg-teal-200'
                }`}
              >
                Pescoço
              </button>

              {/* Peitoral */}
              <button
                type="button"
                disabled={readOnly}
                onClick={() => toggleZone('peitoral')}
                title="Peitoral Maior & Menor"
                className={`w-14 h-5 rounded text-[8px] font-bold flex items-center justify-center transition-all ${
                  selectedZones.includes('peitoral')
                    ? 'bg-teal-600 text-white ring-2 ring-teal-300'
                    : 'bg-stone-300 text-stone-700 hover:bg-teal-200'
                }`}
              >
                Peitoral
              </button>

              {/* Psoas / Quadril */}
              <button
                type="button"
                disabled={readOnly}
                onClick={() => toggleZone('quadril_psoas')}
                title="Psoas Ilíaco"
                className={`w-12 h-4 rounded text-[8px] font-bold flex items-center justify-center transition-all ${
                  selectedZones.includes('quadril_psoas')
                    ? 'bg-teal-600 text-white ring-2 ring-teal-300'
                    : 'bg-stone-300 text-stone-700 hover:bg-teal-200'
                }`}
              >
                Psoas
              </button>

              {/* Quadríceps & TFL */}
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleZone('quadriceps')}
                  title="Quadríceps"
                  className={`w-8 h-6 rounded text-[8px] font-bold flex items-center justify-center transition-all ${
                    selectedZones.includes('quadriceps')
                      ? 'bg-teal-600 text-white ring-2 ring-teal-300'
                      : 'bg-stone-300 text-stone-700 hover:bg-teal-200'
                  }`}
                >
                  Quad
                </button>
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleZone('trato_iliotibial')}
                  title="Trato Iliotibial"
                  className={`w-6 h-6 rounded text-[8px] font-bold flex items-center justify-center transition-all ${
                    selectedZones.includes('trato_iliotibial')
                      ? 'bg-teal-600 text-white ring-2 ring-teal-300'
                      : 'bg-stone-300 text-stone-700 hover:bg-teal-200'
                  }`}
                >
                  TFL
                </button>
              </div>

              {/* Pés / Fáscia Plantar */}
              <button
                type="button"
                disabled={readOnly}
                onClick={() => toggleZone('fascia_plantar')}
                title="Fáscia Plantar"
                className={`w-12 h-4 rounded text-[8px] font-bold flex items-center justify-center transition-all ${
                  selectedZones.includes('fascia_plantar')
                    ? 'bg-teal-600 text-white ring-2 ring-teal-300'
                    : 'bg-stone-300 text-stone-700 hover:bg-teal-200'
                }`}
              >
                Plantar
              </button>
            </div>
          </div>
        </div>

        {/* Instructions / Legend */}
        <div className="text-xs text-stone-600 space-y-2 p-1">
          <p className="font-semibold text-stone-800">Cadeias Fasciais & Disfunções:</p>
          <ul className="space-y-1 text-stone-600">
            <li className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0"></span>
              <span>Clique nos botões ou na lista abaixo para marcar as zonas com aderência ou restrição.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
              <span>Identifique bandas tensas para direcionar ventosaterapia ou IASTM.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Pill buttons list */}
      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
        {filteredZones.map((zone) => {
          const isSelected = selectedZones.includes(zone.id);
          return (
            <button
              key={zone.id}
              type="button"
              disabled={readOnly}
              onClick={() => toggleZone(zone.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                isSelected
                  ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
              } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {isSelected && <Check className="w-3 h-3 text-teal-200" />}
              <span>{zone.nome}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
