import { useEffect, useMemo, useState } from "react";
import {
  User,
  BookOpen,
  ShoppingBag,
  Coffee,
  Library,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { Card } from "./Card";
import Footer from "./Footer";
import {
  getUserFromToken,
  filterCardsByRole,
  getAccessToken,
  isAccessTokenValid,
  decodeJwtUtf8
} from "../utils";
import logo from "../assets/uadelogo.png";
import { useTokenExpiryModal } from "../hooks/useTokenExpiryModal";

interface CardData {
  id: number;
  title: string;
  icon: React.ReactNode;
  url: string;
}

export default function Home() {
  // ✅ Guard: si no hay token o es inválido -> login
  useEffect(() => {
    const token = getAccessToken();
    console.log("[HOME] access_token exists:", !!token);

    if (!token) {
      console.log("[HOME] no token -> redirect /");
      window.location.href = "/";
      return;
    }

    const valid = isAccessTokenValid();
    console.log("[HOME] token valid:", valid);

    if (!valid) {
      console.log("[HOME] token inválido -> redirect /");
      window.location.href = "/";
      return;
    }

    const u = getUserFromToken();
    console.log("[HOME] user from token:", u);

    if (!u?.role) {
      console.log("[HOME] payload sin role -> redirect /");
      window.location.href = "/";
      return;
    }
  }, []);

  // ⚠️ no uses useMemo([]) para el nombre si el token puede cambiar por refresh.
  // Usamos un state inicial y lo actualizamos después de renew.
  const initialUser = useMemo(() => getUserFromToken(), []);
  const [name, setName] = useState(initialUser.name);
  const role = initialUser.role;

  const cards: CardData[] = [
    { id: 1, title: "Portal docente", icon: <User className="w-12 h-12 text-primary" />, url: "https://campus-connect-front-docentes.vercel.app" },
    { id: 2, title: "Portal de alumnos", icon: <BookOpen className="w-12 h-12 text-info" />, url: "https://student-portal-front-production.up.railway.app/misCursos" },
    { id: 3, title: "Portal Tienda", icon: <ShoppingBag className="w-12 h-12 text-warning" />, url: "https://uade-store.vercel.app" },
    { id: 4, title: "Portal Comedor", icon: <Coffee className="w-12 h-12 text-secondary" />, url: "https://proyecto-react-shadcn.vercel.app" },
    { id: 5, title: "Portal Biblioteca", icon: <Library className="w-12 h-12 text-primary" />, url: "https://biblioteca-uade.vercel.app" },
    { id: 6, title: "Portal eventos", icon: <Calendar className="w-12 h-12 text-accent" />, url: "https://desap2-eventos-front.onrender.com" },
    { id: 7, title: "Portal analítica", icon: <BarChart3 className="w-12 h-12 text-info" />, url: "https://campus-connect-da-ii.up.railway.app" },
    { id: 8, title: "Portal Gestión", icon: <Settings className="w-12 h-12 text-success" />, url: "https://backoffice-production-ui.up.railway.app" },
  ];

  const visibleCards = useMemo(() => filterCardsByRole(role, cards), [role]);

  const tokenFromStorage = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const jwtPayload = tokenFromStorage ? decodeJwtUtf8(tokenFromStorage) : null;

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("expires_in");
    sessionStorage.removeItem("external_access_token");
    window.location.href = "/";
  };

  const openExternal = (baseUrl: string) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      console.log("[HOME] openExternal sin token -> /");
      window.location.href = "/";
      return;
    }

    sessionStorage.setItem("external_access_token", token);
    const target = `${baseUrl}?JWT=${encodeURIComponent(token)}`;
    window.location.href = target;
  };

  // ✅ Modal automático cuando está por expirar + debug helpers
  const expiry = useTokenExpiryModal({
    thresholdSeconds: 120,
    checkEveryMs: 15000,
    onLogoutRedirect: () => {
      window.location.href = "/";
    },
  });

  const handleRenew = async () => {
    await expiry.renew();
    const u = getUserFromToken();
    setName(u.name);
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <nav className="navbar bg-primary shadow-md sticky top-0 z-50">
        <div className="flex-1">
          <span className="btn btn-ghost normal-case text-xl text-white">
            <img src={logo} alt="UADE" className="w-8 h-8 mr-2 object-contain" />
            CampusConnect
          </span>
        </div>

        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost gap-2 text-white">
              <span className="text-sm font-medium text-white truncate max-w-[160px]">{name}</span>
              <User className="w-6 h-6 text-white" />
            </div>

            <ul tabIndex={0} className="dropdown-content p-2 shadow bg-base-100 rounded-box w-56 mt-2 z-[60]">
              <li className="w-full">
                <div className="text-sm flex flex-col gap-1 px-3 py-2 text-left">
                  <div className="font-medium">{jwtPayload?.name ?? name}</div>
                  {jwtPayload?.email && (
                    <div className="text-xs opacity-80 break-words whitespace-normal max-w-[12rem]"><span className="font-semibold">Email:</span> {jwtPayload.email}</div>
                  )}
                  {jwtPayload?.role && <div className="text-xs opacity-80"><span className="font-semibold">Rol:</span> {jwtPayload.role}</div>}
                  {jwtPayload?.career?.name && <div className="text-xs opacity-80"><span className="font-semibold">Carrera:</span> {jwtPayload.career.name}</div>}
                </div>
              </li>

              {/* Action buttons kept with DaisyUI "menu" styling */}
              <li className="p-0">
                <ul className="menu p-2">
                  <li>
                    <button onClick={expiry.forceOpen} className="justify-start w-full text-left">
                      Forzar modal (debug)
                    </button>
                  </li>
                  <li>
                    <button onClick={expiry.forceCheck} className="justify-start w-full text-left">
                      Forzar check (debug)
                    </button>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="justify-start text-error w-full text-left">
                      <LogOut className="w-4 h-4 inline-block mr-2" />
                      Cerrar sesión
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
            
          </div>
        </div>
      </nav>

      <section className="px-6 pt-6">
        <div className="relative overflow-hidden rounded-2xl shadow-md">
          <img
            src="https://keystoneacademic-res.cloudinary.com/image/upload/element/11/117284_UADEDia4.jpg"
            alt="UADE"
            className="h-56 w-full object-cover sm:h-64 lg:h-72"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/55 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="px-6 py-6 sm:px-10 max-w-3xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                Bienvenido a CampusConnect
              </h1>
              <p className="mt-2 text-white/90 text-sm sm:text-base">
                Accedé a los portales de la universidad desde un único lugar. Hacé clic en “Acceder”
                para ingresar al portal correspondiente.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="py-10 px-6 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {visibleCards.map((card) => (
            <Card
              key={card.id}
              title={card.title}
              icon={card.icon}
              buttonText="Acceder"
              onButtonClick={() => openExternal(card.url)}
            />
          ))}
        </div>
      </div>

      <Footer />

      {/* ✅ Modal DaisyUI (expiración) */}
      <dialog className={`modal ${expiry.isOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Sesión por expirar</h3>

          <p className="py-3">
            Quedan aproximadamente <b>{expiry.secondsLeft}</b> segundos.
          </p>

          {expiry.error && (
            <p className="text-error text-sm break-words">{expiry.error}</p>
          )}

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRenew}
              disabled={expiry.isBusy}
            >
              {expiry.isBusy ? "Renovando..." : "Renovar sesión"}
            </button>

            <button
              type="button"
              className="btn"
              onClick={expiry.logout}
              disabled={expiry.isBusy}
            >
              Cerrar sesión
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={expiry.close}
              disabled={expiry.isBusy}
            >
              Más tarde
            </button>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button onClick={expiry.close}>close</button>
        </form>
      </dialog>
    </div>
  );
}
