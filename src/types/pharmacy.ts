export type BiologicalSex = 'male' | 'female' | 'other';

export type MetabolizerPhenotype = 'extensive' | 'intermediate' | 'poor' | 'ultrarapid';

export interface GeneticProfile {
  // Phase I Cytochrome P450 Enzymes
  cyp2d6: MetabolizerPhenotype;
  cyp2c19: MetabolizerPhenotype;
  cyp2c9: MetabolizerPhenotype;
  cyp3a4?: MetabolizerPhenotype;
  cyp3a5?: 'expresser' | 'intermediate' | 'non_expresser';
  cyp1a2?: MetabolizerPhenotype;
  cyp2b6?: MetabolizerPhenotype;
  cyp4f2?: 'normal' | 'intermediate' | 'poor';
  
  // Phase II Enzymes & Conjugation Targets
  ugt1a1?: 'extensive' | 'intermediate' | 'poor';
  tpmt?: 'normal' | 'intermediate' | 'poor';
  nudt15?: 'normal' | 'intermediate' | 'poor';
  dpyd?: 'normal' | 'intermediate' | 'poor';
  vkorc1?: 'normal_sensitive' | 'intermediate_sensitive' | 'high_sensitive';
  nat2?: 'rapid' | 'intermediate' | 'slow';
  g6pd?: 'normal' | 'deficient';
  
  // Transporters (Solute Carrier & ABC Efflux)
  slco1b1: 'normal' | 'intermediate' | 'poor';
  abcg2?: 'normal' | 'intermediate' | 'poor';
  
  // Immunogenetics & HLA Hypersensitivity Alleles
  hla_b_5701?: 'negative' | 'positive';
  hla_b_1502?: 'negative' | 'positive';
  hla_a_3101?: 'negative' | 'positive';
  
  notes?: string;
}

export type ConditionSeverity = 'mild' | 'moderate' | 'severe' | 'controlled' | 'in_remission';

export interface MedicalConditionRecord {
  id: string;
  conditionName: string;
  category: 'Respiratory' | 'Endocrine & Metabolic' | 'Cardiovascular' | 'Renal & Hepatic' | 'Neurological' | 'Other';
  diagnosisYear: number;
  severity: ConditionSeverity;
  clinicalNotes: string;
  dosingImpact: string;
  excipientRestriction?: string;
}

export type TreatmentEffectiveness = 
  | 'highly_effective' 
  | 'moderate_control' 
  | 'suboptimal' 
  | 'ineffective' 
  | 'intolerance_adverse_reaction';

export interface PreviousPrescriptionRecord {
  id: string;
  drugName: string;
  prescribedDose: string;
  standardFixedStrengthMg: number;
  startDate: string;
  endDate?: string;
  indication: string;
  effectiveness: TreatmentEffectiveness;
  adverseEffectsReported: string[];
  clinicalOutcomeNotes: string;
  switchedToCustomRationale: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: BiologicalSex;
  weightKg: number;
  heightCm: number;
  pastMedicalHistory: string[]; // For backward compatibility
  medicalConditions: MedicalConditionRecord[];
  previousPrescriptions: PreviousPrescriptionRecord[];
  allergies: string[];
  geneticProfile: GeneticProfile;
  serumCreatinineMgDl?: number;
  notes?: string;
}

export type PrintingTechnique = 
  | 'binder_jetting'       // Powder-bed ZipDose® (like SPRITAM)
  | 'semi_solid_extrusion' // Syringe paste extrusion (polypills)
  | 'fdm'                  // Fused Deposition Modeling (modified release)
  | 'sls';                 // Selective Laser Sintering (porous geometries)

export type TabletShape = 
  | 'cylindrical' 
  | 'oblong_caplet' 
  | 'torus_donut' 
  | 'bilayer_polypill';

export type ReleaseProfile = 
  | 'rapid_disintegrating' // Rapid melt < 10 seconds (ZipDose)
  | 'extended_release'    // 12-24h steady zero-order
  | 'biphasic_pulsatile';  // Immediate burst + sustained core

