import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { createTodo, listTodos } from "@/lib/todos";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const userId = (session.user as any).id as string;

  if (req.method === "GET") {
    const todos = await listTodos(userId);
    return res.status(200).json(todos);
  }

  if (req.method === "POST") {
    const { title, description, dueDate } = req.body || {};
    if (!title || !dueDate) {
      return res.status(400).json({ message: "Title and due date are required." });
    }
    const todo = await createTodo(userId, { title, description, dueDate });
    return res.status(201).json(todo);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ message: "Method not allowed" });
}
