import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../../auth/useAuth.js";

const INDICATORS = [
  { key: "peso", label: "Peso (kg)", color: "#739273", goalKey: "meta_peso" },
  { key: "imc", label: "IMC", color: "#4B3C33" },
  { key: "cintura", label: "Cintura (cm)", color: "#C58940" },
  {
    key: "porcentaje_grasa",
    label: "% Grasa",
    color: "#D97D54",
  },
];

const GOAL_LABEL_PREFIX = "Meta ";

const shouldUseBackend = import.meta.env.VITE_USE_BACKEND === "true";
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const MOCK_DATA = [
  {
    fecha_consulta: "2024-01-10",
    peso: 72,
    imc: 24.9,
    cintura: 82,
    porcentaje_grasa: 24,
    meta_peso: 70,
  },
  {
    fecha_consulta: "2024-03-12",
    peso: 70.5,
    imc: 24.2,
    cintura: 80,
    porcentaje_grasa: 22.5,
    meta_peso: 69,
  },
  {
    fecha_consulta: "2024-06-20",
    peso: 69.8,
    imc: 23.9,
    cintura: 78,
    porcentaje_grasa: 21,

    meta_peso: 68,
  },
];

const formatNumber = (value) => {
  if (value == null || Number.isNaN(Number(value))) return null;
  const numeric = Number(value);
  return Number.isInteger(numeric) ? numeric : Number(numeric.toFixed(1));
};

const mapLabel = (key) => {
  const indicator = INDICATORS.find((item) => item.key === key);
  if (indicator) return indicator.label;
  const goalIndicator = INDICATORS.find((item) => item.goalKey === key);
  if (goalIndicator) return `${GOAL_LABEL_PREFIX}${goalIndicator.label}`;
  return key;
};

const normalizeRecord = (record) => {
  const fecha = record.fecha_consulta ?? record.fecha;
  return {
    fecha: fecha ?? null,
    peso: formatNumber(record.peso),
    imc: formatNumber(record.imc),
    cintura: formatNumber(record.cintura),
    porcentaje_grasa: formatNumber(record.porcentaje_grasa),
    meta_peso: formatNumber(record.meta_peso),
  };
};

const hasIndicatorValue = (entry, indicators) =>
  indicators.some((indicator) => entry[indicator] != null);

