export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate: string; // ISO date string, e.g. 2026-08-20
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TodoInput = {
  title: string;
  description?: string;
  dueDate: string;
  completed?: boolean;
};
