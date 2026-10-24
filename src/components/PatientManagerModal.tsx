import React, { useState } from 'react';
import { Patient, BiologicalSex, MetabolizerPhenotype } from '../types/pharmacy';
import { X, UserPlus, Check, User, Activity, Dna, AlertCircle } from 'lucide-react';
import { calculateBmi, calculateBsaMosteller } from '../utils/pharmacokinetics';

interface PatientManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePatient: (patient: Patient) => void;
  initialPatient?: Patient | null;
}

const COMMON_CONDITIONS = [
  'Asthma (Moderate-Severe)',
  'Type 2 Diabetes Mellitus',
  'Type 1 Diabetes Mellitus',
  'Essential Hypertension',
  'Chronic Kidney Disease (Stage 3)',
  'Chronic Kidney Disease (Stage 4)',
  'Chronic Obstructive Pulmonary Disease (COPD)',
  'Congestive Heart Failure (NYHA II/III)',
  'Hepatic Impairment / NAFLD / Cirrhosis',
  'Coronary Artery Disease (CAD / Post-MI)',
  'Parkinsonism / Pill Swallowing Dysphagia',
  'Gastroesophageal Reflux Disease (GERD)',
  'Atrial Fibrillation',
  'Osteoarthritis',
  'Rheumatoid Arthritis (Autoimmune)',
  'Dyslipidemia / Hypercholesterolemia',
  'Hypothyroidism (Hashimoto\'s)',
  'Pediatric Absence Epilepsy',
  'None / Healthy Reference Control'
];

