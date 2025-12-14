import { useMemo } from "react";
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
// import Carousel from "./Carousel";
import { Card } from "./Card";
import { getUserFromToken, filterCardsByRole } from "../utils";
import logo from "../assets/uadelogo.png";

interface CardData {
  id: number;
  title: string;
  icon: React.ReactNode;
  url: string;
}

export default function Home() {
  const { role, name } = useMemo(() => getUserFromToken(), []);

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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  const openExternal = (baseUrl: string) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      sessionStorage.setItem("external_access_token", token);
    }

    const target = `${baseUrl}?JWT=${encodeURIComponent(token ?? "")}`;

    window.location.href = target;
  };

  return (
    <div className="min-h-screen bg-base-200">
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

            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48 mt-2 z-[60]">
              <li>
                <button onClick={() => (window.location.href = "/perfil")} className="justify-start">
                  <User className="w-4 h-4" />
                  Perfil
                </button>
              </li>
              <li>
                <button onClick={handleLogout} className="justify-start text-error">
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* Lo saco por ahora, yo no lo agregaria */}
      {/* <div className="px-6 pt-6">
        <div className="rounded-xl overflow-hidden shadow-md">
          <Carousel />
        </div>
      </div> */}

      <div className="py-10 px-6">
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
    </div>
  );
}
