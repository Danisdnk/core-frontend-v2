import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-content py-4">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        {/* Logo */}
        <span className="font-bold text-white">CampusConnect</span>

        {/* Copyright */}
        <p className="opacity-90">© 2025 CampusConnect. Todos los derechos reservados.</p>

        {/* Contact */}
        <div className="flex flex-col gap-1 text-right">
          <a href="mailto:soporte@uade.edu.ar" className="opacity-90 hover:opacity-100 transition">Contacto: soporte@uade.edu.ar</a>
        </div>
      </div>
    </footer>
  );
}
