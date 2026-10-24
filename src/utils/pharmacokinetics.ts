import { 
  Patient, CalculatedDosage, TabletFormulation, TabletShape, 
  PrintingTechnique, ReleaseProfile, PosologyRule, PosologyComparisonEntry 
} from '../types/pharmacy';

/**
 * Calculates Body Surface Area (BSA) using the Mosteller Formula:
 * BSA (m²) = sqrt([Height (cm) x Weight (kg)] / 3600)
 */
export function calculateBsaMosteller(heightCm: number, weightKg: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  return Math.sqrt((heightCm * weightKg) / 3600);
}

/**
 * Calculates Body Surface Area (BSA) using the Du Bois & Du Bois Formula:
 * BSA (m²) = 0.007184 x Height (cm)^0.725 x Weight (kg)^0.425
 */
export function calculateBsaDuBois(heightCm: number, weightKg: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  return 0.007184 * Math.pow(heightCm, 0.725) * Math.pow(weightKg, 0.425);
}

/**
 * Calculates Body Mass Index (BMI):
 * BMI = Weight (kg) / (Height (m))²
 */
export function calculateBmi(heightCm: number, weightKg: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

/**
 * Calculates Ideal Body Weight (IBW) using Devine Formula
 */
export function calculateIbw(heightCm: number, sex: 'male' | 'female' | 'other'): number {
  const heightInches = heightCm / 2.54;
  const inchesOver5Feet = Math.max(0, heightInches - 60);
  const base = sex === 'female' ? 45.5 : 50.0;
  return base + 2.3 * inchesOver5Feet;
}

/**
 * Calculates Adjusted Body Weight (ABW) for patients with BMI >= 25:
 * ABW = IBW + 0.4 * (Actual Weight - IBW)
 */
export function calculateAbw(weightKg: number, ibwKg: number): number {
  if (weightKg <= ibwKg) return weightKg;
  return ibwKg + 0.4 * (weightKg - ibwKg);
}

/**
 * Calculates Cockcroft-Gault Creatinine Clearance (eGFR proxy)
 */
export function calculateCreatinineClearance(
  age: number,
  weightKg: number,
  serumCreatinineMgDl: number = 0.9,
  sex: 'male' | 'female' | 'other'
): number {
  if (serumCreatinineMgDl <= 0) return 100;
  const rawCrCl = ((140 - age) * weightKg) / (72 * serumCreatinineMgDl);
  return sex === 'female' ? rawCrCl * 0.85 : rawCrCl;
}

export interface DosageInputOptions {
  baselineDoseMg?: number;
  baselineWeightKg?: number;
  baselineHeightCm?: number;
  baselineAge?: number;
  baselineSex?: 'male' | 'female' | 'other';
  targetPatient: Patient;
  posologyRule?: PosologyRule;
  customComorbidityAdjustmentPercent?: number;
}

/**
 * Comprehensive catalog of supported past medical conditions and diseases
 * with their physiological impact on PK and 3D printing formulations.
 */
export const CLINICAL_DISEASE_LIBRARY = [
  {
    id: 'asthma',
    name: 'Asthma (Moderate-Severe)',
    category: 'Respiratory',
    clearanceModifier: 0,
    pkImpact: 'Airway hyper-reactivity; requires rapid-melt oral dispersion without aspiration.',
    formulationImpact: 'ZipDose® porous micro-channels (<10s melt); 0% sulfites, tartrazine, or bronchospasmic preservatives.'
  },
  {
    id: 'type2_diabetes',
    name: 'Type 2 Diabetes Mellitus',
    category: 'Endocrine & Metabolic',
    clearanceModifier: -10,
    pkImpact: 'Renal microvascular clearance attenuation & glycogen binding shift.',
    formulationImpact: 'Strictly 0% sucrose, glucose, or lactose; non-glycemic copovidone (Kollidon® VA64) + D-Mannitol matrix.'
  },
  {
    id: 'type1_diabetes',
    name: 'Type 1 Diabetes Mellitus',
    category: 'Endocrine & Metabolic',
    clearanceModifier: -12,
    pkImpact: 'Brittle glycemic fluctuations; strict clearance protection.',
    formulationImpact: 'Zero-glycemic polymer matrix.'
  },
  {
    id: 'hypertension',
    name: 'Essential Hypertension',
    category: 'Cardiovascular',
    clearanceModifier: -3,
    pkImpact: 'Elevated systemic vascular resistance and hemodynamic volume adaptation.',
    formulationImpact: 'Controlled erosion zero-order release.'
  },
  {
    id: 'ckd_stage3',
    name: 'Chronic Kidney Disease (Stage 3)',
    category: 'Renal & Hepatic',
    clearanceModifier: -20,
    pkImpact: 'Reduced glomerular filtration (CrCl 30-59 mL/min); high accumulation risk.',
    formulationImpact: 'Micro-dose accuracy to avoid nephrotoxic accumulation.'
  },
  {
    id: 'ckd_stage4',
    name: 'Chronic Kidney Disease (Stage 4)',
    category: 'Renal & Hepatic',
    clearanceModifier: -35,
    pkImpact: 'Severe glomerular clearance deficit (CrCl 15-29 mL/min).',
    formulationImpact: 'Substantial strength reduction with extended interval.'
  },
  {
    id: 'copd',
    name: 'Chronic Obstructive Pulmonary Disease (COPD)',
    category: 'Respiratory',
    clearanceModifier: -5,
    pkImpact: 'Chronic hypoxia; altered pulmonary first-pass metabolism.',
    formulationImpact: 'High-porosity rapid disintegrating oral tablet.'
  },
  {
    id: 'chf',
    name: 'Congestive Heart Failure (NYHA II/III)',
    category: 'Cardiovascular',
    clearanceModifier: -12,
    pkImpact: 'Reduced cardiac output, decreased renal perfusion, and altered volume of distribution.',
    formulationImpact: 'Sodium-free excipient formulation to prevent fluid retention.'
  },
  {
    id: 'hepatic_impairment',
    name: 'Hepatic Impairment / NAFLD / Cirrhosis',
    category: 'Renal & Hepatic',
    clearanceModifier: -15,
    pkImpact: 'Impaired Phase I cytochrome P450 oxidation and reduced serum albumin binding.',
    formulationImpact: 'Hydrophilic binder; avoidance of hepatotoxic plasticizers.'
  },
  {
    id: 'cad',
    name: 'Coronary Artery Disease (CAD / Post-MI)',
    category: 'Cardiovascular',
    clearanceModifier: -5,
    pkImpact: 'Cardiovascular safety buffer; steady-state avoidance of Cmax peaks.',
    formulationImpact: 'Smooth dissolution curve to prevent tachycardia spikes.'
  },
  {
    id: 'parkinsons_dysphagia',
    name: 'Parkinsonism / Pill Swallowing Dysphagia',
    category: 'Neurological',
    clearanceModifier: 0,
    pkImpact: 'Severe impaired swallowing reflex; extreme choking risk on standard pills.',
    formulationImpact: 'ZipDose® ultra-porous rapid disintegration (< 6 seconds) with zero liquid needed.'
  },
  {
    id: 'gerd',
    name: 'Gastroesophageal Reflux Disease (GERD)',
    category: 'Gastrointestinal',
    clearanceModifier: 0,
    pkImpact: 'Gastric acid hyper-secretion and esophageal mucosa vulnerability.',
    formulationImpact: 'Enteric concentric coating to bypass gastric degradation.'
  },
  {
    id: 'atrial_fibrillation',
    name: 'Atrial Fibrillation',
    category: 'Cardiovascular',
    clearanceModifier: -4,
    pkImpact: 'Irregular ventricular response; sensitive antiarrhythmic/anticoagulant window.',
    formulationImpact: 'Multi-layer polypill combining rate control and antiplatelet.'
  },
  {
    id: 'osteoarthritis',
    name: 'Osteoarthritis',
    category: 'Musculoskeletal',
    clearanceModifier: 0,
    pkImpact: 'Chronic joint inflammation; chronic pain management.',
    formulationImpact: 'Extended 12-hour steady zero-order erosion matrix.'
  },
  {
    id: 'rheumatoid_arthritis',
    name: 'Rheumatoid Arthritis (Autoimmune)',
    category: 'Musculoskeletal',
    clearanceModifier: -4,
    pkImpact: 'Systemic inflammatory cytokine circulation altering protein binding.',
    formulationImpact: 'Anti-inflammatory biocompatible polymer carrier.'
  },
  {
    id: 'dyslipidemia',
    name: 'Dyslipidemia / Hypercholesterolemia',
    category: 'Endocrine & Metabolic',
    clearanceModifier: 0,
    pkImpact: 'Elevated atherogenic lipoproteins; hepatic statin transporter interplay.',
    formulationImpact: 'Multi-compartment polypill formulation.'
  },
  {
    id: 'hypothyroidism',
    name: 'Hypothyroidism (Hashimoto\'s)',
    category: 'Endocrine & Metabolic',
    clearanceModifier: -5,
    pkImpact: 'Slowed basal metabolic rate and delayed gastric emptying.',
    formulationImpact: 'Fast-dispersing core to accelerate absorption.'
  },
  {
    id: 'epilepsy',
    name: 'Pediatric Absence Epilepsy',
    category: 'Neurological',
    clearanceModifier: 0,
    pkImpact: 'Sudden neurological absence seizures; refusal of bitter syrups.',
    formulationImpact: 'SPRITAM®-style fast oral melt with pleasant taste-masking.'
  },
  {
    id: 'esrd',
    name: 'End-Stage Renal Disease (ESRD / Dialysis)',
    category: 'Renal & Hepatic',
    clearanceModifier: -45,
    pkImpact: 'Near-zero intrinsic glomerular filtration; extreme drug retention hazard.',
    formulationImpact: 'Requires micro-dosed precision print with extended 48h clearance spacing.'
  },
  {
    id: 'peptic_ulcer',
    name: 'Peptic Ulcer Disease (PUD / Gastric Erosion)',
    category: 'Gastrointestinal',
    clearanceModifier: 0,
    pkImpact: 'Vulnerable gastric mucosa prone to irritation from non-encapsulated APIs.',
    formulationImpact: 'Concentric core-shell print with pH-resistant enteric polymer barrier.'
  },
  {
    id: 'crohns_ibd',
    name: 'Crohn\'s Disease / Inflammatory Bowel Disease',
    category: 'Gastrointestinal',
    clearanceModifier: -5,
    pkImpact: 'Patchy intestinal transmural inflammation and variable oral bioavailability.',
    formulationImpact: 'Colon-targeted delayed pulsatile release geometry.'
  },
  {
    id: 'gout_hyperuricemia',
    name: 'Gout & Hyperuricemia',
    category: 'Musculoskeletal',
    clearanceModifier: -3,
    pkImpact: 'Uric acid crystal deposition in renal tubules; avoid nephrotoxic additives.',
    formulationImpact: 'Alkaline-compatible excipient matrix to prevent crystallization.'
  },
  {
    id: 'allergic_rhinitis',
    name: 'Allergic Rhinitis / Chronic Atopy',
    category: 'Respiratory',
    clearanceModifier: 0,
    pkImpact: 'Histaminergic hyper-responsiveness and nasal mucosal edema.',
    formulationImpact: 'High-porosity sublingual fast-dissolve tablet (< 5 seconds).'
  },
  {
    id: 'bronchiectasis',
    name: 'Bronchiectasis / Chronic Bronchial Dilatation',
    category: 'Respiratory',
    clearanceModifier: -4,
    pkImpact: 'Impaired mucociliary clearance and recurrent lower respiratory infections.',
    formulationImpact: 'Dispersible smooth swallow matrix without aspiration powder dust.'
  },
  {
    id: 'fatty_liver_nafld',
    name: 'Non-Alcoholic Steatohepatitis (NASH / NAFLD)',
    category: 'Renal & Hepatic',
    clearanceModifier: -8,
    pkImpact: 'Hepatic steatosis reducing microsomal enzyme reserve and protein binding.',
    formulationImpact: 'Lipid-free, water-soluble pharmaceutical polymer binder (PVA/PVP).'
  },
  {
    id: 'alzheimers_dysphagia',
    name: 'Alzheimer\'s Disease with Dysphagia',
    category: 'Neurological',
    clearanceModifier: 0,
    pkImpact: 'Cognitive swallowing apraxia and high resistance to swallowing big pills.',
    formulationImpact: 'ZipDose® ultra-fast dissolve porous matrix (< 5s on tongue without water).'
  },
  {
    id: 'peripheral_artery_disease',
    name: 'Peripheral Artery Disease (PAD / Claudication)',
    category: 'Cardiovascular',
    clearanceModifier: -4,
    pkImpact: 'Systemic atherosclerotic vascular stiffening and peripheral perfusion lag.',
    formulationImpact: 'Multi-layer sustained release to maintain constant antiplatelet plasma levels.'
  },
  {
    id: 'osteoporosis',
    name: 'Severe Osteoporosis',
    category: 'Musculoskeletal',
    clearanceModifier: 0,
    pkImpact: 'Bone mineral density loss; requires high esophageal transit velocity.',
    formulationImpact: 'Ultra-smooth hydrophilic coat preventing esophageal adhesion and ulcers.'
  }
];

/**
 * Advanced Pharmacokinetic Dosing Engine grounded in Pharmaceutical Posology
 * Computes doses using classical and modern posology rules:
 * - Mosteller / Catzel BSA Rule (Gold Standard)
 * - Clark's Weight Rule
 * - Allometric Exponent Rule (Kleiber / West)
 * - Young's Pediatric Rule
 * - Dilling's Rule
 * - Cowling's Rule
 * - Fried's Infant Rule
 */
export function calculatePersonalizedDosage(options: DosageInputOptions): CalculatedDosage {
  const baselineDose = options.baselineDoseMg ?? 250;
  const baselineWeight = options.baselineWeightKg ?? 45;
  const baselineHeight = options.baselineHeightCm ?? 135;
  const patient = options.targetPatient;
  const activeRule: PosologyRule = options.posologyRule ?? 'bsa_catzel_mosteller';

  // 1. Calculate Comprehensive Biometrics
  const baselineBsa = calculateBsaMosteller(baselineHeight, baselineWeight);
  const baselineBsaDuBois = calculateBsaDuBois(baselineHeight, baselineWeight);
  const targetBsa = calculateBsaMosteller(patient.heightCm, patient.weightKg);
  const targetBsaDuBois = calculateBsaDuBois(patient.heightCm, patient.weightKg);
  const targetBmi = calculateBmi(patient.heightCm, patient.weightKg);
  const targetIbw = calculateIbw(patient.heightCm, patient.sex);
  const targetAbw = calculateAbw(patient.weightKg, targetIbw);
  const targetCrCl = calculateCreatinineClearance(
    patient.age,
    patient.weightKg,
    patient.serumCreatinineMgDl || 1.0,
    patient.sex
  );

  // 2. Compute Individual Posology Rules
  // Rule 1: Body Surface Area / Catzel's Rule (Mosteller BSA)
  const bsaRatio = baselineBsa > 0 ? targetBsa / baselineBsa : 1.0;
  const bsaScaledDose = baselineDose * bsaRatio;

  // Rule 1b: Du Bois & Du Bois BSA Rule
  const bsaDuBoisRatio = baselineBsaDuBois > 0 ? targetBsaDuBois / baselineBsaDuBois : 1.0;
  const bsaDuBoisScaledDose = baselineDose * bsaDuBoisRatio;

  // Rule 2: Clark's Weight Rule: Dose = (W_target / W_base) * Dose_base
  const clarkRatio = baselineWeight > 0 ? patient.weightKg / baselineWeight : 1.0;
  const clarkScaledDose = baselineDose * clarkRatio;

  // Rule 3: Allometric Scaling (W_target / W_base)^0.75 * Dose_base
  const allometricRatio = baselineWeight > 0 ? Math.pow(patient.weightKg / baselineWeight, 0.75) : 1.0;
  const allometricScaledDose = baselineDose * allometricRatio;

  // Rule 4: Young's Rule (for Age 1-12y, or pedagogical pediatric index)
  // Dose = (Age / [Age + 12]) * Adult_Dose (assuming baseline is reference adult/young adult)
  const youngFactor = patient.age > 0 ? patient.age / (patient.age + 12) : 0.5;
  const youngScaledDose = baselineDose * youngFactor;

  // Rule 5: Dilling's Rule (Age / 20 * Dose)
  const dillingFactor = patient.age > 0 ? patient.age / 20 : 0.5;
  const dillingScaledDose = baselineDose * dillingFactor;

  // Rule 6: Cowling's Rule ([Age + 1] / 24 * Dose)
  const cowlingFactor = (patient.age + 1) / 24;
  const cowlingScaledDose = baselineDose * cowlingFactor;

  // Rule 7: Fried's Rule (Age in months / 150 * Dose)
  const ageMonths = patient.age * 12;
  const friedFactor = ageMonths / 150;
  const friedScaledDose = baselineDose * friedFactor;

  // 3. Comorbidity Clearance Modifiers (Clinical Posology Pathological Factor)
  let comorbidityModifier = 0;
  const comorbidityReasons: string[] = [];

  const rawConditions = [
    ...(patient.pastMedicalHistory || []),
    ...(patient.medicalConditions?.map(c => c.conditionName) || [])
  ].map(c => c.toLowerCase());

  // Foolproof check for completely healthy target patient
  const actualDiseases = rawConditions.filter(c => 
    !c.includes('healthy') && !c.includes('none') && !c.includes('no comorbidities') && c.trim() !== ''
  );
  const isTargetHealthy = actualDiseases.length === 0;

  if (isTargetHealthy) {
    comorbidityReasons.push('Target patient is completely healthy (0% comorbidity deduction). Nominal posological scaling applied.');
  } else {
    const hasDiabetesT2 = actualDiseases.some(c => c.includes('type 2 diabetes') || (c.includes('diabetes') && !c.includes('type 1')));
    const hasDiabetesT1 = actualDiseases.some(c => c.includes('type 1 diabetes'));
    const hasAsthma = actualDiseases.some(c => c.includes('asthma'));
    const hasCopd = actualDiseases.some(c => c.includes('copd') || c.includes('obstructive pulmonary'));
    const hasEsrd = actualDiseases.some(c => c.includes('esrd') || c.includes('dialysis') || c.includes('end-stage'));
    const hasCkdStage4 = actualDiseases.some(c => c.includes('ckd stage 4') || c.includes('stage 4'));
    const hasCkdStage3 = actualDiseases.some(c => c.includes('ckd') || c.includes('kidney') || c.includes('renal')) && !hasCkdStage4 && !hasEsrd;
    const hasChf = actualDiseases.some(c => c.includes('heart failure') || c.includes('chf'));
    const hasHepatic = actualDiseases.some(c => c.includes('hepatic') || c.includes('liver') || c.includes('cirrhosis') || c.includes('nafld'));
    const hasFattyLiver = actualDiseases.some(c => c.includes('nash') || c.includes('steatohepatitis'));
    const hasHypertension = actualDiseases.some(c => c.includes('hypertension') || c.includes('high blood pressure'));
    const hasParkinsons = actualDiseases.some(c => c.includes('parkinson') || c.includes('dysphagia') || c.includes('swallowing'));
    const hasHypothyroid = actualDiseases.some(c => c.includes('hypothyroid') || c.includes('hashimoto'));
    const hasCrohns = actualDiseases.some(c => c.includes('crohn') || c.includes('inflammatory bowel') || c.includes('ibd'));
    const hasGout = actualDiseases.some(c => c.includes('gout') || c.includes('hyperuricemia'));
    const hasBronchiectasis = actualDiseases.some(c => c.includes('bronchiectasis'));
    const hasPad = actualDiseases.some(c => c.includes('peripheral artery') || c.includes('claudication') || c.includes('pad'));

    if (hasDiabetesT2) {
      comorbidityModifier -= 10;
      comorbidityReasons.push('Type 2 Diabetes (-10%): Renal microvascular clearance buffer; requires 0% sugar-free copovidone binder.');
    }
    if (hasDiabetesT1) {
      comorbidityModifier -= 12;
      comorbidityReasons.push('Type 1 Diabetes (-12%): Glycemic instability precaution; zero-sugar matrix.');
    }
    if (hasAsthma) {
      comorbidityReasons.push('Asthma: Formulation adapted to ZipDose® porous rapid-melt matrix (<10s) without sulfites to prevent choking or bronchospasm.');
    }
    if (hasCopd) {
      comorbidityModifier -= 5;
      comorbidityReasons.push('COPD (-5%): Hypoxic metabolism precaution & rapid oral dispersion.');
    }
    if (hasEsrd) {
      comorbidityModifier -= 45;
      comorbidityReasons.push('End-Stage Renal Disease (-45%): Dialysis dependency requires severe strength reduction to prevent toxicity.');
    } else if (hasCkdStage4) {
      comorbidityModifier -= 35;
      comorbidityReasons.push('CKD Stage 4 (-35%): Severe filtration impairment (CrCl < 30 mL/min).');
    } else if (hasCkdStage3 || targetCrCl < 60) {
      comorbidityModifier -= 20;
      comorbidityReasons.push(`Renal Impairment (-20%): CrCl ${targetCrCl.toFixed(0)} mL/min necessitates filtration dose reduction.`);
    }
    if (hasChf) {
      comorbidityModifier -= 12;
      comorbidityReasons.push('Congestive Heart Failure (-12%): Reduced cardiac output and renal perfusion.');
    }
    if (hasHepatic) {
      comorbidityModifier -= 15;
      comorbidityReasons.push('Hepatic Impairment (-15%): Decreased Phase I microsomal CYP functionalization.');
    } else if (hasFattyLiver) {
      comorbidityModifier -= 8;
      comorbidityReasons.push('Fatty Liver NASH (-8%): Reduced microsomal metabolic functionalization.');
    }
    if (hasHypertension && targetBmi > 30) {
      comorbidityModifier -= 3;
      comorbidityReasons.push('Hypertension with Obesity (-3%): Hemodynamic vascular resistance calibration.');
    }
    if (hasParkinsons) {
      comorbidityReasons.push('Dysphagia / Parkinsonism: High-porosity rapid disintegration < 6s without liquid requirement.');
    }
    if (hasHypothyroid) {
      comorbidityModifier -= 5;
      comorbidityReasons.push('Hypothyroidism (-5%): Decreased basal metabolic rate.');
    }
    if (hasCrohns) {
      comorbidityModifier -= 5;
      comorbidityReasons.push('Crohn\'s Disease / IBD (-5%): Mucosal inflammation altering GI absorption.');
    }
    if (hasGout) {
      comorbidityModifier -= 3;
      comorbidityReasons.push('Gout (-3%): Renal tubular crystal protection.');
    }
    if (hasBronchiectasis) {
      comorbidityModifier -= 4;
      comorbidityReasons.push('Bronchiectasis (-4%): Pulmonary clearance accommodation.');
    }
    if (hasPad) {
      comorbidityModifier -= 4;
      comorbidityReasons.push('Peripheral Artery Disease (-4%): Vascular perfusion resistance.');
    }
  }

  if (options.customComorbidityAdjustmentPercent !== undefined) {
    comorbidityModifier = options.customComorbidityAdjustmentPercent;
  }

  // 4. Pharmacogenomic Modifiers (Posological Idiosyncrasy Factor)
  let geneticModifier = 0;
  const geneticReasons: string[] = [];

  // CYP2C9
  if (patient.geneticProfile.cyp2c9 === 'poor') {
    geneticModifier -= 25;
    geneticReasons.push('CYP2C9 Poor Metabolizer (-25%): Severe hepatic clearance deficiency of NSAIDs, sulfonylureas, warfarin.');
  } else if (patient.geneticProfile.cyp2c9 === 'intermediate') {
    geneticModifier -= 6;
    geneticReasons.push('CYP2C9 Intermediate Metabolizer (-6%): Mild enzymatic reduction.');
  } else if (patient.geneticProfile.cyp2c9 === 'ultrarapid') {
    geneticModifier += 15;
    geneticReasons.push('CYP2C9 Ultrarapid Metabolizer (+15%): Accelerated clearance requiring compensatory strength.');
  }

  // CYP2D6
  if (patient.geneticProfile.cyp2d6 === 'poor') {
    geneticModifier -= 20;
    geneticReasons.push('CYP2D6 Poor Metabolizer (-20%): Deficient phase I oxidation of beta-blockers, opioids, and psychotropics.');
  } else if (patient.geneticProfile.cyp2d6 === 'intermediate') {
    geneticModifier -= 8;
    geneticReasons.push('CYP2D6 Intermediate Metabolizer (-8%): Partial enzymatic function.');
  } else if (patient.geneticProfile.cyp2d6 === 'ultrarapid') {
    geneticModifier += 15;
    geneticReasons.push('CYP2D6 Ultrarapid Metabolizer (+15%): Rapid conversion / hyper-clearance.');
  }

  // CYP2C19
  if (patient.geneticProfile.cyp2c19 === 'poor') {
    geneticModifier -= 15;
    geneticReasons.push('CYP2C19 Poor Metabolizer (-15%): Diminished clopidogrel bio-activation & delayed PPI clearance.');
  } else if (patient.geneticProfile.cyp2c19 === 'intermediate') {
    geneticModifier -= 5;
    geneticReasons.push('CYP2C19 Intermediate Metabolizer (-5%): Moderate reduction in prodrug conversion.');
  } else if (patient.geneticProfile.cyp2c19 === 'ultrarapid') {
    geneticModifier += 10;
    geneticReasons.push('CYP2C19 Ultrarapid Metabolizer (+10%): Rapid PPI breakdown.');
  }

  // CYP3A4
  if (patient.geneticProfile.cyp3a4 === 'poor') {
    geneticModifier -= 20;
    geneticReasons.push('CYP3A4 Poor Metabolizer (-20%): Severe deficit in dominant hepatic phase I elimination.');
  } else if (patient.geneticProfile.cyp3a4 === 'intermediate') {
    geneticModifier -= 8;
    geneticReasons.push('CYP3A4 Intermediate Metabolizer (-8%): Moderate reduction in primary oxidative pathway.');
  } else if (patient.geneticProfile.cyp3a4 === 'ultrarapid') {
    geneticModifier += 15;
    geneticReasons.push('CYP3A4 Ultrarapid Metabolizer (+15%): Hyper-accelerated phase I oxidation.');
  }

  // CYP3A5
  if (patient.geneticProfile.cyp3a5 === 'expresser') {
    geneticModifier += 12;
    geneticReasons.push('CYP3A5 Expresser (+12%): High enzymatic activity requiring elevated dosage for therapeutic trough levels.');
  } else if (patient.geneticProfile.cyp3a5 === 'intermediate') {
    geneticModifier += 6;
    geneticReasons.push('CYP3A5 Intermediate Expresser (+6%): Moderate activity.');
  }

  // CYP1A2
  if (patient.geneticProfile.cyp1a2 === 'poor') {
    geneticModifier -= 15;
    geneticReasons.push('CYP1A2 Poor Metabolizer (-15%): Delayed xanthine & neuroleptic clearance.');
  } else if (patient.geneticProfile.cyp1a2 === 'ultrarapid') {
    geneticModifier += 12;
    geneticReasons.push('CYP1A2 Ultrarapid Metabolizer (+12%): High inducible clearance.');
  }

  // CYP2B6
  if (patient.geneticProfile.cyp2b6 === 'poor') {
    geneticModifier -= 20;
    geneticReasons.push('CYP2B6 Poor Metabolizer (-20%): Elevated plasma exposure of efavirenz, bupropion, and methadone.');
  } else if (patient.geneticProfile.cyp2b6 === 'ultrarapid') {
    geneticModifier += 10;
    geneticReasons.push('CYP2B6 Ultrarapid Metabolizer (+10%): Accelerated metabolism.');
  }

  // CYP4F2
  if (patient.geneticProfile.cyp4f2 === 'poor') {
    geneticModifier += 10;
    geneticReasons.push('CYP4F2 Variant (+10%): Decreased vitamin K catabolism requiring dose compensation.');
  }

  // UGT1A1
  if (patient.geneticProfile.ugt1a1 === 'poor') {
    geneticModifier -= 25;
    geneticReasons.push('UGT1A1 Poor Metabolizer (*28/*28) (-25%): Severe glucuronidation deficiency, heightened toxicity risk.');
  } else if (patient.geneticProfile.ugt1a1 === 'intermediate') {
    geneticModifier -= 10;
    geneticReasons.push('UGT1A1 Intermediate (*1/*28) (-10%): Reduced glucuronidation capacity.');
  }

  // TPMT & NUDT15
  if (patient.geneticProfile.tpmt === 'poor') {
    geneticModifier -= 40;
    geneticReasons.push('TPMT Deficient (-40%): Severe thiopurine S-methyltransferase deficit; myelosuppression mitigation.');
  } else if (patient.geneticProfile.tpmt === 'intermediate') {
    geneticModifier -= 20;
    geneticReasons.push('TPMT Intermediate (-20%): Partial thiopurine clearance reduction.');
  }

  if (patient.geneticProfile.nudt15 === 'poor') {
    geneticModifier -= 35;
    geneticReasons.push('NUDT15 Poor Metabolizer (-35%): Extreme early leukopenia risk with thiopurines.');
  } else if (patient.geneticProfile.nudt15 === 'intermediate') {
    geneticModifier -= 15;
    geneticReasons.push('NUDT15 Intermediate (-15%): Moderate thiopurine risk.');
  }

  // DPYD
  if (patient.geneticProfile.dpyd === 'poor') {
    geneticModifier -= 40;
    geneticReasons.push('DPYD Poor Metabolizer (-40%): Dihydropyrimidine dehydrogenase deficit; lethal fluoropyrimidine toxicity prevention.');
  } else if (patient.geneticProfile.dpyd === 'intermediate') {
    geneticModifier -= 20;
    geneticReasons.push('DPYD Intermediate (-20%): 50% fluoropyrimidine clearance deficit.');
  }

  // VKORC1
  if (patient.geneticProfile.vkorc1 === 'high_sensitive') {
    geneticModifier -= 20;
    geneticReasons.push('VKORC1 High Sensitivity (-20%): Exquisite pharmacodynamic target sensitivity, bleed risk protection.');
  } else if (patient.geneticProfile.vkorc1 === 'intermediate_sensitive') {
    geneticModifier -= 10;
    geneticReasons.push('VKORC1 Intermediate Sensitivity (-10%): Moderate target sensitivity.');
  }

  // NAT2
  if (patient.geneticProfile.nat2 === 'slow') {
    geneticModifier -= 15;
    geneticReasons.push('NAT2 Slow Acetylator (-15%): Delayed phase II acetylation of isoniazid, hydralazine, and sulfonamides.');
  } else if (patient.geneticProfile.nat2 === 'rapid') {
    geneticModifier += 10;
    geneticReasons.push('NAT2 Rapid Acetylator (+10%): High acetylation rate.');
  }

  // G6PD
  if (patient.geneticProfile.g6pd === 'deficient') {
    geneticModifier -= 20;
    geneticReasons.push('G6PD Deficient (-20%): Extreme oxidative hemolysis vulnerability (Strict oxidant drug/excipient caution).');
  }

  // SLCO1B1 & ABCG2 Transporters
  if (patient.geneticProfile.slco1b1 === 'poor') {
    geneticModifier -= 20;
    geneticReasons.push('SLCO1B1 Poor Transporter (*5/*5) (-20%): Hepatic sinusoidal uptake deficit, extreme statin myotoxicity risk.');
  } else if (patient.geneticProfile.slco1b1 === 'intermediate') {
    geneticModifier -= 8;
    geneticReasons.push('SLCO1B1 Intermediate (-8%): Partial sinusoidal uptake impairment.');
  }

  if (patient.geneticProfile.abcg2 === 'poor') {
    geneticModifier -= 15;
    geneticReasons.push('ABCG2 Poor Function (-15%): Deficient BCRP intestinal/biliary efflux, heightened rosuvastatin exposure.');
  } else if (patient.geneticProfile.abcg2 === 'intermediate') {
    geneticModifier -= 5;
    geneticReasons.push('ABCG2 Intermediate (-5%): Mild BCRP efflux reduction.');
  }

  // Immunogenetic HLA Alleles (Black-box contraindications / severe cutaneous reactions)
  if (patient.geneticProfile.hla_b_5701 === 'positive') {
    geneticReasons.push('⚠️ HLA-B*57:01 POSITIVE: Absolute contraindication for Abacavir (severe multisystem hypersensitivity risk).');
  }
  if (patient.geneticProfile.hla_b_1502 === 'positive') {
    geneticReasons.push('⚠️ HLA-B*15:02 POSITIVE: Severe risk of Stevens-Johnson syndrome (SJS/TEN) with carbamazepine & phenytoin.');
  }
  if (patient.geneticProfile.hla_a_3101 === 'positive') {
    geneticReasons.push('⚠️ HLA-A*31:01 POSITIVE: High risk of severe cutaneous adverse reactions (SCAR) with carbamazepine.');
  }

  if (geneticReasons.length === 0) {
    geneticReasons.push('Wild-Type Normal / Extensive Metabolizer across all profiled pharmacogenes (Standard therapeutic clearance baseline).');
  }

  // 5. Select Base Scaled Dose from Active Posology Rule
  let rawBaseScaledDose = bsaScaledDose;
  if (activeRule === 'bsa_dubois') {
    rawBaseScaledDose = bsaDuBoisScaledDose;
  } else if (activeRule === 'clark_rule') {
    rawBaseScaledDose = clarkScaledDose;
  } else if (activeRule === 'allometric_scaling') {
    rawBaseScaledDose = allometricScaledDose;
  } else if (activeRule === 'young_rule') {
    rawBaseScaledDose = youngScaledDose;
  } else if (activeRule === 'dilling_rule') {
    rawBaseScaledDose = dillingScaledDose;
  } else if (activeRule === 'cowling_rule') {
    rawBaseScaledDose = cowlingScaledDose;
  } else if (activeRule === 'fried_rule') {
    rawBaseScaledDose = friedScaledDose;
  }

  // Final adjusted calculation
  const totalModifierPercent = comorbidityModifier + geneticModifier;
  const modifierMultiplier = 1 + (totalModifierPercent / 100);
  const finalCalculated = rawBaseScaledDose * modifierMultiplier;
  const finalPersonalizedDoseMg = Math.round(finalCalculated * 2) / 2;

  // 6. Clinical Patient Profile Stratification & Posology Adaptation
  let profileCat: import('../types/pharmacy').PatientProfileCategory = 'adult_normal';
  let profileLabel = 'Adult Normal Biometrics';
  let recommendedRule: PosologyRule = 'bsa_catzel_mosteller';
  let profileRationale = 'Gold-standard Body Surface Area posology (Mosteller / Catzel) directly mirrors physiological cardiac output, glomerular filtration rate, and basal metabolic rate.';
  const physioFactors: string[] = ['Standard extracellular volume', 'Intact hepatic CYP functionalization', 'Nominal baseline creatinine clearance'];

  if (patient.age < 2) {
    profileCat = 'pediatric_infant';
    profileLabel = 'Pediatric Infant (< 2 years)';
    recommendedRule = 'fried_rule';
    profileRationale = 'Infants exhibit immature hepatic Phase I/II enzymes and rapidly evolving renal glomerular filtration. Fried\'s infant rule (months/150) protects against toxic drug accumulation.';
    physioFactors.splice(0, physioFactors.length, 'Immature blood-brain barrier', 'Low plasma albumin binding', 'High total body water percentage (~75-80%)');
  } else if (patient.age >= 2 && patient.age <= 12) {
    profileCat = 'pediatric_child';
    profileLabel = 'Pediatric Child (2–12 years)';
    recommendedRule = 'young_rule';
    profileRationale = 'Children undergo rapid somatic growth and accelerated hepatic drug turnover per kg body weight, but possess lower overall organ clearance volume. Young\'s rule [Age / (Age + 12)] or Mosteller BSA is the classical clinical standard.';
    physioFactors.splice(0, physioFactors.length, 'Accelerated Phase I metabolic rate per kg', 'Active renal glomerular clearance', 'Lower muscle mass proportion');
  } else if (patient.age >= 13 && patient.age <= 17) {
    profileCat = 'pediatric_adolescent';
    profileLabel = 'Pediatric Adolescent (13–17 years)';
    recommendedRule = 'dilling_rule';
    profileRationale = 'Adolescents transition between pediatric metabolism and adult body composition. Dilling\'s rule (Age / 20) or Mosteller BSA prevents under-dosing caused by young-child formulas.';
    physioFactors.splice(0, physioFactors.length, 'Pubertal growth surge', 'Expanding skeletal muscle mass', 'Maturing adult-equivalent cytochrome P450 capacity');
  } else if (targetCrCl < 60) {
    profileCat = 'renal_compromised';
    profileLabel = `Renal Clearance Compromised (CrCl ${targetCrCl.toFixed(0)} mL/min)`;
    recommendedRule = 'bsa_catzel_mosteller';
    profileRationale = 'Reduced glomerular filtration severely impairs polar drug elimination. Posology must scale with Mosteller BSA combined with renal clearance proportional adjustments to prevent toxic plasma accumulation.';
    physioFactors.splice(0, physioFactors.length, `Glomerular filtration rate: ${targetCrCl.toFixed(0)} mL/min`, 'Diminished tubular drug secretion', 'High risk of nephrotoxic plasma peak levels');
  } else if (patient.age >= 65) {
    profileCat = 'geriatric';
    profileLabel = 'Geriatric Profile (≥ 65 years)';
    recommendedRule = 'bsa_catzel_mosteller';
    profileRationale = 'Geriatric pharmacotherapy is characterized by progressive nephron senescence, reduced hepatic blood flow (approx. -1% per year), and altered body composition (sarcopenia with increased body fat percentage). Mosteller BSA coupled with Cockcroft-Gault clearance monitoring is the safest posology rule.';
    physioFactors.splice(0, physioFactors.length, 'Progressive glomerular sclerosis', 'Reduced hepatic blood perfusion', 'Altered volume of distribution (sarcopenia)');
  } else if (targetBmi >= 30) {
    profileCat = 'adult_obese';
    profileLabel = `Adult with Obesity (BMI ${targetBmi.toFixed(1)} kg/m²)`;
    recommendedRule = 'allometric_scaling';
    profileRationale = 'In obese individuals, excess adipose tissue has minimal metabolic drug clearance and low perfusion (~5% of cardiac output). Linear total weight scaling (Clark\'s rule) severely overdoses hydrophilic drugs. Allometric scaling (0.75 metabolic exponent) or Mosteller BSA is the clinically required posological method.';
    physioFactors.splice(0, physioFactors.length, 'Excess adipose tissue with low metabolic clearance', 'Altered drug partition coefficient (lipophilic vs hydrophilic)', 'Allometric 3/4 power metabolic rate scaling constraint');
  }

  const patientProfileAdjustment: import('../types/pharmacy').PatientProfilePosologyAdjustment = {
    category: profileCat,
    label: profileLabel,
    recommendedRule,
    clinicalRationale: profileRationale,
    physiologicalFactors: physioFactors
  };

  // 7. Build Comprehensive Posology Comparison Table Adjusted to Patient Profile
  const calcAdjusted = (raw: number) => Math.round(raw * modifierMultiplier * 2) / 2;

  const posologyComparison: PosologyComparisonEntry[] = [
    {
      ruleId: 'bsa_catzel_mosteller',
      ruleName: "Mosteller / Catzel's BSA Rule (Gold Standard)",
      category: 'Body Surface Area (BSA)',
      formula: `Dose = Base × (BSA_target / BSA_base) = ${baselineDose} × (${targetBsa.toFixed(2)} / ${baselineBsa.toFixed(2)})`,
      calculatedBaseDoseMg: Math.round(bsaScaledDose * 10) / 10,
      adjustedFinalDoseMg: calcAdjusted(bsaScaledDose),
      applicabilityNote: 'Gold standard in modern clinical pharmacy; directly proportional to renal filtration and cardiac output.',
      isRecommended: recommendedRule === 'bsa_catzel_mosteller',
      profileSuitability: profileCat === 'adult_obese' ? 'acceptable' : 'optimal',
      profileSuitabilityReason: profileCat === 'adult_obese'
        ? 'Accounts non-linearly for height and weight, avoiding linear adipose overestimation, though allometric scaling is more strictly metabolic.'
        : 'Directly mirrors physiological cardiac output, renal perfusion, and extracellular fluid volume for this patient profile.'
    },
    {
      ruleId: 'bsa_dubois',
      ruleName: "Du Bois & Du Bois Anthropometric BSA Rule",
      category: 'Body Surface Area (BSA)',
      formula: `Dose = Base × (BSA_DuBois_target / BSA_DuBois_base) = ${baselineDose} × (${targetBsaDuBois.toFixed(2)} / ${baselineBsaDuBois.toFixed(2)})`,
      calculatedBaseDoseMg: Math.round(bsaDuBoisScaledDose * 10) / 10,
      adjustedFinalDoseMg: calcAdjusted(bsaDuBoisScaledDose),
      applicabilityNote: 'Classical anthropometric power law formula (0.007184 × Ht^0.725 × Wt^0.425) benchmarked in clinical pharmacokinetics.',
      isRecommended: (recommendedRule as string) === 'bsa_dubois',
      profileSuitability: profileCat === 'adult_obese' ? 'acceptable' : 'optimal',
      profileSuitabilityReason: 'Classical physiological power-law scaling validated across clinical chemotherapy and intensive care.'
    },
    {
      ruleId: 'clark_rule',
      ruleName: "Clark's Posology Rule (Weight Ratio)",
      category: 'Body Weight',
      formula: `Dose = Base × (Weight_target / Weight_base) = ${baselineDose} × (${patient.weightKg} / ${baselineWeight})`,
      calculatedBaseDoseMg: Math.round(clarkScaledDose * 10) / 10,
      adjustedFinalDoseMg: calcAdjusted(clarkScaledDose),
      applicabilityNote: 'Standard weight-proportional posology; assumes linear clearance with total body weight.',
      isRecommended: (recommendedRule as string) === 'clark_rule',
      profileSuitability: targetBmi >= 30 ? 'caution' : (patient.age < 2 || patient.age >= 65) ? 'caution' : 'acceptable',
      profileSuitabilityReason: targetBmi >= 30
        ? '⚠️ Overestimation Hazard: In obesity (BMI ≥ 30), total body weight scaling assumes adipose tissue metabolizes drugs identically to lean mass, creating severe toxicity risk for hydrophilic APIs.'
        : patient.age >= 65
        ? '⚠️ Caution in Geriatrics: Sarcopenia and reduced muscle mass decrease baseline clearance below what total body weight indicates.'
        : patient.age < 2
        ? '⚠️ Caution in Infants: Immature organ clearance means elimination does not scale linearly with adult weight.'
        : 'Standard proportional dosing acceptable for non-obese adult profiles.'
    },
    {
      ruleId: 'allometric_scaling',
      ruleName: 'Allometric Metabolic Scaling (Exponent 0.75)',
      category: 'Metabolic Allometric',
      formula: `Dose = Base × (W_target / W_base)^0.75 = ${baselineDose} × (${patient.weightKg} / ${baselineWeight})^0.75`,
      calculatedBaseDoseMg: Math.round(allometricScaledDose * 10) / 10,
      adjustedFinalDoseMg: calcAdjusted(allometricScaledDose),
      applicabilityNote: 'Based on Kleiber physiological law; scales dose to basal metabolic rate rather than raw mass.',
      isRecommended: recommendedRule === 'allometric_scaling',
      profileSuitability: targetBmi >= 30 ? 'optimal' : 'acceptable',
      profileSuitabilityReason: targetBmi >= 30
        ? '⭐️ Optimal for Obese Profile: The 0.75 exponent prevents relative overdose by modeling metabolic capacity instead of adipose mass accumulation.'
        : 'Well-suited for physiological clearance scaling across wide body weight variations.'
    },
    {
      ruleId: 'young_rule',
      ruleName: "Young's Posology Rule (Age / [Age + 12])",
      category: 'Age-Based (Pediatric)',
      formula: `Dose = Base × (Age / [Age + 12]) = ${baselineDose} × (${patient.age} / [${patient.age} + 12])`,
      calculatedBaseDoseMg: Math.round(youngScaledDose * 10) / 10,
      adjustedFinalDoseMg: calcAdjusted(youngScaledDose),
      applicabilityNote: 'Classical pediatric rule specifically calibrated for children aged 2 to 12 years.',
      isRecommended: recommendedRule === 'young_rule',
      profileSuitability: (patient.age >= 2 && patient.age <= 12) ? 'optimal' : 'contraindicated',
      profileSuitabilityReason: (patient.age >= 2 && patient.age <= 12)
        ? '⭐️ Clinically Calibrated: Matches the physiological maturation and metabolic expansion of children aged 2 to 12 years.'
        : (patient.age > 12)
        ? '⛔ Inapplicable for Adolescents / Adults: Young\'s formula is mathematically restricted to children ≤ 12 years; applying it to adults results in gross under-dosing.'
        : '⚠️ Caution: In infants < 2 years, organ immaturity requires Fried\'s rule instead.'
    },
    {
      ruleId: 'dilling_rule',
      ruleName: "Dilling's Posology Rule (Age / 20)",
      category: 'Age-Based (Pediatric)',
      formula: `Dose = Base × (Age / 20) = ${baselineDose} × (${patient.age} / 20)`,
      calculatedBaseDoseMg: Math.round(dillingScaledDose * 10) / 10,
      adjustedFinalDoseMg: calcAdjusted(dillingScaledDose),
      applicabilityNote: 'Classical posology rule calibrated for adolescent and pediatric patients between 4 and 20 years.',
      isRecommended: recommendedRule === 'dilling_rule',
      profileSuitability: (patient.age >= 13 && patient.age <= 20) ? 'optimal' : (patient.age >= 4 && patient.age <= 12) ? 'acceptable' : 'contraindicated',
      profileSuitabilityReason: (patient.age >= 13 && patient.age <= 20)
        ? '⭐️ Optimal for Adolescents: Appropriately scales the transition from late childhood to adult body size without under-dosing.'
        : (patient.age > 20)
        ? '⛔ Inapplicable for Adults (> 20y): Formula is restricted to developmental ages 4–20 years.'
        : 'Intended for patients 4 years and older.'
    },
    {
      ruleId: 'cowling_rule',
      ruleName: "Cowling's Posology Rule ([Age + 1] / 24)",
      category: 'Age-Based (Pediatric)',
      formula: `Dose = Base × ([Age + 1] / 24) = ${baselineDose} × (${patient.age + 1} / 24)`,
      calculatedBaseDoseMg: Math.round(cowlingScaledDose * 10) / 10,
      adjustedFinalDoseMg: calcAdjusted(cowlingScaledDose),
      applicabilityNote: 'Alternative pediatric posology formula for age-based fractional doses.',
      isRecommended: false,
      profileSuitability: patient.age <= 17 ? 'acceptable' : 'contraindicated',
      profileSuitabilityReason: patient.age <= 17
        ? 'Acceptable pediatric age approximation, though Young\'s and Dilling\'s rules are more clinically validated.'
        : '⛔ Inapplicable for Adults: Fractional age equation intended only for pediatric development.'
    },
    {
      ruleId: 'fried_rule',
      ruleName: "Fried's Infant Posology Rule (Months / 150)",
      category: 'Age-Based (Pediatric)',
      formula: `Dose = Base × (Age_months / 150) = ${baselineDose} × (${ageMonths} / 150)`,
      calculatedBaseDoseMg: Math.round(friedScaledDose * 10) / 10,
      adjustedFinalDoseMg: calcAdjusted(friedScaledDose),
      applicabilityNote: 'Posology formula strictly designed for infants under 2 years of age.',
      isRecommended: recommendedRule === 'fried_rule',
      profileSuitability: patient.age < 2 ? 'optimal' : 'contraindicated',
      profileSuitabilityReason: patient.age < 2
        ? '⭐️ Clinically Indicated: Dedicated equation tailored for infant metabolic capacity and blood volume.'
        : '⛔ Inapplicable for Older Patients: Formula strictly restricted to infants under 24 months.'
    }
  ];

  // 8. Clinical Rationale Steps
  const activePosologyEntry = posologyComparison.find(p => p.ruleId === activeRule) || posologyComparison[0];

  const steps: string[] = [
    `1. Patient Profile Stratification: Classified as "${patientProfileAdjustment.label}". Recommended rule: ${posologyComparison.find(p => p.ruleId === recommendedRule)?.ruleName || recommendedRule} (${patientProfileAdjustment.clinicalRationale})`,
    `2. Posology Logic Selected: ${activePosologyEntry.ruleName} [Formula: ${activePosologyEntry.formula}]. Suitability: ${activePosologyEntry.profileSuitability.toUpperCase()} - ${activePosologyEntry.profileSuitabilityReason}`,
    `3. Reference Baseline: ${baselineDose} mg for ${baselineWeight} kg, ${baselineHeight} cm patient with no past history (BSA: ${baselineBsa.toFixed(2)} m²).`,
    `4. Target Patient Biometrics: ${patient.name} (${patient.sex}, ${patient.age}y), ${patient.weightKg} kg, ${patient.heightCm} cm -> Target BSA: ${targetBsa.toFixed(2)} m² (Ratio: x${bsaRatio.toFixed(3)}), BMI: ${targetBmi.toFixed(1)} kg/m², CrCl: ${targetCrCl.toFixed(0)} mL/min.`,
    `5. Raw Posological Base Dose: ${rawBaseScaledDose.toFixed(1)} mg.`,
    `6. Pathological Comorbidity Adjustment (${comorbidityModifier >= 0 ? '+' : ''}${comorbidityModifier}%): ${comorbidityReasons.join(' ')}`,
    `7. Pharmacogenomic Idiosyncrasy Adjustment (${geneticModifier >= 0 ? '+' : ''}${geneticModifier}%): ${geneticReasons.length ? geneticReasons.join(' ') : 'Standard Extensive Metabolizer profile (0% shift).' }`,
    `8. Final Personalized 3D Strength: ${finalPersonalizedDoseMg} mg (Eliminates commercial fixed strength gaps).`
  ];

  return {
    baselineDoseMg: baselineDose,
    baselineWeightKg: baselineWeight,
    baselineHeightCm: baselineHeight,
    baselineBsaM2: baselineBsa,
    targetBsaM2: targetBsa,
    targetBsaDuBoisM2: Number(targetBsaDuBois.toFixed(2)),
    targetBmi: Number(targetBmi.toFixed(1)),
    targetIbwKg: Number(targetIbw.toFixed(1)),
    targetAbwKg: Number(targetAbw.toFixed(1)),
    targetCrClMlMin: Number(targetCrCl.toFixed(1)),
    rawBsaScaledDoseMg: Math.round(bsaScaledDose * 10) / 10,
    allometricScaledDoseMg: Math.round(allometricScaledDose * 10) / 10,
    comorbidityModifierPercent: comorbidityModifier,
    comorbidityRationale: comorbidityReasons.join(' | ') || 'No comorbidity adjustments required.',
    geneticModifierPercent: geneticModifier,
    geneticRationale: geneticReasons.join(' | ') || 'Extensive/Normal metabolizer baseline.',
    activePosologyRule: activeRule,
    posologyComparison,
    patientProfileAdjustment,
    finalPersonalizedDoseMg,
    conventionalFixedDosesAvailable: [125, 250, 500, 750, 1000],
    clinicalRationaleSteps: steps
  };
}

/**
 * Builds optimized pharmaceutical 3D printing formulation and excipients
 * based on patient conditions and target dose.
 */
export function generatePrintableFormulation(
  patient: Patient,
  finalDoseMg: number,
  preferredTechnique?: PrintingTechnique
): TabletFormulation {
  const conditions = [
    ...(patient.pastMedicalHistory || []),
    ...(patient.medicalConditions?.map(c => c.conditionName) || [])
  ].map(c => c.toLowerCase());

  const hasDiabetes = conditions.some(c => c.includes('diabetes'));
  const hasAsthma = conditions.some(c => c.includes('asthma') || c.includes('copd') || c.includes('dysphagia'));

  // Technique selection: ZipDose binder jetting is ideal for high dose rapid disintegration (FDA approved Spritam model)
  const technique: PrintingTechnique = preferredTechnique ?? (
    hasAsthma ? 'binder_jetting' : finalDoseMg > 400 ? 'binder_jetting' : 'semi_solid_extrusion'
  );

  let shape: TabletShape = 'cylindrical';
  let releaseProfile: ReleaseProfile = 'rapid_disintegrating';
  
  if (hasAsthma && !hasDiabetes) {
    shape = 'cylindrical';
    releaseProfile = 'rapid_disintegrating';
  } else if (hasDiabetes && !hasAsthma) {
    shape = 'oblong_caplet';
    releaseProfile = 'extended_release';
  } else if (hasDiabetes && hasAsthma) {
    // Both: Bi-layer or Torus rapid-core with smooth erosion
    shape = 'bilayer_polypill';
    releaseProfile = 'biphasic_pulsatile';
  } else if (finalDoseMg > 450) {
    shape = 'torus_donut';
    releaseProfile = 'rapid_disintegrating';
  }

  // Calculate Tablet Physical Geometry based on Mass
  const apiWeightMg = finalDoseMg;
  const excipientMultiplier = 1.75; // total mass is ~1.75x API
  const totalMassMg = Math.max(50, Math.round(apiWeightMg * excipientMultiplier));

  // Excipient breakdown customized for diabetic & asthmatic tolerance
  const excipients = [];
  
  // 1. API
  const apiPercentage = Math.round((apiWeightMg / totalMassMg) * 1000) / 10;
  excipients.push({
    name: 'Active Pharmaceutical Ingredient (API)',
    chemicalRole: 'Active Pharmaceutical Ingredient (API)' as const,
    percentage: apiPercentage,
    milligrams: apiWeightMg,
    functionDescription: `Personalized therapeutic strength calibrated to ${finalDoseMg} mg.`
  });

  // 2. Polymer Binder
  const binderName = hasDiabetes ? 'Kollidon® VA64 (Copovidone NF) - Sugar Free' : 'PVP K30 / Hydroxypropyl Cellulose';
  const binderMg = Math.round(totalMassMg * 0.22);
  const binderPct = Math.round((binderMg / totalMassMg) * 1000) / 10;
  excipients.push({
    name: binderName,
    chemicalRole: 'Polymer Binder' as const,
    percentage: binderPct,
    milligrams: binderMg,
    functionDescription: 'Provides inter-layer tensile strength and mechanical cohesion during additive deposition.'
  });

  // 3. Superdisintegrant
  const disintegrantName = hasAsthma ? 'Croscarmellose Sodium (ZipDose® Superdisintegrant)' : 'Sodium Starch Glycolate';
  const disintegrantMg = Math.round(totalMassMg * 0.16);
  const disintegrantPct = Math.round((disintegrantMg / totalMassMg) * 1000) / 10;
  excipients.push({
    name: disintegrantName,
    chemicalRole: 'Superdisintegrant' as const,
    percentage: disintegrantPct,
    milligrams: disintegrantMg,
    functionDescription: 'Promotes rapid capillary liquid penetration for fast oral dispersion (<12s).'
  });

  // 4. Diluent / Porosity matrix
  const diluentName = hasDiabetes ? 'D-Mannitol Micro-Crystalline (Low Glycemic)' : 'Lactose Monohydrate / Microcrystalline Cellulose';
  const diluentMg = Math.round(totalMassMg * 0.12);
  const diluentPct = Math.round((diluentMg / totalMassMg) * 1000) / 10;
  excipients.push({
    name: diluentName,
    chemicalRole: 'Diluent / Filler' as const,
    percentage: diluentPct,
    milligrams: diluentMg,
    functionDescription: 'Ensures powder bed wettability and uniform fluid flow during binder droplet impact.'
  });

  // 5. Flow aid & Lubricant
  const remainingMg = Math.max(5, totalMassMg - (apiWeightMg + binderMg + disintegrantMg + diluentMg));
  const remainingPct = Math.round((remainingMg / totalMassMg) * 1000) / 10;
  excipients.push({
    name: 'Colloidal Silicon Dioxide & Magnesium Stearate',
    chemicalRole: 'Plasticizer / Lubricant' as const,
    percentage: remainingPct,
    milligrams: remainingMg,
    functionDescription: 'Prevents nozzle clogging and stabilizes droplet surface tension.'
  });

  // Dimensional CAD sizing
  let diameterMm = 11.0;
  let heightMm = 4.8;
  
  if (totalMassMg > 600) {
    diameterMm = 13.5;
    heightMm = 5.6;
  } else if (totalMassMg > 400) {
    diameterMm = 12.0;
    heightMm = 5.0;
  } else if (totalMassMg < 200) {
    diameterMm = 8.5;
    heightMm = 3.6;
  }

  const layerThicknessMm = technique === 'binder_jetting' ? 0.08 : 0.15;
  const layerCount = Math.max(20, Math.round(heightMm / layerThicknessMm));
  const infillDensityPercent = releaseProfile === 'rapid_disintegrating' ? 35 : releaseProfile === 'extended_release' ? 85 : 55;
  const porosityPercent = 100 - infillDensityPercent;

  const estimatedDisintegrationSec = releaseProfile === 'rapid_disintegrating' ? 9.5 : releaseProfile === 'extended_release' ? 43200 : 1800;
  const estimatedPrintTimeSec = Math.round(layerCount * 1.8);

  return {
    technique,
    shape,
    releaseProfile,
    diameterMm,
    heightMm,
    coreDiameterMm: shape === 'torus_donut' ? 4.0 : undefined,
    infillDensityPercent,
    porosityPercent,
    layerCount,
    layerThicknessMm,
    totalMassMg,
    excipients,
    estimatedDisintegrationSec,
    estimatedPrintTimeSec
  };
}
