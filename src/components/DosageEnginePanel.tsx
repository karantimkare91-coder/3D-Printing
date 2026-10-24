import React, { useState } from 'react';
import { Patient, CalculatedDosage, TabletFormulation } from '../types/pharmacy';
import { 
  ArrowRight, ShieldCheck, AlertTriangle, Dna, Calculator, 
  Layers, Sparkles, Check, RefreshCw, Send, HelpCircle
} from 'lucide-react';

interface DosageEnginePanelProps {
  patient: Patient;
  calculatedDosage: CalculatedDosage;
  formulation: TabletFormulation;
  activeDrugName: string;
  onDrugChange: (drugName: string) => void;
  onBaselineDoseChange: (doseMg: number) => void;
  onDispatchToPrinter: () => void;
  onUpdatePatientComorbidities: (comorbidities: string[]) => void;
}

export const DosageEnginePanel: React.FC<DosageEnginePanelProps> = ({
  patient,
  calculatedDosage,
  formulation,
  activeDrugName,
  onDrugChange,
  onBaselineDoseChange,
  onDispatchToPrinter,
  onUpdatePatientComorbidities
}) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'scaling' | 'excipients' | 'pharmacogenomics'>('scaling');

  // Comorbidity toggles
  const hasDiabetes = patient.pastMedicalHistory.some(h => h.toLowerCase().includes('diabetes'));
  const hasAsthma = patient.pastMedicalHistory.some(h => h.toLowerCase().includes('asthma'));
  const hasRenal = patient.pastMedicalHistory.some(h => h.toLowerCase().includes('kidney') || h.toLowerCase().includes('renal'));

  const toggleCondition = (conditionName: string) => {
    let updated = [...patient.pastMedicalHistory];
    const exists = updated.some(h => h.toLowerCase().includes(conditionName.toLowerCase()));
    if (exists) {
      updated = updated.filter(h => !h.toLowerCase().includes(conditionName.toLowerCase()));
      if (updated.length === 0) updated = ['None / Healthy Reference'];
    } else {
      updated = updated.filter(h => !h.toLowerCase().includes('none'));
      updated.push(conditionName);
    }
    onUpdatePatientComorbidities(updated);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Personalized Pharmacokinetic Dosing Engine</span>
              <span className="text-xs font-mono text-cyan-400">· Mosteller &amp; Comorbidity Scaler</span>
            </h3>
            <p className="text-xs text-slate-400">
              Adapting prescription dosage and chemical composition for{' '}
              <span className="text-slate-200 font-medium">{patient.name}</span>
            </p>
          </div>
        </div>

        {/* Tab Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('scaling')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'scaling' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dosage Scaling
          </button>
          <button
            onClick={() => setActiveTab('excipients')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'excipients' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3D Excipient Matrix
          </button>
          <button
            onClick={() => setActiveTab('pharmacogenomics')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'pharmacogenomics' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Genetics (CYP)
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 space-y-5">
        {activeTab === 'scaling' && (
          <>
            {/* The Direct Clinical Case Comparison Card (Requested User Scenario) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span className="font-mono uppercase tracking-wider text-cyan-400">
                  Clinical Adaptation Benchmark
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  Mosteller Formula: BSA = √([H × W] / 3600)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
                {/* Baseline Reference Patient (45 kg, 135 cm, 250 mg) */}
                <div className="md:col-span-5 p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Reference Baseline</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      No Past History
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center py-1">
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] font-mono text-slate-400">WEIGHT</div>
                      <div className="text-sm font-mono font-bold text-slate-200">
                        {calculatedDosage.baselineWeightKg} <span className="text-[10px] font-normal text-slate-400">kg</span>
                      </div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] font-mono text-slate-400">HEIGHT</div>
                      <div className="text-sm font-mono font-bold text-slate-200">
                        {calculatedDosage.baselineHeightCm} <span className="text-[10px] font-normal text-slate-400">cm</span>
                      </div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] font-mono text-slate-400">BSA</div>
                      <div className="text-sm font-mono font-bold text-slate-200">
                        {calculatedDosage.baselineBsaM2.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">m²</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Baseline Reference Strength:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="50"
                        max="1000"
                        step="10"
                        value={calculatedDosage.baselineDoseMg}
                        onChange={(e) => onBaselineDoseChange(Number(e.target.value))}
                        className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
                      />
                      <span className="text-xs font-mono text-slate-300">mg</span>
                    </div>
                  </div>
                </div>

                {/* Arrow & Scaling Ratio (Center) */}
                <div className="md:col-span-1 flex flex-col items-center justify-center text-center py-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-sm">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 mt-1">
                    x{(calculatedDosage.targetBsaM2 / calculatedDosage.baselineBsaM2).toFixed(2)}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">BSA</span>
                </div>

                {/* Target Patient (97 kg, 177 cm with Asthma & Diabetes) */}
                <div className="md:col-span-5 p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-700/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-cyan-200">Target Patient Profile</span>
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded">
                      Asthma + Diabetes
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center py-1">
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] font-mono text-slate-400">WEIGHT</div>
                      <div className="text-sm font-mono font-bold text-cyan-200">
                        {patient.weightKg} <span className="text-[10px] font-normal text-slate-400">kg</span>
                      </div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] font-mono text-slate-400">HEIGHT</div>
                      <div className="text-sm font-mono font-bold text-cyan-200">
                        {patient.heightCm} <span className="text-[10px] font-normal text-slate-400">cm</span>
                      </div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] font-mono text-slate-400">BSA</div>
                      <div className="text-sm font-mono font-bold text-cyan-200">
                        {calculatedDosage.targetBsaM2.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">m²</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-cyan-800/40 flex items-center justify-between">
                    <span className="text-xs text-slate-300">Personalized 3D Dose:</span>
                    <div className="text-base font-mono font-bold text-emerald-400">
                      {calculatedDosage.finalPersonalizedDoseMg} mg
                    </div>
                  </div>
                </div>
              </div>

              {/* Comorbidity Quick Toggles for Dynamic Recalculation */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-400 font-medium">Active Pathological Modifiers:</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => toggleCondition('Type 2 Diabetes Mellitus')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                      hasDiabetes
                        ? 'bg-amber-950/70 border-amber-600 text-amber-200'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Type 2 Diabetes (-10% clearance safety)</span>
                    {hasDiabetes && <Check className="w-3 h-3 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => toggleCondition('Asthma')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                      hasAsthma
                        ? 'bg-cyan-950/70 border-cyan-600 text-cyan-200'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Asthma (ZipDose® rapid dispersion)</span>
                    {hasAsthma && <Check className="w-3 h-3 text-cyan-400" />}
                  </button>

                  <button
                    onClick={() => toggleCondition('Chronic Kidney Disease')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                      hasRenal
                        ? 'bg-rose-950/70 border-rose-600 text-rose-200'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Renal Impairment (-15%)</span>
                    {hasRenal && <Check className="w-3 h-3 text-rose-400" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Step-by-Step Mathematical Derivation Card */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Clinical Pharmacology Audit Trail &amp; Step Derivation</span>
                </span>
                <span className="font-mono text-emerald-400 text-xs font-semibold">
                  Result: {calculatedDosage.finalPersonalizedDoseMg} mg
                </span>
              </div>

              <div className="space-y-2">
                {calculatedDosage.clinicalRationaleSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-cyan-400 shrink-0 font-bold">›</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              {/* The "Why 3D Printing Matters" Clinical Comparison */}
              <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 text-xs text-slate-300 space-y-1.5">
                <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Why Conventional Fixed Doses Fail This Patient:</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Commercial pharmaceutical manufacturing only offers fixed batch sizes (250 mg or 500 mg). If given 250 mg, Arthur Vance is severely under-dosed (-34% efficacy loss). If given 500 mg, his diabetic nephropathy and reduced metabolic clearance risk toxic accumulation and glycemic distress (+32% overdose).
                  <br />
                  <span className="text-emerald-300 font-medium">
                    3D printing resolves this by digitally depositing the exact calculated {calculatedDosage.finalPersonalizedDoseMg} mg strength.
                  </span>
                </p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'excipients' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
              <span className="font-medium text-slate-200">
                Patient-Specific Excipient &amp; Polymer Composition
              </span>
              <span className="font-mono text-cyan-400">
                Total Mass: {formulation.totalMassMg} mg ({formulation.porosityPercent}% Porosity)
              </span>
            </div>

            {/* Excipient Table */}
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Compound / Excipient</th>
                    <th className="p-2.5">Pharmaceutical Role</th>
                    <th className="p-2.5 text-right font-mono">Weight (mg)</th>
                    <th className="p-2.5 text-right font-mono">% W/W</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {formulation.excipients.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-2.5 font-sans font-medium text-slate-200">
                        {item.name}
                        <div className="text-[10px] text-slate-500 font-normal">
                          {item.functionDescription}
                        </div>
                      </td>
                      <td className="p-2.5 text-slate-400 font-sans">{item.chemicalRole}</td>
                      <td className="p-2.5 text-right text-cyan-300 font-bold">{item.milligrams} mg</td>
                      <td className="p-2.5 text-right text-slate-300">{item.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Special Formulation Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs">
                <span className="font-semibold text-amber-300">Diabetic Safety Matrix:</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  100% Sucrose, Lactose &amp; Starch free. Uses Kollidon® VA64 copovidone and non-glycemic D-Mannitol to eliminate glycemic index spikes.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-xs">
                <span className="font-semibold text-cyan-300">Asthma Airway Protection:</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  High-porosity ZipDose® porous micro-channels allow rapid saliva penetration and oral dispersion within &lt; 10 seconds without water ingestion.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pharmacogenomics' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
              <span className="font-medium text-slate-200 flex items-center gap-1.5">
                <Dna className="w-4 h-4 text-cyan-400" />
                <span>Patient Pharmacogenomic (PGx) Profile</span>
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                CPIC Clinical Guideline Aligned
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">CYP2C9 Gene</span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 uppercase">
                    {patient.geneticProfile.cyp2c9}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Influences clearance of sulfonylureas, warfarin, NSAIDs. Intermediate metabolizers exhibit ~30% reduced clearance, preventing accumulation.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">CYP2D6 Gene</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 uppercase">
                    {patient.geneticProfile.cyp2d6}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Controls beta-blocker, antidepressant, and codeine metabolism. Wild-type extensive metabolism confirmed.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">CYP2C19 Gene</span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60 uppercase">
                    {patient.geneticProfile.cyp2c19}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Modulates proton pump inhibitors and clopidogrel activation kinetics.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">SLCO1B1 Transporter</span>
                  <span className="text-[10px] font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 uppercase">
                    {patient.geneticProfile.slco1b1}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Hepatic uptake transporter; normal hepatic extraction capacity.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Current Genetic Dosage Adjustment Applied:</span>
              <span className="font-mono text-cyan-400 font-semibold">
                {calculatedDosage.geneticModifierPercent >= 0 ? '+' : ''}
                {calculatedDosage.geneticModifierPercent}% ({calculatedDosage.geneticRationale})
              </span>
            </div>
          </div>
        )}

        {/* Action Button: Dispatch to 3D Slicer & Printing Machine */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
          <div className="text-xs text-slate-400 font-mono">
            Generated G-Code: {formulation.layerCount} layers · {formulation.heightMm} mm · {formulation.totalMassMg} mg
          </div>

          <button
            onClick={onDispatchToPrinter}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-medium text-xs rounded-lg transition-all shadow-md flex items-center gap-2 group cursor-pointer"
          >
            <span>Send Data to 3D Printing Machine</span>
            <Send className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
