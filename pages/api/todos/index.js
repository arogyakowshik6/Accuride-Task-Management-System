import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getTodosByUser, createTodo } from '../../../lib/dataStore';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  const userId = session.user.id;

  if (req.method === 'GET') {
    const todos = getTodosByUser(userId);
    return res.status(200).json({ todos });
  }

  if (req.method === 'POST') {
    try {
      const todo = createTodo(userId, req.body || {});
      return res.status(201).json({ todo });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
