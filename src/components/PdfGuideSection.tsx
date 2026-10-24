import React from 'react';
import { BookOpen, Layers, CheckCircle2, AlertTriangle, Sparkles, Shield, Cpu } from 'lucide-react';

export const PdfGuideSection: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Hero Showcase with Generated Clinical Photography */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>PHARMACY PROJECT REFERENCE SPECIFICATION</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              3D Printing in Personalized Medicine
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Additive manufacturing builds pharmaceutical dosage forms layer by layer from a computer-aided digital design. Unlike conventional fixed-strength manufacturing where mass batches produce standard strengths (e.g. only 250mg or 500mg), 3D printing customizes <strong>dose, geometry, release kinetics, porosity, and chemical composition</strong> for individual patient biometrics, comorbidities, and genetic profiles.
            </p>

            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300">
              <span className="text-slate-500 block text-[10px] uppercase">Core Academic Viva Principle:</span>
              “3D printing in pharmacy is an additive manufacturing technique that builds medicines layer by layer from a digital design, allowing potential customization of dose, shape, drug combinations and release characteristics.”
            </div>
          </div>

          <div className="lg:col-span-5 h-64 lg:h-full relative overflow-hidden bg-slate-950">
            <img
              src="/src/assets/images/printed_personalized_tablets_1791176730043.jpg"
              alt="Personalized 3D printed pharmaceutical tablets and porous ZipDose geometry"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent lg:bg-gradient-to-r lg:from-slate-900 lg:to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-4 text-[11px] font-mono text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
              ZipDose® High-Porosity Rapid-Melt &amp; Bi-Layer Microstructure
            </div>
          </div>
        </div>
      </div>

      {/* 6-Stage Working Process from Document */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>The 6-Stage Pharmaceutical 3D Printing Workflow</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              step: '01',
              title: 'Patient & Prescription Data',
              desc: 'Biometrics (Weight, Height, BSA, BMI), clinical comorbidities (Asthma, Diabetes), and PGx genotypes define exact dosage needs.'
            },
            {
              step: '02',
              title: 'Digital 3D CAD Design',
              desc: 'Computer-aided design computes tablet volume, external shape (cylindrical, oblong, torus), and internal honeycomb porosity infill.'
            },
            {
              step: '03',
              title: 'Formulation & Excipient Selection',
              desc: 'Active drug + patient-safe excipients (diabetic-safe sugar-free polymer Kollidon VA64, asthma superdisintegrants).'
            },
            {
              step: '04',
              title: 'Layer-by-Layer 3D Deposition',
              desc: 'Piezo drop-on-demand binder jetting or semi-solid syringe extruder deposits and solidifies material per digital G-code instructions.'
            },
            {
              step: '05',
              title: 'Post-Processing & PAT Testing',
              desc: 'In-line Near-Infrared (NIR) spectroscopic assay checks content uniformity, mass verification (USP <905>), and hardness.'
            },
            {
              step: '06',
              title: 'Patient-Specific Dispensing',
              desc: 'Validated personalized medicine supplied at exact calibrated strength with custom dissolution profile.'
            }
          ].map((item) => (
            <div key={item.step} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-cyan-400 font-bold">{item.step}. STAGE</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <h4 className="text-xs font-semibold text-slate-200">{item.title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ZipDose® Technology Spotlight (SPRITAM® FDA Model) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              ZipDose® Technology (Aprecia / SPRITAM®)
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ZipDose® is the proprietary powder-bed 3D printing technology that produced <strong>SPRITAM® (levetiracetam)</strong>, the first FDA-approved 3D-printed prescription tablet. It selectively binds powder layers without heavy mechanical compression.
          </p>
          <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
            <li>Rapid disintegration within &lt; 10 seconds with a sip of water.</li>
            <li>Enables ultra-high drug loading (up to 1,000 mg active API).</li>
            <li>Invaluable for dysphagic, pediatric, geriatric, or asthmatic patients.</li>
          </ul>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Major 3D-Printing Techniques in Pharmacy
            </h3>
          </div>
          <div className="text-xs space-y-2 text-slate-300">
            <div>
              <strong className="text-cyan-300 font-medium">Binder Jetting / Powder-Bed:</strong> Liquid binder selectively joins powder particles. Ideal for porous fast-melt tablets.
            </div>
            <div>
              <strong className="text-cyan-300 font-medium">Semi-Solid Extrusion (SSE):</strong> Gels or pastes extruded through a syringe nozzle at ambient temperatures. Ideal for polypills.
            </div>
            <div>
              <strong className="text-cyan-300 font-medium">Fused Deposition Modeling (FDM):</strong> Thermoplastic drug-loaded polymer filament melted layer-by-layer for sustained release.
            </div>
          </div>
        </div>
      </div>

      {/* Comparison: Conventional Fixed Dose vs 3D-Printed Personalized Approach */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-100">
          Personalized Medicine vs Conventional Fixed-Dose Comparison
        </h3>

        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 font-mono text-[11px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Feature</th>
                <th className="p-3">Conventional Fixed-Dose Approach</th>
                <th className="p-3 text-cyan-300">3D-Printed Personalized Approach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-[11px]">
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-semibold text-slate-200">Dose</td>
                <td className="p-3 text-slate-400">Selected from fixed commercial stock (e.g. 250 mg or 500 mg only).</td>
                <td className="p-3 text-cyan-300 font-mono">Digitally tailored to exact mg (e.g. 378.0 mg).</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-semibold text-slate-200">Manufacturing</td>
                <td className="p-3 text-slate-400">Large-scale batch production with tablet presses.</td>
                <td className="p-3 text-cyan-300">Point-of-care digital small-batch additive deposition.</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-semibold text-slate-200">Drug Combinations</td>
                <td className="p-3 text-slate-400">Separate pills or rigid fixed-dose combinations.</td>
                <td className="p-3 text-cyan-300">Single personalized multi-compartment polypill.</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-semibold text-slate-200">Shape &amp; Release</td>
                <td className="p-3 text-slate-400">Limited predefined standard compression molds.</td>
                <td className="p-3 text-cyan-300">Custom geometry, porous lattice, and pulsatile release.</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-semibold text-slate-200">Comorbidity Fit</td>
                <td className="p-3 text-slate-400">High risk of underdosing or toxic accumulation.</td>
                <td className="p-3 text-cyan-300">Zero sugar for diabetics, rapid melt for asthmatics.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
