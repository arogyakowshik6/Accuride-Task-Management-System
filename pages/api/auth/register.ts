import type { NextApiRequest, NextApiResponse } from "next";
import { createUser } from "@/lib/users";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  try {
    const user = await createUser(name, email, password);
    return res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || "Registration failed." });
  }
}
