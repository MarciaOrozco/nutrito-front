import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function EvolucionChart({ data }) {
  if (!data.length) {
    return <p className="text-sm text-bark/60">Aún no hay datos para mostrar.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <XAxis dataKey="fecha" stroke="#4b3c33" fontSize={12} />
        <YAxis stroke="#4b3c33" fontSize={12} />
        <Tooltip />
        <Line type="monotone" dataKey="peso" stroke="#739273" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
