import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

function readDb() {
  if (!fs.existsSync(DB_PATH)) {
    const seed = { users: [], todos: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return raw.trim() ? JSON.parse(raw) : { users: [], todos: [] };
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// ---------- Users ----------

export function findUserByEmail(email) {
  const db = readDb();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function createUser({ name, email, password }) {
  const db = readDb();
  if (findUserByEmail(email)) {
    throw new Error('An account with that email already exists.');
  }
  const user = {
    id: uuid(),
    name,
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  writeDb(db);
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export function verifyUserPassword(email, password) {
  const user = findUserByEmail(email);
  if (!user) return null;
  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

// ---------- Todos ----------

export function getTodosByUser(userId) {
  const db = readDb();
  return db.todos
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

export function createTodo(userId, { title, description, dueDate }) {
  if (!title || !title.trim()) {
    throw new Error('Title is required.');
  }
  const db = readDb();
  const todo = {
    id: uuid(),
    userId,
    title: title.trim(),
    description: description ? description.trim() : '',
    dueDate: dueDate || new Date().toISOString().slice(0, 10),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  db.todos.push(todo);
  writeDb(db);
  return todo;
}

export function updateTodo(userId, id, updates) {
  const db = readDb();
  const idx = db.todos.findIndex((t) => t.id === id && t.userId === userId);
  if (idx === -1) return null;
  db.todos[idx] = { ...db.todos[idx], ...updates, id, userId };
  writeDb(db);
  return db.todos[idx];
}

export function deleteTodo(userId, id) {
  const db = readDb();
  const before = db.todos.length;
  db.todos = db.todos.filter((t) => !(t.id === id && t.userId === userId));
  writeDb(db);
  return db.todos.length < before;
}
