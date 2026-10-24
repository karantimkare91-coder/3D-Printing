import React, { useState } from 'react';
import { Patient, CalculatedDosage, TabletFormulation, BiologicalSex, PosologyRule } from '../types/pharmacy';
import { CLINICAL_DISEASE_LIBRARY } from '../utils/pharmacokinetics';
import { AVAILABLE_DRUGS } from '../data/initialPatients';
import { 
  ArrowRight, ShieldCheck, AlertTriangle, Dna, Calculator, 
  Layers, Sparkles, Check, RefreshCw, Send, Sliders, Scale, Activity,
  Info, ChevronDown, ChevronUp, Droplets, HeartPulse, Stethoscope, 
  RotateCcw, HeartHandshake, PlusCircle, CheckCircle2, BookOpen, Plus, X,
  Search, AlertCircle
} from 'lucide-react';

interface AdvancedDosageCalculatorProps {
  patient: Patient;
  patients?: Patient[];
  onSelectPatient?: (patientId: string) => void;
  calculatedDosage: CalculatedDosage;
  formulation: TabletFormulation;
  activeDrugName: string;
  baselineDoseMg: number;
  baselineWeightKg: number;
  baselineHeightCm: number;
  baselineAge?: number;
  baselineSex?: BiologicalSex;
  activePosologyRule: PosologyRule;
  onPosologyRuleChange: (rule: PosologyRule) => void;
  onDrugChange: (drugName: string) => void;
  onBaselineDoseChange: (doseMg: number) => void;
  onBaselineWeightChange: (weightKg: number) => void;
  onBaselineHeightChange: (heightCm: number) => void;
  onBaselineAgeChange?: (age: number) => void;
  onBaselineSexChange?: (sex: BiologicalSex) => void;
  onResetBaseline: () => void;
  onDispatchToPrinter: () => void;
  onUpdatePatientComorbidities: (comorbidities: string[]) => void;
  onUpdatePatientGenetics: (genetics: Patient['geneticProfile']) => void;
  onUpdatePatientBiometrics: (weightKg: number, heightCm: number, age: number, sex?: BiologicalSex) => void;
}

export interface PharmacogeneDefinition {
  key: keyof Patient['geneticProfile'];
  symbol: string;
  name: string;
  category: 'Phase I (CYP450)' | 'Phase II Conjugation' | 'Transporters' | 'Immunogenetics (HLA)' | 'Toxicity & Targets';
  primarySubstrates: string;
  clinicalSignificance: string;
  options: {
    value: string;
    label: string;
    status: 'normal' | 'caution' | 'danger';
  }[];
}

