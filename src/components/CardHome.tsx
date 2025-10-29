import { useNavigate } from "react-router-dom";
import Carousel from "./Carousel";
import { Card } from "./Card";

interface CardData {
  id: number;
  title: string;
  badgeText?: string;
  badgeColor?:
    | "primary"
    | "secondary"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error";
  buttonText?: string;
}

export default function App() {
  const navigate = useNavigate();

  const handleLogin = (title: string) => {
    console.log(`Ingresando al ${title}...`);
    navigate("/home", { replace: true });
  };

  // 🔹 Array de datos para las cards
  const cards: CardData[] = [
    { id: 1, title: "Portal docente", badgeText: "Nuevo", badgeColor: "success", buttonText: "Acceder" },
    { id: 2, title: "Portal de alumnos", badgeText: "Actualizado", badgeColor: "info", buttonText: "Entrar" },
    { id: 3, title: "Portal Tienda", badgeText: "Beta", badgeColor: "warning", buttonText: "Abrir" },
    { id: 4, title: "Portal Comedor", badgeText: "Pro", badgeColor: "secondary", buttonText: "Ver" },
    { id: 5, title: "Portal Biblioteca", badgeText: "Nuevo", badgeColor: "primary", buttonText: "Ir" },
    { id: 6, title: "Portal eventos", badgeText: "Online", badgeColor: "accent", buttonText: "Acceder" },
    { id: 7, title: "Portal analitica", badgeText: "Actualizado", badgeColor: "info", buttonText: "Ver" },
    { id: 8, title: "Portal Gestion", badgeText: "24h", badgeColor: "success", buttonText: "Abrir" },
  ];

  return (
    <div>
      <Carousel />

      {/* 🧱 Grid de 4 columnas */}
      <div className=" min-h-screen py-10 px-6 bg-200 bg-primart" >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {cards.map((card) => (
            <Card
              key={card.id}
              title={card.title}
              badgeText={card.badgeText}
              badgeColor={card.badgeColor}
              buttonText={card.buttonText}
              onButtonClick={() => handleLogin(card.title)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
