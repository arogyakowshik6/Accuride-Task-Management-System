import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Registration failed.");
      }
      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (signInRes?.error) throw new Error("Registered, but sign-in failed. Try logging in.");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fog px-4">
      <div className="ticket w-full max-w-sm border-dashed p-6">
        <p className="mb-1 font-mono text-[0.65rem] uppercase tracking-widest text-slate">
          Accuride Todo
        </p>
        <h1 className="mb-1 font-display text-xl font-semibold text-ink">Create an account</h1>
        <p className="mb-6 text-sm text-slate">Start tracking your own TODOs.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {error && <p className="text-sm text-rust">{error}</p>}
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Name</label>
            <input
              required
              className="w-full rounded border border-ink/20 bg-paper px-3 py-2 text-sm text-ink focus:border-amber focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Email</label>
            <input
              type="email"
              required
              className="w-full rounded border border-ink/20 bg-paper px-3 py-2 text-sm text-ink focus:border-amber focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full rounded border border-ink/20 bg-paper px-3 py-2 text-sm text-ink focus:border-amber focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded bg-ink px-4 py-2 font-mono text-xs uppercase tracking-wider text-paper hover:bg-ink-soft disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-amber-dark hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (session) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }
  return { props: {} };
};