export const PatientManagerModal: React.FC<PatientManagerModalProps> = ({
  isOpen,
  onClose,
  onSavePatient,
  initialPatient
}) => {
  const [name, setName] = useState(initialPatient?.name || '');
  const [age, setAge] = useState(initialPatient?.age || 45);
  const [sex, setSex] = useState<BiologicalSex>(initialPatient?.sex || 'male');
  const [weightKg, setWeightKg] = useState(initialPatient?.weightKg || 97);
  const [heightCm, setHeightCm] = useState(initialPatient?.heightCm || 177);
  const [history, setHistory] = useState<string[]>(initialPatient?.pastMedicalHistory || ['Asthma (Moderate Persistent)', 'Type 2 Diabetes Mellitus']);
  const [allergiesText, setAllergiesText] = useState(initialPatient?.allergies.join(', ') || 'Sulfites, Aspirin');
  
  // Genetics
  const [cyp2c9, setCyp2c9] = useState<MetabolizerPhenotype>(initialPatient?.geneticProfile.cyp2c9 || 'extensive');
  const [cyp2d6, setCyp2d6] = useState<MetabolizerPhenotype>(initialPatient?.geneticProfile.cyp2d6 || 'extensive');
  const [cyp2c19, setCyp2c19] = useState<MetabolizerPhenotype>(initialPatient?.geneticProfile.cyp2c19 || 'extensive');
  const [cyp3a4, setCyp3a4] = useState<MetabolizerPhenotype>(initialPatient?.geneticProfile.cyp3a4 || 'extensive');
  const [slco1b1, setSlco1b1] = useState<'normal' | 'intermediate' | 'poor'>(initialPatient?.geneticProfile.slco1b1 || 'normal');
  const [dpyd, setDpyd] = useState<'normal' | 'intermediate' | 'poor'>(initialPatient?.geneticProfile.dpyd || 'normal');
  const [vkorc1, setVkorc1] = useState<'normal_sensitive' | 'intermediate_sensitive' | 'high_sensitive'>(initialPatient?.geneticProfile.vkorc1 || 'normal_sensitive');
  const [notes, setNotes] = useState(initialPatient?.notes || '');

  if (!isOpen) return null;

  const currentBsa = calculateBsaMosteller(heightCm, weightKg);
  const currentBmi = calculateBmi(heightCm, weightKg);

  const toggleCondition = (cond: string) => {
    if (cond.includes('None')) {
      setHistory(['None / Healthy Reference']);
      return;
    }
    const cleanHistory = history.filter(h => !h.includes('None'));
    if (cleanHistory.includes(cond)) {
      const filtered = cleanHistory.filter(h => h !== cond);
      setHistory(filtered.length === 0 ? ['None / Healthy Reference'] : filtered);
    } else {
      setHistory([...cleanHistory, cond]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPatient: Patient = {
      id: initialPatient ? initialPatient.id : `pt-${Date.now()}`,
      name: name.trim(),
      age: Number(age),
      sex,
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      pastMedicalHistory: history,
      medicalConditions: initialPatient?.medicalConditions || history.map((h, i) => ({
        id: `cond-init-${i}`,
        conditionName: h,
        category: h.toLowerCase().includes('asthma') ? 'Respiratory' : h.toLowerCase().includes('diabetes') ? 'Endocrine & Metabolic' : 'Other',
        diagnosisYear: 2022,
        severity: 'moderate',
        clinicalNotes: 'Documented in medical records.',
        dosingImpact: h.toLowerCase().includes('diabetes') ? '-10% renal buffer, sugar-free' : h.toLowerCase().includes('asthma') ? 'ZipDose rapid melt' : 'Standard clearance'
      })),
      previousPrescriptions: initialPatient?.previousPrescriptions || [],
      allergies: allergiesText.split(',').map(s => s.trim()).filter(Boolean),
      geneticProfile: {
        ...(initialPatient?.geneticProfile || {
          cyp2d6: 'extensive',
          cyp2c19: 'extensive',
          cyp2c9: 'extensive',
          slco1b1: 'normal'
        }),
        cyp2c9,
        cyp2d6,
        cyp2c19,
        cyp3a4,
        slco1b1,
        dpyd,
        vkorc1,
        notes: `Profile recorded on ${new Date().toLocaleDateString()}`
      },
      serumCreatinineMgDl: 1.1,
      notes: notes.trim()
    };

    onSavePatient(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                {initialPatient ? 'Edit Patient Biometrics & Genetics' : 'Register New Patient Record'}
              </h3>
              <p className="text-xs text-slate-400">
                Store clinical history and pharmacogenomic profile for 3D additive dosing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Biometrics Row */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Biometric Demographics</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-300 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arthur Vance"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Biological Sex</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as BiologicalSex)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  step="0.5"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Height (cm)</label>
                <input
                  type="number"
                  min="40"
                  max="250"
                  step="0.5"
                  required
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {/* Calculated Biometric Readout */}
            <div className="mt-2.5 p-2 rounded-md bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>Derived BSA (Mosteller): <strong className="text-cyan-400">{currentBsa.toFixed(2)} m²</strong></span>
              <span>Derived BMI: <strong className="text-cyan-400">{currentBmi.toFixed(1)} kg/m²</strong></span>
            </div>
          </div>

          {/* Past History & Comorbidities */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Past Medical History &amp; Comorbidities</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMMON_CONDITIONS.map((cond) => {
                const selected = history.includes(cond);
                return (
                  <button
                    type="button"
                    key={cond}
                    onClick={() => toggleCondition(cond)}
                    className={`p-2 rounded-md text-left text-xs transition-colors border flex items-center justify-between ${
                      selected
                        ? 'bg-cyan-950/50 border-cyan-600 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{cond}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-2">
              <label className="block text-xs text-slate-300 mb-1">Known Allergies / Sensitivities</label>
              <input
                type="text"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="e.g. Sulfites, Aspirin, Penicillin"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Pharmacogenomic Genetic Profile */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pharmacogenomics (PGx) Metabolizer Phenotypes</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">CYP2C9</label>
                <select
                  value={cyp2c9}
                  onChange={(e) => setCyp2c9(e.target.value as MetabolizerPhenotype)}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="extensive">Extensive (Normal)</option>
                  <option value="intermediate">Intermediate (*1/*3)</option>
                  <option value="poor">Poor (*3/*3)</option>
                  <option value="ultrarapid">Ultrarapid</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">CYP2D6</label>
                <select
                  value={cyp2d6}
                  onChange={(e) => setCyp2d6(e.target.value as MetabolizerPhenotype)}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="extensive">Extensive (Normal)</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="poor">Poor</option>
                  <option value="ultrarapid">Ultrarapid</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">CYP2C19</label>
                <select
                  value={cyp2c19}
                  onChange={(e) => setCyp2c19(e.target.value as MetabolizerPhenotype)}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="extensive">Extensive (Normal)</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="poor">Poor</option>
                  <option value="ultrarapid">Ultrarapid</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">CYP3A4</label>
                <select
                  value={cyp3a4}
                  onChange={(e) => setCyp3a4(e.target.value as MetabolizerPhenotype)}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="extensive">Extensive (Normal)</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="poor">Poor</option>
                  <option value="ultrarapid">Ultrarapid</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">SLCO1B1</label>
                <select
                  value={slco1b1}
                  onChange={(e) => setSlco1b1(e.target.value as 'normal' | 'intermediate' | 'poor')}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="normal">Normal</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">DPYD</label>
                <select
                  value={dpyd}
                  onChange={(e) => setDpyd(e.target.value as 'normal' | 'intermediate' | 'poor')}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="normal">Normal</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="poor">Poor (Toxicity Alert)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">VKORC1</label>
                <select
                  value={vkorc1}
                  onChange={(e) => setVkorc1(e.target.value as any)}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="normal_sensitive">Normal Sensitive</option>
                  <option value="intermediate_sensitive">Intermediate</option>
                  <option value="high_sensitive">High Sensitive (-20%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-sm"
            >
              Save Patient &amp; Recalculate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
