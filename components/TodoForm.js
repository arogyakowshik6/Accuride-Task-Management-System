import { useState, useEffect } from 'react';

const empty = { title: '', description: '', dueDate: new Date().toISOString().slice(0, 10) };

export default function TodoForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState(initial || empty);

  useEffect(() => {
    setValues(initial || empty);
  }, [initial]);

  function handleChange(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!values.title.trim()) return;
    onSubmit(values);
    if (!initial) setValues(empty);
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="field field-full">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          required
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="What's your upcoming plan?"
        />
      </div>
      <div className="field">
        <label htmlFor="dueDate">Due date</label>
        <input
          id="dueDate"
          type="date"
          value={values.dueDate}
          onChange={(e) => handleChange('dueDate', e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="description">Notes</label>
        <input
          id="description"
          value={values.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Optional detail"
        />
      </div>
      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
          {initial ? 'Save changes' : 'Add to-do'}
        </button>
      </div>
    </form>
  );
}