export interface ExcipientComposition {
  name: string;
  chemicalRole: 'Active Pharmaceutical Ingredient (API)' | 'Polymer Binder' | 'Superdisintegrant' | 'Diluent / Filler' | 'Plasticizer / Lubricant';
  percentage: number;
  milligrams: number;
  functionDescription: string;
}

export type PosologyRule = 
  | 'bsa_catzel_mosteller' // Body Surface Area (BSA) / Catzel's Rule (Target BSA / Base BSA * Dose)
  | 'bsa_dubois'           // Du Bois & Du Bois Body Surface Area Rule
  | 'clark_rule'           // Clark's Weight Rule (Target Wt / Base Wt * Dose)
  | 'allometric_scaling'   // Allometric Weight Scaling (Target Wt / Base Wt)^0.75 * Dose
  | 'young_rule'           // Young's Age Rule (Age / [Age + 12] * Adult Dose)
  | 'dilling_rule'         // Dilling's Age Rule (Age / 20 * Adult Dose)
  | 'cowling_rule'         // Cowling's Age Rule ([Age + 1] / 24 * Adult Dose)
  | 'fried_rule';          // Fried's Infant Rule (Age in months / 150 * Adult Dose)

export type ProfileSuitability = 'optimal' | 'acceptable' | 'caution' | 'contraindicated';

export type PatientProfileCategory = 
  | 'pediatric_infant' 
  | 'pediatric_child' 
  | 'pediatric_adolescent' 
  | 'adult_normal' 
  | 'adult_obese' 
  | 'geriatric' 
  | 'renal_compromised';

export interface PatientProfilePosologyAdjustment {
  category: PatientProfileCategory;
  label: string;
  recommendedRule: PosologyRule;
  clinicalRationale: string;
  physiologicalFactors: string[];
}

export interface PosologyComparisonEntry {
  ruleId: PosologyRule;
  ruleName: string;
  category: 'Body Surface Area (BSA)' | 'Body Weight' | 'Age-Based (Pediatric)' | 'Metabolic Allometric';
  formula: string;
  calculatedBaseDoseMg: number;
  adjustedFinalDoseMg: number;
  applicabilityNote: string;
  isRecommended: boolean;
  profileSuitability: ProfileSuitability;
  profileSuitabilityReason: string;
}

export interface CalculatedDosage {
  baselineDoseMg: number;
  baselineWeightKg: number;
  baselineHeightCm: number;
  baselineBsaM2: number;
  
  targetBsaM2: number;
  targetBsaDuBoisM2?: number;
  targetBmi: number;
  targetIbwKg: number;
  targetAbwKg?: number;
  targetCrClMlMin?: number;
  
  rawBsaScaledDoseMg: number;
  allometricScaledDoseMg: number;
  
  comorbidityModifierPercent: number;
  comorbidityRationale: string;
  
  geneticModifierPercent: number;
  geneticRationale: string;
  
  activePosologyRule: PosologyRule;
  posologyComparison: PosologyComparisonEntry[];
  patientProfileAdjustment: PatientProfilePosologyAdjustment;
  
  finalPersonalizedDoseMg: number;
  conventionalFixedDosesAvailable: number[];
  clinicalRationaleSteps: string[];
}

export interface TabletFormulation {
  technique: PrintingTechnique;
  shape: TabletShape;
  releaseProfile: ReleaseProfile;
  diameterMm: number;
  heightMm: number;
  coreDiameterMm?: number;
  infillDensityPercent: number;
  porosityPercent: number;
  layerCount: number;
  layerThicknessMm: number;
  totalMassMg: number;
  excipients: ExcipientComposition[];
  estimatedDisintegrationSec: number;
  estimatedPrintTimeSec: number;
}

export interface PrescriptionOrder {
  id: string;
  patientId: string;
  drugName: string;
  indication: string;
  batchLotNumber: string;
  calculatedDosage: CalculatedDosage;
  formulation: TabletFormulation;
  status: 'formulated' | 'sliced' | 'printing' | 'completed' | 'quality_approved';
  createdAt: string;
  dispensedAt?: string;
  pharmacistNotes?: string;
}
