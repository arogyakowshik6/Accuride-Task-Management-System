import { useMemo, useState } from "react";
import Calendar from "react-calendar";
import { Todo } from "@/types";

interface Props {
  todos: Todo[];
}

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function TodoCalendar({ todos }: Props) {
  const [selected, setSelected] = useState<Date>(new Date());

  const todosByDate = useMemo(() => {
    const map: Record<string, Todo[]> = {};
    for (const t of todos) {
      const key = t.dueDate.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(t);
    }
    return map;
  }, [todos]);

  const selectedKey = toDateKey(selected);
  const dayTodos = todosByDate[selectedKey] || [];

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="ticket border-dashed p-4 lg:w-[26rem]">
        <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-widest text-slate">
          Planner
        </p>
        <Calendar
          onChange={(v) => setSelected(v as Date)}
          value={selected}
          tileContent={({ date }) => {
            const key = toDateKey(date);
            return todosByDate[key] ? <span className="todo-dot" /> : null;
          }}
        />
      </div>
      <div className="flex-1">
        <p className="mb-1 font-mono text-[0.65rem] uppercase tracking-widest text-slate">
          Due
        </p>
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">
          {selected.toLocaleDateString(undefined, { dateStyle: "full" })}
        </h2>
        {dayTodos.length === 0 ? (
          <p className="text-sm text-slate">No TODOs due on this day.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {dayTodos.map((t) => (
              <li key={t.id} className="ticket flex items-start gap-2 p-3">
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    t.completed ? "bg-moss" : "bg-amber"
                  }`}
                />
                <div>
                  <p className={`font-medium ${t.completed ? "text-slate line-through" : "text-ink"}`}>
                    {t.title}
                  </p>
                  {t.description && (
                    <p className="mt-0.5 text-sm text-slate">{t.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
