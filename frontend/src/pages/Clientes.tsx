import {
  Plus,
  Search,
  MoreVertical,
} from "lucide-react";

import { useEffect, useState } from "react";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";

import { obtenerClientes } from "../services/clientes";
import type { Client } from "../types";

export default function Clientes() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await obtenerClientes();
        setClients(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los clientes.");
      } finally {
        setLoading(false);
      }
    };

    cargarClientes();
  }, []);

  const filteredClients = clients.filter((client) =>
    `${client.nombre} ${client.empresa} ${client.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Clientes
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gestión de clientes registrados
          </p>
        </div>

        <Button>
          <span className="flex items-center gap-2">
            <Plus size={18} />
            Nuevo cliente
          </span>
        </Button>
      </div>

      <Card>

        <div className="mb-5 max-w-md">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading && (
          <div className="py-10 text-center text-sm text-slate-500">
            Cargando clientes...
          </div>
        )}

        {error && !loading && (
          <div className="py-10 text-center text-sm text-red-500">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 font-semibold">
                    Cliente
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Empresa
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Teléfono
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Estado
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-slate-800">
                          {client.nombre}
                        </p>

                        <p className="text-xs text-slate-500">
                          {client.email || "Sin correo"}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {client.empresa || "Sin empresa"}
                    </td>

                    <td className="px-4 py-4">
                      {client.telefono || "Sin teléfono"}
                    </td>

                    <td className="px-4 py-4">
                      {client.activo ? (
                        <Badge variant="green">
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="red">
                          Inactivo
                        </Badge>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        className="rounded-lg p-2 hover:bg-slate-100"
                        type="button"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredClients.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      {search
                        ? "No se encontraron clientes."
                        : "No hay clientes registrados."}
                    </td>
                  </tr>
                )}
              </tbody>

            </table>

          </div>
        )}

      </Card>
    </div>
  );
}
