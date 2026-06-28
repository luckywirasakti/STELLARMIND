import { useState, useEffect } from 'react';
import type { RefObject } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import type { StarNode, Constellation } from "../types";
import { generateId } from '../types';
import { sfx } from '../services/SoundEngine';

interface UseCosmicCanvasProps {
  nodes: StarNode[];
  setNodes: React.Dispatch<React.SetStateAction<StarNode[]>>;
  connections: Constellation[];
  setConnections: React.Dispatch<React.SetStateAction<Constellation[]>>;
  containerRef: RefObject<HTMLDivElement | null>;
}

export function useCosmicCanvas({ nodes, setNodes, connections, setConnections, containerRef }: UseCosmicCanvasProps) {
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [linkSourceNodeId, setLinkSourceNodeId] = useState<string | null>(null);
  const [linkPointerPos, setLinkPointerPos] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [interactionMode, setInteractionMode] = useState<'drag' | 'link'>('drag');

  const handlePointerDown = (e: ReactMouseEvent) => {
    if ((e.target as HTMLElement).closest('.glass-panel') || (e.target as HTMLElement).closest('.star-node')) {
      return; 
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
      
      let closestNode: StarNode | null = null;
      let minDistance = 60;
      
      for (const n of nodes) {
        if (n.id === linkSourceNodeId) continue;
        const dist = Math.hypot(n.x - worldX, n.y - worldY);
        if (dist < minDistance) {
          closestNode = n;
          minDistance = dist;
        }
      }
      
      if (closestNode) {
        const exists = connections.some(c => 
          (c.sourceId === linkSourceNodeId && c.targetId === closestNode!.id) || 
          (c.sourceId === closestNode!.id && c.targetId === linkSourceNodeId)
        );
        if (!exists) {
          setConnections([...connections, { id: generateId(), sourceId: linkSourceNodeId, targetId: closestNode!.id }]);
          sfx.play('connect');
        }
      }
      setLinkSourceNodeId(null);
    }
  };

  useEffect(() => {
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
  }, [containerRef]);

  const handleResetView = () => {
    if (nodes.length === 0) {
      setViewport({ x: 0, y: 0, scale: 1 });
      return;
    }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x);
      minY = Math.min(minY, n.y);
      maxY = Math.max(maxY, n.y);
    });
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    const scale = window.innerWidth < 800 ? 0.6 : 1;
    setViewport({
      x: window.innerWidth / 2 - centerX * scale,
      y: window.innerHeight / 2 - centerY * scale,
      scale
    });
    sfx.play('click');
  };

  return {
    viewport, setViewport,
    interactionMode, setInteractionMode,
    linkSourceNodeId, setLinkSourceNodeId,
    linkPointerPos, setLinkPointerPos,
    draggingNodeId, setDraggingNodeId,
    handlePointerDown, handlePointerMove, handlePointerUp,
    handleResetView
  };
}
