import { Bell, Lock, Palette, ShieldCheck } from "lucide-react";
import { cn } from "../../../lib/cn";

const items = [
  {
    title: "Brand y apariencia",
    description: "Espacio reservado para tokens visuales, identidad y ajustes de superficie del panel.",
    icon: Palette,
    accent: "text-admin-primary",
  },
  {
    title: "Alertas del equipo",
    description: "Placeholder para preferencias de notificación, recordatorios y eventos críticos.",
    icon: Bell,
    accent: "text-admin-secondary",
  },
  {
    title: "Seguridad operativa",
    description: "Bloque visual preparado para futuras políticas de acceso y revisiones de sesión.",
    icon: Lock,
    accent: "text-admin-tertiary",
  },
  {
    title: "Controles administrativos",
    description: "Panel de referencia para permisos y salvaguardas sin tocar el flujo actual de auth/storage.",
    icon: ShieldCheck,
    accent: "text-emerald-300",
  },
];

export default function AdminSettingsPage() {
  return (
    <section className="space-y-8">
      <div>
        <h3 className="font-headline text-2xl font-extrabold tracking-tight text-admin-on-surface sm:text-3xl">Configuración</h3>
        <p className="mt-1 text-sm text-admin-on-surface-variant">
          Placeholder visual coherente con el shell del admin para cubrir la ruta pendiente.
        </p>
      </div>

      <article className="admin-panel rounded-[28px] p-5 sm:p-7">
        <div className="rounded-[24px] border border-admin-outline-variant/20 bg-admin-surface-high/40 p-5 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-admin-outline">Estado actual</p>
          <h4 className="mt-3 font-headline text-2xl font-black text-admin-on-surface">Módulo en preparación</h4>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-admin-on-surface-variant">
            Esta pantalla queda intencionalmente como placeholder visual. Mantiene la navegación del admin alineada con
            Dashboard-Admin sin introducir decisiones nuevas de negocio ni cambios sobre autenticación, almacenamiento o server.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.title} className="rounded-[24px] border border-admin-outline-variant/20 bg-admin-surface-high/30 p-5 sm:p-6">
              <div className={cn("inline-flex rounded-2xl bg-admin-surface-highest/70 p-3", item.accent)}>
                <item.icon className="h-5 w-5" />
              </div>
              <h5 className="mt-4 font-headline text-xl font-bold text-admin-on-surface">{item.title}</h5>
              <p className="mt-2 text-sm leading-6 text-admin-on-surface-variant">{item.description}</p>
            </article>
          ))}
        </div>
      </article>
    </section>
  );
}
