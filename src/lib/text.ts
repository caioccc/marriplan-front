export function toUpperCamelWords(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      // Verifica se a palavra inteira já está em caixa alta
      if (word === word.toUpperCase() && /[A-Z]/.test(word)) {
        return word; // Mantém exatamente como o usuário digitou
      }

      // Caso contrário, capitaliza a primeira e põe o resto em minúsculo
      return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
    })
    .join(" ");
}

export function toSentenceCase(value: string) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (!normalized) return "";

  // Processa palavra por palavra para preservar as caixas altas
  const words = normalized.split(" ").map((word, index) => {
    // Se a palavra já estiver toda em maiúsculo, preserva
    if (word === word.toUpperCase() && /[A-Z]/.test(word)) {
      return word;
    }
    // Caso contrário, vira minúscula
    return word.toLowerCase();
  });

  // Junta tudo de volta
  const combined = words.join(" ");

  // Garante apenas que a primeira letra de toda a frase seja maiúscula
  return `${combined.charAt(0).toUpperCase()}${combined.slice(1)}`;
}

export function handleValueChange(raw: string) {
  // permite dígitos, ponto e vírgula; converte vírgula para ponto
  let v = raw.replace(/[^\d.,]/g, "");
  v = v.replace(/,/g, ".");
  // remover zeros à esquerda quando não houver parte decimal
  if (!v.includes(".")) {
    v = v.replace(/^0+(?=\d)/, "");
  } else {
    const parts = v.split(".");
    parts[0] = parts[0].replace(/^0+(?=\d)/, "") || "0";
    v = parts.join(".");
  }
  return v;
}
