import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import Carousel from "./Carousel";
import { Card } from "./Card";
import {
  getUserFromToken,
  filterCardsByRole,
  buildPathWithToken,
} from "../utils";

interface CardData {
  id: number;
  title: string;
  icon: React.ReactNode;
  path: string;
  buttonText?: string;
}

export default function Home() {
  const navigate = useNavigate();
  const { role, name } = useMemo(() => getUserFromToken(), []);

  const cards: CardData[] = [
    { id: 1, title: "Portal docente", icon: <User className="w-12 h-12 text-primary" />, path: "/docente" },
    { id: 2, title: "Portal de alumnos", icon: <BookOpen className="w-12 h-12 text-info" />, path: "/alumnos" },
    { id: 3, title: "Portal Tienda", icon: <ShoppingBag className="w-12 h-12 text-warning" />, path: "/tienda" },
    { id: 4, title: "Portal Comedor", icon: <Coffee className="w-12 h-12 text-secondary" />, path: "/comedor" },
    { id: 5, title: "Portal Biblioteca", icon: <Library className="w-12 h-12 text-primary" />, path: "/biblioteca" },
    { id: 6, title: "Portal eventos", icon: <Calendar className="w-12 h-12 text-accent" />, path: "/eventos" },
    { id: 7, title: "Portal analítica", icon: <BarChart3 className="w-12 h-12 text-info" />, path: "/analitica" },
    { id: 8, title: "Portal Gestión", icon: <Settings className="w-12 h-12 text-success" />, path: "/gestion" },
  ];

  const visibleCards = useMemo(() => filterCardsByRole(role, cards), [role]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/", { replace: true });
  };

  const openInternal = (path: string) => {
    navigate(buildPathWithToken(path));
  };

  return (
    <div className="min-h-screen bg-base-200">
      <nav className="navbar bg-base-100 shadow-md sticky top-0 z-50">
        <div className="flex-1">
          <span className="btn btn-ghost normal-case text-xl font-bold text-primary">
            UADE
          </span>
        </div>

        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost gap-2">
              <span className="text-sm font-medium text-base-content truncate max-w-[160px]">
                {name}
              </span>
              <User className="w-6 h-6" />
            </div>

            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48 mt-2 z-[60]"
            >
              <li>
                <button onClick={() => navigate("/perfil")} className="justify-start">
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

      <div className="px-6 pt-6">
        <div className="rounded-xl overflow-hidden shadow-md">
          <Carousel />
        </div>
      </div>

      <div className="py-10 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {visibleCards.map((card) => (
            <Card
              key={card.id}
              title={card.title}
              icon={card.icon}
              buttonText="Acceder"
              onButtonClick={() => openInternal(card.path)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
