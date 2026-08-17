import { FormEvent, useState } from "react";
import { Todo } from "@/types";

interface Props {
  initial?: Partial<Todo>;
  submitLabel: string;
  onSubmit: (data: { title: string; description: string; dueDate: string }) => Promise<void>;
  onCancel?: () => void;
}

export default function TodoForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [dueDate, setDueDate] = useState(
    initial?.dueDate ? initial.dueDate.slice(0, 10) : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim() || !dueDate) {
      setError("Title and due date are required.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), dueDate });
      if (!initial) {
        setTitle("");
        setDescription("");
        setDueDate("");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="ticket flex flex-col gap-3 border-dashed p-4 sm:p-5"
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-widest text-slate">
        {initial ? "Edit ticket" : "New ticket"}
      </p>
      {error && <p className="text-sm text-rust">{error}</p>}
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Title</label>
        <input
          className="w-full rounded border border-ink/20 bg-paper px-3 py-2 text-sm text-ink placeholder:text-slate/60 focus:border-amber focus:outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Finish frontend task"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Description</label>
        <textarea
          className="w-full rounded border border-ink/20 bg-paper px-3 py-2 text-sm text-ink placeholder:text-slate/60 focus:border-amber focus:outline-none"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Due date</label>
        <input
          type="date"
          className="w-full rounded border border-ink/20 bg-paper px-3 py-2 font-mono text-sm text-ink focus:border-amber focus:outline-none sm:w-56"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-ink px-4 py-2 font-mono text-xs uppercase tracking-wider text-paper hover:bg-ink-soft disabled:opacity-60"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-ink/20 px-4 py-2 font-mono text-xs uppercase tracking-wider text-slate hover:bg-fog"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
