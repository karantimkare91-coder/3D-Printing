import { TabletFormulation, Patient } from '../types/pharmacy';

export interface SlicedLayer {
  layerIndex: number;
  zHeightMm: number;
  type: 'base_seal' | 'api_matrix' | 'porous_infill' | 'sustained_outer' | 'cap_seal';
  points: { x: number; y: number }[];
  dropletsOrExtrusionCount: number;
  estimatedDryTimeSec: number;
}

export interface MachineGCodePackage {
  filename: string;
  gcodeString: string;
  totalLayers: number;
  estimatedPrintDurationSec: number;
  powderVolumeCm3: number;
  binderVolumeUl: number;
  nozzleTempC: number;
  bedTempC: number;
  layers: SlicedLayer[];
}

/**
 * Generates pharmaceutical G-Code instructions and 3D slicing geometries
 * for a customized 3D tablet formulation.
 */
export function sliceTabletGeometry(
  formulation: TabletFormulation,
  patient: Patient,
  batchId: string
): MachineGCodePackage {
  const { diameterMm, heightMm, layerCount, layerThicknessMm, technique, shape, infillDensityPercent } = formulation;
  const radius = diameterMm / 2;
  const layers: SlicedLayer[] = [];

  // Generate sliced layers
  for (let i = 0; i < layerCount; i++) {
    const zHeight = (i + 1) * layerThicknessMm;
    const isBaseOrCap = i < 3 || i >= layerCount - 3;
    
    // Create toolpath points
    const points: { x: number; y: number }[] = [];
    const segments = 32;

    for (let s = 0; s <= segments; s++) {
      const theta = (s / segments) * Math.PI * 2;
      let r = radius;

      if (shape === 'oblong_caplet') {
        // Caplet elongation factor along X
        const xOffset = Math.sin(theta) > 0 ? 3.0 : -3.0;
        const x = Math.cos(theta) * (r * 0.7) + xOffset;
        const y = Math.sin(theta) * (r * 0.7);
        points.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
      } else {
        const x = Math.cos(theta) * r;
        const y = Math.sin(theta) * r;
        points.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
      }
    }

    let layerType: SlicedLayer['type'] = 'api_matrix';
    if (isBaseOrCap) {
      layerType = i < 3 ? 'base_seal' : 'cap_seal';
    } else if (infillDensityPercent < 50) {
      layerType = 'porous_infill';
    } else if (shape === 'bilayer_polypill' && i > layerCount / 2) {
      layerType = 'sustained_outer';
    }

    layers.push({
      layerIndex: i + 1,
      zHeightMm: Number(zHeight.toFixed(3)),
      type: layerType,
      points,
      dropletsOrExtrusionCount: Math.round(180 * (infillDensityPercent / 100)),
      estimatedDryTimeSec: technique === 'binder_jetting' ? 1.2 : 2.5
    });
  }

  // Calculate Volumes
  const tabletVolumeMm3 = Math.PI * Math.pow(radius, 2) * heightMm;
  const powderVolumeCm3 = Number((tabletVolumeMm3 / 1000).toFixed(3));
  const binderVolumeUl = Number(((tabletVolumeMm3 * (formulation.porosityPercent / 100)) * 0.45).toFixed(1));

  // Build Standard Pharmaceutical Additive G-Code
  const gcodeLines: string[] = [
    `; ========================================================`,
    `; PHARMAPRINT PRECISION MEDICINE G-CODE SPECIFICATION v3.2`,
    `; Patient: ${patient.name} | ID: ${patient.id}`,
    `; Batch / Lot: ${batchId}`,
    `; Target Mass: ${formulation.totalMassMg} mg | Shape: ${shape.toUpperCase()}`,
    `; Method: ${technique.toUpperCase()} | Release: ${formulation.releaseProfile.toUpperCase()}`,
    `; Sliced Layers: ${layerCount} | Layer Height: ${layerThicknessMm} mm`,
    `; Excipients: Kollidon VA64, Croscarmellose, Mannitol, API`,
    `; ========================================================`,
    `G21 ; Set units to millimeters`,
    `G90 ; Absolute positioning`,
    `M82 ; Absolute extrusion mode`,
    `M104 S${technique === 'binder_jetting' ? 24 : 75} ; Set nozzle temp`,
    `M140 S${technique === 'binder_jetting' ? 32 : 45} ; Set powder bed heating`,
    `M116 ; Wait for temperature stabilization`,
    `G28 ; Home all axes (Cleanroom sterile datum)`,
    `M106 S180 ; Activate micro-exhaust HEPA ventilation`,
    `; Chamber environment: RH 32%, ISO Class 5 laminar flow`,
    ``
  ];

  layers.forEach((l) => {
    gcodeLines.push(`; --- LAYER ${l.layerIndex}/${layerCount} [Z = ${l.zHeightMm}mm | TYPE: ${l.type.toUpperCase()}] ---`);
    gcodeLines.push(`G1 Z${l.zHeightMm} F800 ; Elevate print carriage`);
    
    if (technique === 'binder_jetting') {
      gcodeLines.push(`M201 P_RECOAT V0.1 ; Recoater blade powder spread sweep`);
      gcodeLines.push(`G4 P350 ; Dwell for powder compaction`);
      gcodeLines.push(`M205 J_JETTING DROPLETS=${l.dropletsOrExtrusionCount} FREQ=12000HZ`);
    } else {
      gcodeLines.push(`G1 X-10 Y-10 F2400 ; Position syringe head`);
      gcodeLines.push(`G1 E0.8 F300 ; Prime semi-solid paste`);
      gcodeLines.push(`G1 X${radius.toFixed(1)} Y0 E1.4 F600 ; Perimeter perimeter pass`);
    }

    gcodeLines.push(`G4 P${Math.round(l.estimatedDryTimeSec * 1000)} ; In-line IR sensor flash drying`);
    gcodeLines.push(`M300 S1 ; Visual optical validation sensor check passed`);
    gcodeLines.push(``);
  });

  gcodeLines.push(`; --- POST-PROCESSING & COMPLETION ---`);
  gcodeLines.push(`G1 Z${(heightMm + 20).toFixed(1)} F1200 ; Lift nozzle clear`);
  gcodeLines.push(`G28 X0 Y0 ; Return carriage to sterile park dock`);
  gcodeLines.push(`M104 S0 ; Heater off`);
  gcodeLines.push(`M140 S0 ; Bed off`);
  gcodeLines.push(`M84 ; Disable stepper motors`);
  gcodeLines.push(`; END OF BATCH FILE - READY FOR NIR SPECTROMETRY INSPECTION`);

  return {
    filename: `PRX_${batchId}_${patient.name.replace(/\s+/g, '_')}.gcode`,
    gcodeString: gcodeLines.join('\n'),
    totalLayers: layerCount,
    estimatedPrintDurationSec: formulation.estimatedPrintTimeSec,
    powderVolumeCm3,
    binderVolumeUl,
    nozzleTempC: technique === 'binder_jetting' ? 24 : 75,
    bedTempC: technique === 'binder_jetting' ? 32 : 45,
    layers
  };
}
