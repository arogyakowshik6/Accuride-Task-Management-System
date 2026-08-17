import {
  hygraphCreateTodo,
  hygraphDeleteTodo,
  hygraphListTodos,
  hygraphUpdateTodo,
} from "./hygraph";
import { Todo, TodoInput } from "@/types";


export async function listTodos(userId: string): Promise<Todo[]> {
  return hygraphListTodos(userId);
}

export async function createTodo(
  userId: string,
  input: TodoInput
): Promise<Todo> {
  return hygraphCreateTodo(userId, input);
}

export async function updateTodo(
  userId: string,
  id: string,
  input: Partial<TodoInput>
): Promise<Todo | null> {
  {/*
    Ownership check: confirm this todo belongs to the requesting user
    before allowing the update, since Hygraph itself has no concept of
    per-app-user row ownership

  */}

  const owned = await listTodos(userId);
  if (!owned.some((t) => t.id === id)) return null;
  return hygraphUpdateTodo(id, input);
}

export async function deleteTodo(userId: string, id: string): Promise<boolean> {
  const owned = await listTodos(userId);
  if (!owned.some((t) => t.id === id)) return false;
  await hygraphDeleteTodo(id);
  return true;
}
