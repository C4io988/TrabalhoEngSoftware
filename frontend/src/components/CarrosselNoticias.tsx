import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Imagens de exemplo (pode substituir por URLs reais ou imagens locais)
const noticias = [
  {
    id: 1,
    titulo: "Campanha de Vacinação 2025",
    texto: "Fique atento ao calendário e proteja sua família.",
    cor: "bg-blue-600", // Pode ser uma imagem de fundo depois
    icone: "💉"
  },
  {
    id: 2,
    titulo: "Novos Medicamentos no Programa",
    texto: "Confira a lista atualizada de remédios disponíveis.",
    cor: "bg-green-600",
    icone: "💊"
  },
  {
    id: 3,
    titulo: "Atendimento Humanizado",
    texto: "Nossa prioridade é cuidar de você com agilidade.",
    cor: "bg-purple-600",
    icone: "🤝"
  }
];

export default function CarrosselNoticias() {
  const [atual, setAtual] = useState(0);

  // Troca automática a cada 5 segundos
  useEffect(() => {
    const intervalo = setInterval(() => {
        proximo();
    }, 5000);
    return () => clearInterval(intervalo);
  }, [atual]);

  const proximo = () => {
    setAtual((curr) => (curr === noticias.length - 1 ? 0 : curr + 1));
  };

  const anterior = () => {
    setAtual((curr) => (curr === 0 ? noticias.length - 1 : curr - 1));
  };

  return (
    <div className="w-full h-full relative overflow-hidden rounded-xl shadow-sm group">
      
      {/* Slides */}
      <div 
        className="w-full h-full flex transition-transform duration-500 ease-out" 
        style={{ transform: `translateX(-${atual * 100}%)` }}
      >
        {noticias.map((item) => (
          <div key={item.id} className={`w-full h-full flex-shrink-0 flex flex-col items-center justify-center text-white ${item.cor} relative p-10`}>
             {/* Fundo decorativo sutil */}
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             
             <div className="z-10 text-center animate-fade-in-up">
                <div className="text-6xl mb-4">{item.icone}</div>
                <h2 className="text-3xl font-bold mb-2">{item.titulo}</h2>
                <p className="text-lg opacity-90 max-w-lg mx-auto">{item.texto}</p>
                <button className="mt-6 px-6 py-2 bg-white text-gray-800 font-semibold rounded-full hover:bg-gray-100 transition shadow-md">
                    Saiba Mais
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* Botões de Navegação (Aparecem no Hover) */}
      <button 
        onClick={anterior} 
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
      >
        <ChevronLeft size={32} />
      </button>
      <button 
        onClick={proximo} 
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
      >
        <ChevronRight size={32} />
      </button>

      {/* Indicadores (Bolinhas) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {noticias.map((_, i) => (
          <div 
            key={i} 
            className={`w-3 h-3 rounded-full transition-all cursor-pointer ${atual === i ? "bg-white scale-125" : "bg-white/50"}`}
            onClick={() => setAtual(i)}
          />
        ))}
      </div>
    </div>
  );
}