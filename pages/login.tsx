import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setSubmitting(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fog px-4">
      <div className="ticket w-full max-w-sm border-dashed p-6">
        <p className="mb-1 font-mono text-[0.65rem] uppercase tracking-widest text-slate">
          Accuride Todo
        </p>
        <h1 className="mb-1 font-display text-xl font-semibold text-ink">Welcome back</h1>
        <p className="mb-6 text-sm text-slate">Sign in to manage your TODOs.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {error && <p className="text-sm text-rust">{error}</p>}
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
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-amber-dark hover:underline">
            Register
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
