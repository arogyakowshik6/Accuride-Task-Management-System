import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import Navbar from "@/components/Navbar";
import TodoCalendar from "@/components/TodoCalendar";
import { Todo } from "@/types";

export default function CalendarPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/todos")
      .then((res) => res.json())
      .then((data) => {
        setTodos(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-fog">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-slate">
          Calendar view of your TODOs
        </p>
        <h1 className="mb-5 font-display text-xl font-semibold text-ink sm:text-2xl">
          Calendar
        </h1>
        {loading ? (
          <p className="text-sm text-slate">Loading…</p>
        ) : (
          <TodoCalendar todos={todos} />
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
