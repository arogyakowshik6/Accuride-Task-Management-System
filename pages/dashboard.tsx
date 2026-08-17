import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import Navbar from "@/components/Navbar";
import TodoForm from "@/components/TodoForm";
import TodoItem from "@/components/TodoItem";
import { Todo } from "@/types";

type Filter = "all" | "active" | "completed";

export default function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/todos");
    const data = await res.json();
    setTodos(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(data: { title: string; description: string; dueDate: string }) {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Could not create TODO.");
    const todo = await res.json();
    setTodos((prev) => [...prev, todo]);
  }

  async function handleUpdate(id: string, data: { title: string; description: string; dueDate: string }) {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Could not update TODO.");
    const updated = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function handleToggle(todo: Todo) {
    const res = await fetch(`/api/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    }
  }

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="min-h-screen bg-fog">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="mb-5 font-display text-xl font-semibold text-ink sm:text-2xl">
          My TODOs
        </h1>

        <div className="mb-6">
          <TodoForm submitLabel="Add TODO" onSubmit={handleCreate} />
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-3 py-1 font-mono text-[0.65rem] uppercase tracking-wider transition-colors ${
                filter === f.key
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/20 bg-paper text-slate hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-slate">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="ticket border-dashed p-6 text-center">
            <p className="text-sm text-slate">No TODOs here yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: {} };
};
