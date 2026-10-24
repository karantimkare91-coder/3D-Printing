import React from 'react';
import { UserPlus, Activity, Printer, HelpCircle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'calculator' | 'history' | 'cad' | 'printing' | 'pdf_guide';
  setActiveTab: (tab: 'calculator' | 'history' | 'cad' | 'printing' | 'pdf_guide') => void;
  onOpenNewPatientModal: () => void;
  printStatus: 'idle' | 'printing' | 'completed';
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewPatientModal,
  printStatus
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/95 sticky top-0 z-40 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a href="/" className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>PrintRx</span>
        </a>
        <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
          · Personalized 3D Medicine
        </span>
      </div>

      {/* Zone 2: Clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`hover:text-slate-100 transition-colors ${
            activeTab === 'calculator' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Dosing &amp; Formulation Engine
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`hover:text-slate-100 transition-colors ${
            activeTab === 'history' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Patient Clinical History &amp; Rx Outcomes
        </button>

        <button
          onClick={() => setActiveTab('cad')}
          className={`hover:text-slate-100 transition-colors ${
            activeTab === 'cad' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          3D Tablet CAD &amp; Slices
        </button>

        <button
          onClick={() => setActiveTab('printing')}
          className={`hover:text-slate-100 transition-colors flex items-center gap-1.5 ${
            activeTab === 'printing' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          <span>3D Print Machine</span>
          {printStatus === 'printing' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('pdf_guide')}
          className={`hover:text-slate-100 transition-colors flex items-center gap-1 ${
            activeTab === 'pdf_guide' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          <span>Project Reference &amp; ZipDose®</span>
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>ISO Class 5 · Bio-Jet 4X Connected</span>
        </div>

        <button
          onClick={onOpenNewPatientModal}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New Patient</span>
        </button>
      </div>
    </header>
  );
};