export default function EvolucionChart({ pacienteId }) {
  const { token } = useAuth();
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emptyMessage, setEmptyMessage] = useState(null);
  const [selectedIndicators, setSelectedIndicators] = useState(() =>
    INDICATORS.map((indicator) => indicator.key)
  );
  const [includeGoals, setIncludeGoals] = useState(false);
  const [viewMode, setViewMode] = useState("chart");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      if (!pacienteId) {
        setRawData([]);
        setEmptyMessage("Seleccioná un paciente para ver su evolución.");
        setLoading(false);
        return;
      }

      if (!shouldUseBackend) {
        const sample = MOCK_DATA.map(normalizeRecord).filter((entry) =>
          hasIndicatorValue(
            entry,
            INDICATORS.map((item) => item.key)
          )
        );
        setRawData(sample);
        setEmptyMessage(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setEmptyMessage(null);

      try {
        const response = await axios.get(
          `${baseUrl}/api/pacientes/${pacienteId}/evolucion`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            signal: controller.signal,
          }
        );

        if (!isMounted) return;

        const body = Array.isArray(response.data) ? response.data : [];
        const normalized = body.map(normalizeRecord).filter((entry) =>
          hasIndicatorValue(
            entry,
            INDICATORS.map((item) => item.key)
          )
        );

        if (!normalized.length) {
          setRawData([]);
          setEmptyMessage("No hay registros en el período seleccionado");
        } else {
          setRawData(normalized);
          setEmptyMessage(null);
        }
      } catch (apiError) {
        if (!isMounted) return;
        if (axios.isAxiosError(apiError) && apiError.response?.status === 204) {
          setRawData([]);
          setEmptyMessage("No hay registros en el período seleccionado");
        } else if (axios.isCancel(apiError)) {
          // ignore abort
        } else {
          const message =
            apiError instanceof Error && apiError.message
              ? apiError.message
              : "No pudimos cargar la evolución del paciente.";
          setError(message);
          setRawData([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [pacienteId, token]);

  useEffect(() => {
    if (!rawData.length) return;
    const fechas = rawData
      .map((entry) => entry.fecha)
      .filter(Boolean)
      .sort();

    if (!fromDate && fechas[0]) {
      setFromDate(fechas[0]);
    }
    if (!toDate && fechas[fechas.length - 1]) {
      setToDate(fechas[fechas.length - 1]);
    }
  }, [rawData, fromDate, toDate]);

  const filteredData = useMemo(() => {
    if (!rawData.length) return [];

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    return rawData.filter((entry) => {
      if (!entry.fecha) return false;
      const entryDate = new Date(entry.fecha);
      if (Number.isNaN(entryDate.getTime())) return false;
      if (from && entryDate < from) return false;
      if (to && entryDate > to) return false;
      return hasIndicatorValue(entry, selectedIndicators);
    });
  }, [rawData, fromDate, toDate, selectedIndicators]);

  const indicatorsToDisplay = useMemo(
    () =>
      INDICATORS.filter((indicator) =>
        selectedIndicators.includes(indicator.key)
      ),
    [selectedIndicators]
  );

  const hasEnoughData = filteredData.length >= 2;

  const toggleIndicator = (key) => {
    setSelectedIndicators((prev) => {
      if (prev.includes(key)) {
        const next = prev.filter((item) => item !== key);
        return next.length ? next : prev;
      }
      return [...prev, key];
    });
  };

  const tooltipFormatter = (value, name) => {
    if (value == null) return null;
    return [value, mapLabel(name)];
  };

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-6 text-sm text-bark/60 shadow-soft">
        Cargando evolución...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-white p-6 text-sm text-red-600 shadow-soft">
        {error}
      </div>
    );
  }

  if (!rawData.length || emptyMessage) {
    return (
      <div className="rounded-3xl bg-white p-6 text-sm text-bark/60 shadow-soft">
        {emptyMessage ?? "No hay registros en el período seleccionado"}
      </div>
    );
  }

  const noDataForFilters = !hasEnoughData;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-lg font-semibold text-bark">
            Evolución del paciente
          </p>
          <div className="flex items-center gap-2 text-xs text-bark/60">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="view-mode"
                value="chart"
                checked={viewMode === "chart"}
                onChange={() => setViewMode("chart")}
              />
              Gráfico de líneas
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="view-mode"
                value="table"
                checked={viewMode === "table"}
                onChange={() => setViewMode("table")}
              />
              Tabla
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-bark/50">
              Indicadores
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              {INDICATORS.map((indicator) => (
                <label
                  key={indicator.key}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    selectedIndicators.includes(indicator.key)
                      ? "border-clay bg-clay text-white"
                      : "border-sand bg-white text-bark/70 hover:border-clay/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedIndicators.includes(indicator.key)}
                    onChange={() => toggleIndicator(indicator.key)}
                  />
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: indicator.color }}
                  />
                  {indicator.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-4 text-sm text-bark/70">
            <label className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-bark/50">
                Desde
              </span>
              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) => setFromDate(event.target.value)}
                className="rounded-xl border border-sand px-3 py-2"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-bark/50">
                Hasta
              </span>
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) => setToDate(event.target.value)}
                className="rounded-xl border border-sand px-3 py-2"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-bark/60">
              <input
                type="checkbox"
                checked={includeGoals}
                onChange={(event) => setIncludeGoals(event.target.checked)}
              />
              Incluir metas
            </label>
          </div>
        </div>
      </div>

      {noDataForFilters ? (
        <div className="rounded-3xl bg-white p-6 text-sm text-bark/60 shadow-soft">
          No hay registros suficientes para mostrar el gráfico con los filtros
          actuales.
        </div>
      ) : viewMode === "table" ? (
        <div className="overflow-x-auto rounded-3xl bg-white shadow-soft">
          <table className="min-w-full divide-y divide-sand/60 text-sm">
            <thead className="bg-bone/50 text-left text-xs uppercase tracking-wide text-bark/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                {indicatorsToDisplay.map((indicator) => (
                  <th key={indicator.key} className="px-4 py-3 font-semibold">
                    {indicator.label}
                  </th>
                ))}
                {includeGoals &&
                  indicatorsToDisplay.map((indicator) => {
                    if (!indicator.goalKey) return null;
                    const hasGoal = filteredData.some(
                      (entry) => entry[indicator.goalKey] != null
                    );
                    if (!hasGoal) return null;
                    return (
                      <th
                        key={`${indicator.key}-goal`}
                        className="px-4 py-3 font-semibold"
                      >
                        {GOAL_LABEL_PREFIX}
                        {indicator.label}
                      </th>
                    );
                  })}
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/40 text-bark/80">
              {filteredData.map((entry, index) => (
                <tr key={`${entry.fecha ?? "registro"}-${index}`}>
                  <td className="px-4 py-2">{entry.fecha ?? "-"}</td>
                  {indicatorsToDisplay.map((indicator) => (
                    <td key={indicator.key} className="px-4 py-2">
                      {entry[indicator.key] != null
                        ? entry[indicator.key]
                        : "-"}
                    </td>
                  ))}
                  {includeGoals &&
                    indicatorsToDisplay.map((indicator) => {
                      if (!indicator.goalKey) return null;
                      const goalValue = entry[indicator.goalKey];
                      const hasGoal = filteredData.some(
                        (item) => item[indicator.goalKey] != null
                      );
                      if (!hasGoal) return null;
                      return (
                        <td key={`${indicator.key}-goal`} className="px-4 py-2">
                          {goalValue != null ? goalValue : "-"}
                        </td>
                      );
                    })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <ResponsiveContainer width="100%" height={360}>
            <LineChart
              data={filteredData}
              margin={{ top: 20, right: 24, left: 12, bottom: 12 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#DDD0C8" />
              <XAxis
                dataKey="fecha"
                stroke="#4B3C33"
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis
                stroke="#4B3C33"
                tick={{ fontSize: 12 }}
                tickMargin={8}
                allowDecimals
              />
              <Tooltip formatter={tooltipFormatter} />
              <Legend formatter={(value) => mapLabel(value)} />
              {indicatorsToDisplay.map((indicator) => (
                <Line
                  key={indicator.key}
                  type="monotone"
                  dataKey={indicator.key}
                  name={indicator.label}
                  stroke={indicator.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
              {includeGoals &&
                indicatorsToDisplay.map((indicator) => {
                  if (!indicator.goalKey) return null;
                  const hasGoal = filteredData.some(
                    (entry) => entry[indicator.goalKey] != null
                  );
                  if (!hasGoal) return null;
                  return (
                    <Line
                      key={`${indicator.key}-goal`}
                      type="monotone"
                      dataKey={indicator.goalKey}
                      name={`${GOAL_LABEL_PREFIX}${indicator.label}`}
                      stroke={indicator.color}
                      strokeWidth={1.5}
                      dot={false}
                      strokeDasharray="6 4"
                      connectNulls
                    />
                  );
                })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
