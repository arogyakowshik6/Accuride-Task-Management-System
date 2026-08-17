import { useState } from "react";
import { Todo } from "@/types";
import TodoForm from "./TodoForm";

interface Props {
  todo: Todo;
  onToggle: (todo: Todo) => Promise<void>;
  onUpdate: (id: string, data: { title: string; description: string; dueDate: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TodoItem({ todo, onToggle, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (editing) {
    return (
      <TodoForm
        initial={todo}
        submitLabel="Save changes"
        onCancel={() => setEditing(false)}
        onSubmit={async (data) => {
          await onUpdate(todo.id, data);
          setEditing(false);
        }}
      />
    );
  }

  const overdue = !todo.completed && new Date(todo.dueDate) < new Date(new Date().toDateString());
  const stampColor = todo.completed ? "text-moss" : overdue ? "text-rust" : "text-amber-dark";

  return (
    <div className="ticket ticket-notch flex flex-col sm:flex-row">
      {/* Main content */}
      <div className="flex flex-1 items-start gap-3 p-4">
        <button
          type="button"
          onClick={() => onToggle(todo)}
          aria-label={todo.completed ? "Mark as not done" : "Mark as done"}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            todo.completed
              ? "border-moss bg-moss text-paper"
              : "border-ink/30 text-transparent hover:border-ink"
          }`}
        >
          <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current">
            <path d="M4.5 8.5 2 6l-1 1 3.5 3.5L11 3.5 10 2.5z" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <p className={`font-display font-medium ${todo.completed ? "text-slate line-through" : "text-ink"}`}>
            {todo.title}
          </p>
          {todo.description && (
            <p className="mt-0.5 text-sm text-slate">{todo.description}</p>
          )}
        </div>
      </div>

      {/* Perforated stub */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-dashed ticket-perforation p-3 sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:p-4">
        <span className={`stamp ${stampColor}`}>
          {overdue ? "Overdue" : new Date(todo.dueDate).toLocaleDateString(undefined, { month: "short", day: "2-digit" })}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setEditing(true)}
            className="rounded px-2 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-slate hover:bg-fog hover:text-ink"
          >
            Edit
          </button>
          <button
            onClick={async () => {
              setDeleting(true);
              await onDelete(todo.id);
            }}
            disabled={deleting}
            className="rounded px-2 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-rust hover:bg-rust/10 disabled:opacity-60"
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
