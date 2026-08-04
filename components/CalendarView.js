import { useState, useMemo } from 'react';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toDateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function CalendarView({ todos, onSelectTodo }) {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const todosByDate = useMemo(() => {
    const map = {};
    for (const t of todos) {
      if (!map[t.dueDate]) map[t.dueDate] = [];
      map[t.dueDate].push(t);
    }
    return map;
  }, [todos]);

  const { year, month } = cursor;
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  function shiftMonth(delta) {
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  return (
    <div>
      <div className="calendar-head">
        <button className="btn btn-ghost" onClick={() => shiftMonth(-1)} aria-label="Previous month">
          ← Prev
        </button>
        <span className="calendar-month">
          {MONTH_NAMES[month]} {year}
        </span>
        <button className="btn btn-ghost" onClick={() => shiftMonth(1)} aria-label="Next month">
          Next →
        </button>
      </div>
      <div className="calendar-grid">
        {DOW.map((d) => (
          <div className="calendar-dow" key={d}>
            {d}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (day === null) return <div className="calendar-cell empty" key={`empty-${idx}`} />;
          const key = toDateKey(year, month, day);
          const dayTodos = todosByDate[key] || [];
          const isToday = key === todayKey;
          return (
            <div className={`calendar-cell${isToday ? ' today' : ''}`} key={key}>
              <span className="cell-date">{day}</span>
              {dayTodos.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTodo(t)}
                  className={`cell-todo${t.completed ? '' : ' pending'}${i === 0 ? ' first' : ''}`}
                  title={t.title}
                  style={{ border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  {t.title}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
