import React, { useState, useRef, useEffect } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { Star } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sfx } from './services/SoundEngine';
import { HUD } from './components/HUD';
import { StarConsole } from './components/StarConsole';
import { ParallaxStars } from './components/ParallaxStars';
import { useCosmicCanvas } from './hooks/useCosmicCanvas';
import type { StarNode, Constellation } from "./types";
import { STAR_COLORS, generateId } from './types';
import './index.css';

function App() {
  const [nodes, setNodes] = useState<StarNode[]>([
    { id: 'root', x: window.innerWidth / 2, y: window.innerHeight / 2, title: 'Central Core', content: 'The center of your mind map universe.', color: '#00f0ff', size: 24 }
  ]);
  const [connections, setConnections] = useState<Constellation[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    viewport, setViewport,
    interactionMode, setInteractionMode,
    linkSourceNodeId, setLinkSourceNodeId,
    linkPointerPos, setLinkPointerPos,
    setDraggingNodeId,
    handlePointerDown, handlePointerMove, handlePointerUp,
    handleResetView
  } = useCosmicCanvas({ nodes, setNodes, connections, setConnections, containerRef });

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

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

  useEffect(() => {
    localStorage.setItem('stellar_mind_data', JSON.stringify({ nodes, connections }));
  }, [nodes, connections]);

  const handleNodePointerDown = (e: ReactMouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedNodeId(id);
    sfx.play('click');
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
    const x = (-viewport.x + window.innerWidth / 2) / viewport.scale + (Math.random() - 0.5) * 150;
    const y = (-viewport.y + window.innerHeight / 2) / viewport.scale + (Math.random() - 0.5) * 150;
    const newNode: StarNode = {
      id: generateId(), x, y, title: 'New Star', content: 'Write your thoughts here...',
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)], size: 16 + Math.random() * 12
    };
    setNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
    sfx.play('create');
  };

  const handleDeleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    setConnections(connections.filter(c => c.sourceId !== id && c.targetId !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
    sfx.play('delete');
  };

  const handleExportImage = async () => {
    sfx.play('click');
    if (!containerRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: '#070913', scale: 2, useCORS: true, allowTaint: false,
        ignoreElements: (el) => el.classList.contains('main-toolbar') || el.classList.contains('glass-panel')
      });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'stellarmind_map.png';
      a.click();
    } catch (e) { console.error('Failed to export image', e); }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes, connections }));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = "stellarmind_export.json";
    a.click();
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
        } catch (err) { alert('Invalid file format'); }
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSample = () => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    setNodes([
      { id: 'n1', x: cx, y: cy, title: 'Project Core', content: 'Central hub.', color: '#00f0ff', size: 32 },
      { id: 'n2', x: cx - 250, y: cy - 150, title: 'Frontend UI', content: 'React.', color: '#ff007f', size: 24 },
      { id: 'n3', x: cx + 250, y: cy - 150, title: 'Backend API', content: 'Node.js.', color: '#39ff14', size: 24 }
    ]);
    setConnections([
      { id: 'c1', sourceId: 'n1', targetId: 'n2' },
      { id: 'c2', sourceId: 'n1', targetId: 'n3' }
    ]);
    setViewport({ x: 0, y: 0, scale: 0.8 });
    setSelectedNodeId(null);
  };

  const handleClearAll = () => {
    setNodes([]); setConnections([]); setSelectedNodeId(null);
    localStorage.removeItem('stellar_mind_data'); sfx.play('delete');
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const updateSelectedNode = (updates: Partial<StarNode>) => {
    setNodes(nodes.map(n => n.id === selectedNodeId ? { ...n, ...updates } : n));
  };
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea || !selectedNode) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = selectedNode.content || '';
    const newText = `${text.substring(0, start)}${prefix}${text.substring(start, end) || 'text'}${suffix}${text.substring(end)}`;
    updateSelectedNode({ content: newText });
    sfx.play('click');
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (text.substring(start, end) ? text.substring(start, end).length : 4));
    }, 10);
  };

  return (
    <>
      <div className="nebula-bg" />
      
      <div id="mobile-block">
        <Star size={48} color="var(--star-glow)" fill="var(--star-glow)" style={{ marginBottom: 20 }} className="pulse-glow" />
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '2px', margin: 0 }}>PLEASE USE A LARGER SCREEN</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 10, maxWidth: '300px', lineHeight: 1.5 }}>
          StellarMind requires a desktop or tablet for optimal navigation.
        </p>
      </div>

      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star color="var(--star-glow)" fill="var(--star-glow)" size={24} className="pulse-glow" style={{ borderRadius: '50%' }} /> 
          STELLARMIND
        </h1>
        <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '12px', letterSpacing: '1px' }}>COSMIC KNOWLEDGE GRAPH</p>
      </div>

      <HUD 
        handleResetView={handleResetView}
        interactionMode={interactionMode}
        setInteractionMode={setInteractionMode}
        handleAddNode={handleAddNode}
        handleExportImage={handleExportImage}
        handleExport={handleExport}
        handleImport={handleImport}
        handleLoadSample={handleLoadSample}
        handleClearAll={handleClearAll}
      />

      <div 
        ref={containerRef} className="universe-container"
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}
      >
        <ParallaxStars viewport={viewport} />

        <div style={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`, transformOrigin: '0 0'
        }}>
          <svg className="constellation-layer">
            {connections.map(conn => {
              const src = nodes.find(n => n.id === conn.sourceId);
              const tgt = nodes.find(n => n.id === conn.targetId);
              if (!src || !tgt) return null;
              return <line key={conn.id} x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y} className="constellation-line" />;
            })}
            {linkSourceNodeId && (
              <line 
                x1={nodes.find(n => n.id === linkSourceNodeId)?.x} y1={nodes.find(n => n.id === linkSourceNodeId)?.y} 
                x2={linkPointerPos.x} y2={linkPointerPos.y} 
                stroke="var(--star-glow)" strokeWidth={2} strokeDasharray="4 4" className="pulse-glow" style={{ pointerEvents: 'none' }}
              />
            )}
          </svg>

          {nodes.map(node => (
            <div 
              key={node.id} className={`star-node ${selectedNodeId === node.id ? 'selected pulse-glow' : ''}`}
              onMouseEnter={() => sfx.play('hover')}
              style={{
                left: node.x, top: node.y, width: node.size, height: node.size,
                backgroundColor: node.color, boxShadow: `0 0 ${node.size}px ${node.color}, 0 0 ${node.size*2}px ${node.color}80`
              }}
              onPointerDown={(e) => handleNodePointerDown(e, node.id)}
            >
              <div className="node-card">
                <div className="node-title" style={{ color: selectedNodeId === node.id ? node.color : 'inherit' }}>{node.title}</div>
                {node.content && <div className="node-snippet"><ReactMarkdown>{node.content}</ReactMarkdown></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedNode && (
        <StarConsole 
          selectedNode={selectedNode}
          updateSelectedNode={updateSelectedNode}
          handleDeleteNode={handleDeleteNode}
          setSelectedNodeId={setSelectedNodeId}
          insertMarkdown={insertMarkdown}
        />
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </>
  );
}

export default App;
