import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Acompanhar from "./pages/Acompanhar";
import Paciente from "./pages/Paciente";
import Recepcao from "./pages/Recepcao";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Paciente />} />
        <Route path="/acompanhar/:id" element={<Acompanhar />} />
        <Route path="/recepcao" element={<Recepcao />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
