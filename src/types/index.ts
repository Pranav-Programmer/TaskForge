export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
export type DecisionStatus = 'pending' | 'accepted' | 'rejected' | 'superseded';
export type ToastType = 'success' | 'error' | 'info';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  tags: string[];
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Decision {
  id: string;
  title: string;
  context: string;
  options: string[];
  chosenOption: string;
  rationale: string;
  status: DecisionStatus;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  variables: string[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export type View = 'dashboard' | 'tasks' | 'notes' | 'projects' | 'decisions' | 'prompts';
