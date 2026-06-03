/** Máscara de percentual (pt-BR): dígitos + vírgula decimal, sem type="number". */

export function sanitizePercentInput(raw: string): string {
  let value = raw.replace(/%/g, "").trim().replace(/[^\d,]/g, "");

  const commaIndex = value.indexOf(",");
  if (commaIndex === -1) return value;

  const integerPart = value.slice(0, commaIndex);
  const decimalPart = value.slice(commaIndex + 1).replace(/,/g, "").slice(0, 4);
  return `${integerPart},${decimalPart}`;
}

export function parsePercentInput(masked: string): number | null {
  const sanitized = sanitizePercentInput(masked);
  if (!sanitized) return null;

  const normalized = sanitized.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatPercentForInput(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value);
}
