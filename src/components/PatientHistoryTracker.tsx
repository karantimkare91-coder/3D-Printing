import React, { useState } from 'react';
import { 
  Patient, MedicalConditionRecord, PreviousPrescriptionRecord, 
  ConditionSeverity, TreatmentEffectiveness 
} from '../types/pharmacy';
import { 
  History, Plus, AlertCircle, CheckCircle2, ShieldAlert, Pill, 
  Activity, Calendar, FileText, X, Check, HeartPulse, Sparkles, Printer
} from 'lucide-react';

interface PatientHistoryTrackerProps {
  patient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onNavigateToCalculator: () => void;
}

export const PatientHistoryTracker: React.FC<PatientHistoryTrackerProps> = ({
  patient,
  onUpdatePatient,
  onNavigateToCalculator
}) => {
  // Modal states
  const [isAddConditionOpen, setIsAddConditionOpen] = useState(false);
  const [isAddPrescriptionOpen, setIsAddPrescriptionOpen] = useState(false);

  // New Condition Form State
  const [newCondName, setNewCondName] = useState('');
  const [newCondCategory, setNewCondCategory] = useState<MedicalConditionRecord['category']>('Respiratory');
  const [newCondYear, setNewCondYear] = useState(2020);
  const [newCondSeverity, setNewCondSeverity] = useState<ConditionSeverity>('moderate');
  const [newCondNotes, setNewCondNotes] = useState('');
  const [newCondDosingImpact, setNewCondDosingImpact] = useState('');
  const [newCondExcipient, setNewCondExcipient] = useState('');

  // New Prescription Form State
  const [newRxDrugName, setNewRxDrugName] = useState('');
  const [newRxDose, setNewRxDose] = useState('');
  const [newRxFixedStrength, setNewRxFixedStrength] = useState(500);
  const [newRxStartDate, setNewRxStartDate] = useState('');
  const [newRxEndDate, setNewRxEndDate] = useState('');
  const [newRxIndication, setNewRxIndication] = useState('');
  const [newRxEffectiveness, setNewRxEffectiveness] = useState<TreatmentEffectiveness>('intolerance_adverse_reaction');
  const [newRxAdverseEffects, setNewRxAdverseEffects] = useState('');
  const [newRxOutcomeNotes, setNewRxOutcomeNotes] = useState('');
  const [newRxSwitchRationale, setNewRxSwitchRationale] = useState('');

  // Add Condition Handler
  const handleSaveCondition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCondName.trim()) return;

    const newRecord: MedicalConditionRecord = {
      id: `cond-${Date.now()}`,
      conditionName: newCondName.trim(),
      category: newCondCategory,
      diagnosisYear: Number(newCondYear),
      severity: newCondSeverity,
      clinicalNotes: newCondNotes.trim() || 'Condition monitored in clinical history.',
      dosingImpact: newCondDosingImpact.trim() || 'Incorporate in 3D formulation clearance parameters.',
      excipientRestriction: newCondExcipient.trim() || undefined
    };

    const updatedConditions = [...(patient.medicalConditions || []), newRecord];
    const updatedHistoryList = Array.from(new Set([...patient.pastMedicalHistory, newRecord.conditionName]));

    onUpdatePatient({
      ...patient,
      medicalConditions: updatedConditions,
      pastMedicalHistory: updatedHistoryList
    });

    setIsAddConditionOpen(false);
    setNewCondName('');
    setNewCondNotes('');
    setNewCondDosingImpact('');
    setNewCondExcipient('');
  };

  // Add Previous Prescription Handler
  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRxDrugName.trim()) return;

    const newRecord: PreviousPrescriptionRecord = {
      id: `rx-prev-${Date.now()}`,
      drugName: newRxDrugName.trim(),
      prescribedDose: newRxDose.trim() || `${newRxFixedStrength} mg oral daily`,
      standardFixedStrengthMg: Number(newRxFixedStrength),
      startDate: newRxStartDate || '2023-01-01',
      endDate: newRxEndDate || undefined,
      indication: newRxIndication.trim() || 'Clinical symptom management',
      effectiveness: newRxEffectiveness,
      adverseEffectsReported: newRxAdverseEffects.split(',').map(s => s.trim()).filter(Boolean),
      clinicalOutcomeNotes: newRxOutcomeNotes.trim() || 'Evaluated for switch to personalized 3D additive therapy.',
      switchedToCustomRationale: newRxSwitchRationale.trim() || 'Requires patient-specific strength and modified porous dissolution matrix.'
    };

    const updatedPrescriptions = [...(patient.previousPrescriptions || []), newRecord];

    onUpdatePatient({
      ...patient,
      previousPrescriptions: updatedPrescriptions
    });

    setIsAddPrescriptionOpen(false);
    setNewRxDrugName('');
    setNewRxDose('');
    setNewRxIndication('');
    setNewRxAdverseEffects('');
    setNewRxOutcomeNotes('');
    setNewRxSwitchRationale('');
  };

  const getEffectivenessBadge = (effectiveness: TreatmentEffectiveness) => {
    switch (effectiveness) {
      case 'highly_effective':
        return {
          label: 'Highly Effective / Optimal Control',
          classes: 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
        };
      case 'moderate_control':
        return {
          label: 'Moderate Control',
          classes: 'bg-blue-950/70 text-blue-300 border-blue-800'
        };
      case 'suboptimal':
        return {
          label: 'Suboptimal Response',
          classes: 'bg-amber-950/70 text-amber-300 border-amber-800'
        };
      case 'ineffective':
        return {
          label: 'Ineffective / Therapeutic Failure',
          classes: 'bg-rose-950/70 text-rose-300 border-rose-800'
        };
      case 'intolerance_adverse_reaction':
        return {
          label: 'Intolerance & Adverse Reaction',
          classes: 'bg-red-950/80 text-red-300 border-red-700 font-semibold'
        };
      default:
        return { label: effectiveness, classes: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const conditionsCount = patient.medicalConditions?.length || 0;
  const prescriptionsCount = patient.previousPrescriptions?.length || 0;

  return (
    <div className="space-y-6">
      {/* Patient Demographic & Clinical Header */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-100">
                {patient.name} · Longitudinal Clinical History
              </h2>
              <span className="text-[11px] font-mono text-cyan-400">
                · Record #{patient.id.toUpperCase()}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{patient.age} Years</span>
              <span>·</span>
              <span className="capitalize">{patient.sex}</span>
              <span>·</span>
              <span className="font-mono text-slate-300">{patient.weightKg} kg</span>
              <span>·</span>
              <span className="font-mono text-slate-300">{patient.heightCm} cm</span>
              <span>·</span>
              <span className="font-mono text-cyan-400">
                {conditionsCount} Medical Conditions · {prescriptionsCount} Past Rx Tracked
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddConditionOpen(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Medical Condition</span>
          </button>

          <button
            onClick={() => setIsAddPrescriptionOpen(true)}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Past Prescription</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Conditions & Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Pre-Existing Medical Conditions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Past &amp; Active Medical Conditions ({conditionsCount})</span>
            </h3>

            <button
              onClick={() => setIsAddConditionOpen(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-3">
            {patient.medicalConditions && patient.medicalConditions.length > 0 ? (
              patient.medicalConditions.map((cond) => (
                <div
                  key={cond.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                        <span>{cond.conditionName}</span>
                      </h4>
                      <span className="text-[11px] font-mono text-slate-400">
                        {cond.category} · Diagnosed {cond.diagnosisYear}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                        cond.severity === 'severe'
                          ? 'bg-rose-950/70 text-rose-300 border-rose-800'
                          : cond.severity === 'moderate'
                          ? 'bg-amber-950/70 text-amber-300 border-amber-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {cond.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded border border-slate-800/80">
                    {cond.clinicalNotes}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
                    <div className="text-[11px] text-cyan-300 font-medium">
                      <span className="text-slate-400">3D Dosing &amp; Formulation Impact: </span>
                      {cond.dosingImpact}
                    </div>

                    {cond.excipientRestriction && (
                      <div className="text-[11px] text-amber-300 flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>Restriction: {cond.excipientRestriction}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                No distinct chronic medical conditions recorded for this patient.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Previous Prescriptions & Treatment Effectiveness Tracking */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Pill className="w-4 h-4 text-cyan-400" />
              <span>Previous Prescriptions &amp; Treatment Effectiveness ({prescriptionsCount})</span>
            </h3>

            <button
              onClick={() => setIsAddPrescriptionOpen(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Log Rx</span>
            </button>
          </div>

          <div className="space-y-4">
            {patient.previousPrescriptions && patient.previousPrescriptions.length > 0 ? (
              patient.previousPrescriptions.map((rx) => {
                const badge = getEffectivenessBadge(rx.effectiveness);
                return (
                  <div
                    key={rx.id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-100">{rx.drugName}</h4>
                        <div className="text-xs font-mono text-cyan-400 font-medium">
                          Prescribed: {rx.prescribedDose}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Indication: {rx.indication} · Duration: {rx.startDate} {rx.endDate ? `to ${rx.endDate}` : '(Current)'}
                        </div>
                      </div>

                      {/* Effectiveness Rating Badge */}
                      <span className={`text-xs font-mono px-2.5 py-1 rounded-md border ${badge.classes}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Reported Adverse Reactions */}
                    {rx.adverseEffectsReported && rx.adverseEffectsReported.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-900/40 text-xs text-red-200 space-y-1">
                        <span className="font-semibold text-red-400 text-[11px] flex items-center gap-1.5 uppercase font-mono">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                          <span>Reported Adverse Drug Reactions &amp; Intolerance:</span>
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-300">
                          {rx.adverseEffectsReported.map((ae, idx) => (
                            <li key={idx}>{ae}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Clinical Outcome & Switch Rationale */}
                    <div className="text-xs space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="text-slate-400 font-medium">Clinical Outcome Evaluation: </span>
                        <span className="text-slate-200">{rx.clinicalOutcomeNotes}</span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-800/80">
                        <span className="text-cyan-400 font-medium">Why 3D Additive Formulation Is Required: </span>
                        <span className="text-slate-300">{rx.switchedToCustomRationale}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                No previous prescription history logged for this patient.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clinical Intelligence Card: Summary of Why 3D Printing Solves Historical Failures */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-800/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Clinical Intelligence Synthesis for {patient.name}</span>
          </div>

          <button
            onClick={onNavigateToCalculator}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <span>Proceed to Advanced Dosage Calculator</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Historical records confirm {patient.name} experiences acute intolerance and therapeutic failure with conventional commercial fixed strengths. In particular, fixed 500mg tablets trigger dysphagia due to physical dimensions and induce metabolic accumulation given their diabetic microvascular clearance limits.
          <br />
          <strong className="text-emerald-400">3D additive manufacturing delivers the clinical remedy:</strong> an exact 378 mg strength tablet engineered with a high-porosity ZipDose® rapid-melt matrix and sugar-free Kollidon® VA64 binder.
        </p>
      </div>

      {/* Modal: Add Medical Condition */}
      {isAddConditionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Add Medical Condition for {patient.name}</span>
              </h3>
              <button
                onClick={() => setIsAddConditionOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCondition} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Condition Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asthma (Moderate Persistent), Type 2 Diabetes"
                  value={newCondName}
                  onChange={(e) => setNewCondName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <select
                    value={newCondCategory}
                    onChange={(e) => setNewCondCategory(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Respiratory">Respiratory</option>
                    <option value="Endocrine & Metabolic">Endocrine &amp; Metabolic</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Renal & Hepatic">Renal &amp; Hepatic</option>
                    <option value="Neurological">Neurological</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Severity</label>
                  <select
                    value={newCondSeverity}
                    onChange={(e) => setNewCondSeverity(e.target.value as ConditionSeverity)}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                    <option value="controlled">Controlled</option>
                    <option value="in_remission">In Remission</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Year Diagnosed</label>
                <input
                  type="number"
                  min="1950"
                  max="2026"
                  value={newCondYear}
                  onChange={(e) => setNewCondYear(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Clinical Notes &amp; Symptoms</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Coughing reflex with large pills, HbA1c 7.6%"
                  value={newCondNotes}
                  onChange={(e) => setNewCondNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">3D Dosing &amp; Formulation Impact</label>
                <input
                  type="text"
                  placeholder="e.g. -10% clearance safety buffer; ZipDose porous rapid melt"
                  value={newCondDosingImpact}
                  onChange={(e) => setNewCondDosingImpact(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Excipient Restrictions (if any)</label>
                <input
                  type="text"
                  placeholder="e.g. 0% sugar/lactose; zero sulfites"
                  value={newCondExcipient}
                  onChange={(e) => setNewCondExcipient(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddConditionOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium"
                >
                  Save Condition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Previous Prescription */}
      {isAddPrescriptionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl my-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Pill className="w-4 h-4 text-cyan-400" />
                <span>Log Previous Prescription &amp; Treatment Effectiveness</span>
              </h3>
              <button
                onClick={() => setIsAddPrescriptionOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePrescription} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-300 mb-1">Drug Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Commercial Levetiracetam"
                    value={newRxDrugName}
                    onChange={(e) => setNewRxDrugName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-300 mb-1">Standard Fixed Strength (mg)</label>
                  <input
                    type="number"
                    min="10"
                    max="2000"
                    value={newRxFixedStrength}
                    onChange={(e) => setNewRxFixedStrength(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Prescribed Regimen / Dose</label>
                <input
                  type="text"
                  placeholder="e.g. 500 mg oral tablet once daily"
                  value={newRxDose}
                  onChange={(e) => setNewRxDose(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newRxStartDate}
                    onChange={(e) => setNewRxStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">End Date (or blank if ongoing)</label>
                  <input
                    type="date"
                    value={newRxEndDate}
                    onChange={(e) => setNewRxEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Clinical Indication</label>
                <input
                  type="text"
                  placeholder="e.g. Seizure prophylaxis, asthma bronchospasm"
                  value={newRxIndication}
                  onChange={(e) => setNewRxIndication(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold text-cyan-300">
                  Treatment Effectiveness Evaluation
                </label>
                <select
                  value={newRxEffectiveness}
                  onChange={(e) => setNewRxEffectiveness(e.target.value as TreatmentEffectiveness)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-cyan-800 rounded text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
                >
                  <option value="highly_effective">Highly Effective / Optimal Control</option>
                  <option value="moderate_control">Moderate Control</option>
                  <option value="suboptimal">Suboptimal Response</option>
                  <option value="ineffective">Ineffective / Therapeutic Failure</option>
                  <option value="intolerance_adverse_reaction">Intolerance &amp; Adverse Reaction (Indicates 3D Switch)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Reported Adverse Reactions (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Dysphagia, daytime somnolence, creatinine elevation"
                  value={newRxAdverseEffects}
                  onChange={(e) => setNewRxAdverseEffects(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Clinical Outcome Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Fixed commercial dose exceeded clearance capacity in diabetes..."
                  value={newRxOutcomeNotes}
                  onChange={(e) => setNewRxOutcomeNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold text-emerald-300">
                  Rationale for Switching to 3D Additive Compounding
                </label>
                <input
                  type="text"
                  placeholder="e.g. Requires 378 mg personalized strength with porous ZipDose rapid melt"
                  value={newRxSwitchRationale}
                  onChange={(e) => setNewRxSwitchRationale(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-emerald-800 rounded text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddPrescriptionOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium"
                >
                  Log Prescription Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
