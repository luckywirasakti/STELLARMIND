import React from 'react';
import { Crosshair, MousePointer2, Link2, Plus, Camera, Download, Upload, Rocket, Trash2 } from 'lucide-react';

interface HUDProps {
  handleResetView: () => void;
  interactionMode: 'drag' | 'link';
  setInteractionMode: (mode: 'drag' | 'link') => void;
  handleAddNode: () => void;
  handleExportImage: () => void;
  handleExport: () => void;
  handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLoadSample: () => void;
  handleClearAll: () => void;
}

export function HUD({
  handleResetView,
  interactionMode,
  setInteractionMode,
  handleAddNode,
  handleExportImage,
  handleExport,
  handleImport,
  handleLoadSample,
  handleClearAll
}: HUDProps) {
  return (
    <div className="glass-panel main-toolbar">
      <button className="toolbar-btn" onClick={handleResetView}>
        <Crosshair size={18} /> <span className="toolbar-label">Reset View</span>
      </button>
      
      <div style={{ height: '1px', background: 'var(--border-glass)', width: '100%', margin: '4px 0' }} />

      <button 
        className={`toolbar-btn ${interactionMode === 'drag' ? 'active' : ''}`}
        onClick={() => setInteractionMode('drag')}
      >
        <MousePointer2 size={18} /> <span className="toolbar-label">Move Mode</span>
      </button>
      <button 
        className={`toolbar-btn ${interactionMode === 'link' ? 'active' : ''}`}
        onClick={() => setInteractionMode('link')}
      >
        <Link2 size={18} /> <span className="toolbar-label">Link Mode</span>
      </button>

      <div style={{ height: '1px', background: 'var(--border-glass)', width: '100%', margin: '4px 0' }} />

      <button 
        className="toolbar-btn"
        style={{ background: 'rgba(0, 240, 255, 0.2)', color: '#00f0ff' }}
        onClick={handleAddNode}
      >
        <Plus size={18} /> <span className="toolbar-label">Create Star</span>
      </button>
      
      <div style={{ height: '1px', background: 'var(--border-glass)', width: '100%', margin: '4px 0' }} />

      <button className="toolbar-btn" onClick={handleExportImage}>
        <Camera size={18} /> <span className="toolbar-label">Capture Photo</span>
      </button>

      <button className="toolbar-btn" onClick={handleExport}>
        <Download size={18} /> <span className="toolbar-label">Export JSON</span>
      </button>

      <label className="toolbar-btn" style={{ cursor: 'pointer', margin: 0 }}>
        <Upload size={18} /> <span className="toolbar-label">Import JSON</span>
        <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
      </label>
      
      <div style={{ height: '1px', background: 'var(--border-glass)', width: '100%', margin: '4px 0' }} />

      <button className="toolbar-btn" onClick={handleLoadSample}>
        <Rocket size={18} /> <span className="toolbar-label">Load Demo</span>
      </button>
      
      <button className="toolbar-btn danger" onClick={handleClearAll}>
        <Trash2 size={18} /> <span className="toolbar-label">Clear All</span>
      </button>
    </div>
  );
}
