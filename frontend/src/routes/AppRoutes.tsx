import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Clientes from "../pages/Clientes";
import Comentarios from "../pages/Comentarios";
import AnalisisNLP from "../pages/AnalisisNLP";
import Metricas from "../pages/Metricas";
import Optimizacion from "../pages/Optimizacion";
import Reportes from "../pages/Reportes";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route element={<ProtectedRoute />}>

          <Route element={<MainLayout />}>

            <Route
              path="/"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/clientes"
              element={<Clientes />}
            />

            <Route
              path="/comentarios"
              element={<Comentarios />}
            />

            <Route
              path="/nlp"
              element={<AnalisisNLP />}
            />

            <Route
              path="/metricas"
              element={<Metricas />}
            />

            <Route
              path="/optimizacion"
              element={<Optimizacion />}
            />

            <Route
              path="/reportes"
              element={<Reportes />}
            />

          </Route>

        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

