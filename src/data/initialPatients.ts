import { Patient } from '../types/pharmacy';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pt-baseline-001',
    name: 'Maya Chen (Reference Baseline - Healthy Control)',
    age: 18,
    sex: 'female',
    weightKg: 45,
    heightCm: 135,
    pastMedicalHistory: [],
    medicalConditions: [],
    previousPrescriptions: [],
    allergies: ['No Known Drug Allergies (NKDA)'],
    geneticProfile: {
      cyp2d6: 'extensive',
      cyp2c19: 'extensive',
      cyp2c9: 'extensive',
      cyp3a4: 'extensive',
      cyp3a5: 'non_expresser',
      cyp1a2: 'extensive',
      cyp2b6: 'extensive',
      cyp4f2: 'normal',
      ugt1a1: 'extensive',
      tpmt: 'normal',
      nudt15: 'normal',
      dpyd: 'normal',
      vkorc1: 'normal_sensitive',
      nat2: 'rapid',
      g6pd: 'normal',
      slco1b1: 'normal',
      abcg2: 'normal',
      hla_b_5701: 'negative',
      hla_b_1502: 'negative',
      hla_a_3101: 'negative',
      notes: 'Wild-type normal metabolic clearance profile (*1/*1).'
    },
    serumCreatinineMgDl: 0.75,
    notes: 'Reference baseline patient: completely healthy control with 0 comorbidities, standard 250 mg baseline for 45 kg / 135 cm.'
  },
  {
    id: 'pt-target-002',
    name: 'Arthur Vance (Target Patient - 97 kg, 177 cm)',
    age: 54,
    sex: 'male',
    weightKg: 97,
    heightCm: 177,
    pastMedicalHistory: [],
    medicalConditions: [],
    previousPrescriptions: [],
    allergies: ['No Known Drug Allergies (NKDA)'],
    geneticProfile: {
      cyp2d6: 'extensive',
      cyp2c19: 'extensive',
      cyp2c9: 'extensive',
      cyp3a4: 'extensive',
      cyp3a5: 'non_expresser',
      cyp1a2: 'extensive',
      cyp2b6: 'extensive',
      cyp4f2: 'normal',
      ugt1a1: 'extensive',
      tpmt: 'normal',
      nudt15: 'normal',
      dpyd: 'normal',
      vkorc1: 'normal_sensitive',
      nat2: 'rapid',
      g6pd: 'normal',
      slco1b1: 'normal',
      abcg2: 'normal',
      hla_b_5701: 'negative',
      hla_b_1502: 'negative',
      hla_a_3101: 'negative',
      notes: 'Wild-type normal metabolic clearance profile (*1/*1 across all profiled pharmacogenes).'
    },
    serumCreatinineMgDl: 0.95,
    notes: 'Target test case: 97 kg, 177 cm. Starts totally healthy by default with 0% comorbidity deductions. Add or select any diseases to test pharmacokinetic & 3D formulation adjustments.'
  },
  {
    id: 'pt-pediatric-003',
    name: 'Leo Thorne (Pediatric Neurology)',
    age: 7,
    sex: 'male',
    weightKg: 22,
    heightCm: 118,
    pastMedicalHistory: ['Pediatric Absence Epilepsy', 'Sensory Texture Aversion / Dysphagia'],
    medicalConditions: [
      {
        id: 'cond-p01',
        conditionName: 'Pediatric Absence Epilepsy',
        category: 'Neurological',
        diagnosisYear: 2023,
        severity: 'moderate',
        clinicalNotes: 'Frequent 10-15 second absence seizures during school hours.',
        dosingImpact: 'Requires precise 120 mg pediatric micro-strength. Cannot swallow standard tablets.',
        excipientRestriction: 'Porous ZipDose® orally disintegrating matrix without water.'
      }
    ],
    previousPrescriptions: [
      {
        id: 'rx-prev-p01',
        drugName: 'Compounded Liquid Levetiracetam Solution 100mg/mL',
        prescribedDose: '1.2 mL (120 mg) twice daily',
        standardFixedStrengthMg: 100,
        startDate: '2024-01-05',
        endDate: '2024-06-20',
        indication: 'Seizure control',
        effectiveness: 'suboptimal',
        adverseEffectsReported: [
          'Extreme taste aversion & spitting out medication',
          'Measurement errors with oral dosing syringe'
        ],
        clinicalOutcomeNotes: 'Caregivers struggled with liquid dosing accuracy. Child refused bitter liquid taste, leading to missed doses and breakthrough staring spells.',
        switchedToCustomRationale: 'Ideal indication for SPRITAM®-like 3D printed rapid-melt tablet that dissolves on tongue in 5 seconds with zero taste stress.'
      }
    ],
    allergies: ['NKDA'],
    geneticProfile: {
      cyp2d6: 'extensive',
      cyp2c19: 'poor',
      cyp2c9: 'extensive',
      slco1b1: 'normal',
      notes: 'Requires exact pediatric micro-dosing and fast dispersion (ZipDose).'
    },
    serumCreatinineMgDl: 0.5,
    notes: 'Candidate for SPRITAM® equivalent 3D-printed fast melt tablet < 8 seconds.'
  },
  {
    id: 'pt-geriatric-004',
    name: 'Eleanor Vance-Shaw (Geriatric Complex)',
    age: 78,
    sex: 'female',
    weightKg: 62,
    heightCm: 158,
    pastMedicalHistory: [
      'Type 2 Diabetes Mellitus', 
      'Chronic Kidney Disease (Stage 3a)', 
      'Congestive Heart Failure (NYHA II)',
      'Osteoarthritis',
      'Parkinsonism / Pill Swallowing Dysphagia'
    ],
    medicalConditions: [
      {
        id: 'cond-g01',
        conditionName: 'Chronic Kidney Disease (Stage 3a)',
        category: 'Renal & Hepatic',
        diagnosisYear: 2019,
        severity: 'moderate',
        clinicalNotes: 'eGFR 46 mL/min/1.73m². Serum creatinine 1.45 mg/dL. Decreased tubular secretion.',
        dosingImpact: 'Requires -25% dose clearance reduction to avoid toxic drug retention.'
      },
      {
        id: 'cond-g02',
        conditionName: 'Congestive Heart Failure (NYHA II)',
        category: 'Cardiovascular',
        diagnosisYear: 2020,
        severity: 'moderate',
        clinicalNotes: 'Left ventricular ejection fraction 42%. Slower systemic circulation.',
        dosingImpact: '-12% clearance & fluid retention avoidance.'
      },
      {
        id: 'cond-g03',
        conditionName: 'Parkinsonism / Pill Swallowing Dysphagia',
        category: 'Neurological',
        diagnosisYear: 2022,
        severity: 'moderate',
        clinicalNotes: 'Frequent choking episodes on hard tablets.',
        dosingImpact: 'Requires ZipDose rapid melt matrix < 6 seconds.'
      }
    ],
    previousPrescriptions: [
      {
        id: 'rx-prev-g01',
        drugName: 'Conventional Metformin 850mg Commercial Tablets',
        prescribedDose: '850 mg once daily',
        standardFixedStrengthMg: 850,
        startDate: '2021-08-01',
        endDate: '2023-11-12',
        indication: 'Diabetes mellitus',
        effectiveness: 'intolerance_adverse_reaction',
        adverseEffectsReported: [
          'Lactic acidosis warning sign / extreme fatigue',
          'Declining eGFR due to drug accumulation'
        ],
        clinicalOutcomeNotes: 'High fixed 850 mg strength was inappropriate for Stage 3 CKD. Discontinued by nephrologist.',
        switchedToCustomRationale: 'Requires 3D printed low-strength 320 mg modified release tablet safely matching renal clearance.'
      }
    ],
    allergies: ['Penicillins'],
    geneticProfile: {
      cyp2d6: 'poor',
      cyp2c19: 'intermediate',
      cyp2c9: 'poor',
      slco1b1: 'intermediate',
      notes: 'Reduced phase 1 oxidation; impaired tubular elimination.'
    },
    serumCreatinineMgDl: 1.45,
    notes: 'Requires dual-compartment polypill with sustained release profile.'
  }
];

