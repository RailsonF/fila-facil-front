import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { HeartPulse, Menu, Ticket, X } from "lucide-react";
import { ProvedorToast } from "./Toast";

const LINKS = [
  { para: "/", rotulo: "Retirar senha" },
  { para: "/recepcao", rotulo: "Painel da recepção" },
];

export default function Layout() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { pathname } = useLocation();

  return (
    <ProvedorToast>
      <div className="flex min-h-dvh flex-col bg-slate-50">
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-marca-600 text-white shadow-sm">
                <HeartPulse className="size-5" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                Fila<span className="text-marca-600">Fácil</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {LINKS.map((link) => {
                const ativo =
                  link.para === "/" ? pathname === "/" : pathname.startsWith(link.para);
                return (
                  <Link
                    key={link.para}
                    to={link.para}
                    className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                      ativo
                        ? "bg-marca-50 text-marca-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {link.rotulo}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={() => setMenuAberto((aberto) => !aberto)}
              className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            >
              {menuAberto ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>

          {menuAberto && (
            <nav className="border-t border-slate-200 bg-white px-4 py-2 md:hidden">
              {LINKS.map((link) => (
                <Link
                  key={link.para}
                  to={link.para}
                  onClick={() => setMenuAberto(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <Ticket className="size-4" />
                  {link.rotulo}
                </Link>
              ))}
            </nav>
          )}
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row">
            <p>
              Fila Fácil · projeto de extensão universitária para UBS, clínicas e
              laboratórios.
            </p>
            <p>{new Date().getFullYear()} · Protótipo 1.0</p>
          </div>
        </footer>
      </div>
    </ProvedorToast>
  );
}
