import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/dashboard", label: "My TODOs" },
    { href: "/calendar", label: "Calendar" },
  ];

  return (
    <nav className="border-b border-ink/10 bg-paper">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/dashboard"
          className="font-display text-lg font-semibold tracking-tight text-ink"
        >
          Accuride <span className="text-amber-dark">Todo</span>
        </Link>

        <button
          className="rounded p-2 sm:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="block h-0.5 w-6 bg-ink mb-1" />
          <span className="block h-0.5 w-6 bg-ink mb-1" />
          <span className="block h-0.5 w-6 bg-ink" />
        </button>

        <div className="hidden items-center gap-1 sm:flex">
          {links.map((l) => {
            const active = router.pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-t-sm border-b-2 px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                  active
                    ? "border-amber text-ink"
                    : "border-transparent text-slate hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          {session && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="ml-4 rounded border border-ink/20 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-ink hover:bg-ink hover:text-paper"
            >
              Sign out
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-ink/10 px-4 pb-3 sm:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded px-2 py-2 font-mono text-xs uppercase tracking-wider text-ink hover:bg-fog"
            >
              {l.label}
            </Link>
          ))}
          {session && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="mt-1 rounded border border-ink/20 px-3 py-2 text-left font-mono text-xs uppercase tracking-wider text-ink hover:bg-fog"
            >
              Sign out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
