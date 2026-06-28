
import { Star, X, Bold, Italic, List, Image as ImageIcon, Trash2 } from 'lucide-react';
import type { StarNode } from "../types";
import { STAR_COLORS } from '../types';
import { sfx } from '../services/SoundEngine';

interface StarConsoleProps {
  selectedNode: StarNode;
  updateSelectedNode: (updates: Partial<StarNode>) => void;
  handleDeleteNode: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  insertMarkdown: (prefix: string, suffix?: string) => void;
}

export function StarConsole({
  selectedNode,
  updateSelectedNode,
  handleDeleteNode,
  setSelectedNodeId,
  insertMarkdown
}: StarConsoleProps) {
  return (
    <div className="glass-panel editor-panel">
      <div className="flex-between">
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Star size={12} color="var(--star-glow)" /> STAR CONSOLE
        </span>
        <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => { setSelectedNodeId(null); sfx.play('click'); }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ height: '1px', background: 'var(--border-glass)' }} />

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
              const url = window.prompt('Enter image URL:');
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
  );
}
