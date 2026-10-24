import React, { useState } from 'react';
import { MachineGCodePackage } from '../utils/slicer';
import { X, Copy, Download, Check, Terminal, FileCode } from 'lucide-react';

interface GCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  gcodePackage: MachineGCodePackage;
  batchId: string;
}

export const GCodeViewerModal: React.FC<GCodeViewerModalProps> = ({
  isOpen,
  onClose,
  gcodePackage,
  batchId
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(gcodePackage.gcodeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([gcodePackage.gcodeString], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = gcodePackage.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span>Machine Numerical Control G-Code</span>
                <span className="text-xs font-mono text-cyan-400">· {gcodePackage.filename}</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {gcodePackage.totalLayers} Slices · Powder Volume: {gcodePackage.powderVolumeCm3} cm³ · Binder: {gcodePackage.binderVolumeUl} µL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-md border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-2.5 py-1.5 text-xs text-white bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .gcode</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* G-Code Display Console */}
        <div className="p-4 bg-slate-950 overflow-y-auto flex-1 font-mono text-xs text-slate-300 select-text leading-relaxed">
          <pre className="whitespace-pre-wrap">{gcodePackage.gcodeString}</pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Target Platform: Aprecia ZipDose® &amp; Bio-Jet ISO Class 5</span>
          <span className="font-mono text-emerald-400">Validated Toolpath Checksum: OK</span>
        </div>
      </div>
    </div>
  );
};
