import Card from "../ui/Card";

const words = [
  { word: "servicio", frequency: 125 },
  { word: "atención", frequency: 98 },
  { word: "rápido", frequency: 87 },
  { word: "producto", frequency: 74 },
  { word: "soporte", frequency: 63 },
  { word: "cliente", frequency: 58 },
];

export default function FrequentWords() {
  return (
    <Card>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Palabras más frecuentes
        </h2>

        <p className="text-sm text-slate-500">
          Principales términos encontrados
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {words.map((item) => (
          <div
            key={item.word}
            className="rounded-lg bg-slate-100 px-4 py-3"
          >
            <span className="font-medium text-slate-800">
              {item.word}
            </span>

            <span className="ml-2 text-sm text-slate-500">
              {item.frequency}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}