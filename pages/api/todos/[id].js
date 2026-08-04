import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { updateTodo, deleteTodo } from '../../../lib/dataStore';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  const userId = session.user.id;
  const { id } = req.query;

  if (req.method === 'PUT') {
    const updated = updateTodo(userId, id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'To-do not found.' });
    return res.status(200).json({ todo: updated });
  }

  if (req.method === 'DELETE') {
    const ok = deleteTodo(userId, id);
    if (!ok) return res.status(404).json({ error: 'To-do not found.' });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).json({ error: 'Method not allowed' });
}
