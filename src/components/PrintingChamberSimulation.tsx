import React, { useState, useEffect, useRef } from 'react';
import { TabletFormulation, Patient, PrescriptionOrder } from '../types/pharmacy';
import { MachineGCodePackage } from '../utils/slicer';
import { 
  Play, Pause, RotateCcw, CheckCircle2, Download, Printer, 
  Activity, Thermometer, Droplets, Wind, AlertCircle, FileText
} from 'lucide-react';

interface PrintingChamberSimulationProps {
  order: PrescriptionOrder;
  patient: Patient;
  gcodePackage: MachineGCodePackage;
  onPrintComplete: () => void;
  onOpenLabelModal: () => void;
  onOpenGCodeModal: () => void;
}

export const PrintingChamberSimulation: React.FC<PrintingChamberSimulationProps> = ({
  order,
  patient,
  gcodePackage,
  onPrintComplete,
  onOpenLabelModal,
  onOpenGCodeModal
}) => {
  const [printStatus, setPrintStatus] = useState<'idle' | 'printing' | 'paused' | 'completed' | 'testing'>('idle');
  const [currentLayer, setCurrentLayer] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 5 | 10>(2);
  const [headPos, setHeadPos] = useState({ x: 50, y: 50 });
  const [recoaterPos, setRecoaterPos] = useState(0); // 0 to 100%
  const [isJetting, setIsJetting] = useState(false);
  
  // Real-time telemetry fluctuations
  const [nozzleTemp, setNozzleTemp] = useState(gcodePackage.nozzleTempC);
  const [bedTemp, setBedTemp] = useState(gcodePackage.bedTempC);
  const [chamberHumidity, setChamberHumidity] = useState(32.4);
  const [nirAssayPurity, setNirAssayPurity] = useState(99.6);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalLayers = gcodePackage.totalLayers;

  // Print simulation interval
  useEffect(() => {
    if (printStatus === 'printing') {
      const stepIntervalMs = Math.max(80, 500 / playbackSpeed);

      timerRef.current = setInterval(() => {
        setCurrentLayer((prev) => {
          if (prev >= totalLayers) {
            setPrintStatus('testing');
            // Brief post-processing testing delay
            setTimeout(() => {
              setPrintStatus('completed');
              setProgressPercent(100);
              onPrintComplete();
            }, 1200);
            return totalLayers;
          }

          const nextLayer = prev + 1;
          setProgressPercent(Math.round((nextLayer / totalLayers) * 100));

          // Animate print head and recoater
          setIsJetting(true);
          setHeadPos({
            x: 40 + Math.sin(nextLayer * 0.8) * 35,
            y: 40 + Math.cos(nextLayer * 0.8) * 35
          });
          setRecoaterPos((nextLayer % 2 === 0 ? 90 : 10));

          // Subtle sensor fluctuations
          setNozzleTemp(gcodePackage.nozzleTempC + (Math.random() * 0.4 - 0.2));
          setBedTemp(gcodePackage.bedTempC + (Math.random() * 0.2 - 0.1));
          setChamberHumidity(32.0 + Math.random() * 0.8);
          setNirAssayPurity(99.2 + Math.random() * 0.6);

          return nextLayer;
        });
      }, stepIntervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [printStatus, playbackSpeed, totalLayers, gcodePackage, onPrintComplete]);

  const handleStart = () => {
    if (printStatus === 'completed') {
      setCurrentLayer(0);
      setProgressPercent(0);
    }
    setPrintStatus('printing');
  };

  const handlePause = () => setPrintStatus('paused');

  const handleReset = () => {
    setPrintStatus('idle');
    setCurrentLayer(0);
    setProgressPercent(0);
  };

  const handleFastComplete = () => {
    setCurrentLayer(totalLayers);
    setProgressPercent(100);
    setPrintStatus('completed');
    onPrintComplete();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950/70 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100">
                PharmaPrint Bio-Jet 4X Additive Console
              </h3>
              <span className="text-[11px] font-mono text-cyan-400">
                · {order.formulation.technique === 'binder_jetting' ? 'ZipDose® Powder-Bed' : 'Semi-Solid Extrusion'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Lot Batch: <span className="font-mono text-slate-300">{order.batchLotNumber}</span> · Patient:{' '}
              <span className="text-slate-200 font-medium">{patient.name}</span>
            </p>
          </div>
        </div>

        {/* Status Badge & Speed Controls */}
        <div className="flex items-center gap-3">
          {/* Operational Status */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800">
            <span
              className={`w-2 h-2 rounded-full ${
                printStatus === 'printing'
                  ? 'bg-emerald-400 animate-pulse'
                  : printStatus === 'completed'
                  ? 'bg-cyan-400'
                  : printStatus === 'paused'
                  ? 'bg-amber-400'
                  : 'bg-slate-500'
              }`}
            />
            <span className="text-xs font-mono font-medium uppercase text-slate-300">
              {printStatus === 'printing'
                ? 'PRINTING LAYER BY LAYER'
                : printStatus === 'testing'
                ? 'IN-LINE NIR QC ASSAY'
                : printStatus === 'completed'
                ? 'BATCH COMPLETE & VALIDATED'
                : printStatus === 'paused'
                ? 'PAUSED'
                : 'READY TO DISPATCH'}
            </span>
          </div>

          {/* Speed Multiplier */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 px-1">Speed:</span>
            {([1, 2, 5, 10] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[11px] transition-colors ${
                  playbackSpeed === spd ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chamber Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-slate-800 flex-1">
        {/* Left: 3D Printing Chamber Animation Viewport (7 Cols) */}
        <div className="lg:col-span-7 p-5 flex flex-col justify-between bg-slate-950/60 relative overflow-hidden">
          {/* Machine Chamber Box Graphic */}
          <div className="relative w-full h-[320px] rounded-lg border border-slate-800 bg-[#070b12] overflow-hidden flex items-center justify-center">
            {/* Background ISO Class 5 sterile illumination beam */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-cyan-500/10 pointer-events-none" />

            {/* Cleanroom Grid Platform */}
            <div className="absolute bottom-6 w-[280px] h-[160px] border border-cyan-800/40 bg-slate-900/60 rounded-md transform -rotate-x-12 flex items-center justify-center shadow-inner">
              {/* Powder Bed Depression */}
              <div className="relative w-[240px] h-[130px] rounded border border-cyan-700/50 bg-slate-950 flex items-center justify-center overflow-hidden">
                {/* Simulated Powder Texture */}
                <div 
                  className="absolute inset-0 opacity-25"
                  style={{
                    backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
                    backgroundSize: '8px 8px'
                  }}
                />

                {/* The 3D Printed Tablet Being Formed */}
                <div
                  className="relative rounded-full transition-all duration-200 flex items-center justify-center text-center shadow-lg"
                  style={{
                    width: `${Math.min(180, 70 + (currentLayer / totalLayers) * 60)}px`,
                    height: `${Math.min(120, 50 + (currentLayer / totalLayers) * 40)}px`,
                    backgroundColor: order.formulation.shape === 'bilayer_polypill' && currentLayer > totalLayers / 2 ? '#1e40af' : '#0e7490',
                    border: '2px solid #22d3ee',
                    boxShadow: '0 0 25px rgba(6, 182, 212, 0.35)'
                  }}
                >
                  <div className="text-center">
                    <span className="block text-[11px] font-mono font-bold text-white tracking-wider">
                      {order.calculatedDosage.finalPersonalizedDoseMg} mg
                    </span>
                    <span className="block text-[9px] font-mono text-cyan-200">
                      Layer {currentLayer}/{totalLayers}
                    </span>
                  </div>
                </div>

                {/* Recoater Blade Animation */}
                <div
                  className="absolute top-0 bottom-0 w-2.5 bg-gradient-to-r from-slate-400 to-slate-200 shadow-lg transition-all duration-300 pointer-events-none"
                  style={{ left: `${recoaterPos}%` }}
                >
                  <div className="absolute -top-1 -left-1 w-4 h-2 bg-cyan-400 rounded-xs" />
                </div>
              </div>
            </div>

            {/* Active Print Carriage Head */}
            <div
              className="absolute pointer-events-none transition-all duration-150"
              style={{
                left: `${headPos.x}%`,
                top: `${headPos.y * 0.45 + 10}%`
              }}
            >
              {/* Syringe / Piezo Jet Assembly */}
              <div className="relative flex flex-col items-center">
                <div className="w-8 h-10 bg-slate-800 border border-slate-600 rounded-sm shadow-md flex items-center justify-center">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="w-1.5 h-6 bg-slate-400" />
                <div className="w-0.5 h-2 bg-cyan-400 shadow-cyan-400 shadow-md" />
                {isJetting && printStatus === 'printing' && (
                  <div className="w-1 h-3 bg-cyan-300 rounded-full animate-ping mt-0.5" />
                )}
              </div>
            </div>

            {/* Chamber HUD Info (Top Bar inside viewport) */}
            <div className="absolute top-2.5 left-3 text-[11px] font-mono text-slate-400 flex items-center gap-3 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
              <span className="text-cyan-400">X: {headPos.x.toFixed(1)}mm</span>
              <span className="text-cyan-400">Y: {headPos.y.toFixed(1)}mm</span>
              <span className="text-emerald-400">Z: {((currentLayer / totalLayers) * order.formulation.heightMm).toFixed(2)}mm</span>
            </div>

            <div className="absolute top-2.5 right-3 text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
              <span>HEPA Laminar: </span>
              <span className="text-emerald-400 font-semibold">ISO 5 (0.45 m/s)</span>
            </div>
          </div>

          {/* Execution Progress & Layer Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-medium">Batch Progress:</span>
                <span className="font-mono text-cyan-400 font-semibold">{progressPercent}%</span>
                <span className="text-slate-500 font-mono">
                  (Layer {currentLayer} of {totalLayers})
                </span>
              </div>
              <div className="text-slate-400 font-mono text-xs">
                Estimated Time: {Math.max(0, Math.round((totalLayers - currentLayer) * (1.8 / playbackSpeed)))}s remaining
              </div>
            </div>

            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 h-full transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Machine Control Buttons */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              {printStatus !== 'printing' ? (
                <button
                  onClick={handleStart}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{printStatus === 'paused' ? 'Resume Print' : printStatus === 'completed' ? 'Re-Print Batch' : 'Start 3D Printing'}</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Machine</span>
                </button>
              )}

              <button
                onClick={handleReset}
                disabled={currentLayer === 0}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              {printStatus === 'printing' && (
                <button
                  onClick={handleFastComplete}
                  className="px-2.5 py-1.5 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline"
                >
                  Fast Forward to Complete
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenGCodeModal}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>View G-Code</span>
              </button>

              <button
                onClick={onOpenLabelModal}
                disabled={printStatus !== 'completed'}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:pointer-events-none text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Dispensing Label</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Telemetry Sensors & Dissolution Profile (5 Cols) */}
        <div className="lg:col-span-5 p-5 bg-slate-900 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 space-y-4">
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real-Time Sensor Telemetry & PAT</span>
            </h4>

            {/* Sensor Telemetry Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Thermometer className="w-3 h-3 text-amber-400" />
                  <span>Nozzle Thermal</span>
                </div>
                <div className="text-lg font-mono font-semibold text-slate-100 mt-1">
                  {nozzleTemp.toFixed(1)} <span className="text-xs text-slate-400">°C</span>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 mt-0.5">● Nominal range</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Wind className="w-3 h-3 text-cyan-400" />
                  <span>Bed Temperature</span>
                </div>
                <div className="text-lg font-mono font-semibold text-slate-100 mt-1">
                  {bedTemp.toFixed(1)} <span className="text-xs text-slate-400">°C</span>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 mt-0.5">● Stable adhesion</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Droplets className="w-3 h-3 text-blue-400" />
                  <span>Chamber RH%</span>
                </div>
                <div className="text-lg font-mono font-semibold text-slate-100 mt-1">
                  {chamberHumidity.toFixed(1)} <span className="text-xs text-slate-400">%</span>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 mt-0.5">● Moisture locked</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>NIR Assay Purity</span>
                </div>
                <div className="text-lg font-mono font-semibold text-emerald-400 mt-1">
                  {nirAssayPurity.toFixed(2)} <span className="text-xs text-slate-400">%</span>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 mt-0.5">USP &lt;905&gt; Compliant</div>
              </div>
            </div>
          </div>

          {/* In Vitro Dissolution Comparison Graph */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-slate-200">Simulated Drug Dissolution Curve</span>
              <span className="text-[10px] font-mono text-slate-400">USP Paddle Method II (pH 6.8)</span>
            </div>

            {/* SVG Graph showing 3D Printed vs Conventional Fixed Dose */}
            <div className="relative h-28 w-full">
              <svg className="w-full h-full" viewBox="0 0 240 100" preserveAspectRatio="none">
                {/* Horizontal reference lines */}
                <line x1="0" y1="20" x2="240" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="240" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="240" y2="80" stroke="#1e293b" strokeDasharray="3 3" />

                {/* Therapeutic Window target band (green shaded) */}
                <rect x="0" y="25" width="240" height="40" fill="rgba(16, 185, 129, 0.08)" />
                <text x="5" y="47" fill="#10b981" fontSize="7" fontFamily="monospace">
                  TARGET THERAPEUTIC WINDOW
                </text>

                {/* Curve 1: Conventional Fixed Dose (commercial 500 mg or 250 mg overshoot/undershoot) */}
                <path
                  d="M 10 90 Q 30 10, 70 15 T 150 70 T 230 85"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.8"
                  strokeDasharray="4 2"
                />

                {/* Curve 2: 3D Printed Personalized Medicine (optimal controlled dissolution) */}
                <path
                  d={
                    order.formulation.releaseProfile === 'rapid_disintegrating'
                      ? "M 10 90 Q 20 30, 40 32 T 120 35 T 230 40"
                      : "M 10 90 Q 40 45, 90 40 T 180 38 T 230 42"
                  }
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.4"
                />
              </svg>
            </div>

            {/* Graph Legend */}
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-cyan-400 inline-block"></span>
                <span className="text-cyan-300 font-medium">
                  3D Printed ({order.calculatedDosage.finalPersonalizedDoseMg} mg)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-red-400 inline-block border-t border-dashed"></span>
                <span className="text-slate-400">
                  Fixed Stock (500mg commercial)
                </span>
              </div>
            </div>
          </div>

          {/* Quality Assurance Certificate Notice */}
          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-emerald-400">Automated QA Release Criteria:</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Target mass {order.formulation.totalMassMg} mg (±1.5%), active loading uniformity 99.4%, porous matrix free from sugar excipients for patient safety.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