export const PHARMACOGENETIC_GENE_CATALOG: PharmacogeneDefinition[] = [
  // Phase I CYP450 Enzymes
  {
    key: 'cyp2d6',
    symbol: 'CYP2D6',
    name: 'Cytochrome P450 2D6',
    category: 'Phase I (CYP450)',
    primarySubstrates: 'Codeine, Tramadol, Metoprolol, Carvedilol, Tamoxifen, SSRIs, Antipsychotics',
    clinicalSignificance: 'Controls Phase I oxidation for ~25% of clinical drugs. Poor metabolizers fail to activate prodrugs (codeine) and accumulate parent psychotropics.',
    options: [
      { value: 'extensive', label: 'Extensive / Normal (*1/*1: 0%)', status: 'normal' },
      { value: 'intermediate', label: 'Intermediate (*1/*4: -8%)', status: 'caution' },
      { value: 'poor', label: 'Poor (*4/*4: -20% dose reduction)', status: 'danger' },
      { value: 'ultrarapid', label: 'Ultrarapid (*1xN: +15% hyper-clearance)', status: 'caution' }
    ]
  },
  {
    key: 'cyp2c19',
    symbol: 'CYP2C19',
    name: 'Cytochrome P450 2C19',
    category: 'Phase I (CYP450)',
    primarySubstrates: 'Clopidogrel (Plavix), Omeprazole, Voriconazole, Sertraline, Diazepam',
    clinicalSignificance: 'Bio-activates clopidogrel into active antiplatelet thiol metabolite; clears proton pump inhibitors.',
    options: [
      { value: 'extensive', label: 'Extensive / Normal (*1/*1: 0%)', status: 'normal' },
      { value: 'intermediate', label: 'Intermediate (*1/*2: -5%)', status: 'caution' },
      { value: 'poor', label: 'Poor (*2/*2: -15% dose adjustment)', status: 'danger' },
      { value: 'ultrarapid', label: 'Ultrarapid (*17/*17: +10%)', status: 'caution' }
    ]
  },
  {
    key: 'cyp2c9',
    symbol: 'CYP2C9',
    name: 'Cytochrome P450 2C9',
    category: 'Phase I (CYP450)',
    primarySubstrates: 'Warfarin, Phenytoin, Glipizide, Celecoxib, Ibuprofen, Losartan',
    clinicalSignificance: 'Primary clearance mechanism for S-warfarin and sulfonylureas. Poor metabolizers suffer extreme bleed and hypoglycemia risks.',
    options: [
      { value: 'extensive', label: 'Extensive / Normal (*1/*1: 0%)', status: 'normal' },
      { value: 'intermediate', label: 'Intermediate (*1/*3: -6%)', status: 'caution' },
      { value: 'poor', label: 'Poor (*3/*3: -25% dose reduction)', status: 'danger' },
      { value: 'ultrarapid', label: 'Ultrarapid (+15%)', status: 'caution' }
    ]
  },
  {
    key: 'cyp3a4',
    symbol: 'CYP3A4',
    name: 'Cytochrome P450 3A4',
    category: 'Phase I (CYP450)',
    primarySubstrates: 'Atorvastatin, Amlodipine, Midazolam, Cyclosporine, Fentanyl, Macrolides (>50% of drugs)',
    clinicalSignificance: 'Most abundant hepatic and intestinal cytochrome. Modulates dominant oxidative first-pass and systemic clearance.',
    options: [
      { value: 'extensive', label: 'Extensive / Normal (*1/*1: 0%)', status: 'normal' },
      { value: 'intermediate', label: 'Intermediate (*1/*22: -8%)', status: 'caution' },
      { value: 'poor', label: 'Poor (*20/*22: -20% dose reduction)', status: 'danger' },
      { value: 'ultrarapid', label: 'Ultrarapid (+15%)', status: 'caution' }
    ]
  },
  {
    key: 'cyp3a5',
    symbol: 'CYP3A5',
    name: 'Cytochrome P450 3A5',
    category: 'Phase I (CYP450)',
    primarySubstrates: 'Tacrolimus (Prograf), Vincristine, Cyclosporine',
    clinicalSignificance: 'Critical for immunosuppressive trough concentration maintenance. Expressers require 1.5-2x higher doses to prevent organ rejection.',
    options: [
      { value: 'non_expresser', label: 'Non-Expresser (*3/*3: Standard 0%)', status: 'normal' },
      { value: 'intermediate', label: 'Intermediate Expresser (*1/*3: +6%)', status: 'caution' },
      { value: 'expresser', label: 'Expresser (*1/*1: +12% dose need)', status: 'caution' }
    ]
  },
  {
    key: 'cyp1a2',
    symbol: 'CYP1A2',
    name: 'Cytochrome P450 1A2',
    category: 'Phase I (CYP450)',
    primarySubstrates: 'Theophylline, Olanzapine, Clozapine, Caffeine, Tizanidine',
    clinicalSignificance: 'Hepatic enzyme influenced by polycyclic hydrocarbons and smoking. Governs narrow-therapeutic bronchodilator & atypical antipsychotic clearance.',
    options: [
      { value: 'extensive', label: 'Extensive / Normal (*1/*1: 0%)', status: 'normal' },
      { value: 'poor', label: 'Poor (*1C/*1K: -15% clearance)', status: 'danger' },
      { value: 'ultrarapid', label: 'Ultrarapid (*1F/*1F: +12%)', status: 'caution' }
    ]
  },
  {
    key: 'cyp2b6',
    symbol: 'CYP2B6',
    name: 'Cytochrome P450 2B6',
    category: 'Phase I (CYP450)',
    primarySubstrates: 'Efavirenz, Bupropion (Wellbutrin), Methadone, Ketamine, Cyclophosphamide',
    clinicalSignificance: 'Poor metabolizers experience extreme CNS toxicity, severe vivid dreams, and neurotoxicity with antiretrovirals and smoking cessation agents.',
    options: [
      { value: 'extensive', label: 'Extensive / Normal (*1/*1: 0%)', status: 'normal' },
      { value: 'poor', label: 'Poor (*6/*6: -20% dose reduction)', status: 'danger' },
      { value: 'ultrarapid', label: 'Ultrarapid (*4/*4: +10%)', status: 'caution' }
    ]
  },
  {
    key: 'cyp4f2',
    symbol: 'CYP4F2',
    name: 'Cytochrome P450 4F2',
    category: 'Phase I (CYP450)',
    primarySubstrates: 'Vitamin K1 Catabolism, Arachidonic Acid, Warfarin',
    clinicalSignificance: 'Regulates endogenous vitamin K1 oxidation. Carriers of *3 allele require higher baseline anticoagulant doses.',
    options: [
      { value: 'normal', label: 'Normal (*1/*1: Standard 0%)', status: 'normal' },
      { value: 'intermediate', label: 'Intermediate (*1/*3: +5%)', status: 'caution' },
      { value: 'poor', label: 'Variant (*3/*3: +10% higher requirement)', status: 'caution' }
    ]
  },

  // Phase II Conjugation Enzymes
  {
    key: 'ugt1a1',
    symbol: 'UGT1A1',
    name: 'UDP-Glucuronosyltransferase 1A1',
    category: 'Phase II Conjugation',
    primarySubstrates: 'Irinotecan (SN-38 Active Metabolite), Atazanavir, Bilirubin, Dolutegravir',
    clinicalSignificance: 'Phase II glucuronidation. *28/*28 variant causes severe life-threatening neutropenia and diarrhea (Gilbert Syndrome phenotype).',
    options: [
      { value: 'extensive', label: 'Extensive / Normal (*1/*1: 0%)', status: 'normal' },
      { value: 'intermediate', label: 'Intermediate (*1/*28: -10%)', status: 'caution' },
      { value: 'poor', label: 'Poor (*28/*28: -25% dose reduction)', status: 'danger' }
    ]
  },
  {
    key: 'tpmt',
    symbol: 'TPMT',
    name: 'Thiopurine S-Methyltransferase',
    category: 'Phase II Conjugation',
    primarySubstrates: 'Azathioprine, 6-Mercaptopurine, 6-Thioguanine',
    clinicalSignificance: 'Inactivates cytotoxic thiopurine metabolites. Deficient patients develop fatal myelosuppression and pancytopenia without 3D dose down-titration.',
    options: [
      { value: 'normal', label: 'Normal Activity (*1/*1: 0%)', status: 'normal' },
      { value: 'intermediate', label: 'Intermediate (*1/*3A: -20%)', status: 'caution' },
      { value: 'poor', label: 'Deficient (*3A/*3A: -40% critical reduction)', status: 'danger' }
    ]
  },
  {
    key: 'nudt15',
    symbol: 'NUDT15',
    name: 'Nudix Hydrolase 15',
    category: 'Phase II Conjugation',
    primarySubstrates: 'Thiopurines (6-MP, Azathioprine, 6-TG)',
    clinicalSignificance: 'Enzyme preventing incorporation of toxic thiopurine triphosphates into DNA. Deficient alleles induce acute leukopenia and alopecia.',
    options: [
      { value: 'normal', label: 'Normal Activity (*1/*1: 0%)', status: 'normal' },
      { value: 'intermediate', label: 'Intermediate (*1/*3: -15%)', status: 'caution' },
      { value: 'poor', label: 'Poor (*3/*3: -35% critical reduction)', status: 'danger' }
    ]
  },
  {
    key: 'nat2',
    symbol: 'NAT2',
    name: 'N-Acetyltransferase 2',
    category: 'Phase II Conjugation',
    primarySubstrates: 'Isoniazid, Hydralazine, Sulfasalazine, Procainamide',
    clinicalSignificance: 'Slow acetylators have impaired arylamine/hydrazine conjugation, predisposing to severe peripheral neuropathy and drug-induced lupus.',
    options: [
      { value: 'rapid', label: 'Rapid Acetylator (+10% / 0%)', status: 'normal' },
      { value: 'intermediate', label: 'Intermediate Acetylator (0%)', status: 'normal' },
      { value: 'slow', label: 'Slow Acetylator (-15% toxicity caution)', status: 'danger' }
    ]
  },

  // Toxicity & Pharmacodynamic Safety Targets
  {
    key: 'dpyd',
    symbol: 'DPYD',
    name: 'Dihydropyrimidine Dehydrogenase',
    category: 'Toxicity & Targets',
    primarySubstrates: 'Fluorouracil (5-FU), Capecitabine, Tegafur',
    clinicalSignificance: 'Rate-limiting enzyme for fluoropyrimidine catabolism (>80%). Deficient patients face lethal mucositis, neutropenia, and neurotoxicity.',
    options: [
      { value: 'normal', label: 'Normal Activity (*1/*1: 0%)', status: 'normal' },
      { value: 'intermediate', label: 'Intermediate (*1/*2A: -20%)', status: 'caution' },
      { value: 'poor', label: 'Deficient (*2A/*2A: -40% critical reduction)', status: 'danger' }
    ]
  },
  {
    key: 'vkorc1',
    symbol: 'VKORC1',
    name: 'Vitamin K Epoxide Reductase Complex 1',
    category: 'Toxicity & Targets',
    primarySubstrates: 'Warfarin, Acenocoumarol, Phenprocoumon',
    clinicalSignificance: 'Pharmacodynamic target enzyme. -1639G>A promoter variant reduces VKORC1 expression, conferring exquisite anticoagulant hypersensitivity.',
    options: [
      { value: 'normal_sensitive', label: 'Normal Sensitive (G/G: 0%)', status: 'normal' },
      { value: 'intermediate_sensitive', label: 'Intermediate Sensitive (G/A: -10%)', status: 'caution' },
      { value: 'high_sensitive', label: 'High Sensitive (A/A: -20% dose reduction)', status: 'danger' }
    ]
  },
  {
    key: 'g6pd',
    symbol: 'G6PD',
    name: 'Glucose-6-Phosphate Dehydrogenase',
    category: 'Toxicity & Targets',
    primarySubstrates: 'Rasburicase, Primaquine, Dapsone, Nitrofurantoin, Sulfonamides',
    clinicalSignificance: 'Maintains erythrocyte NADPH and glutathione antioxidant reserve. Deficiency causes acute severe oxidative hemolytic anemia.',
    options: [
      { value: 'normal', label: 'Normal Activity (Standard 0%)', status: 'normal' },
      { value: 'deficient', label: 'Deficient Variant (-20% / Strict Oxidant Caution)', status: 'danger' }
    ]
  },

  // Transporters (Solute Carrier & ABC Efflux)
  {
    key: 'slco1b1',
    symbol: 'SLCO1B1',
    name: 'Solute Carrier Organic Anion Transporter 1B1 (OATP1B1)',
    category: 'Transporters',
    primarySubstrates: 'Simvastatin, Atorvastatin, Pravastatin, Methotrexate, Repaglinide',
    clinicalSignificance: 'Hepatic sinusoidal uptake transporter. *5 allele dramatically reduces hepatic clearance, surging systemic statin levels and inducing severe rhabdomyolysis.',
    options: [
      { value: 'normal', label: 'Normal (*1a/*1a: Standard 0%)', status: 'normal' },
      { value: 'intermediate', label: 'Intermediate (*1a/*5: -8%)', status: 'caution' },
      { value: 'poor', label: 'Poor (*5/*5: -20% / Extreme Myopathy Risk)', status: 'danger' }
    ]
  },
  {
    key: 'abcg2',
    symbol: 'ABCG2',
    name: 'ATP-Binding Cassette G2 (BCRP Transporter)',
    category: 'Transporters',
    primarySubstrates: 'Rosuvastatin, Sulfasalazine, Allopurinol, Topotecan',
    clinicalSignificance: 'Apical efflux transporter in intestine, liver canaliculi, and renal tubules. 421C>A variant increases systemic statin bioavailability twofold.',
    options: [
      { value: 'normal', label: 'Normal Function (421C/C: 0%)', status: 'normal' },
      { value: 'intermediate', label: 'Intermediate (421C/A: -5%)', status: 'caution' },
      { value: 'poor', label: 'Poor Function (421A/A: -15% dose reduction)', status: 'danger' }
    ]
  },

  // Immunogenetics & HLA Hypersensitivity Alleles
  {
    key: 'hla_b_5701',
    symbol: 'HLA-B*57:01',
    name: 'Major Histocompatibility Complex B*57:01',
    category: 'Immunogenetics (HLA)',
    primarySubstrates: 'Abacavir (Ziagen, Triumeq)',
    clinicalSignificance: 'CPIC Tier 1 Black-Box Contraindication: Positive carriers develop fatal multisystem hypersensitivity syndrome with multi-organ failure upon exposure.',
    options: [
      { value: 'negative', label: 'Negative (Non-carrier: Standard safe use)', status: 'normal' },
      { value: 'positive', label: '⚠️ POSITIVE (CARRIER: Absolute Contraindication)', status: 'danger' }
    ]
  },
  {
    key: 'hla_b_1502',
    symbol: 'HLA-B*15:02',
    name: 'Major Histocompatibility Complex B*15:02',
    category: 'Immunogenetics (HLA)',
    primarySubstrates: 'Carbamazepine (Tegretol), Phenytoin, Oxcarbazepine',
    clinicalSignificance: 'Associated with catastrophic Stevens-Johnson syndrome (SJS) and Toxic Epidermal Necrolysis (TEN) in patients of Asian ancestry.',
    options: [
      { value: 'negative', label: 'Negative (Non-carrier)', status: 'normal' },
      { value: 'positive', label: '⚠️ POSITIVE (CARRIER: High SJS/TEN Risk)', status: 'danger' }
    ]
  },
  {
    key: 'hla_a_3101',
    symbol: 'HLA-A*31:01',
    name: 'Major Histocompatibility Complex A*31:01',
    category: 'Immunogenetics (HLA)',
    primarySubstrates: 'Carbamazepine, Anticonvulsants',
    clinicalSignificance: 'Predisposes to severe cutaneous adverse reactions including DRESS syndrome (Drug Reaction with Eosinophilia and Systemic Symptoms).',
    options: [
      { value: 'negative', label: 'Negative (Non-carrier)', status: 'normal' },
      { value: 'positive', label: '⚠️ POSITIVE (CARRIER: High Cutaneous Risk)', status: 'danger' }
    ]
  }
];

