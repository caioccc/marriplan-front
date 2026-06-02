export interface SimulationInputs {
  guestsCount: number;
  weddingDate: string;
  style: string;
  dressCode: string;
  locationType: "capital" | "interior" | "praia" | "campo" | "serra";
  state: string;
  city: string;
  eventLevel: "economic" | "intermediate" | "premium" | "luxury";
  structure: string[];
  foodType: "coquetel" | "jantar" | "churrasco" | "buffet" | "ilhas";
  entertainment: "playlist" | "dj" | "banda" | "banda_dj";
  media: "photo" | "photo_video" | "photo_video_drone";
  priorities: string[];
  budgetTier: string;
  monthlySaving: number;
}

export interface CostBreakdownItem {
  category: string;
  estimatedCost: number;
  percentage: number;
}

export interface Scenario {
  name: string;
  description: string;
  totalEstimated: number;
  timeToSaveMonths: number;
  isFeasible: boolean;
}

export interface SimulationResult {
  generatedAt: string;
  inputs: SimulationInputs;
  scenarios: {
    target: Scenario;
    alternativeEconomical: Scenario;
    alternativePremium: Scenario;
  };
  breakdown: CostBreakdownItem[];
  monthlyGoalStatus: {
    monthsRequired: number;
    monthsUntilWedding: number;
    isPossibleBeforeWedding: boolean;
    monthlyShortfall: number;
  };
  recommendations: string[];
}

// Valores base médios por convidado e custos fixos estruturais
const BASE_COST_PER_GUEST = 180;

const MULTIPLIERS = {
  eventLevel: { economic: 0.8, intermediate: 1.2, premium: 1.8, luxury: 3.2 },
  locationType: { capital: 1.3, interior: 0.9, praia: 1.4, campo: 1.2, serra: 1.25 },
  foodType: { coquetel: 0.8, jantar: 1.1, churrasco: 0.9, buffet: 1.3, ilhas: 1.6 },
  entertainment: { playlist: 500, dj: 3500, banda: 8000, banda_dj: 11000 },
  media: { photo: 4000, photo_video: 7500, photo_video_drone: 11000 }
};

