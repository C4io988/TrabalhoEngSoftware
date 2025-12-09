import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import baseUrl from "../Api";

interface Cargo {
  codCargo: number;
  nomCargo: string;

}
type OutletContextType = {
  exibirMensagem: (obj: MensagemObj) => void;
};

type MensagemObj = {
  tipo: "ERRO" | "AVISO" | "SUCESSO";
  mensagem: string[];
};

export default function ListaCargo() {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [cargoEditando, setCargoEditando] = useState<Cargo | null>(
    null
  );
  const [modoEdicao, setModoEdicao] = useState(false);
  const outletContext = useOutletContext<OutletContextType | null>();
  const exibirMensagem = outletContext?.exibirMensagem ?? ((obj: MensagemObj) => alert(obj.mensagem.join("\n"))); 

  // Buscar cargos na montagem
  useEffect(() => {
    buscarCargos();
  }, []);

  const buscarCargos = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/cargo`);
      if (!res.ok) {
        const msg = await res.json();
        exibirMensagem(msg)
        return;
      }
      const data = await res.json();
      setCargos(data);
    } catch (error) {
      exibirMensagem({
        tipo: "ERRO",
        mensagem: [`Erro inesperado ao consultar o Medicamento: ${error}`]
      });
    }
  };

  const buscarCargoPorId = async (codCargo: number) => {
    try {
      const res = await fetch(
        `${baseUrl}/api/obterCargoPorId/${codCargo}`
      );

      if (!res.ok) {
        const msg = await res.json();
        exibirMensagem(msg)
        return;
      }
      const data = await res.json();
      if (data && data.length > 0) {
        setCargoEditando(data[0]);
        setModoEdicao(true);
      }
    } catch (error) {
      exibirMensagem({
        tipo: "ERRO",
        mensagem: [`Erro inesperado ao salvar o cargo: ${error}`]
      });
    }
  };

  const salvarCargo = async () => {
    if (!cargoEditando) return;

    const metodo = modoEdicao ? "PUT" : "POST";

    try {
      const res = await fetch(`${baseUrl}/api/cargo`, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cargoEditando),
      });

      if (!res.ok) {
        const msg = await res.json();
        exibirMensagem(msg)
        return;
      }
      const resposta = await res.json();
      if (resposta.tipo !== "SUCESSO"){
         return;
      }
      exibirMensagem(resposta)
      
    } catch (error) {
       exibirMensagem({
        tipo: "ERRO",
        mensagem: [`Erro inesperado ao salvar o cargo: ${error}`]
      });
    } finally {
      await buscarCargos();
      setCargoEditando(null);
      setModoEdicao(false);
    }
  };


  const excluirCargo = async (codCargo: number) => {
    const confirmado = confirm("Deseja realmente excluir este Medicamento?");
    if (!confirmado) return;

    try {
      const res = await fetch(`${baseUrl}/api/cargo/${codCargo}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const msg = await res.json();
        exibirMensagem(msg)
        return;
      }

      await buscarCargos(); // Recarrega a lista após excluir
    } catch (error) {
       exibirMensagem({
        tipo: "ERRO",
        mensagem: [`Erro inesperado ao excluir o Medicamento: ${error}`]
      });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Medicamentos:</h2>

      <table className="w-full border-collapse border border-gray-400">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-400 px-4 py-2">Nome do Medicamento</th>
            <th className="border border-gray-400 px-4 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {cargos.map((cargo) => (
            <tr
              key={cargo.codCargo}
              className="border border-gray-400"
            >
              <td className="border border-gray-400 px-4 py-2">
                {cargo.nomCargo}
              </td>
              <td className="border border-gray-400 px-4 py-2">
                <button
                  className="mr-2 text-blue-500"
                  onClick={() =>
                    buscarCargoPorId(cargo.codCargo)
                  }
                >
                  ✏️
                </button>
                <button
                  className="text-red-500"
                  onClick={() => excluirCargo(cargo.codCargo)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        onClick={() => {
          setCargoEditando({
            codCargo: 0,
            nomCargo: ""
          });
          setModoEdicao(false);
        }}
      >
        ➕ Inserir Novo Medicamento
      </button>

      {cargoEditando && (
        <div className="mt-6 p-4 border border-gray-400 rounded">
          <h3 className="text-lg font-semibold mb-2">
            {modoEdicao ? "Editar Medicamento" : "Novo Medicamento"}
          </h3>

          <label className="block mb-2">
            Nome do Medicamento:
            <input
              type="text"
              className="w-full p-2 border border-gray-400 rounded"
              value={cargoEditando.nomCargo}
              onChange={(e) =>
                setCargoEditando({
                  ...cargoEditando,
                  nomCargo: e.target.value,
                })
              }
            />
          </label>

          <div className="mt-4 flex justify-center space-x-4">
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              onClick={() => {
                setCargoEditando(null);
                setModoEdicao(false);
              }}
            >
              ❌ Cancelar
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={salvarCargo}
            >
              💾 Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
