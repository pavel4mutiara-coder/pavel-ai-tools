export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
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

export interface ProjectTemplate {
  id: string;
  icon: string;
  nameKey: string;
  descriptionKey: string;
  promptModifier: string;
}