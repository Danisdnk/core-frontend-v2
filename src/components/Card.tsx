import React from "react";

interface CardProps {
  title: string;
  icon?: React.ReactNode;
  buttonText?: string;
  onButtonClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  icon,
  buttonText = "Acceder",
  onButtonClick,
}) => {
  return (
    <div className="card w-64 h-64 shadow-md bg-base-100 hover:shadow-lg transition-all duration-200">
      <div className="card-body flex flex-col justify-between items-center text-center p-6">
        {/* Contenido centrado (icono + título) */}
        <div className="flex flex-col items-center justify-center flex-grow space-y-5">
          {/* Ícono grande */}
          {icon && <div className="scale-[1.7] flex justify-center">{icon}</div>}

          {/* Título con espacio extra */}
          <h2 className="text-base font-semibold leading-tight mt-1">{title}</h2>
        </div>

        {/* Botón fijo al fondo */}
        <button
          className="btn btn-primary btn-sm w-full mt-4"
          onClick={onButtonClick}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};
