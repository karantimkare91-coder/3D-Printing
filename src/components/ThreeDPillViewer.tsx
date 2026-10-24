import React, { useState, useEffect, useRef } from 'react';
import { TabletFormulation } from '../types/pharmacy';
import { Eye, Layers, RotateCw, ZoomIn, ZoomOut, CheckCircle2 } from 'lucide-react';

interface ThreeDPillViewerProps {
  formulation: TabletFormulation;
  patientName: string;
  activeDrugName: string;
  targetDoseMg: number;
}

export const ThreeDPillViewer: React.FC<ThreeDPillViewerProps> = ({
  formulation,
  patientName,
  activeDrugName,
  targetDoseMg
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotX, setRotX] = useState(25);
  const [rotY, setRotY] = useState(35);
  const [zoom, setZoom] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [showCrossSection, setShowCrossSection] = useState(false);
  const [activeLayerSlice, setActiveLayerSlice] = useState(formulation.layerCount);
  const [renderMode, setRenderMode] = useState<'solid' | 'wireframe' | 'porosity'>('solid');

  // Keep activeLayerSlice in sync when layer count changes
  useEffect(() => {
    setActiveLayerSlice(formulation.layerCount);
  }, [formulation.layerCount]);

  // Canvas 3D rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear background with sterile cleanroom dark backdrop
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Draw background calibration grid
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    const gridSize = 24;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const centerX = width / 2;
    const centerY = height / 2;

    // 3D projection math
    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;

    // Base dimensions scaled to canvas
    const baseRadius = 85 * zoom * (formulation.diameterMm / 12.0);
    const totalHeight = 45 * zoom * (formulation.heightMm / 5.0);
    const totalLayers = formulation.layerCount;
    const visibleLayers = Math.max(1, Math.min(activeLayerSlice, totalLayers));

    // Sort layers from bottom to top for correct painter's depth
    for (let i = 0; i < visibleLayers; i++) {
      const layerProgress = i / totalLayers;
      const layerZ = (layerProgress - 0.5) * totalHeight;

      // Color scheme based on release profile / formulation layers
      let layerColor = '#06b6d4'; // Cyan default API
      let strokeColor = '#0891b2';

      if (formulation.shape === 'bilayer_polypill') {
        if (i < totalLayers / 2) {
          layerColor = '#06b6d4'; // Layer 1: Rapid release API (cyan)
          strokeColor = '#0891b2';
        } else {
          layerColor = '#3b82f6'; // Layer 2: Sustained diabetic matrix (cobalt)
          strokeColor = '#2563eb';
        }
      } else if (formulation.releaseProfile === 'rapid_disintegrating') {
        // ZipDose porous gradient
        layerColor = i % 2 === 0 ? '#10b981' : '#059669'; // Emerald porous matrix
        strokeColor = '#047857';
      } else {
        layerColor = i % 3 === 0 ? '#38bdf8' : '#0284c7';
        strokeColor = '#0369a1';
      }

      // Check if cross-section cutaway is enabled
      const segments = 36;
      const startAngle = showCrossSection ? 0 : 0;
      const endAngle = showCrossSection ? Math.PI * 1.5 : Math.PI * 2;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Draw the layer slice
      ctx.beginPath();
      for (let s = 0; s <= segments; s++) {
        const theta = startAngle + (s / segments) * (endAngle - startAngle);
        let rx = baseRadius;
        let ry = baseRadius;

        if (formulation.shape === 'oblong_caplet') {
          // Elongate along X
          rx = baseRadius * 1.35;
          ry = baseRadius * 0.75;
        }

        // 3D Isometric / Euler rotation
        const px = Math.cos(theta) * rx;
        const py = Math.sin(theta) * ry;
        const pz = layerZ;

        // Rotate around Y
        const x1 = px * Math.cos(radY) + pz * Math.sin(radY);
        const z1 = -px * Math.sin(radY) + pz * Math.cos(radY);

        // Rotate around X
        const y2 = py * Math.cos(radX) - z1 * Math.sin(radX);
        const z2 = py * Math.sin(radX) + z1 * Math.cos(radX);

        // Perspective projection
        const distance = 400;
        const scale = distance / (distance + z2);
        const screenX = x1 * scale;
        const screenY = y2 * scale;

        if (s === 0) {
          ctx.moveTo(screenX, screenY);
        } else {
          ctx.lineTo(screenX, screenY);
        }
      }

      if (showCrossSection) {
        // Connect to center for cutaway slice
        const cz1 = layerZ * Math.sin(radY);
        const cz2 = layerZ * Math.cos(radY);
        const cy2 = -cz2 * Math.sin(radX);
        const cscale = 400 / (400 + cz2 * Math.cos(radX));
        ctx.lineTo(cz1 * cscale, cy2 * cscale);
        ctx.closePath();
      }

      if (renderMode === 'solid') {
        ctx.fillStyle = layerColor + '2a';
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (renderMode === 'wireframe') {
        ctx.strokeStyle = strokeColor + 'cc';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      } else {
        // Porosity mode: draw dots to represent micro-pore binder voids
        ctx.fillStyle = layerColor + '15';
        ctx.fill();
        ctx.strokeStyle = strokeColor + 'aa';
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // Draw internal micro-voids
        if (i % 2 === 0) {
          ctx.fillStyle = '#67e8f9';
          for (let p = 0; p < 8; p++) {
            const poreAngle = (p / 8) * Math.PI * 2 + i * 0.4;
            const poreR = (baseRadius * 0.5) * (0.3 + (p % 3) * 0.2);
            const pX = Math.cos(poreAngle) * poreR;
            const pY = Math.sin(poreAngle) * poreR;
            
            const x1 = pX * Math.cos(radY) + layerZ * Math.sin(radY);
            const z1 = -pX * Math.sin(radY) + layerZ * Math.cos(radY);
            const y2 = pY * Math.cos(radX) - z1 * Math.sin(radX);
            const z2 = pY * Math.sin(radX) + z1 * Math.cos(radX);
            const pscale = 400 / (400 + z2);

            ctx.beginPath();
            ctx.arc(x1 * pscale, y2 * pscale, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.restore();
    }

    // Draw dimension calipers overlay
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    
    // Diameter caliper at bottom
    const caliperY = height - 32;
    ctx.beginPath();
    ctx.moveTo(centerX - baseRadius, caliperY);
    ctx.lineTo(centerX + baseRadius, caliperY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Caliper ticks
    ctx.beginPath();
    ctx.moveTo(centerX - baseRadius, caliperY - 5);
    ctx.lineTo(centerX - baseRadius, caliperY + 5);
    ctx.moveTo(centerX + baseRadius, caliperY - 5);
    ctx.lineTo(centerX + baseRadius, caliperY + 5);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Ø ${formulation.diameterMm.toFixed(1)} mm`, centerX, caliperY - 6);

  }, [rotX, rotY, zoom, showCrossSection, activeLayerSlice, renderMode, formulation]);

  // Drag interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    setRotY((prev) => prev + dx * 0.7);
    setRotX((prev) => Math.max(-80, Math.min(80, prev - dy * 0.7)));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>3D Digital Tablet CAD Model</span>
            <span className="text-xs font-mono text-cyan-400">· {formulation.shape.replace('_', ' ').toUpperCase()}</span>
          </h3>
          <p className="text-xs text-slate-400">
            {activeDrugName} · <span className="text-emerald-400 font-mono font-medium">{targetDoseMg} mg</span> for {patientName}
          </p>
        </div>

        {/* Render mode segmented buttons */}
        <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => setRenderMode('solid')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              renderMode === 'solid' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Solid Mesh
          </button>
          <button
            onClick={() => setRenderMode('porosity')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              renderMode === 'porosity' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ZipDose® Porosity
          </button>
          <button
            onClick={() => setRenderMode('wireframe')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              renderMode === 'wireframe' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Toolpath
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative flex-1 min-h-[300px] w-full cursor-grab active:cursor-grabbing select-none">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* HUD Overlay Stats (Top Left) */}
        <div className="absolute top-3 left-3 pointer-events-none space-y-1">
          <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 backdrop-blur-sm">
            <span className="text-slate-500">MASS:</span> <span className="text-slate-200 font-semibold">{formulation.totalMassMg} mg</span>
            <span className="mx-1.5 text-slate-600">|</span>
            <span className="text-slate-500">HEIGHT:</span> <span className="text-slate-200">{formulation.heightMm.toFixed(1)} mm</span>
            <span className="mx-1.5 text-slate-600">|</span>
            <span className="text-slate-500">LAYERS:</span> <span className="text-cyan-400 font-semibold">{formulation.layerCount}</span>
          </div>

          <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 backdrop-blur-sm">
            <span className="text-slate-500">DISINTEGRATION:</span>{' '}
            <span className="text-emerald-400 font-semibold">&lt; {formulation.estimatedDisintegrationSec}s</span>
            <span className="mx-1.5 text-slate-600">|</span>
            <span className="text-slate-500">POROSITY:</span> <span className="text-cyan-400">{formulation.porosityPercent}%</span>
          </div>
        </div>

        {/* Viewport Action Controls (Top Right) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800 backdrop-blur-sm">
          <button
            title="Toggle 90° Cross-Section View"
            onClick={() => setShowCrossSection(!showCrossSection)}
            className={`p-2 rounded text-xs transition-colors flex items-center gap-1.5 ${
              showCrossSection ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono">Cutaway</span>
          </button>

          <button
            title="Reset Orientation"
            onClick={() => {
              setRotX(25);
              setRotY(35);
              setZoom(1.0);
            }}
            className="p-2 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono">Reset</span>
          </button>

          <div className="flex items-center gap-1 pt-1 border-t border-slate-800">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Drag Hint */}
        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-500 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800 pointer-events-none">
          Click & Drag to Rotate 360°
        </div>
      </div>

      {/* Slicing Layer Inspection Slider */}
      <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium">Additive Layer Slicing Inspector:</span>
            <span className="font-mono text-cyan-400">
              Layer {activeLayerSlice} of {formulation.layerCount}
            </span>
            <span className="text-slate-500 font-mono">
              ({((activeLayerSlice / formulation.layerCount) * formulation.heightMm).toFixed(2)} mm / {formulation.heightMm.toFixed(2)} mm)
            </span>
          </div>

          <button
            onClick={() => setActiveLayerSlice(formulation.layerCount)}
            className="text-[11px] font-mono text-slate-400 hover:text-cyan-400 underline transition-colors"
          >
            Show Full Tablet
          </button>
        </div>

        <input
          type="range"
          min="1"
          max={formulation.layerCount}
          value={activeLayerSlice}
          onChange={(e) => setActiveLayerSlice(Number(e.target.value))}
          className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />

        {/* Microstructure explanation */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              <span>API Active Zone ({targetDoseMg} mg)</span>
            </span>
            {formulation.shape === 'bilayer_polypill' && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Diabetic Sustained Polymer Matrix</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Porous Recoat Bed ({formulation.porosityPercent}% Voids)</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
            <CheckCircle2 className="w-3 h-3" />
            <span>Layer Thickness: {formulation.layerThicknessMm} mm validated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
