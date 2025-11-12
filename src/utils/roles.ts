export function filterCardsByRole<T extends { title: string }>(
  role: string | null,
  cards: T[]
): T[] {
  if (!role) return cards;

  const rules: Record<string, (t: string) => boolean> = {
    ADMINISTRADOR: (t) => !["Portal de alumnos", "Portal docente"].includes(t),
    DOCENTE: (t) => !["Portal de alumnos","Portal Gestión", "Portal analítica"].includes(t),
    ALUMNO: (t) => ["Portal de alumnos","Portal Comedor", "Portal Biblioteca", "Portal eventos"].includes(t),
  };

  return cards.filter((c) => (rules[role] ? rules[role](c.title) : true));
}
