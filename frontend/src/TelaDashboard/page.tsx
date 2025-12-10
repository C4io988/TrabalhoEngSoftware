import { useState, useEffect } from "react";
import baseUrl from "../Api";
import { PieChart, CheckCircle, XCircle, Clock, FileText } from "lucide-react"; // Ícones para ficar bonito

interface DadosDashboard {
  total: number;
  em_analise: number;
  deferidos: number;
  indeferidos: number;
}

export default function TelaDashboard() {
  const [dados, setDados] = useState<DadosDashboard>({
    total: 0,
    em_analise: 0,
    deferidos: 0,
    indeferidos: 0
  });

  useEffect(() => {
    carregarDados();
    // Atualiza a cada 10 segundos automaticamente (efeito legal na apresentação)
    const intervalo = setInterval(carregarDados, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const carregarDados = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/dashboard/resumo`);
      if (response.ok) {
        const data = await response.json();
        setDados(data);
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2">
        <PieChart className="text-[#1351B4]" /> Dashboard Gerencial
      </h1>

      {/* GRID DE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card Total */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Solicitações</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{dados.total}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <FileText size={32} />
          </div>
        </div>

        {/* Card Em Análise */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Aguardando Análise</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">{dados.em_analise}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
            <Clock size={32} />
          </div>
        </div>

        {/* Card Deferidos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Deferidos (Aprovados)</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{dados.deferidos}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-full text-green-600">
            <CheckCircle size={32} />
          </div>
        </div>

        {/* Card Indeferidos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Indeferidos (Negados)</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{dados.indeferidos}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-full text-red-600">
            <XCircle size={32} />
          </div>
        </div>
      </div>

      {/* Exemplo de Gráfico Visual Simples (Barra de Progresso) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Taxa de Aprovação</h2>
        <div className="relative pt-1">
          <div className="overflow-hidden h-6 mb-4 text-xs flex rounded bg-gray-200">
            
            {/* Barra Verde (Deferidos) */}
            <div 
                style={{ width: `${dados.total ? (dados.deferidos / dados.total) * 100 : 0}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-1000"
            >
            </div>
            
            {/* Barra Vermelha (Indeferidos) */}
            <div 
                style={{ width: `${dados.total ? (dados.indeferidos / dados.total) * 100 : 0}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500 transition-all duration-1000"
            >
            </div>

             {/* Barra Amarela (Em análise - resto) */}
             <div 
                style={{ width: `${dados.total ? (dados.em_analise / dados.total) * 100 : 0}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-400 transition-all duration-1000"
            >
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
             <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Aprovados</span>
             <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Negados</span>
             <span className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400 rounded-full"></div> Em Análise</span>
          </div>
        </div>
      </div>

    </div>
  );
}