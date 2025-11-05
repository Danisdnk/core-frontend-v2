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
} from "lucide-react";
import Carousel from "./Carousel";
import { Card } from "./Card";

interface CardData {
  id: number;
  title: string;
  icon: React.ReactNode;
  url: string;         
  buttonText?: string;  
}

export default function Home() {
  const navigate = useNavigate(); 

  const goToProfile = () => {
    navigate("/perfil");
  };

  // 👇 Definí acá los destinos EXTERNOS
  const cards: CardData[] = [
    { id: 1, title: "Portal docente",    icon: <User className="w-12 h-12 text-primary" />,     url: "https://docentes.uade.edu.ar",   buttonText: "Acceder" },
    { id: 2, title: "Portal de alumnos", icon: <BookOpen className="w-12 h-12 text-info" />,     url: "https://alumnos.uade.edu.ar",    buttonText: "Acceder" },
    { id: 3, title: "Portal Tienda",     icon: <ShoppingBag className="w-12 h-12 text-warning" />,url: "https://tienda.uade.edu.ar",     buttonText: "Acceder" },
    { id: 4, title: "Portal Comedor",    icon: <Coffee className="w-12 h-12 text-secondary" />,  url: "https://comedor.uade.edu.ar",    buttonText: "Acceder" },
    { id: 5, title: "Portal Biblioteca", icon: <Library className="w-12 h-12 text-primary" />,   url: "https://biblioteca.uade.edu.ar", buttonText: "Acceder" },
    { id: 6, title: "Portal eventos",    icon: <Calendar className="w-12 h-12 text-accent" />,   url: "https://eventos.uade.edu.ar",    buttonText: "Acceder" },
    { id: 7, title: "Portal analítica",  icon: <BarChart3 className="w-12 h-12 text-info" />,    url: "https://analytics.uade.edu.ar",  buttonText: "Acceder" },
    { id: 8, title: "Portal Gestión",    icon: <Settings className="w-12 h-12 text-success" />,  url: "https://gestion.uade.edu.ar",    buttonText: "Acceder" },
  ];

 
  const openExternal = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    // window.location.href = url; // 
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-md sticky top-0 z-20">
        <div className="flex-1">
          <span className="btn btn-ghost normal-case text-xl font-bold text-primary">
            UADE
          </span>
        </div>

        <div className="flex-none flex items-center gap-2 pr-2">
          <span className="text-sm font-medium text-base-content">
            Gregorio Carranza
          </span>
          <button
            className="btn btn-ghost btn-circle"
            onClick={goToProfile}
            aria-label="Perfil"
          >
            <User className="w-6 h-6" />
          </button>
        </div>
      </div>

   
      <div className="px-6 pt-6">
        <div className="rounded-xl overflow-hidden shadow-md">
          <Carousel />
        </div>
      </div>

      <div className="py-10 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {cards.map((card) => (
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
