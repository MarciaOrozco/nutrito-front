import { Link } from "react-router-dom";

export default function MembershipCheckoutPending() {
  return (
    <section className="flex flex-col gap-6 rounded-3xl bg-white p-8 shadow-soft">
      <p className="text-xs uppercase tracking-widest text-bark/50">Checkout pendiente</p>
      <h1 className="text-3xl font-semibold text-bark">
        Próximamente integración con Mercado Pago
      </h1>
      <p className="max-w-3xl text-sm text-bark/70">
        Estamos preparando el flujo de pago para completar la membresía profesional. Pronto
        vas a poder finalizar tu suscripción directamente desde aquí.
      </p>
      <Link
        to="/nutricionista/membresia/detalle"
        className="inline-flex w-full items-center justify-center rounded-xl border border-sand px-4 py-3 text-sm font-semibold text-bark/80 transition hover:border-clay hover:text-clay sm:w-auto"
      >
        Volver al detalle
      </Link>
    </section>
  );
}
