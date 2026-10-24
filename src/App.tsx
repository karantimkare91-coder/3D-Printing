import React, { useState, useEffect, useMemo } from 'react';
import { Patient, PrescriptionOrder, TabletFormulation, PosologyRule, BiologicalSex } from './types/pharmacy';
import { INITIAL_PATIENTS, AVAILABLE_DRUGS } from './data/initialPatients';
import { calculatePersonalizedDosage, generatePrintableFormulation } from './utils/pharmacokinetics';
import { sliceTabletGeometry } from './utils/slicer';
import { Header } from './components/Header';
import { AdvancedDosageCalculator } from './components/AdvancedDosageCalculator';
import { PatientHistoryTracker } from './components/PatientHistoryTracker';
import { ThreeDPillViewer } from './components/ThreeDPillViewer';
import { PrintingChamberSimulation } from './components/PrintingChamberSimulation';
import { PatientManagerModal } from './components/PatientManagerModal';
import { DispensingCertificateModal } from './components/DispensingCertificateModal';
import { GCodeViewerModal } from './components/GCodeViewerModal';
import { PdfGuideSection } from './components/PdfGuideSection';
import { 
  Users, Pill, CheckCircle2, ArrowRight, Printer, RefreshCw, 
  ExternalLink, FileCode, Layers, Sparkles, Activity, History, Stethoscope, Check
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'calculator' | 'history' | 'cad' | 'printing' | 'pdf_guide'>('calculator');

  // Patients Data (persisted in localStorage with schema v4)
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('printrx_patients_db_v4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse stored patients', e);
      }
    }
    return INITIAL_PATIENTS;
  });

  // Active Selected Patient: Default to Arthur Vance (the Target Patient in user prompt)
  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    return 'pt-target-002'; // Arthur Vance: 97 kg, 177 cm
  });

  // Active Drug & Reference Baseline Settings (NOW FULLY EDITABLE)
  const [selectedDrugId, setSelectedDrugId] = useState<string>('levetiracetam');
  const [baselineDoseMg, setBaselineDoseMg] = useState<number>(250); // Editable (prompt: 250 mg)
  const [baselineWeightKg, setBaselineWeightKg] = useState<number>(45); // Editable (prompt: 45 kg)
  const [baselineHeightCm, setBaselineHeightCm] = useState<number>(135); // Editable (prompt: 135 cm)
  const [baselineAge, setBaselineAge] = useState<number>(18); // Editable
  const [baselineSex, setBaselineSex] = useState<BiologicalSex>('female'); // Editable
  
  // Posology Rule Selected
  const [activePosologyRule, setActivePosologyRule] = useState<PosologyRule>('bsa_catzel_mosteller');

  // Modals
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isGCodeModalOpen, setIsGCodeModalOpen] = useState(false);

  // Print simulation status
  const [printStatus, setPrintStatus] = useState<'idle' | 'printing' | 'completed'>('idle');

  // Sync patients to localStorage
  useEffect(() => {
    localStorage.setItem('printrx_patients_db_v4', JSON.stringify(patients));
  }, [patients]);

  const activePatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  const activeDrug = useMemo(() => {
    return AVAILABLE_DRUGS.find(d => d.id === selectedDrugId) || AVAILABLE_DRUGS[0];
  }, [selectedDrugId]);

  // Dynamic Pharmacokinetic & Posology Dosage Calculation
  const calculatedDosage = useMemo(() => {
    return calculatePersonalizedDosage({
      baselineDoseMg,
      baselineWeightKg,
      baselineHeightCm,
      baselineAge,
      baselineSex,
      targetPatient: activePatient,
      posologyRule: activePosologyRule
    });
  }, [baselineDoseMg, baselineWeightKg, baselineHeightCm, baselineAge, baselineSex, activePatient, activePosologyRule]);

  // 3D Printable Formulation & Excipient Breakdown
  const formulation: TabletFormulation = useMemo(() => {
    return generatePrintableFormulation(activePatient, calculatedDosage.finalPersonalizedDoseMg);
  }, [activePatient, calculatedDosage.finalPersonalizedDoseMg]);

  // Batch identification
  const currentBatchId = useMemo(() => {
    return `PRX-${activePatient.weightKg}${activePatient.heightCm}-${activePatient.id.slice(-3)}`;
  }, [activePatient]);

  // Prescription Order
  const prescriptionOrder: PrescriptionOrder = useMemo(() => {
    return {
      id: `ord-${currentBatchId}`,
      patientId: activePatient.id,
      drugName: activeDrug.name,
      indication: activeDrug.indication,
      batchLotNumber: currentBatchId,
      calculatedDosage,
      formulation,
      status: printStatus === 'completed' ? 'quality_approved' : printStatus === 'printing' ? 'printing' : 'formulated',
      createdAt: new Date().toISOString()
    };
  }, [currentBatchId, activePatient, activeDrug, calculatedDosage, formulation, printStatus]);

  // Machine G-Code Package
  const gcodePackage = useMemo(() => {
    return sliceTabletGeometry(formulation, activePatient, currentBatchId);
  }, [formulation, activePatient, currentBatchId]);

  // Handlers
  const handleSavePatient = (patient: Patient) => {
    setPatients((prev) => {
      const idx = prev.findIndex(p => p.id === patient.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = patient;
        return copy;
      }
      return [patient, ...prev];
    });
    setSelectedPatientId(patient.id);
  };

  const handleUpdatePatientRecord = (updatedPatient: Patient) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
  };

  const handleUpdateComorbidities = (comorbidities: string[]) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === activePatient.id ? { ...p, pastMedicalHistory: comorbidities } : p))
    );
  };

  const handleUpdateGenetics = (genetics: Patient['geneticProfile']) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === activePatient.id ? { ...p, geneticProfile: genetics } : p))
    );
  };

  const handleUpdateBiometrics = (weightKg: number, heightCm: number, age: number, sex?: BiologicalSex) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === activePatient.id ? { ...p, weightKg, heightCm, age, ...(sex ? { sex } : {}) } : p))
    );
  };

  const handleResetBaseline = () => {
    setBaselineDoseMg(250);
    setBaselineWeightKg(45);
    setBaselineHeightCm(135);
    setBaselineAge(18);
    setBaselineSex('female');
    setSelectedDrugId('levetiracetam');
  };

  const handleDrugSelectionChange = (newDrug: string) => {
    const drug = AVAILABLE_DRUGS.find(d => d.id === newDrug || d.name === newDrug);
    if (drug) {
      setSelectedDrugId(drug.id);
      setBaselineDoseMg(drug.defaultReferenceDoseMg);
    }
  };

  const handleMakeTargetHealthy = () => {
    handleUpdateComorbidities([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* 3-Zone Top Navigation Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewPatientModal={() => {
          setEditingPatient(null);
          setIsPatientModalOpen(true);
        }}
        printStatus={printStatus}
      />

      {/* Patient Selection & Quick Benchmark Strip */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Patient Profile:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {patients.map((p) => {
              const isSelected = p.id === selectedPatientId;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPatientId(p.id);
                    setPrintStatus('idle');
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-600/20 border-cyan-500 text-cyan-200 font-semibold shadow-xs'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>{p.name.split(' ')[0]} {p.name.split(' ')[1] || ''}</span>
                  <span className="font-mono text-[10px] text-slate-500">
                    ({p.weightKg}kg / {p.heightCm}cm)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Helper Actions for User Scenario & Healthy Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleMakeTargetHealthy}
            title="Clear all diseases and test 100% healthy target patient scaling"
            className="px-2.5 py-1 text-[11px] font-mono text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800 rounded transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3 h-3" />
            <span>Make Target Healthy</span>
          </button>

          <button
            onClick={() => {
              setEditingPatient(activePatient);
              setIsPatientModalOpen(true);
            }}
            className="text-[11px] text-slate-400 hover:text-cyan-300 underline font-mono ml-1"
          >
            Edit Biometrics
          </button>
        </div>
      </div>

      {/* Main Body Viewports */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Prescription Selection & Patient Status Banner (NOW WITH 20 TABLETS) */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-300">Prescribed Drug:</span>
              <select
                value={selectedDrugId}
                onChange={(e) => handleDrugSelectionChange(e.target.value)}
                className="px-3 py-1 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-100 font-medium focus:outline-none focus:border-cyan-500 max-w-xs sm:max-w-md"
              >
                {AVAILABLE_DRUGS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.defaultReferenceDoseMg} mg default)
                  </option>
                ))}
              </select>
            </div>

            <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Patient:</span>
              <strong className="text-slate-200">{activePatient.name}</strong>
              <span className="text-slate-600">·</span>
              <span>{activePatient.age} yrs</span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-cyan-300">{activePatient.weightKg} kg</span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-cyan-300">{activePatient.heightCm} cm</span>
            </div>
          </div>

          {/* Target personalized strength readout */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">
                CALIBRATED 3D STRENGTH
              </span>
              <span className="text-xl font-mono font-bold text-emerald-400">
                {calculatedDosage.finalPersonalizedDoseMg} mg
              </span>
            </div>

            <button
              onClick={() => setActiveTab('printing')}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>3D Print Machine</span>
            </button>
          </div>
        </div>

        {/* TAB 1: ADVANCED DOSING ENGINE & 3D TABLET CAD (Split Layout) */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: Pharmacokinetic & Posology Calculation & Comorbidity Modifiers */}
            <div className="xl:col-span-7">
              <AdvancedDosageCalculator
                patient={activePatient}
                patients={patients}
                onSelectPatient={setSelectedPatientId}
                calculatedDosage={calculatedDosage}
                formulation={formulation}
                activeDrugName={activeDrug.name}
                baselineDoseMg={baselineDoseMg}
                baselineWeightKg={baselineWeightKg}
                baselineHeightCm={baselineHeightCm}
                baselineAge={baselineAge}
                baselineSex={baselineSex}
                activePosologyRule={activePosologyRule}
                onPosologyRuleChange={setActivePosologyRule}
                onDrugChange={handleDrugSelectionChange}
                onBaselineDoseChange={setBaselineDoseMg}
                onBaselineWeightChange={setBaselineWeightKg}
                onBaselineHeightChange={setBaselineHeightCm}
                onBaselineAgeChange={setBaselineAge}
                onBaselineSexChange={setBaselineSex}
                onResetBaseline={handleResetBaseline}
                onDispatchToPrinter={() => setActiveTab('printing')}
                onUpdatePatientComorbidities={handleUpdateComorbidities}
                onUpdatePatientGenetics={handleUpdateGenetics}
                onUpdatePatientBiometrics={handleUpdateBiometrics}
              />
            </div>

            {/* Right 5 Columns: Interactive 3D CAD Pill Viewer with Slicing Inspector */}
            <div className="xl:col-span-5 h-[580px]">
              <ThreeDPillViewer
                formulation={formulation}
                patientName={activePatient.name}
                activeDrugName={activeDrug.name}
                targetDoseMg={calculatedDosage.finalPersonalizedDoseMg}
              />
            </div>
          </div>
        )}

        {/* TAB 2: PATIENT CLINICAL HISTORY & TREATMENT EFFECTIVENESS TRACKER */}
        {activeTab === 'history' && (
          <PatientHistoryTracker
            patient={activePatient}
            onUpdatePatient={handleUpdatePatientRecord}
            onNavigateToCalculator={() => setActiveTab('calculator')}
          />
        )}

        {/* TAB 3: FULL-WIDTH 3D TABLET CAD & SLICER */}
        {activeTab === 'cad' && (
          <div className="space-y-6">
            <div className="h-[620px]">
              <ThreeDPillViewer
                formulation={formulation}
                patientName={activePatient.name}
                activeDrugName={activeDrug.name}
                targetDoseMg={calculatedDosage.finalPersonalizedDoseMg}
              />
            </div>

            {/* Slicing & Formulation Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs font-mono uppercase text-slate-400">Tablet Geometry</span>
                <div className="text-base font-semibold text-slate-200">
                  {formulation.shape.replace('_', ' ').toUpperCase()}
                </div>
                <p className="text-xs text-slate-400">
                  Diameter: {formulation.diameterMm} mm · Height: {formulation.heightMm} mm · Total Mass: {formulation.totalMassMg} mg
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs font-mono uppercase text-slate-400">Additive Slicing</span>
                <div className="text-base font-semibold text-cyan-400 font-mono">
                  {formulation.layerCount} Layers @ {formulation.layerThicknessMm} mm
                </div>
                <p className="text-xs text-slate-400">
                  Toolpath G-Code generated with in-line IR drying dwell cycles.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs font-mono uppercase text-slate-400">Porosity &amp; Release</span>
                <div className="text-base font-semibold text-emerald-400 font-mono">
                  {formulation.porosityPercent}% Voids · &lt; {formulation.estimatedDisintegrationSec}s Disintegration
                </div>
                <p className="text-xs text-slate-400">
                  ZipDose® rapid-melt capillary channels optimized for asthmatic tolerance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 3D PRINTING MACHINE CONSOLE */}
        {activeTab === 'printing' && (
          <div className="space-y-6">
            <PrintingChamberSimulation
              order={prescriptionOrder}
              patient={activePatient}
              gcodePackage={gcodePackage}
              onPrintComplete={() => setPrintStatus('completed')}
              onOpenLabelModal={() => setIsLabelModalOpen(true)}
              onOpenGCodeModal={() => setIsGCodeModalOpen(true)}
            />

            {/* Cleanroom Facility Showcase Anchor with Generated Image */}
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 p-5 flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-64 h-40 rounded-lg overflow-hidden shrink-0 border border-slate-800 bg-slate-950">
                <img
                  src="/src/assets/images/pharma_3d_printer_1791176714596.jpg"
                  alt="Sterile pharmaceutical 3D printing compounding cleanroom"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-cyan-400 font-mono font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Point-of-Care Compounding Cleanroom Unit</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-100">
                  Aprecia ZipDose® &amp; Bio-Jet Semi-Solid Additive Platform
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Equipped with dual micro-metering piezo printheads, non-thermal binder deposition, and continuous real-time Process Analytical Technology (PAT). Formulations are verified for content uniformity before physical release to ensure strict USP &lt;905&gt; clinical compliance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: EDUCATIONAL PDF GUIDE & ZIPDOSE® REFERENCE */}
        {activeTab === 'pdf_guide' && (
          <PdfGuideSection />
        )}
      </main>

      {/* Modals */}
      <PatientManagerModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSavePatient={handleSavePatient}
        initialPatient={editingPatient}
      />

      <DispensingCertificateModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        order={prescriptionOrder}
        patient={activePatient}
      />

      <GCodeViewerModal
        isOpen={isGCodeModalOpen}
        onClose={() => setIsGCodeModalOpen(false)}
        gcodePackage={gcodePackage}
        batchId={currentBatchId}
      />
    </div>
  );
}
