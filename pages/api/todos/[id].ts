import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { deleteTodo, updateTodo } from "@/lib/todos";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const userId = (session.user as any).id as string;
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "Invalid id" });
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const { title, description, dueDate, completed } = req.body || {};
    const todo = await updateTodo(userId, id, {
      title,
      description,
      dueDate,
      completed,
    });
    if (!todo) return res.status(404).json({ message: "Todo not found" });
    return res.status(200).json(todo);
  }

  if (req.method === "DELETE") {
    const ok = await deleteTodo(userId, id);
    if (!ok) return res.status(404).json({ message: "Todo not found" });
    return res.status(204).end();
  }

  res.setHeader("Allow", ["PUT", "PATCH", "DELETE"]);
  return res.status(405).json({ message: "Method not allowed" });
}
