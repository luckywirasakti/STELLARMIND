export interface StarNode {
  id: string;
  x: number;
  y: number;
  title: string;
  content: string;
  color: string;
  size: number;
}

export interface Constellation {
  id: string;
  sourceId: string;
  targetId: string;
}

export const STAR_COLORS = ['#00f0ff', '#ff007f', '#39ff14', '#ffb300', '#9d4edd', '#ffffff'];

export const generateId = () => Math.random().toString(36).substr(2, 9);
