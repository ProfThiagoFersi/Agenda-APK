import React, { useRef } from 'react';
import { 
  Database, 
  Trash2, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  X,
  FileJson,
  ShieldAlert
} from 'lucide-react';
import { Paciente, Agendamento, ConfiguracaoPrecos } from '../types';

interface DatabaseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pacientes: Paciente[];
  agendamentos: Agendamento[];
  configPrecos: ConfiguracaoPrecos;
  onZerarBanco: () => void;
  onCarregarExemplo: () => void;
  onImportarDados: (dados: { pacientes: Paciente[]; agendamentos: Agendamento[]; configPrecos?: ConfiguracaoPrecos }) => void;
}

export const DatabaseManagerModal: React.FC<DatabaseManagerModalProps> = ({
  isOpen,
  onClose,
  pacientes,
  agendamentos,
  configPrecos,
  onZerarBanco,
  onCarregarExemplo,
  onImportarDados,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportarBackup = () => {
    const data = {
      exportadoEm: new Date().toISOString(),
      versao: '2.0.0-apk',
      clinica: 'Liberação Miofascial Renata Okoti',
      configPrecos,
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
  };

  const handleArquivoSelecionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const conteudo = event.target?.result as string;
        const parsed = JSON.parse(conteudo);

        if (!Array.isArray(parsed.pacientes) || !Array.isArray(parsed.agendamentos)) {
          alert('Arquivo de backup inválido. Certifique-se de usar um arquivo JSON exportado por este aplicativo.');
          return;
        }

        onImportarDados({
          pacientes: parsed.pacientes,
          agendamentos: parsed.agendamentos,
          configPrecos: parsed.configPrecos,
        });
        onClose();
      } catch (err) {
        alert('Erro ao ler arquivo de backup JSON.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const isBancoZerado = pacientes.length === 0 && agendamentos.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-stone-200 text-stone-900 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-950 flex items-center justify-center text-teal-400 shadow-md shrink-0 border border-stone-700">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">Gerenciamento do Banco de Dados</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Controle de persistência local do aplicativo Android APK
            </p>
          </div>
        </div>

        {/* Current status card */}
        <div className="mt-4 p-4 rounded-xl border bg-stone-50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Status Atual do Sistema
            </span>
            {isBancoZerado ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Banco Zerado (Limpo)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-300">
                {pacientes.length} paciente(s) • {agendamentos.length} agendamento(s)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-2.5 bg-white rounded-lg border border-stone-200">
              <span className="text-stone-500 block">Total de Pacientes:</span>
              <strong className="text-base text-stone-900 font-bold">{pacientes.length}</strong>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-stone-200">
              <span className="text-stone-500 block">Total de Atendimentos:</span>
              <strong className="text-base text-stone-900 font-bold">{agendamentos.length}</strong>
            </div>
          </div>
        </div>

        {/* Actions list */}
        <div className="mt-5 space-y-3">
          {/* Zerar banco */}
          <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-red-600" />
                Zerar Banco de Dados (Limpar Tudo)
              </h4>
              <p className="text-[11px] text-red-700 mt-0.5">
                Remove todos os pacientes e atendimentos, deixando a agenda 100% limpa.
              </p>
            </div>
            <button
              type="button"
              onClick={onZerarBanco}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px]"
            >
              Zerar Banco
            </button>
          </div>

          {/* Exportar Backup */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-teal-600" />
                Exportar Backup de Segurança (JSON)
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Baixe um arquivo seguro com todos os seus pacientes, prontuários e histórico financeiro.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportarBackup}
              disabled={isBancoZerado}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] flex items-center gap-1.5 ${
                isBancoZerado
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-teal-700 hover:bg-teal-600 active:scale-95 text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Backup</span>
            </button>
          </div>

          {/* Importar Backup */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" />
                Restaurar Backup (JSON)
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Importe dados de um backup salvo anteriormente para restaurar sua agenda.
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleArquivoSelecionado}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Selecionar Arquivo</span>
            </button>
          </div>

          {/* Carregar Exemplo Demo */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-stone-500" />
                Carregar Dados de Demonstração
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Popula a agenda com pacientes e atendimentos simulados para fins de teste.
              </p>
            </div>
            <button
              type="button"
              onClick={onCarregarExemplo}
              className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold transition-all shrink-0 min-h-[36px]"
            >
              Carregar Exemplo
            </button>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-stone-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};