export const AVAILABLE_DRUGS = [
  {
    id: 'levetiracetam',
    name: 'Levetiracetam (SPRITAM® 3D Platform)',
    defaultReferenceDoseMg: 250,
    indication: 'Antiepileptic / Partial-Onset Seizures',
    therapeuticWindow: 'Wide',
    referencePlatform: 'ZipDose® Powder-bed Jetting'
  },
  {
    id: 'paracetamol',
    name: 'Paracetamol / Acetaminophen',
    defaultReferenceDoseMg: 250,
    indication: 'Analgesic & Antipyretic',
    therapeuticWindow: 'Standard',
    referencePlatform: 'Semi-Solid Extrusion / FDM'
  },
  {
    id: 'theophylline',
    name: 'Theophylline (Bronchodilator Asthma Core)',
    defaultReferenceDoseMg: 200,
    indication: 'Asthma / COPD Airway Relaxation',
    therapeuticWindow: 'Narrow (10-20 mcg/mL)',
    referencePlatform: 'Multi-layer Pulsatile Tablet'
  },
  {
    id: 'montelukast',
    name: 'Montelukast Sodium (Asthma Leukotriene Blocker)',
    defaultReferenceDoseMg: 10,
    indication: 'Asthma Prophylaxis & Allergic Rhinitis',
    therapeuticWindow: 'Standard',
    referencePlatform: 'ZipDose® Rapid-Melt Porous Matrix'
  },
  {
    id: 'metformin_extended',
    name: 'Metformin HCl (Diabetic Glycemic Control)',
    defaultReferenceDoseMg: 500,
    indication: 'Type 2 Diabetes Glycemic Regulation',
    therapeuticWindow: 'Moderate',
    referencePlatform: 'Erosion Matrix Semi-Solid (Sugar-Free)'
  },
  {
    id: 'glipizide',
    name: 'Glipizide (2nd Gen Sulfonylurea - PGx Sensitive)',
    defaultReferenceDoseMg: 5,
    indication: 'Type 2 Diabetes Pancreatic Insulin Release',
    therapeuticWindow: 'Narrow-Moderate (CYP2C9)',
    referencePlatform: 'Osmotic Torus 3D Tablet'
  },
  {
    id: 'warfarin',
    name: 'Warfarin Sodium (Precision Anticoagulant)',
    defaultReferenceDoseMg: 5,
    indication: 'Thromboembolism & DVT Prophylaxis',
    therapeuticWindow: 'Very Narrow (INR 2.0-3.0, CYP2C9)',
    referencePlatform: 'Precision Piezo Inkjet Micro-Dose'
  },
  {
    id: 'lisinopril',
    name: 'Lisinopril (ACE Inhibitor Antihypertensive)',
    defaultReferenceDoseMg: 10,
    indication: 'Hypertension, Heart Failure, Post-MI',
    therapeuticWindow: 'Moderate',
    referencePlatform: 'Multi-Compartment Extrusion Polypill'
  },
  {
    id: 'amlodipine',
    name: 'Amlodipine Besylate (Calcium Channel Blocker)',
    defaultReferenceDoseMg: 5,
    indication: 'Hypertension & Chronic Stable Angina',
    therapeuticWindow: 'Standard',
    referencePlatform: 'Zero-Order Sustained Extrusion'
  },
  {
    id: 'losartan',
    name: 'Losartan Potassium (Angiotensin Receptor Blocker)',
    defaultReferenceDoseMg: 50,
    indication: 'Hypertension & Diabetic Nephropathy',
    therapeuticWindow: 'Standard',
    referencePlatform: 'Biphasic Core-Shell Print'
  },
  {
    id: 'atorvastatin',
    name: 'Atorvastatin Calcium (HMG-CoA Reductase Statin)',
    defaultReferenceDoseMg: 20,
    indication: 'Hypercholesterolemia & Atherosclerosis',
    therapeuticWindow: 'Standard (SLCO1B1 Transporter)',
    referencePlatform: 'Bi-Layer Lipid Polypill'
  },
  {
    id: 'carvedilol',
    name: 'Carvedilol (Dual Alpha/Beta Blocker)',
    defaultReferenceDoseMg: 12.5,
    indication: 'Congestive Heart Failure & Hypertension',
    therapeuticWindow: 'Narrow-Moderate (CYP2D6)',
    referencePlatform: 'Syringe Semi-Solid Micro-Deposition'
  },
  {
    id: 'hydrochlorothiazide',
    name: 'Hydrochlorothiazide (Thiazide Diuretic)',
    defaultReferenceDoseMg: 25,
    indication: 'Hypertension & Peripheral Edema',
    therapeuticWindow: 'Standard',
    referencePlatform: 'Dual-Nozzle Combination Layer'
  },
  {
    id: 'prednisolone',
    name: 'Prednisolone (Corticosteroid Tapering Platform)',
    defaultReferenceDoseMg: 20,
    indication: 'Severe Asthma Flare & Systemic Inflammation',
    therapeuticWindow: 'Moderate',
    referencePlatform: 'Programmable Density Gradient 3D'
  },
  {
    id: 'aspirin',
    name: 'Aspirin (Cardioprotective / Anti-inflammatory)',
    defaultReferenceDoseMg: 150,
    indication: 'Cardiovascular Protection & Antiplatelet',
    therapeuticWindow: 'Moderate',
    referencePlatform: '3D Controlled Release Porous Lattice'
  },
  {
    id: 'omeprazole',
    name: 'Omeprazole (Delayed-Release PPI Core)',
    defaultReferenceDoseMg: 20,
    indication: 'GERD & Peptic Acid Suppression',
    therapeuticWindow: 'Standard (CYP2C19)',
    referencePlatform: 'Enteric-Coated 3D Concentric Ring'
  },
  {
    id: 'gabapentin',
    name: 'Gabapentin (Neuropathic Analgesic Caplet)',
    defaultReferenceDoseMg: 300,
    indication: 'Diabetic Neuropathy & Post-Herpetic Pain',
    therapeuticWindow: 'Wide',
    referencePlatform: 'High-Volume Porous Caplet 3D'
  },
  {
    id: 'ciprofloxacin',
    name: 'Ciprofloxacin HCl (Broad-Spectrum Fluoroquinolone)',
    defaultReferenceDoseMg: 250,
    indication: 'Complicated Bacterial Infections',
    therapeuticWindow: 'Moderate',
    referencePlatform: 'Semi-Solid Extrusion Paste'
  },
  {
    id: 'ibuprofen',
    name: 'Ibuprofen (Fast-Acting NSAID Porous Melt)',
    defaultReferenceDoseMg: 200,
    indication: 'Acute Musculoskeletal Pain & Inflammation',
    therapeuticWindow: 'Standard',
    referencePlatform: 'ZipDose® High-Porosity Fast Dispersing'
  },
  {
    id: 'sertraline',
    name: 'Sertraline HCl (SSRI Antidepressant)',
    defaultReferenceDoseMg: 50,
    indication: 'Major Depressive Disorder & Panic Disorder',
    therapeuticWindow: 'Moderate (CYP2C19/CYP2D6)',
    referencePlatform: 'Hot-Melt FDM Filament Extrusion'
  },
  {
    id: 'furosemide',
    name: 'Furosemide (Potent Loop Diuretic)',
    defaultReferenceDoseMg: 40,
    indication: 'Edema, Congestive Heart Failure, Hepatic Cirrhosis',
    therapeuticWindow: 'Standard-Narrow',
    referencePlatform: 'Biphasic Core-Shell Rapid Extrusion'
  },
  {
    id: 'levothyroxine',
    name: 'Levothyroxine Sodium (Thyroid Hormone T4)',
    defaultReferenceDoseMg: 0.1, // 100 mcg
    indication: 'Hypothyroidism & TSH Suppression Therapy',
    therapeuticWindow: 'Narrow (Microgram Range)',
    referencePlatform: 'Precision Piezo Inkjet Micro-Dose'
  },
  {
    id: 'clopidogrel',
    name: 'Clopidogrel Bisulfate (P2Y12 Antiplatelet)',
    defaultReferenceDoseMg: 75,
    indication: 'Acute Coronary Syndrome & Stroke Prevention',
    therapeuticWindow: 'Moderate (CYP2C19 Bioactivation)',
    referencePlatform: '3D Controlled Release Porous Lattice'
  },
  {
    id: 'spironolactone',
    name: 'Spironolactone (Aldosterone Receptor Antagonist)',
    defaultReferenceDoseMg: 25,
    indication: 'Heart Failure, Resistant Hypertension, Edema',
    therapeuticWindow: 'Standard',
    referencePlatform: 'Semi-Solid Extrusion Paste'
  }
];
