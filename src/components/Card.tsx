import React from "react";

interface CardProps {
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
  onButtonClick?: () => void;
}


export const Card: React.FC<CardProps> = ({
  title,
  badgeText,
  badgeColor = "warning",
  buttonText = "Acceder",
  onButtonClick,
}) => {
  return (
    <div className="card w-72 h-80 shadow-md flex flex-col justify-between" >
      <div className="card-body flex flex-col justify-between">
        {badgeText && (
          <span
            className={`badge badge-lg self-start badge-${badgeColor}`}
          >
            {badgeText}
          </span>
        )}

        <div className="flex-1 flex items-center justify-center text-center">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>

        <div>
          <button
            className="btn btn-primary btn-block"
            onClick={onButtonClick}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};
