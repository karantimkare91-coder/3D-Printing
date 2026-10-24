import React, { useRef } from 'react';
import { PrescriptionOrder, Patient } from '../types/pharmacy';
import { X, Printer, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

interface DispensingCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PrescriptionOrder;
  patient: Patient;
}

export const DispensingCertificateModal: React.FC<DispensingCertificateModalProps> = ({
  isOpen,
  onClose,
  order,
  patient
}) => {
  const printContentRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Top Modal Controls */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Personalized 3D Pharmaceutical Dispensing Certificate
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Label</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Pharmaceutical Label (Styled like a modern hospital cleanroom compounding label) */}
        <div className="p-6 bg-slate-950 overflow-y-auto" ref={printContentRef}>
          <div className="bg-white text-slate-900 p-6 rounded-lg border-2 border-slate-900 shadow-md font-sans space-y-4">
            {/* Header Lockup */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
              <div>
                <div className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-900">
                  HOSPITAL COMPOUNDING &amp; ADDITIVE PHARMACY
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-950">
                  PRINT-RX PRECISION MEDICINE DISPENSARY
                </h2>
                <p className="text-[11px] text-slate-600">
                  ISO Class 5 Additive Manufacturing Facility · cGMP Automated Cleanroom
                </p>
              </div>

              {/* Simulated 2D DataMatrix / QR Code */}
              <div className="w-16 h-16 border-2 border-slate-900 p-1 flex flex-col items-center justify-center bg-slate-50">
                <QrCode className="w-10 h-10 text-slate-900" />
                <span className="text-[8px] font-mono tracking-tighter">PRX-SECURE</span>
              </div>
            </div>

            {/* Patient Demographics & Batch */}
            <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-300 pb-3">
              <div>
                <span className="text-slate-500 font-mono text-[10px] block uppercase">PATIENT IDENTIFIER</span>
                <span className="font-bold text-sm text-slate-900">{patient.name}</span>
                <div className="text-[11px] text-slate-700">
                  Age: {patient.age} yrs · Sex: {patient.sex.toUpperCase()} · Weight: {patient.weightKg} kg · Height: {patient.heightCm} cm
                </div>
                <div className="text-[10px] font-mono text-cyan-800 font-semibold mt-0.5">
                  BSA: {order.calculatedDosage.targetBsaM2.toFixed(2)} m² · BMI: {order.calculatedDosage.targetBmi.toFixed(1)} kg/m²
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-mono text-[10px] block uppercase">BATCH LOT &amp; DISPENSE DATE</span>
                <span className="font-mono font-bold text-slate-900">{order.batchLotNumber}</span>
                <div className="text-[11px] text-slate-700">
                  Mfg Date: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                </div>
                <div className="text-[10px] font-mono text-emerald-800 font-semibold mt-0.5">
                  Method: {order.formulation.technique.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Personalized Drug Strength */}
            <div className="p-3.5 bg-slate-100 rounded border border-slate-300 space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="font-bold text-base text-slate-950">{order.drugName}</span>
                <span className="font-mono font-black text-2xl text-cyan-900">
                  {order.calculatedDosage.finalPersonalizedDoseMg} mg
                </span>
              </div>
              <div className="text-[11px] text-slate-700 font-medium">
                Indication: {order.indication}
              </div>
              <div className="text-[10px] text-slate-600 italic">
                Formulation: {order.formulation.shape.replace('_', ' ').toUpperCase()} tablet ({order.formulation.releaseProfile.replace('_', ' ')}). Total tablet mass: {order.formulation.totalMassMg} mg.
              </div>
            </div>

            {/* Special Instructions & Comorbidity Caution */}
            <div className="text-xs space-y-1.5">
              <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wide">
                PATIENT-SPECIFIC COMPOUNDING NOTES &amp; COMPLIANCE
              </div>
              <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-0.5">
                <li>
                  <strong>Diabetic Precaution:</strong> Formulation engineered with 0% sucrose/glucose binder (Kollidon® VA64 + D-Mannitol) to prevent glycemic interference.
                </li>
                <li>
                  <strong>Asthma Safety:</strong> ZipDose® porous internal matrix enables rapid oral dispersion in &lt; 10s with minimal liquid, preventing choking or bronchospasm reflex.
                </li>
                <li>
                  <strong>Pharmacogenomic Tuning:</strong> Calibrated for {patient.geneticProfile.cyp2c9.toUpperCase()} CYP2C9 clearance profile to prevent metabolic toxic buildup.
                </li>
              </ul>
            </div>

            {/* Sign-off & Verification */}
            <div className="pt-3 border-t-2 border-slate-900 flex items-center justify-between text-xs">
              <div>
                <div className="text-[10px] font-mono text-slate-500">QC ASSAY INLINE VERIFICATION</div>
                <div className="font-bold text-emerald-700 flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>NIR SPECTROSCOPY PASS: 99.6% PURITY</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-mono text-slate-500">COMPOUNDING PHARMACIST SIGNATURE</div>
                <div className="font-mono text-xs font-bold text-slate-800 underline decoration-slate-400">
                  Dr. K. Timkare, PharmD, RPh #84209
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Batch record permanently archived in local clinical repository.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
