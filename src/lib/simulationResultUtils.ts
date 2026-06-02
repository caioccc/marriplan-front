import { SimulationResult } from "./simulationUtils";

export interface EconomyOption {
  id: string;
  label: string;
  savings: number;
  iconType: "music" | "users" | "sparkles";
}

/**
 * Retorna as opções dinâmicas do simulador de economia com base nas escolhas originais do casal
 */
export function getAvailableEconomyOptions(simulation: SimulationResult): EconomyOption[] {
  const options: EconomyOption[] = [];
  const inputs = simulation.inputs;

  // Se escolheu Banda ou Banda+DJ, oferece a troca por apenas DJ
  if (inputs.entertainment === "banda" || inputs.entertainment === "banda_dj") {
    options.push({
      id: "change_music",
      label: "Trocar performance ao vivo (Banda) por DJ Profissional",
      savings: inputs.eventLevel === "luxury" ? 7000 : 4500,
      iconType: "music"
    });
  }

  // Se a lista for maior que 50 convidados, calcula ganho por redução sutil de corte
  if (inputs.guestsCount > 50) {
    const costPerGuest = Math.round(simulation.breakdown[0].estimatedCost / inputs.guestsCount) || 160;
    options.push({
      id: "reduce_guests",
      label: "Otimizar a lista reduzindo em 20 convidados menos próximos",
      savings: costPerGuest * 20,
      iconType: "users"
    });
  }

  // Se o nível for premium ou luxo, oferece migração cirúrgica de fornecedores de cenografia
  if (inputs.eventLevel === "premium" || inputs.eventLevel === "luxury") {
    options.push({
      id: "reduce_decor",
      label: "Optar por mobiliário integrado e cenografia intermediária",
      savings: inputs.eventLevel === "luxury" ? 6000 : 3500,
      iconType: "sparkles"
    });
  }

  return options;
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(value);
};