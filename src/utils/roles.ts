export function filterCardsByRole<T extends { title: string }>(
  role: string | null,
  subrol: string | null,
  cards: T[]
): T[] {
  if (!role) return cards;

  const rules: Record<string, (t: string) => boolean> = {
        ADMINISTRADOR: (t) => {
      if (subrol === "BIBLOTECARIO") {
        return !["Portal de alumnos", "Portal docente"].includes(t);
      }
      return !["Portal de alumnos", "Portal docente", "Portal Biblioteca"].includes(t);
    },
    DOCENTE: (t) => !["Portal de alumnos","Portal Gestión", "Portal analítica", "Portal Biblioteca"].includes(t),
    ALUMNO: (t) => !["Portal docente","Portal Gestión", "Portal analítica"].includes(t),
  };

  return cards.filter((c) => (rules[role] ? rules[role](c.title) : true));
}
