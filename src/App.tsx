import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, WheelEvent as ReactWheelEvent } from 'react';
import { Plus, X, Maximize, Minimize, Crosshair, Star, Trash2, MousePointer2, Link2, Rocket, Download, Upload, Camera, Bold, Italic, List, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './index.css';

interface StarNode {
  id: string;
  x: number;
  y: number;
  title: string;
  content: string;
  color: string;
  size: number;
}

interface Constellation {
  id: string;
  sourceId: string;
  targetId: string;
}

const STAR_COLORS = ['#00f0ff', '#ff007f', '#39ff14', '#ffb300', '#9d4edd', '#ffffff'];

const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  const [nodes, setNodes] = useState<StarNode[]>([
    { id: 'root', x: window.innerWidth / 2, y: window.innerHeight / 2, title: 'Central Core', content: 'The center of your mind map universe.', color: '#00f0ff', size: 24 }
  ]);
  const [connections, setConnections] = useState<Constellation[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Viewport State for Panning & Zooming
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [linkSourceNodeId, setLinkSourceNodeId] = useState<string | null>(null);
  const [linkPointerPos, setLinkPointerPos] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [interactionMode, setInteractionMode] = useState<'drag' | 'link'>('drag');
  
  const containerRef = useRef<HTMLDivElement>(null);

  // --- PANNING & ZOOMING ---
  const handleWheel = (e: ReactWheelEvent) => {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    setViewport(prev => {
      const newScale = Math.min(Math.max(0.2, prev.scale + delta), 4);
      // Zoom towards cursor would require offset calculations, for simplicity we just scale
      return { ...prev, scale: newScale };
    });
  };

  const handlePointerDown = (e: ReactMouseEvent) => {
    if ((e.target as HTMLElement).closest('.glass-panel') || (e.target as HTMLElement).closest('.star-node')) {
      return; // Don't pan if clicking UI or nodes
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
  };

  const handlePointerMove = (e: ReactMouseEvent) => {
    if (linkSourceNodeId) {
      const worldX = (-viewport.x + e.clientX) / viewport.scale;
      const worldY = (-viewport.y + e.clientY) / viewport.scale;
      setLinkPointerPos({ x: worldX, y: worldY });
      return;
    }
    if (draggingNodeId) {
      setNodes(prev => prev.map(n => 
        n.id === draggingNodeId 
          ? { ...n, x: n.x + e.movementX / viewport.scale, y: n.y + e.movementY / viewport.scale } 
          : n
      ));
      return;
    }
    if (!isDragging) return;
    setViewport(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  };

  const handlePointerUp = (e: ReactMouseEvent) => {
    setIsDragging(false);
    setDraggingNodeId(null);
    
    if (linkSourceNodeId) {
      const worldX = (-viewport.x + e.clientX) / viewport.scale;
      const worldY = (-viewport.y + e.clientY) / viewport.scale;
      
      let closestNode = null;
      let minDistance = 60;
      
      nodes.forEach(n => {
        if (n.id === linkSourceNodeId) return;
        const dist = Math.hypot(n.x - worldX, n.y - worldY);
        if (dist < minDistance) {
          closestNode = n;
          minDistance = dist;
        }
      });
      
      if (closestNode) {
        const exists = connections.some(c => 
          (c.sourceId === linkSourceNodeId && c.targetId === closestNode!.id) || 
          (c.sourceId === closestNode!.id && c.targetId === linkSourceNodeId)
        );
        if (!exists) {
          setConnections([...connections, { id: generateId(), sourceId: linkSourceNodeId, targetId: closestNode.id }]);
        }
      }
      setLinkSourceNodeId(null);
    }
  };

  useEffect(() => {
    // Add non-passive wheel listener for zooming to prevent default scroll
    const container = containerRef.current;
    if (container) {
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const zoomSensitivity = 0.002;
        const delta = -e.deltaY * zoomSensitivity;
        setViewport(prev => {
          const newScale = Math.min(Math.max(0.2, prev.scale + delta), 4);
          return { ...prev, scale: newScale };
        });
      };
      container.addEventListener('wheel', onWheel, { passive: false });
      return () => container.removeEventListener('wheel', onWheel);
    }
  }, []);

  // Disable context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Allow right-click on inputs and textareas so users can copy/paste text natively
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // --- NODE INTERACTIONS ---
  const handleNodePointerDown = (e: ReactMouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedNodeId(id);
    if (interactionMode === 'link') {
      const node = nodes.find(n => n.id === id);
      if (node) {
        setLinkSourceNodeId(id);
        setLinkPointerPos({ x: node.x, y: node.y });
      }
    } else {
      setDraggingNodeId(id);
    }
  };

  const handleAddNode = () => {
    // Add in center of current viewport view with slight scatter
    const x = (-viewport.x + window.innerWidth / 2) / viewport.scale + (Math.random() - 0.5) * 150;
    const y = (-viewport.y + window.innerHeight / 2) / viewport.scale + (Math.random() - 0.5) * 150;
    
    const newNode: StarNode = {
      id: generateId(),
      x,
      y,
      title: 'New Star',
      content: 'Write your thoughts here...',
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      size: 16 + Math.random() * 12
    };
    
    setNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const handleDeleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    setConnections(connections.filter(c => c.sourceId !== id && c.targetId !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes, connections }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "stellarmind_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const { nodes: newNodes, connections: newConn } = JSON.parse(ev.target?.result as string);
          setNodes(newNodes);
          setConnections(newConn);
        } catch (e) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportImage = async () => {
    if (!containerRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: '#070913',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        ignoreElements: (element) => element.classList.contains('main-toolbar') || element.classList.contains('glass-panel')
      });
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'stellarmind_map.png';
      a.click();
    } catch (e) {
      console.error('Failed to export image', e);
    }
  };

  const handleLoadSample = () => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    
    setNodes([
      { id: 'n1', x: cx, y: cy, title: 'Project Core', content: 'The central hub of our application architecture.', color: '#00f0ff', size: 32 },
      { id: 'n2', x: cx - 250, y: cy - 150, title: 'Frontend UI', content: 'React components and glassmorphism styling.', color: '#ff007f', size: 24 },
      { id: 'n3', x: cx + 250, y: cy - 150, title: 'Backend API', content: 'Node.js server handling data persistence.', color: '#39ff14', size: 24 },
      { id: 'n4', x: cx - 350, y: cy + 100, title: 'State Mgmt', content: 'Zustand or React Context for global state.', color: '#9d4edd', size: 20 },
      { id: 'n5', x: cx + 350, y: cy + 100, title: 'Database', content: 'PostgreSQL storing user nodes and edges.', color: '#ffb300', size: 20 },
      { id: 'n6', x: cx, y: cy + 250, title: 'Analytics', content: 'Tracking user interaction and graph growth.', color: '#ffffff', size: 22 },
    ]);
    
    setConnections([
      { id: 'c1', sourceId: 'n1', targetId: 'n2' },
      { id: 'c2', sourceId: 'n1', targetId: 'n3' },
      { id: 'c3', sourceId: 'n2', targetId: 'n4' },
      { id: 'c4', sourceId: 'n3', targetId: 'n5' },
      { id: 'c5', sourceId: 'n1', targetId: 'n6' },
      { id: 'c6', sourceId: 'n2', targetId: 'n3' },
    ]);
    
    setViewport({ x: 0, y: 0, scale: 0.8 });
    setSelectedNodeId(null);
  };

  // Auto-Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('stellar_mind_data');
    if (saved) {
      try {
        const { nodes: savedNodes, connections: savedConn } = JSON.parse(saved);
        if (savedNodes && savedNodes.length > 0) {
          setNodes(savedNodes);
          setConnections(savedConn || []);
        }
      } catch (e) { console.error('Failed to load save', e); }
    }
  }, []);

  // Auto-Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('stellar_mind_data', JSON.stringify({ nodes, connections }));
  }, [nodes, connections]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Update node details
  const updateSelectedNode = (updates: Partial<StarNode>) => {
    setNodes(nodes.map(n => n.id === selectedNodeId ? { ...n, ...updates } : n));
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea || !selectedNode) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = selectedNode.content || '';
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    
    const newText = `${before}${prefix}${selected || 'text'}${suffix}${after}`;
    updateSelectedNode({ content: newText });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
    }, 10);
  };

  return (
    <>
      <div className="nebula-bg" />
      
      {/* Mobile Portrait Block */}
      <div id="portrait-block">
        <Star size={48} color="var(--star-glow)" fill="var(--star-glow)" style={{ marginBottom: 20 }} className="pulse-glow" />
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '2px', margin: 0 }}>PLEASE ROTATE YOUR DEVICE</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 10, maxWidth: '300px', lineHeight: 1.5 }}>
          StellarMind requires a landscape orientation for optimal cosmic exploration.
        </p>
      </div>

      {/* HUD (Heads Up Display) UI */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star color="var(--star-glow)" fill="var(--star-glow)" size={24} className="pulse-glow" style={{ borderRadius: '50%' }} /> 
          STELLARMIND
        </h1>
        <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '12px', letterSpacing: '1px' }}>
          COSMIC KNOWLEDGE GRAPH
        </p>
      </div>

      {/* HUD Vertical Toolbar (Right side) */}
      {/* HUD Vertical Toolbar (Right side) */}
      <div className="glass-panel main-toolbar">
        <button className="toolbar-btn" onClick={() => setViewport({ x: 0, y: 0, scale: 1 })}>
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

        <button 
          className="toolbar-btn"
          onClick={handleExportImage}
        >
          <Camera size={18} /> <span className="toolbar-label">Capture Photo</span>
        </button>

        <button 
          className="toolbar-btn"
          onClick={handleExport}
        >
          <Download size={18} /> <span className="toolbar-label">Export JSON</span>
        </button>

        <label className="toolbar-btn" style={{ cursor: 'pointer', margin: 0 }}>
          <Upload size={18} /> <span className="toolbar-label">Import JSON</span>
          <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        </label>
        
        <div style={{ height: '1px', background: 'var(--border-glass)', width: '100%', margin: '4px 0' }} />

        <button 
          className="toolbar-btn"
          onClick={handleLoadSample}
        >
          <Rocket size={18} /> <span className="toolbar-label">Load Demo</span>
        </button>
        
        <button 
          className="toolbar-btn danger"
          onClick={() => { setNodes([]); setConnections([]); setSelectedNodeId(null); localStorage.removeItem('stellar_mind_data'); }}
        >
          <Trash2 size={18} /> <span className="toolbar-label">Clear All</span>
        </button>
      </div>

      {/* Infinite Canvas */}
      <div 
        ref={containerRef}
        className="universe-container"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, left: 0, width: '100%', height: '100%',
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Connections Layer */}
          <svg className="constellation-layer">
            {connections.map(conn => {
              const src = nodes.find(n => n.id === conn.sourceId);
              const tgt = nodes.find(n => n.id === conn.targetId);
              if (!src || !tgt) return null;
              return (
                <line 
                  key={conn.id}
                  x1={src.x} y1={src.y} 
                  x2={tgt.x} y2={tgt.y} 
                  className="constellation-line"
                />
              );
            })}
            
            {/* Draw active linking line */}
            {linkSourceNodeId && (
              <line 
                x1={nodes.find(n => n.id === linkSourceNodeId)?.x} 
                y1={nodes.find(n => n.id === linkSourceNodeId)?.y} 
                x2={linkPointerPos.x} 
                y2={linkPointerPos.y} 
                stroke="var(--star-glow)" strokeWidth={2} strokeDasharray="4 4"
                className="pulse-glow"
                style={{ pointerEvents: 'none' }}
              />
            )}
          </svg>

          {/* Nodes Layer */}
          {nodes.map(node => (
            <div 
              key={node.id}
              className={`star-node ${selectedNodeId === node.id ? 'selected pulse-glow' : ''}`}
              style={{
                left: node.x,
                top: node.y,
                width: node.size,
                height: node.size,
                backgroundColor: node.color,
                boxShadow: `0 0 ${node.size}px ${node.color}, 0 0 ${node.size*2}px ${node.color}80`
              }}
              onPointerDown={(e) => handleNodePointerDown(e, node.id)}
            >
              <div className="node-card">
                <div className="node-title" style={{ color: selectedNodeId === node.id ? node.color : 'inherit' }}>{node.title}</div>
                {node.content && (
                  <div className="node-snippet">
                    <ReactMarkdown>{node.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Side Panel */}
      {selectedNode && (
        <div className="glass-panel editor-panel">
          <div className="flex-between">
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={12} color="var(--star-glow)" /> STAR CONSOLE
            </span>
            <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => setSelectedNodeId(null)}>
              <X size={14} />
            </button>
          </div>

          <div style={{ height: '1px', background: 'var(--border-glass)' }} />

          {/* Identity Section */}
          <div className="editor-section identity-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '1px' }}>IDENTITY</span>
            <input 
              type="text" 
              className="glass-input" 
              style={{ fontSize: '18px', fontWeight: 'bold' }}
              value={selectedNode.title}
              onChange={(e) => updateSelectedNode({ title: e.target.value })}
              placeholder="Star Name"
            />
          </div>

          {/* Data Section */}
          <div className="editor-section data-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="flex-between">
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '1px' }}>LOGS & DATA (Markdown)</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="btn-icon" style={{ width: '24px', height: '24px' }} onClick={() => insertMarkdown('**', '**')} title="Bold">
                  <Bold size={12} />
                </button>
                <button className="btn-icon" style={{ width: '24px', height: '24px' }} onClick={() => insertMarkdown('*', '*')} title="Italic">
                  <Italic size={12} />
                </button>
                <button className="btn-icon" style={{ width: '24px', height: '24px' }} onClick={() => insertMarkdown('\n- ')} title="List">
                  <List size={12} />
                </button>
                <button className="btn-icon" style={{ width: '24px', height: '24px' }} onClick={() => {
                  const url = prompt('Enter image URL:');
                  if (url) insertMarkdown(`![Image](${url})`, '');
                }} title="Attach Image">
                  <ImageIcon size={12} />
                </button>
              </div>
            </div>
            <textarea 
              id="markdown-editor"
              className="glass-input"
              style={{ height: '140px', resize: 'vertical', lineHeight: '1.5' }}
              value={selectedNode.content || ''}
              onChange={(e) => updateSelectedNode({ content: e.target.value })}
              placeholder="Information regarding this star..."
            />
          </div>

          {/* Appearance Section */}
          <div className="editor-section appearance-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '1px' }}>EMISSION SPECTRUM</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {STAR_COLORS.map(color => (
                <div 
                  key={color}
                  onClick={() => updateSelectedNode({ color })}
                  style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    backgroundColor: color, cursor: 'pointer',
                    border: selectedNode.color === color ? '2px solid white' : '2px solid transparent',
                    boxShadow: `0 0 10px ${color}80`
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--border-glass)', margin: '4px 0' }} />

          {/* Actions Section */}
          <div className="editor-section danger-section flex-between">
            <span style={{ fontSize: '10px', color: 'rgba(255,85,85,0.7)', fontWeight: 600, letterSpacing: '1px' }}>DANGER ZONE</span>
            <button 
              className="btn-icon"
              style={{ borderColor: 'rgba(255,50,50,0.5)', color: '#ff5555' }}
              onClick={() => handleDeleteNode(selectedNode.id)}
              title="Destroy Star"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

export default App;
