export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string; // Content is now required for files
}

export interface Feature {
  name: string;
  description: string;
  complexity: 'Low' | 'Medium' | 'High';
}

export interface TechItem {
  name: string;
  category: string;
  reason: string;
}

export interface ProjectBlueprint {
  projectName: string;
  tagline: string;
  description: string;
  techStack: TechItem[];
  features: Feature[];
  fileStructure: FileNode[];
  estimatedDuration: string;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}