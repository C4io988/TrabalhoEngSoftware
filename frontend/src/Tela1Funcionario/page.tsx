import { useEffect, useState } from "react";
import baseUrl from "../Api";

interface Medicamento {
  codCargo: number;
  nomCargo: string;
}

export default function ListarMedicamentos() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);

  useEffect(() => {
    buscarMedicamentos();
  }, []);

  const buscarMedicamentos = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/cargo`);
      if (!res.ok) {
        const msg = await res.json().catch(() => ({ mensagem: ["Erro ao consultar"] }));
        alert(Array.isArray(msg.mensagem) ? msg.mensagem.join("\n") : String(msg.mensagem));
        return;
      }
      const data = await res.json();
      setMedicamentos(data || []);
    } catch (error) {
      alert(`Erro inesperado ao consultar os medicamentos: ${error}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lista de Medicamentos</h2>

      <table className="w-full border-collapse border border-gray-400">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-400 px-4 py-2">Nome do Medicamento</th>
          </tr>
        </thead>
        <tbody>
          {medicamentos.map((medicamento) => (
            <tr key={medicamento.codCargo} className="border border-gray-400">
              <td className="border border-gray-400 px-4 py-2">
                {medicamento.nomCargo}
              </td>
            </tr>
          ))}
          {medicamentos.length === 0 && (
            <tr>
              <td className="px-4 py-2 text-center" colSpan={1}>
                Nenhum medicamento cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}