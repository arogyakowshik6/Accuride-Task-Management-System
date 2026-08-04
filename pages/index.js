import { useEffect, useState } from 'react';
import { getSession, signOut } from 'next-auth/react';
import Head from 'next/head';
import TodoForm from '../components/TodoForm';
import TodoList from '../components/TodoList';
import CalendarView from '../components/CalendarView';

export default function Home({ user }) {
  const [todos, setTodos] = useState([]);
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadTodos() {
    setLoading(true);
    const res = await fetch('/api/todos');
    if (res.ok) {
      const data = await res.json();
      setTodos(data.todos);
    } else {
      setError('Could not load to-dos.');
    }
    setLoading(false);
  }

  useEffect(() => {
    loadTodos();
  }, []);

  async function handleCreate(values) {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      const data = await res.json();
      setTodos((t) => [...t, data.todo].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
    }
  }

  async function handleUpdate(id, values) {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      const data = await res.json();
      setTodos((t) => t.map((item) => (item.id === id ? data.todo : item)));
    }
  }

  async function handleToggle(todo) {
    await handleUpdate(todo.id, { completed: !todo.completed });
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setTodos((t) => t.filter((item) => item.id !== id));
    }
  }

  return (
    <div className="page">
      <Head>
        <title>Ledger · To-Dos</title>
      </Head>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">Ledger</span>
          <span className="brand-tag">Accuride task</span>
        </div>
        <div className="topbar-right">
          <span className="user-pill">{user?.name || user?.email}</span>
          <button className="btn btn-ghost" onClick={() => signOut({ callbackUrl: '/login' })}>
            Sign out
          </button>
        </div>
      </header>

      <nav className="tabs">
        <button className={`tab${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')}>
          List
        </button>
        <button className={`tab${view === 'calendar' ? ' active' : ''}`} onClick={() => setView('calendar')}>
          Calendar
        </button>
      </nav>

      <main className="content">
        {error && <div className="error-banner">{error}</div>}

        {view === 'list' && (
          <>
            <div className="section-head">
              <h1 className="section-title">Your to-dos</h1>
            </div>
            <TodoForm onSubmit={handleCreate} />
            {loading ? (
              <p>Loading…</p>
            ) : (
              <TodoList
                todos={todos}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            )}
          </>
        )}

        {view === 'calendar' && (
          <>
            <div className="section-head">
              <h1 className="section-title">Calendar</h1>
            </div>
            {loading ? <p>Loading…</p> : <CalendarView todos={todos} onSelectTodo={() => setView('list')} />}
          </>
        )}
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  return { props: { user: session.user } };
}
