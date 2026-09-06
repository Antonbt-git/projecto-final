import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";

import {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} from "../services/clientes";
import type { ClientCreate } from "../services/clientes";
import type { Client } from "../types";

const FORM_VACIO: ClientCreate = {
  nombre: "",
  email: "",
  telefono: "",
  empresa: "",
  activo: true,
};

export default function Clientes() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal de crear/editar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Client | null>(
    null
  );
  const [form, setForm] = useState<ClientCreate>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");

  // Menú de acciones (⋮) por fila
  const [menuAbiertoId, setMenuAbiertoId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Eliminar
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);

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

  useEffect(() => {
    cargarClientes();
  }, []);

  // Cierra el menú de acciones si se hace click afuera
  useEffect(() => {
    const manejarClickAfuera = (evento: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(evento.target as Node)
      ) {
        setMenuAbiertoId(null);
      }
    };

    document.addEventListener("mousedown", manejarClickAfuera);
    return () =>
      document.removeEventListener("mousedown", manejarClickAfuera);
  }, []);

  const filteredClients = clients.filter((client) =>
    `${client.nombre} ${client.empresa} ${client.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const abrirModalCrear = () => {
    setClienteEditando(null);
    setForm(FORM_VACIO);
    setErrorForm("");
    setModalAbierto(true);
  };

  const abrirModalEditar = (client: Client) => {
    setClienteEditando(client);
    setForm({
      nombre: client.nombre,
      email: client.email || "",
      telefono: client.telefono || "",
      empresa: client.empresa || "",
      activo: client.activo,
    });
    setErrorForm("");
    setModalAbierto(true);
    setMenuAbiertoId(null);
  };

  const cerrarModal = () => {
    if (guardando) return;
    setModalAbierto(false);
    setClienteEditando(null);
    setForm(FORM_VACIO);
    setErrorForm("");
  };

  const manejarSubmit = async (evento: React.FormEvent) => {
    evento.preventDefault();

    if (!form.nombre.trim()) {
      setErrorForm("El nombre es obligatorio.");
      return;
    }

    setGuardando(true);
    setErrorForm("");

    const datos: ClientCreate = {
      nombre: form.nombre.trim(),
      email: form.email?.trim() || null,
      telefono: form.telefono?.trim() || null,
      empresa: form.empresa?.trim() || null,
      activo: form.activo,
    };

    try {
      if (clienteEditando) {
        const actualizado = await actualizarCliente(
          clienteEditando.id,
          datos
        );

        setClients((prev) =>
          prev.map((c) =>
            c.id === actualizado.id ? actualizado : c
          )
        );
      } else {
        const creado = await crearCliente(datos);
        setClients((prev) => [creado, ...prev]);
      }

      setModalAbierto(false);
      setClienteEditando(null);
      setForm(FORM_VACIO);
    } catch (err) {
      console.error(err);
      setErrorForm(
        "No se pudo guardar el cliente. Intenta de nuevo."
      );
    } finally {
      setGuardando(false);
    }
  };

  const manejarEliminar = async (client: Client) => {
    setMenuAbiertoId(null);

    const confirmado = window.confirm(
      `¿Seguro que quieres eliminar a "${client.nombre}"? Esta acción no se puede deshacer.`
    );

    if (!confirmado) return;

    try {
      setEliminandoId(client.id);
      await eliminarCliente(client.id);
      setClients((prev) => prev.filter((c) => c.id !== client.id));
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el cliente.");
    } finally {
      setEliminandoId(null);
    }
  };

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

        <Button onClick={abrirModalCrear}>
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
                    className={`border-b border-slate-100 hover:bg-slate-50 ${
                      eliminandoId === client.id
                        ? "opacity-50"
                        : ""
                    }`}
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

                    <td className="relative px-4 py-4">
                      <button
                        className="rounded-lg p-2 hover:bg-slate-100"
                        type="button"
                        disabled={eliminandoId === client.id}
                        onClick={() =>
                          setMenuAbiertoId(
                            menuAbiertoId === client.id
                              ? null
                              : client.id
                          )
                        }
                      >
                        <MoreVertical size={18} />
                      </button>

                      {menuAbiertoId === client.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-4 top-12 z-10 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
                        >
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            onClick={() => abrirModalEditar(client)}
                          >
                            <Pencil size={14} />
                            Editar
                          </button>

                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            onClick={() => manejarEliminar(client)}
                          >
                            <Trash2 size={14} />
                            Eliminar
                          </button>
                        </div>
                      )}
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

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {clienteEditando ? "Editar cliente" : "Nuevo cliente"}
              </h2>

              <button
                type="button"
                onClick={cerrarModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={manejarSubmit} className="space-y-4">
              <Input
                label="Nombre"
                placeholder="Nombre del cliente"
                value={form.nombre}
                onChange={(e) =>
                  setForm({ ...form, nombre: e.target.value })
                }
                required
              />

              <Input
                label="Correo electrónico"
                type="email"
                placeholder="cliente@correo.com"
                value={form.email ?? ""}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />

              <Input
                label="Teléfono"
                placeholder="+51 999 999 999"
                value={form.telefono ?? ""}
                onChange={(e) =>
                  setForm({ ...form, telefono: e.target.value })
                }
              />

              <Input
                label="Empresa"
                placeholder="Nombre de la empresa"
                value={form.empresa ?? ""}
                onChange={(e) =>
                  setForm({ ...form, empresa: e.target.value })
                }
              />

              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={form.activo ?? true}
                  onChange={(e) =>
                    setForm({ ...form, activo: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                Cliente activo
              </label>

              {errorForm && (
                <p className="text-sm text-red-600">{errorForm}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={cerrarModal}
                  disabled={guardando}
                >
                  Cancelar
                </Button>

                <Button type="submit" disabled={guardando}>
                  {guardando
                    ? "Guardando..."
                    : clienteEditando
                    ? "Guardar cambios"
                    : "Crear cliente"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
