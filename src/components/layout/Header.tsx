import Link from "next/link";

type HeaderProps = {
  title: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
};

export function Header({ title, backHref, backLabel = "戻る", action }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-blue-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          {backHref ? (
            <Link
              href={backHref}
              className="shrink-0 rounded-lg px-2 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              ← {backLabel}
            </Link>
          ) : (
            <span className="w-12 shrink-0" />
          )}
          <h1 className="truncate text-base font-semibold text-slate-900">{title}</h1>
        </div>
        {action ?? <span className="w-12 shrink-0" />}
      </div>
    </header>
  );
}