export const AdvancedDosageCalculator: React.FC<AdvancedDosageCalculatorProps> = ({
  patient,
  patients,
  onSelectPatient,
  calculatedDosage,
  formulation,
  activeDrugName,
  baselineDoseMg,
  baselineWeightKg,
  baselineHeightCm,
  baselineAge = 18,
  baselineSex = 'female',
  activePosologyRule,
  onPosologyRuleChange,
  onDrugChange,
  onBaselineDoseChange,
  onBaselineWeightChange,
  onBaselineHeightChange,
  onBaselineAgeChange,
  onBaselineSexChange,
  onResetBaseline,
  onDispatchToPrinter,
  onUpdatePatientComorbidities,
  onUpdatePatientGenetics,
  onUpdatePatientBiometrics
}) => {
  const [activeTab, setActiveTab] = useState<'scaling' | 'posology' | 'diseases' | 'biometrics' | 'excipients' | 'pharmacogenomics'>('scaling');
  const [diseaseSearch, setDiseaseSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Custom disease state
  const [isAddingCustomDisease, setIsAddingCustomDisease] = useState(false);
  const [customDiseaseName, setCustomDiseaseName] = useState('');
  const [customDiseaseCategory, setCustomDiseaseCategory] = useState('Respiratory');
  const [customClearanceModifier, setCustomClearanceModifier] = useState(-5);
  const [customDiseaseNote, setCustomDiseaseNote] = useState('');

  // Active conditions on the patient
  const patientConditions = [
    ...(patient.pastMedicalHistory || []),
    ...(patient.medicalConditions?.map(c => c.conditionName) || [])
  ];

  const hasDisease = (diseaseName: string) => {
    return patientConditions.some(c => 
      c.toLowerCase().includes(diseaseName.toLowerCase()) || 
      diseaseName.toLowerCase().includes(c.toLowerCase())
    );
  };

  const actualDiseases = patientConditions.filter(c => 
    !c.toLowerCase().includes('healthy') && 
    !c.toLowerCase().includes('none') && 
    !c.toLowerCase().includes('no comorbidities') && 
    c.trim() !== ''
  );

  const isTargetPatientHealthy = actualDiseases.length === 0;

  const toggleDisease = (disease: typeof CLINICAL_DISEASE_LIBRARY[0]) => {
    const isCurrentlyActive = hasDisease(disease.name);
    let updated: string[];

    if (isCurrentlyActive) {
      updated = actualDiseases.filter(c => 
        !c.toLowerCase().includes(disease.name.toLowerCase()) && 
        !disease.name.toLowerCase().includes(c.toLowerCase())
      );
    } else {
      updated = [...actualDiseases, disease.name];
    }

    onUpdatePatientComorbidities(updated);
  };

  const handleAddCustomDisease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDiseaseName.trim()) return;
    const updated = [...actualDiseases, customDiseaseName.trim()];
    onUpdatePatientComorbidities(updated);
    setCustomDiseaseName('');
    setCustomDiseaseNote('');
    setIsAddingCustomDisease(false);
  };

  const setPatientCompletelyHealthy = () => {
    onUpdatePatientComorbidities([]);
  };

  const handleGeneticsChange = (gene: keyof Patient['geneticProfile'], phenotype: any) => {
    onUpdatePatientGenetics({
      ...patient.geneticProfile,
      [gene]: phenotype
    });
  };

  // Pharmacogenomics state & filtering
  const [geneSearch, setGeneSearch] = useState('');
  const [selectedGeneCategory, setSelectedGeneCategory] = useState<string>('All');

  const geneCategories = ['All', 'Phase I (CYP450)', 'Phase II Conjugation', 'Transporters', 'Immunogenetics (HLA)', 'Toxicity & Targets'];

  const filteredGenes = PHARMACOGENETIC_GENE_CATALOG.filter(gene => {
    const matchesCategory = selectedGeneCategory === 'All' || gene.category === selectedGeneCategory;
    const matchesSearch = 
      gene.symbol.toLowerCase().includes(geneSearch.toLowerCase()) ||
      gene.name.toLowerCase().includes(geneSearch.toLowerCase()) ||
      gene.primarySubstrates.toLowerCase().includes(geneSearch.toLowerCase()) ||
      gene.clinicalSignificance.toLowerCase().includes(geneSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const variantGeneCount = PHARMACOGENETIC_GENE_CATALOG.filter(gene => {
    const val = (patient.geneticProfile as any)[gene.key];
    return val && val !== 'extensive' && val !== 'normal' && val !== 'normal_sensitive' && val !== 'non_expresser' && val !== 'rapid' && val !== 'negative';
  }).length;

  const handleApplyGenePreset = (preset: 'wild_type' | 'cardiac' | 'statin' | 'oncology' | 'ultrarapid' | 'hla_alerts') => {
    const updated: Patient['geneticProfile'] = {
      ...patient.geneticProfile,
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
      notes: 'Profile calibrated via clinical panel preset.'
    };

    if (preset === 'cardiac') {
      updated.cyp2c9 = 'poor';
      updated.vkorc1 = 'high_sensitive';
      updated.cyp2c19 = 'poor';
    } else if (preset === 'statin') {
      updated.slco1b1 = 'poor';
      updated.abcg2 = 'poor';
    } else if (preset === 'oncology') {
      updated.dpyd = 'poor';
      updated.tpmt = 'poor';
      updated.ugt1a1 = 'poor';
    } else if (preset === 'ultrarapid') {
      updated.cyp2d6 = 'ultrarapid';
      updated.cyp2c19 = 'ultrarapid';
      updated.cyp1a2 = 'ultrarapid';
    } else if (preset === 'hla_alerts') {
      updated.hla_b_5701 = 'positive';
      updated.hla_b_1502 = 'positive';
    }

    onUpdatePatientGenetics(updated);
  };

  const categories = ['All', 'Respiratory', 'Endocrine & Metabolic', 'Cardiovascular', 'Renal & Hepatic', 'Neurological', 'Gastrointestinal', 'Musculoskeletal'];

  const filteredDiseases = CLINICAL_DISEASE_LIBRARY.filter(d => {
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesSearch = d.name.toLowerCase().includes(diseaseSearch.toLowerCase()) ||
                          d.pkImpact.toLowerCase().includes(diseaseSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      {/* Module Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Posological Dosing &amp; 3D Formulation Engine</span>
              <span className="text-xs font-mono text-cyan-400">· Pharmaceutical Posology</span>
            </h3>
            <p className="text-xs text-slate-400">
              Interactive Baseline Scaling &amp; Selectable Disease Profiles for{' '}
              <span className="text-slate-200 font-medium">{patient.name}</span>
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('scaling')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'scaling' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dosage Scaling
          </button>
          <button
            onClick={() => setActiveTab('posology')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'posology' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Posology Rules</span>
          </button>
          <button
            onClick={() => setActiveTab('diseases')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'diseases' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Choose Diseases</span>
            {!isTargetPatientHealthy && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('biometrics')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'biometrics' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Biometrics &amp; Renal
          </button>
          <button
            onClick={() => setActiveTab('excipients')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'excipients' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3D Composition
          </button>
          <button
            onClick={() => setActiveTab('pharmacogenomics')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'pharmacogenomics' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            <span>Genetics (PGx)</span>
            {variantGeneCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-purple-950 text-purple-300 border border-purple-700/60 font-mono text-[10px]">
                {variantGeneCount}
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-700/60 font-mono text-[10px]">
                20
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 space-y-5">
        {activeTab === 'scaling' && (
          <>
            {/* The Direct User Prompt Scenario Benchmark */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800 gap-2">
                <span className="font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Fully Editable Reference Baseline vs Target Patient</span>
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-500">Active Posology:</span>
                  <select
                    value={activePosologyRule}
                    onChange={(e) => onPosologyRuleChange(e.target.value as PosologyRule)}
                    className="bg-slate-900 border border-slate-700 text-cyan-300 rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:border-cyan-500 max-w-[280px]"
                  >
                    {calculatedDosage.posologyComparison.map((r) => (
                      <option key={r.ruleId} value={r.ruleId}>
                        {r.ruleName} {r.isRecommended ? '⭐️ [Optimal]' : r.profileSuitability === 'caution' ? '⚠️ [Caution]' : r.profileSuitability === 'contraindicated' ? '⛔ [Inapplicable]' : ''}
                      </option>
                    ))}
                  </select>

                  {activePosologyRule !== calculatedDosage.patientProfileAdjustment?.recommendedRule && (
                    <button
                      onClick={() => onPosologyRuleChange(calculatedDosage.patientProfileAdjustment.recommendedRule)}
                      title={`Align to profile: ${calculatedDosage.patientProfileAdjustment?.label}`}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                      <span>Align to Profile</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-stretch">
                {/* Baseline Patient Card (FULLY EDITABLE) */}
                <div className="md:col-span-5 p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-200">Reference Baseline</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                          Healthy Control (0 Pathologies)
                        </span>
                      </div>
                      <button
                        onClick={onResetBaseline}
                        title="Reset to 250 mg @ 45 kg, 135 cm"
                        className="text-[11px] font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Reference</span>
                      </button>
                    </div>

                    {/* Prescribed Drug Selection Dropdown */}
                    <div className="mb-2.5">
                      <label className="text-[9px] font-mono text-slate-400 block mb-0.5">PRESCRIBED DRUG LIBRARY (24 TABLETS)</label>
                      <select
                        value={activeDrugName}
                        onChange={(e) => onDrugChange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-cyan-300 rounded px-2 py-1 text-xs font-medium focus:outline-none focus:border-cyan-500"
                      >
                        {AVAILABLE_DRUGS.map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name} — Ref: {d.defaultReferenceDoseMg} mg ({d.indication})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Editable Baseline Demographic & Metric Inputs */}
                    <div className="grid grid-cols-4 gap-2 py-1">
                      {/* Editable Weight */}
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <label className="text-[9px] font-mono text-slate-400 block mb-0.5">WEIGHT</label>
                        <input
                          type="number"
                          min="5"
                          max="250"
                          step="0.5"
                          value={baselineWeightKg}
                          onChange={(e) => onBaselineWeightChange(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-xs font-mono font-bold text-slate-100 text-center focus:outline-none focus:border-cyan-500"
                        />
                        <span className="text-[8px] font-mono text-slate-500 block text-center mt-0.5">kg</span>
                      </div>

                      {/* Editable Height */}
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <label className="text-[9px] font-mono text-slate-400 block mb-0.5">HEIGHT</label>
                        <input
                          type="number"
                          min="40"
                          max="250"
                          step="0.5"
                          value={baselineHeightCm}
                          onChange={(e) => onBaselineHeightChange(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-xs font-mono font-bold text-slate-100 text-center focus:outline-none focus:border-cyan-500"
                        />
                        <span className="text-[8px] font-mono text-slate-500 block text-center mt-0.5">cm</span>
                      </div>

                      {/* Editable Age */}
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <label className="text-[9px] font-mono text-slate-400 block mb-0.5">AGE</label>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          step="1"
                          value={baselineAge}
                          onChange={(e) => onBaselineAgeChange?.(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-xs font-mono font-bold text-slate-100 text-center focus:outline-none focus:border-cyan-500"
                        />
                        <span className="text-[8px] font-mono text-slate-500 block text-center mt-0.5">years</span>
                      </div>

                      {/* Editable Sex */}
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <label className="text-[9px] font-mono text-slate-400 block mb-0.5">SEX</label>
                        <select
                          value={baselineSex}
                          onChange={(e) => onBaselineSexChange?.(e.target.value as BiologicalSex)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-xs font-mono font-bold text-slate-100 text-center focus:outline-none focus:border-cyan-500 capitalize"
                        >
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                        </select>
                        <span className="text-[8px] font-mono text-slate-500 block text-center mt-0.5">biol.</span>
                      </div>
                    </div>

                    {/* Derived Baseline BSA Metrics */}
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-center">
                      <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                        <div className="text-[9px] font-mono text-slate-400">BASELINE BSA (MOSTELLER)</div>
                        <div className="text-xs font-mono font-bold text-cyan-400">
                          {calculatedDosage.baselineBsaM2.toFixed(2)} m²
                        </div>
                      </div>
                      <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                        <div className="text-[9px] font-mono text-slate-400">BASELINE BMI</div>
                        <div className="text-xs font-mono font-bold text-slate-200">
                          {(baselineWeightKg / Math.pow(baselineHeightCm / 100, 2)).toFixed(1)} kg/m²
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Editable Base Dose */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-300">Prescribed Reference Dose:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0.05"
                        max="2000"
                        step="5"
                        value={baselineDoseMg}
                        onChange={(e) => onBaselineDoseChange(Number(e.target.value))}
                        className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-center text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
                      />
                      <span className="text-xs font-mono text-slate-300">mg</span>
                    </div>
                  </div>
                </div>

                {/* Scaling Factor (Center Arrow) */}
                <div className="md:col-span-1 flex flex-col items-center justify-center text-center py-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-sm">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 mt-1">
                    x{(calculatedDosage.baselineBsaM2 > 0 ? (calculatedDosage.targetBsaM2 / calculatedDosage.baselineBsaM2) : 1).toFixed(2)}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">Posology Scale</span>
                </div>

                {/* Target Patient Profile Card */}
                <div className="md:col-span-5 p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-200">Target Patient Profile</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          isTargetPatientHealthy 
                            ? 'bg-emerald-950/70 border-emerald-800/60 text-emerald-300 font-semibold' 
                            : 'bg-amber-950/70 border-amber-800/60 text-amber-300 font-medium'
                        }`}>
                          {isTargetPatientHealthy ? 'Healthy Control (0 Pathologies)' : `${actualDiseases.length} Pathologies (${calculatedDosage.comorbidityModifierPercent}%)`}
                        </span>
                      </div>
                      <button
                        onClick={setPatientCompletelyHealthy}
                        title="Set target patient completely healthy (0% comorbidity deduction)"
                        className={`text-[11px] font-mono flex items-center gap-1 transition-colors ${
                          isTargetPatientHealthy ? 'text-emerald-400' : 'text-slate-400 hover:text-cyan-400'
                        }`}
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Healthy</span>
                      </button>
                    </div>

                    {/* Target Patient Selection Dropdown */}
                    <div className="mb-2.5">
                      <label className="text-[9px] font-mono text-slate-400 block mb-0.5">TARGET PATIENT RECORD (CUSTOM DOSING PROFILE)</label>
                      {patients && onSelectPatient ? (
                        <select
                          value={patient.id}
                          onChange={(e) => onSelectPatient(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 text-cyan-300 rounded px-2 py-1 text-xs font-medium focus:outline-none focus:border-cyan-500"
                        >
                          {patients.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — {p.weightKg} kg, {p.heightCm} cm ({p.age}y {p.sex})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="w-full bg-slate-950 border border-slate-700 text-cyan-300 rounded px-2 py-1 text-xs font-medium flex items-center justify-between">
                          <span className="truncate">{patient.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">{patient.weightKg} kg · {patient.heightCm} cm</span>
                        </div>
                      )}
                    </div>

                    {/* 4 Editable Target Demographic & Metric Tiles (WEIGHT, HEIGHT, AGE, SEX) */}
                    <div className="grid grid-cols-4 gap-2 py-1">
                      {/* Target Weight */}
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <label className="text-[9px] font-mono text-slate-400 block mb-0.5">WEIGHT</label>
                        <input
                          type="number"
                          min="5"
                          max="250"
                          step="0.5"
                          value={patient.weightKg}
                          onChange={(e) => onUpdatePatientBiometrics(Number(e.target.value), patient.heightCm, patient.age, patient.sex)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-xs font-mono font-bold text-slate-100 text-center focus:outline-none focus:border-cyan-500"
                        />
                        <span className="text-[8px] font-mono text-slate-500 block text-center mt-0.5">kg</span>
                      </div>

                      {/* Target Height */}
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <label className="text-[9px] font-mono text-slate-400 block mb-0.5">HEIGHT</label>
                        <input
                          type="number"
                          min="40"
                          max="250"
                          step="0.5"
                          value={patient.heightCm}
                          onChange={(e) => onUpdatePatientBiometrics(patient.weightKg, Number(e.target.value), patient.age, patient.sex)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-xs font-mono font-bold text-slate-100 text-center focus:outline-none focus:border-cyan-500"
                        />
                        <span className="text-[8px] font-mono text-slate-500 block text-center mt-0.5">cm</span>
                      </div>

                      {/* Target Age */}
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <label className="text-[9px] font-mono text-slate-400 block mb-0.5">AGE</label>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          step="1"
                          value={patient.age}
                          onChange={(e) => onUpdatePatientBiometrics(patient.weightKg, patient.heightCm, Number(e.target.value), patient.sex)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-xs font-mono font-bold text-slate-100 text-center focus:outline-none focus:border-cyan-500"
                        />
                        <span className="text-[8px] font-mono text-slate-500 block text-center mt-0.5">years</span>
                      </div>

                      {/* Target Sex */}
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <label className="text-[9px] font-mono text-slate-400 block mb-0.5">SEX</label>
                        <select
                          value={patient.sex}
                          onChange={(e) => onUpdatePatientBiometrics(patient.weightKg, patient.heightCm, patient.age, e.target.value as BiologicalSex)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-xs font-mono font-bold text-slate-100 text-center focus:outline-none focus:border-cyan-500 capitalize"
                        >
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                        </select>
                        <span className="text-[8px] font-mono text-slate-500 block text-center mt-0.5">biol.</span>
                      </div>
                    </div>

                    {/* Derived Target BSA Metrics */}
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-center">
                      <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                        <div className="text-[9px] font-mono text-slate-400">TARGET BSA (MOSTELLER)</div>
                        <div className="text-xs font-mono font-bold text-cyan-400">
                          {calculatedDosage.targetBsaM2.toFixed(2)} m²
                        </div>
                      </div>
                      <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                        <div className="text-[9px] font-mono text-slate-400">TARGET BMI</div>
                        <div className="text-xs font-mono font-bold text-slate-200">
                          {calculatedDosage.targetBmi.toFixed(1)} kg/m²
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Calibrated 3D Strength Readout Row */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-300 block">Calibrated 3D Strength:</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {isTargetPatientHealthy ? '0% Comorbidity Deduction' : `${calculatedDosage.comorbidityModifierPercent}% Comorbidity Deduction`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-center text-xs font-mono font-bold text-emerald-400">
                        {calculatedDosage.finalPersonalizedDoseMg}
                      </div>
                      <span className="text-xs font-mono text-slate-300">mg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disease Selection Quick Bar for Target Patient */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-medium">Active Pathological Modifiers on Target Patient:</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={setPatientCompletelyHealthy}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors border flex items-center gap-1 ${
                        isTargetPatientHealthy 
                          ? 'bg-emerald-600 text-white border-emerald-500 font-semibold' 
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>Set Completely Healthy (0% deductions)</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('diseases')}
                      className="text-[11px] font-mono text-cyan-400 hover:underline ml-1"
                    >
                      Browse All 30+ Diseases ›
                    </button>
                  </div>
                </div>

                {/* Quick Toggle Disease Pills (12 most popular conditions) */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {CLINICAL_DISEASE_LIBRARY.slice(0, 12).map(d => {
                    const active = hasDisease(d.name);
                    return (
                      <button
                        key={d.id}
                        onClick={() => toggleDisease(d)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                          active
                            ? 'bg-amber-950/70 border-amber-600 text-amber-200 shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <span>{d.name}</span>
                        {d.clearanceModifier !== 0 && (
                          <span className={`text-[10px] font-mono ${active ? 'text-amber-300' : 'text-slate-500'}`}>
                            ({d.clearanceModifier}%)
                          </span>
                        )}
                        {active && <Check className="w-3 h-3 text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step-by-Step Clinical Pharmacology Audit Trail */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Clinical Posology Audit Trail &amp; Derivation</span>
                </span>
                <span className="font-mono text-emerald-400 text-xs font-semibold">
                  Personalized 3D Target: {calculatedDosage.finalPersonalizedDoseMg} mg
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

              {/* Clinical Risk Summary Callout */}
              <div className="p-3.5 rounded-lg bg-blue-950/30 border border-blue-800/40 text-xs text-slate-300 space-y-1.5">
                <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Fixed Commercial Strength Vulnerability Analysis:</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Commercial pharmaceutical manufacturing relies on fixed increments (e.g. 250 mg or 500 mg). 
                  For this patient requiring an exact calculated <strong>{calculatedDosage.finalPersonalizedDoseMg} mg</strong>, 
                  a 250 mg pill yields under-dosing while a 500 mg pill causes significant toxic accumulation and plasma spikes.
                  <br />
                  <span className="text-emerald-300 font-medium">
                    3D printing delivers the exact {calculatedDosage.finalPersonalizedDoseMg} mg strength with customized porosity and release kinetics.
                  </span>
                </p>
              </div>
            </div>
          </>
        )}

        {/* TAB: POSOLOGY RULES COMPARISON (NEW DEDICATED TAB) */}
        {activeTab === 'posology' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Pharmaceutical Posology Comparative Rules</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Posology establishes mathematical dosage calculation rules based on age, body weight, body surface area (BSA), and physiological clearance.
                </p>
              </div>

              <div className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800">
                Active Selection: {calculatedDosage.activePosologyRule.toUpperCase()}
              </div>
            </div>

            {/* Posology Comparison Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Posology Rule</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Mathematical Formula</th>
                    <th className="p-3 text-right">Raw Posology Dose</th>
                    <th className="p-3 text-right text-cyan-300">Pathology Adjusted</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-xs">
                  {calculatedDosage.posologyComparison.map((rule) => {
                    const isSelected = calculatedDosage.activePosologyRule === rule.ruleId;
                    return (
                      <tr 
                        key={rule.ruleId} 
                        className={`transition-colors ${isSelected ? 'bg-cyan-950/40' : 'hover:bg-slate-900/60'}`}
                      >
                        <td className="p-3">
                          <div className="font-semibold text-slate-100 flex items-center gap-2">
                            <span>{rule.ruleName}</span>
                            {rule.isRecommended && (
                              <span className="text-[9px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-1 rounded uppercase">
                                Recommended
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{rule.applicabilityNote}</div>
                        </td>
                        <td className="p-3 font-mono text-slate-400 text-[11px]">{rule.category}</td>
                        <td className="p-3 font-mono text-cyan-300 text-[11px]">{rule.formula}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-200">
                          {rule.calculatedBaseDoseMg} mg
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-400">
                          {rule.adjustedFinalDoseMg} mg
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => onPosologyRuleChange(rule.ruleId)}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                              isSelected
                                ? 'bg-cyan-600 text-white font-semibold'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            {isSelected ? 'Active' : 'Apply Rule'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Classical Posology Principles Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-cyan-300 block">1. Surface Area (BSA) Rule:</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Most physiological processes (glomerular filtration, basal metabolic rate, extracellular fluid volume) correlate directly with BSA rather than body weight alone. BSA calculation is the modern gold standard for therapeutic index precision.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-cyan-300 block">2. Clark's Weight Rule:</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Based on the assumption that an adult of 68 kg (150 lbs) receives 100% of the adult dose. In obese patients, Clark's rule can overestimate hydrophilic drugs, making allometric scaling or BSA preferable.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-cyan-300 block">3. Pediatric Age Rules:</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Young's and Dilling's classical age-based rules assume standard growth curves. In modern additive 3D pharmacy, age rules are augmented with PGx metabolizer phenotypes and renal clearance staging.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CHOOSE DISEASES (FULL INTERACTIVE SELECTION MATRIX) */}
        {activeTab === 'diseases' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-cyan-400" />
                  <span>Interactive Comorbidity &amp; Disease Selection Matrix</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Select or clear any diseases to adjust clearance rates and 3D formulation specifications in real-time.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={setPatientCompletelyHealthy}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                    isTargetPatientHealthy 
                      ? 'bg-emerald-600 text-white border-emerald-500 font-semibold' 
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Make Patient Completely Healthy</span>
                </button>
              </div>
            </div>

            {/* Category Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      selectedCategory === cat ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Search disease or clinical impact..."
                value={diseaseSearch}
                onChange={(e) => setDiseaseSearch(e.target.value)}
                className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 w-64"
              />
            </div>

            {/* Custom Disease Form (Toggleable) */}
            {isAddingCustomDisease ? (
              <form onSubmit={handleAddCustomDisease} className="p-4 rounded-xl bg-slate-950 border border-cyan-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Clinical Disease to Patient</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomDisease(false)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">DISEASE / PATHOLOGY NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Severe Bronchospasm, Nephrotic Syndrome"
                      value={customDiseaseName}
                      onChange={(e) => setCustomDiseaseName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">CLINICAL CATEGORY</label>
                    <select
                      value={customDiseaseCategory}
                      onChange={(e) => setCustomDiseaseCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Respiratory">Respiratory</option>
                      <option value="Endocrine & Metabolic">Endocrine &amp; Metabolic</option>
                      <option value="Cardiovascular">Cardiovascular</option>
                      <option value="Renal & Hepatic">Renal &amp; Hepatic</option>
                      <option value="Neurological">Neurological</option>
                      <option value="Gastrointestinal">Gastrointestinal</option>
                      <option value="Musculoskeletal">Musculoskeletal</option>
                      <option value="Other">Other Pathology</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">CLEARANCE ADJUSTMENT (%)</label>
                    <input
                      type="number"
                      min="-50"
                      max="20"
                      step="1"
                      value={customClearanceModifier}
                      onChange={(e) => setCustomClearanceModifier(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-amber-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomDisease(false)}
                    className="px-3 py-1 rounded bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-cyan-600 text-xs font-medium text-white hover:bg-cyan-500"
                  >
                    Add Condition to Patient
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-end">
                <button
                  onClick={() => setIsAddingCustomDisease(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Custom Pathology Condition</span>
                </button>
              </div>
            )}

            {/* Disease Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDiseases.map(disease => {
                const active = hasDisease(disease.name);
                return (
                  <div
                    key={disease.id}
                    onClick={() => toggleDisease(disease)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                      active
                        ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500/50 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                            {disease.category}
                          </span>
                          <h5 className="text-xs font-bold text-slate-100">{disease.name}</h5>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {disease.clearanceModifier !== 0 && (
                            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
                              {disease.clearanceModifier}%
                            </span>
                          )}
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                            active ? 'bg-cyan-600 border-cyan-400 text-white' : 'border-slate-700 bg-slate-900'
                          }`}>
                            {active && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        {disease.pkImpact}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 text-[10px] text-emerald-400 font-mono">
                      {disease.formulationImpact}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: BIOMETRICS & RENAL */}
        {activeTab === 'biometrics' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
              <span className="font-medium text-slate-200 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Patient Biometric &amp; Pharmacokinetic Indices</span>
              </span>
              <span className="font-mono text-cyan-400">
                Patient: {patient.name} ({patient.sex.toUpperCase()}, {patient.age}y)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400">BSA (MOSTELLER)</div>
                <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                  {calculatedDosage.targetBsaM2.toFixed(2)} <span className="text-xs text-slate-400">m²</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">√([H × W] / 3600)</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400">BSA (DU BOIS)</div>
                <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                  {calculatedDosage.targetBsaDuBoisM2?.toFixed(2)} <span className="text-xs text-slate-400">m²</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">0.007184 × H^0.725 × W^0.425</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400">BODY MASS INDEX</div>
                <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                  {calculatedDosage.targetBmi} <span className="text-xs text-slate-400">kg/m²</span>
                </div>
                <div className="text-[10px] font-mono text-amber-400 mt-0.5">
                  {calculatedDosage.targetBmi > 30 ? '● Class 1 Obesity' : '● Normal/Overweight'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400">ESTIMATED CrCl</div>
                <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                  {calculatedDosage.targetCrClMlMin} <span className="text-xs text-slate-400">mL/min</span>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 mt-0.5">Cockcroft-Gault eGFR</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400">IDEAL BODY WEIGHT</div>
                <div className="text-lg font-mono font-bold text-slate-200 mt-1">
                  {calculatedDosage.targetIbwKg} <span className="text-xs text-slate-400">kg</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Devine Formula</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400">ADJUSTED BODY WEIGHT</div>
                <div className="text-lg font-mono font-bold text-slate-200 mt-1">
                  {calculatedDosage.targetAbwKg} <span className="text-xs text-slate-400">kg</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">IBW + 0.4(Actual - IBW)</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400">ALLOMETRIC SCALED</div>
                <div className="text-lg font-mono font-bold text-cyan-300 mt-1">
                  {calculatedDosage.allometricScaledDoseMg} <span className="text-xs text-slate-400">mg</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">W^0.75 metabolic index</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400">SERUM CREATININE</div>
                <div className="text-lg font-mono font-bold text-slate-200 mt-1">
                  {patient.serumCreatinineMgDl || 1.15} <span className="text-xs text-slate-400">mg/dL</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Baseline lab value</div>
              </div>
            </div>

            {/* Biometric Sliders for Live Sensitivity Analysis */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Target Patient Biometric Sliders</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                    <span>Target Patient Weight:</span>
                    <span className="font-mono text-cyan-400 font-bold">{patient.weightKg} kg</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="160"
                    step="0.5"
                    value={patient.weightKg}
                    onChange={(e) => onUpdatePatientBiometrics(Number(e.target.value), patient.heightCm, patient.age)}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                    <span>Target Patient Height:</span>
                    <span className="font-mono text-cyan-400 font-bold">{patient.heightCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="220"
                    step="1"
                    value={patient.heightCm}
                    onChange={(e) => onUpdatePatientBiometrics(patient.weightKg, Number(e.target.value), patient.age)}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: 3D CHEMICAL COMPOSITION & EXCIPIENTS */}
        {activeTab === 'excipients' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
              <span className="font-medium text-slate-200">
                Patient-Specific Excipient &amp; Polymer Formulation Matrix
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
                <span className="font-semibold text-amber-300">Glycemic &amp; Diabetic Formulation:</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  100% Sucrose, Lactose &amp; Starch free. Uses Kollidon® VA64 copovidone and non-glycemic D-Mannitol to eliminate glycemic index spikes.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-xs">
                <span className="font-semibold text-cyan-300">Respiratory &amp; Dysphagia Protection:</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  High-porosity ZipDose® porous micro-channels allow rapid saliva penetration and oral dispersion within &lt; 10 seconds without water ingestion.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PHARMACOGENOMICS (20 CLINICAL PHARMACOGENES) */}
        {activeTab === 'pharmacogenomics' && (
          <div className="space-y-4">
            {/* Header with CPIC Guidelines & Status Badges */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
                    <Dna className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-100">
                        Pharmacogenomic (PGx) Profile &amp; Phenotyping
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                        20 CPIC Genes
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Grounded in Clinical Pharmacogenetics Implementation Consortium (CPIC Level 1A/1B) &amp; PharmGKB Guidelines.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-right">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">PGx Calibrated Shift</div>
                    <div className={`text-xs font-mono font-bold ${
                      calculatedDosage.geneticModifierPercent < 0 
                        ? 'text-amber-400' 
                        : calculatedDosage.geneticModifierPercent > 0 
                        ? 'text-cyan-400' 
                        : 'text-emerald-400'
                    }`}>
                      {calculatedDosage.geneticModifierPercent >= 0 ? '+' : ''}{calculatedDosage.geneticModifierPercent}%
                    </div>
                  </div>

                  <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-right">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Active Status</div>
                    <div className="text-xs font-mono font-bold text-slate-300">
                      {variantGeneCount > 0 ? (
                        <span className="text-purple-400">{variantGeneCount} Variants</span>
                      ) : (
                        <span className="text-emerald-400">Wild-Type (*1/*1)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Clinical PGx Scenario Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-slate-400 block">
                  FAST CLINICAL PGx PRESETS &amp; BENCHMARKS:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyGenePreset('wild_type')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-900/50 hover:border-emerald-700 transition-colors flex items-center gap-1.5"
                  >
                    <span>🌱 All Wild-Type (100% Normal)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyGenePreset('cardiac')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-900/50 hover:border-cyan-700 transition-colors flex items-center gap-1.5"
                  >
                    <span>🫀 Cardiology Panel (CYP2C9 + VKORC1 + CYP2C19)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyGenePreset('statin')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-900/50 hover:border-amber-700 transition-colors flex items-center gap-1.5"
                  >
                    <span>🛡️ Statin Myopathy (SLCO1B1 + ABCG2)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyGenePreset('oncology')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-900/50 hover:border-rose-700 transition-colors flex items-center gap-1.5"
                  >
                    <span>🧬 Oncology Safety (DPYD + TPMT + UGT1A1)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyGenePreset('ultrarapid')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-900/50 hover:border-indigo-700 transition-colors flex items-center gap-1.5"
                  >
                    <span>⚡ Ultrarapid Phenotype (CYP2D6 + CYP2C19)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyGenePreset('hla_alerts')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-red-300 border border-red-900/50 hover:border-red-700 transition-colors flex items-center gap-1.5"
                  >
                    <span>⚠️ HLA Alleles (HLA-B*57:01 + B*15:02)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Chips & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {geneCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedGeneCategory(cat)}
                    className={`px-2.5 py-1 text-xs rounded transition-colors ${
                      selectedGeneCategory === cat
                        ? 'bg-cyan-600 text-white font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search gene, enzyme, substrate (e.g. Warfarin, Tacrolimus)..."
                  value={geneSearch}
                  onChange={(e) => setGeneSearch(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 w-72"
                />
              </div>
            </div>

            {/* Critical HLA / Toxicity Warning Banner (if positive or severe) */}
            {(patient.geneticProfile.hla_b_5701 === 'positive' ||
              patient.geneticProfile.hla_b_1502 === 'positive' ||
              patient.geneticProfile.hla_a_3101 === 'positive' ||
              patient.geneticProfile.dpyd === 'poor' ||
              patient.geneticProfile.tpmt === 'poor') && (
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/60 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>High-Risk Pharmacogenomic Warnings &amp; Black-Box Flags Detected:</span>
                </div>
                <div className="text-xs space-y-1 text-rose-200">
                  {patient.geneticProfile.hla_b_5701 === 'positive' && (
                    <p className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span><strong>HLA-B*57:01 POSITIVE:</strong> Absolute contraindication for Abacavir. Extreme risk of fatal multi-system hypersensitivity.</span>
                    </p>
                  )}
                  {patient.geneticProfile.hla_b_1502 === 'positive' && (
                    <p className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span><strong>HLA-B*15:02 POSITIVE:</strong> High risk of Stevens-Johnson syndrome (SJS) and toxic epidermal necrolysis (TEN) with carbamazepine.</span>
                    </p>
                  )}
                  {patient.geneticProfile.hla_a_3101 === 'positive' && (
                    <p className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span><strong>HLA-A*31:01 POSITIVE:</strong> High risk of severe cutaneous adverse reactions (SCAR/DRESS) with carbamazepine.</span>
                    </p>
                  )}
                  {patient.geneticProfile.dpyd === 'poor' && (
                    <p className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span><strong>DPYD Poor Metabolizer:</strong> Severe dihydropyrimidine dehydrogenase deficiency; 40% dose reduction &amp; extreme fluoropyrimidine toxicity avoidance.</span>
                    </p>
                  )}
                  {patient.geneticProfile.tpmt === 'poor' && (
                    <p className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span><strong>TPMT Deficient:</strong> Thiopurine S-methyltransferase deficit; 40% dose reduction required to prevent acute bone marrow suppression.</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Gene Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredGenes.map((gene) => {
                const currentValue = (patient.geneticProfile as any)[gene.key] || gene.options[0]?.value;
                const activeOption = gene.options.find(opt => opt.value === currentValue) || gene.options[0];

                return (
                  <div
                    key={gene.key}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                      activeOption.status === 'danger'
                        ? 'bg-rose-950/20 border-rose-800/80 shadow-sm'
                        : activeOption.status === 'caution'
                        ? 'bg-amber-950/20 border-amber-800/80'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top Bar: Symbol, Category, Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-sm font-bold font-mono text-cyan-300">
                              {gene.symbol}
                            </h5>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                              {gene.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300 font-medium mt-0.5">
                            {gene.name}
                          </div>
                        </div>

                        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase shrink-0 ${
                          activeOption.status === 'danger'
                            ? 'bg-rose-950 text-rose-300 border-rose-700'
                            : activeOption.status === 'caution'
                            ? 'bg-amber-950 text-amber-300 border-amber-700'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}>
                          {activeOption.status === 'danger' ? '⚠️ High Impact' : activeOption.status === 'caution' ? 'Moderate Shift' : 'Normal / WT'}
                        </span>
                      </div>

                      {/* Substrates */}
                      <div className="mt-2 text-[10px] text-slate-400 leading-snug">
                        <span className="text-slate-500 font-mono">Substrates: </span>
                        <span className="text-slate-300">{gene.primarySubstrates}</span>
                      </div>

                      {/* Interactive Phenotype Selector */}
                      <div className="mt-2.5">
                        <label className="text-[10px] font-mono text-slate-400 block mb-1">
                          METABOLIZER PHENOTYPE / GENOTYPE:
                        </label>
                        <select
                          value={currentValue}
                          onChange={(e) => handleGeneticsChange(gene.key, e.target.value)}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:ring-1 transition-colors ${
                            activeOption.status === 'danger'
                              ? 'bg-rose-950/60 border-rose-700 text-rose-200 focus:ring-rose-500'
                              : activeOption.status === 'caution'
                              ? 'bg-amber-950/60 border-amber-700 text-amber-200 focus:ring-amber-500'
                              : 'bg-slate-900 border-slate-700 text-cyan-300 focus:ring-cyan-500'
                          }`}
                        >
                          {gene.options.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Clinical CPIC Note & 3D Additive Impact */}
                    <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 leading-relaxed">
                      {gene.clinicalSignificance}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Summary: Net Calibration Applied to 3D Printer */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3D Additive Manufacturing Dosing &amp; Chemical Customization Rationale:</span>
                </span>
                <span className="font-mono font-bold text-cyan-400">
                  Net Genetic Phenotype Adjustment: {calculatedDosage.geneticModifierPercent >= 0 ? '+' : ''}{calculatedDosage.geneticModifierPercent}%
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {calculatedDosage.geneticRationale}
              </p>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2">
                <div className="text-slate-400">
                  Unlike traditional mass-manufactured fixed tablets (which force all genotypes onto one standard pill size), the 3D printing system personalizes API layer extrusion thickness, binder volume, and core porosity in real time.
                </div>
                <div className="font-mono text-cyan-300 text-xs font-semibold">
                  Resulting 3D Tablet Strength: {calculatedDosage.finalPersonalizedDoseMg} mg
                </div>
              </div>
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