export function calculateWeddingSimulation(inputs: SimulationInputs): SimulationResult {
  const { guestsCount, weddingDate, eventLevel, locationType, foodType, entertainment, media, priorities, monthlySaving } = inputs;

  // 1. Cálculo do custo base ponderado
  const guestMultiplier = MULTIPLIERS.eventLevel[eventLevel] * MULTIPLIERS.locationType[locationType] * MULTIPLIERS.foodType[foodType];
  const totalVariableCost = guestsCount * BASE_COST_PER_GUEST * guestMultiplier;

  // Costos fixos com base nas escolhas
  const entertainmentCost = MULTIPLIERS.entertainment[entertainment] * MULTIPLIERS.eventLevel[eventLevel];
  const mediaCost = MULTIPLIERS.media[media] * MULTIPLIERS.eventLevel[eventLevel];
  const structuralCost = (inputs.structure.length * 4000) * MULTIPLIERS.eventLevel[eventLevel];

  let totalTargetCost = totalVariableCost + entertainmentCost + mediaCost + structuralCost;

  // Ajuste com base nas prioridades (inflaciona levemente as áreas de foco para garantir margem de segurança)
  priorities.forEach(() => {
    totalTargetCost += (2500 * MULTIPLIERS.eventLevel[eventLevel]);
  });

  // 2. Divisão de categorias (Breakdown)
  const categoriesDistribution = [
    { category: "Espaço e Alimento (Buffet)", weight: 0.42 },
    { category: "Decoração e Ambientes", weight: 0.18 },
    { category: "Foto, Vídeo e Cobertura", weight: mediaCost / totalTargetCost },
    { category: "Música e Entretenimento", weight: entertainmentCost / totalTargetCost },
    { category: "Estrutura, Cerimonial e Extras", weight: 0.12 }
  ];

  let distributedWeightSum = 0;
  const breakdown: CostBreakdownItem[] = categoriesDistribution.map(item => {
    const estimatedCost = totalTargetCost * item.weight;
    distributedWeightSum += item.weight;
    return {
      category: item.category,
      estimatedCost: Math.round(estimatedCost),
      percentage: Math.round(item.weight * 100)
    };
  });

  // 3. Cálculo de Prazos e Metas Financeiras
  const weddingDateTime = new Date(weddingDate).getTime();
  const now = Date.now();
  const monthsUntilWedding = Math.max(1, Math.floor((weddingDateTime - now) / (1000 * 60 * 60 * 24 * 30.41)));

  const calculateMonthsNeeded = (total: number) => Math.ceil(total / (monthlySaving || 1));
  
  const targetMonthsRequired = calculateMonthsNeeded(totalTargetCost);
  const isPossibleBeforeWedding = targetMonthsRequired <= monthsUntilWedding;
  const monthlyShortfall = isPossibleBeforeWedding ? 0 : Math.ceil((totalTargetCost / monthsUntilWedding) - monthlySaving);

  // 4. Cenários alternativos
  const totalEcoCost = totalTargetCost * 0.75;
  const totalPremiumCost = totalTargetCost * 1.35;

  // 5. Recomendações Dinâmicas e Customizadas
  const recommendations: string[] = [];
  if (!isPossibleBeforeWedding) {
    recommendations.push(`Aumentar a meta mensal de economia em R$ ${monthlyShortfall.toFixed(0)} ajudará a quitar o cenário planejado dentro do prazo estipulado.`);
    recommendations.push("Considerem migrar alguns itens não prioritários para a categoria Econômica para reduzir o valor total de investimento.");
  } else {
    recommendations.push("Excelente planejamento financeiro! A sua capacidade de poupança atual cobre o cenário desejado confortavelmente antes do casamento.");
  }

  if (priorities.includes("decora") && eventLevel !== "economic") {
    recommendations.push("Como Decoração é sua prioridade máxima, priorize espaços que já possuam beleza natural (como campo ou serra) para otimizar os arranjos florais.");
  }
  if (guestsCount > 150) {
    recommendations.push("Para listas acima de 150 convidados, o modelo de Buffet Completo ou Ilhas Gastronômicas costuma apresentar melhor custo-benefício por pessoa.");
  }

  return {
    generatedAt: new Date().toLocaleDateString("pt-BR"),
    inputs,
    scenarios: {
      target: {
        name: "Cenário Desejado",
        description: "Alinhado perfeitamente com todas as escolhas selecionadas.",
        totalEstimated: Math.round(totalTargetCost),
        timeToSaveMonths: targetMonthsRequired,
        isFeasible: isPossibleBeforeWedding
      },
      alternativeEconomical: {
        name: "Cenário Otimizado (Econômico)",
        description: "Redução sutil de escopo em itens não prioritários para maior fôlego financeiro.",
        totalEstimated: Math.round(totalEcoCost),
        timeToSaveMonths: calculateMonthsNeeded(totalEcoCost),
        isFeasible: calculateMonthsNeeded(totalEcoCost) <= monthsUntilWedding
      },
      alternativePremium: {
        name: "Cenário Premium (Experiência Máxima)",
        description: "Upgrade geral de fornecedores e experiências exclusivas para os convidados.",
        totalEstimated: Math.round(totalPremiumCost),
        timeToSaveMonths: calculateMonthsNeeded(totalPremiumCost),
        isFeasible: calculateMonthsNeeded(totalPremiumCost) <= monthsUntilWedding
      }
    },
    breakdown,
    monthlyGoalStatus: {
      monthsRequired: targetMonthsRequired,
      monthsUntilWedding,
      isPossibleBeforeWedding,
      monthlyShortfall
    },
    recommendations
  };
}