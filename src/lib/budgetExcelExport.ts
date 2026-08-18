import type { Worksheet } from "exceljs";

import { Budget, BudgetItem } from "@/src/types";
import { resolvePercentNfBV, resolveTaxNfFactor } from "@/src/lib/profitability";

/**
 * Exporta um orçamento para um arquivo .xlsx idêntico à planilha BASE da Joy.
 *
 * Estratégia: carrega o template versionado em `public/templates/orcamento-base.xlsx`
 * (que já contém todos os estilos, merges e fórmulas da planilha original), escreve
 * apenas os valores de entrada (cabeçalho + itens) nas células corretas e deixa o
 * Excel recalcular os totais. Quando uma categoria tem mais itens do que os "slots"
 * disponíveis no template, linhas extras são inseridas e as fórmulas dos blocos de
 * total/financeira são regeneradas com as novas posições.
 */

export type ExcelExportVariant = "internal" | "client";

const SHEET_NAME = "Orçamento Geral JOY";
const TEMPLATE_URL = `${import.meta.env.BASE_URL}templates/orcamento-base.xlsx`;

/** Primeira linha de dados e capacidade de slots de cada categoria no template. */
interface CategoryLayout {
  first: number;
  slots: number;
}

const CATEGORY_LAYOUT: Record<string, CategoryLayout> = {
  "1.1": { first: 12, slots: 12 },
  "1.2": { first: 26, slots: 23 },
  "1.3": { first: 51, slots: 26 },
  "1.4": { first: 79, slots: 20 },
  "1.5": { first: 101, slots: 15 },
  "1.6": { first: 118, slots: 10 },
  "1.7": { first: 130, slots: 9 },
  "1.8": { first: 141, slots: 21 },
  "1.9": { first: 164, slots: 8 },
  "1.10": { first: 174, slots: 9 },
  "1.11": { first: 185, slots: 8 },
  "1.12": { first: 195, slots: 8 },
  "2.1": { first: 215, slots: 30 },
};

const SECTION1_CATEGORIES = [
  "1.1",
  "1.2",
  "1.3",
  "1.4",
  "1.5",
  "1.6",
  "1.7",
  "1.8",
  "1.9",
  "1.10",
  "1.11",
  "1.12",
];

// Colunas (1-based) na planilha.
const COL = {
  B_NAME: 2,
  A_NUMBER: 1,
  C_DESCRIPTION: 3,
  D_BILLING: 4,
  E_QUANTITY: 5,
  F_DAYS: 6,
  H_UNIT: 8,
  I_TOTAL: 9,
  L_ADVANCE: 12,
  M_30: 13,
  N_45: 14,
  O_60: 15,
  P_90: 16,
  Q_120: 17, // coluna "120 dias" — não existe no template original, criada na exportação
  S_SUPPLIER: 19,
  T_SUPPLIER_VALUE: 20,
  U_BV: 21,
  V_NF_BV: 22,
  W_RS_BV: 23,
  X_NF_OVER: 24,
  Y_OVER: 25,
  Z_REAL: 26,
} as const;

// Faixa de colunas da área FINANCEIRA (S..AC) — removida na versão "cliente".
const FINANCEIRA_FIRST_COL = 19;
const FINANCEIRA_LAST_COL = 29;
// Coluna espaçadora vermelha (R) que divide o orçamento da financeira no template.
const RED_DIVIDER_COL = 18;

function extractOrder(itemNumber: string): number {
  const parts = itemNumber.split(".");
  return parseInt(parts[parts.length - 1], 10) || 0;
}

function groupByCategory(items: BudgetItem[]): Record<string, BudgetItem[]> {
  const grouped: Record<string, BudgetItem[]> = {};
  for (const item of items) {
    (grouped[item.categoryId] ??= []).push(item);
  }
  return grouped;
}

function copyRowStyle(ws: Worksheet, fromRow: number, toRow: number): void {
  const src = ws.getRow(fromRow);
  const dst = ws.getRow(toRow);
  dst.height = src.height;
  for (let c = 1; c <= FINANCEIRA_LAST_COL; c++) {
    dst.getCell(c).style = { ...src.getCell(c).style };
  }
}

function sanitize(value: string | undefined): string {
  return (value ?? "").replace(/[\\/:*?"<>|]/g, "-").trim();
}

function columnNumber(letters: string): number {
  return letters.split("").reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0);
}

/** Desfaz os merges restritos às colunas B/C (agrupamentos de itens do template). */
function unmergeItemCells(ws: Worksheet): void {
  const merges: string[] = [...((ws.model as { merges?: string[] }).merges ?? [])];
  for (const range of merges) {
    const [start, end] = range.split(":");
    const startCol = columnNumber((start.match(/[A-Z]+/) ?? [""])[0]);
    const endCol = columnNumber((end.match(/[A-Z]+/) ?? [""])[0]);
    if (startCol >= COL.B_NAME && endCol <= COL.C_DESCRIPTION) {
      ws.unMergeCells(range);
    }
  }
}

export async function exportBudgetToExcel(budget: Budget, variant: ExcelExportVariant): Promise<void> {
  // Importação dinâmica: ExcelJS é pesado (~1MB) e só é necessário ao exportar.
  const { default: ExcelJS } = await import("exceljs");

  const response = await fetch(TEMPLATE_URL);
  if (!response.ok) {
    throw new Error(`Falha ao carregar o template de exportação (${response.status}).`);
  }
  const buffer = await response.arrayBuffer();

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const ws = workbook.getWorksheet(SHEET_NAME);
  if (!ws) throw new Error(`Aba "${SHEET_NAME}" não encontrada no template.`);

  const grouped = groupByCategory(budget.items);
  const allCategories = [...SECTION1_CATEGORIES, "2.1"];

  // Itens ordenados por número, posicionados sequencialmente (sem buracos).
  const sortedItems: Record<string, BudgetItem[]> = {};
  for (const categoryId of allCategories) {
    sortedItems[categoryId] = (grouped[categoryId] ?? [])
      .slice()
      .sort((a, b) => extractOrder(a.itemNumber) - extractOrder(b.itemNumber));
  }

  // O template agrupa nomes/descritivos do catálogo padrão com merges em B/C
  // (ex.: B12:B14 = "Hospedagem"). Como cada item do orçamento tem nome próprio,
  // desfazemos esses merges antes de remanejar linhas.
  unmergeItemCells(ws);

  const setValue = (row: number, col: number, value: string | number | null) => {
    ws.getCell(row, col).value = value;
  };
  const setFormula = (row: number, col: number, formula: string) => {
    ws.getCell(row, col).value = { formula };
  };

  // --- 1. Layout compacto: cada categoria mostra exatamente seus itens. ---
  // Slots em branco não usados são OCULTADOS (não deletados — deletar quebra os
  // merges das linhas abaixo no ExcelJS). Itens além da capacidade do template
  // são inseridos (inserir preserva os merges). As fórmulas dependentes são
  // regeneradas quando há inserção.
  const finalFirst: Record<string, number> = {};
  const renderedRows: Record<string, number> = {};
  const rowsToHide: number[] = [];
  const emptyCategoryRows: number[] = []; // cabeçalho/separador de categorias sem itens (só no cliente)
  let offset = 0;

  const layoutCategory = (categoryId: string) => {
    const { first, slots } = CATEGORY_LAYOUT[categoryId];
    const base = first + offset;
    finalFirst[categoryId] = base;
    const count = sortedItems[categoryId].length;
    renderedRows[categoryId] = Math.max(count, slots);
    if (count > slots) {
      const extra = count - slots;
      const insertAt = base + slots;
      ws.spliceRows(insertAt, 0, ...Array.from({ length: extra }, () => [] as unknown[]));
      for (let k = 0; k < extra; k++) copyRowStyle(ws, insertAt - 1, insertAt + k);
      offset += extra;
    } else {
      for (let r = base + count; r < base + slots; r++) rowsToHide.push(r); // slots vazios
    }
    if (categoryId === "2.1") rowsToHide.push(base - 2); // antigo título da seção de serviços internos
    if (count === 0) {
      emptyCategoryRows.push(base - 1, base + slots); // faixa do título + linha separadora
    }
  };

  SECTION1_CATEGORIES.forEach(layoutCategory);
  const offsetSection1 = offset; // bloco Subtotal 1 (linhas 205+)
  rowsToHide.push(211 + offset); // oculta "ITENS NÃO PREENCHIDOS"
  layoutCategory("2.1");
  const offsetTotal = offset; // tudo a partir da linha 245
  const hasOverflow = offset > 0;

  // --- 2. Cabeçalho. ---
  setValue(1, COL.B_NAME, budget.client ?? "");
  setValue(2, COL.B_NAME, budget.job ?? "");
  const deadline = Number(budget.deadline);
  setValue(3, COL.B_NAME, deadline > 0 ? deadline : null); // limpa o "30" do template se vazio
  setValue(4, COL.B_NAME, budget.location ?? "");
  setValue(5, COL.B_NAME, budget.date ?? "");
  setValue(6, COL.B_NAME, budget.participants ?? "");
  // Honorários: sempre do orçamento (padrão 10%, igual ao sistema — não o 15% do template).
  setValue(248 + offsetTotal, COL.F_DAYS, (budget.honorariumPercentage ?? 10) / 100);
  // Planejamento é persistido pela API como projectedValue.
  setValue(247 + offsetTotal, COL.I_TOTAL, budget.projectedValue);

  // --- 3. Itens (posição sequencial). ---
  for (const categoryId of allCategories) {
    const base = finalFirst[categoryId];
    sortedItems[categoryId].forEach((item, idx) => {
      const r = base + idx;
      setValue(r, COL.B_NAME, item.name);
      setValue(r, COL.C_DESCRIPTION, item.description);
      setValue(r, COL.D_BILLING, item.billingType || null);
      setValue(r, COL.E_QUANTITY, item.quantity);
      setValue(r, COL.F_DAYS, item.days);
      setValue(r, COL.H_UNIT, item.unitPrice);
      setValue(r, COL.L_ADVANCE, item.paymentAdvance);
      setValue(r, COL.M_30, item.payment30d);
      setValue(r, COL.N_45, item.payment45d);
      setValue(r, COL.O_60, item.payment60d);
      setValue(r, COL.P_90, item.payment90d);
      // Coluna "120 dias": não existe no template, então herda o estilo do 90 dias.
      ws.getCell(r, COL.Q_120).style = { ...ws.getCell(r, COL.P_90).style };
      setValue(r, COL.Q_120, item.payment120d);
      if (variant === "internal") {
        setValue(r, COL.S_SUPPLIER, item.fornecedorName || null);
        setValue(r, COL.T_SUPPLIER_VALUE, item.fornecedorValue);
        setValue(r, COL.U_BV, (item.percentBV || 0) / 100);
        const nfBv = resolvePercentNfBV(item.billingType, item.percentBV || 0, item.percentNfBV);
        setValue(r, COL.V_NF_BV, nfBv / 100);
        setValue(r, COL.X_NF_OVER, (item.percentNfOver || 0) / 100);
      }
    });
  }

  // --- 4. Mescla numeração (A) e nome (B) de itens consecutivos com mesmo nome. ---
  mergeSameNameGroups(ws, allCategories, finalFirst, sortedItems);

  // --- 5. Regenera fórmulas apenas quando houve inserção (overflow). ---
  if (hasOverflow) {
    regenerateFormulas(setFormula, finalFirst, renderedRows, offsetSection1, offsetTotal);
  }

  // --- 6. Coluna "120 dias" (existe no sistema, não no template). ---
  applyPayment120Column(ws, setFormula, finalFirst, offsetSection1, offsetTotal);

  // O fator NF vem do snapshot da API. No formato atual, 0.82 é usado
  // diretamente como divisor; o formato percentual legado também é aceito.
  const taxNfValue = Number(budget.taxNf);
  const taxNf = Number.isFinite(taxNfValue) && taxNfValue > 0 ? taxNfValue : 18;
  applyTaxNfFormulas(setFormula, taxNf, resolveTaxNfFactor(taxNf), offsetSection1, offsetTotal);

  const lastRow = 270 + offsetTotal;

  // --- 7. Enxuga: oculta slots vazios, "ITENS NÃO PREENCHIDOS", categorias sem
  //        itens, e remove a formatação vermelha do template (nas 2 versões). ---
  for (const r of rowsToHide) ws.getRow(r).hidden = true;
  for (const r of emptyCategoryRows) ws.getRow(r).hidden = true;
  removeRedFormatting(ws, lastRow);
  clearInternalTemplateNotes(ws, offsetTotal);

  // --- 8. Bloco de texto do rodapé: quebra de linha + altura para não cortar. ---
  applyFooterTextLayout(ws, offsetTotal);

  // --- 9. Versão "cliente": remove a área financeira e o divisor (coluna R). ---
  if (variant === "client") {
    clearClientFinancialArea(ws, lastRow);
    for (let c = FINANCEIRA_FIRST_COL; c <= FINANCEIRA_LAST_COL; c++) {
      ws.getColumn(c).hidden = true;
    }
    ws.getColumn(RED_DIVIDER_COL).hidden = true;
  }

  // --- 10. Download. ---
  const out = await workbook.xlsx.writeBuffer();
  const { saveAs } = await import("file-saver");
  const suffix = variant === "internal" ? " (INTERNA)" : " (COMERCIAL)";
  // Data/hora no nome garante arquivo único por exportação (evita abrir um download antigo).
  const n = new Date();
  const p = (v: number) => String(v).padStart(2, "0");
  const stamp = `${p(n.getDate())}-${p(n.getMonth() + 1)}-${n.getFullYear()} ${p(n.getHours())}h${p(n.getMinutes())}`;
  const fileName = `Orçamento - ${sanitize(budget.client) || "sem-cliente"} - ${sanitize(budget.name) || "orcamento"}${suffix} - ${stamp}.xlsx`;
  saveAs(
    new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    fileName,
  );
}

/**
 * No modo cliente, a área de rentabilidade não deve manter os preenchimentos
 * cinza nem as bordas usadas pela planilha interna.
 */
function clearClientFinancialArea(ws: Worksheet, lastRow: number): void {
  for (let r = 1; r <= lastRow; r++) {
    for (let c = FINANCEIRA_FIRST_COL; c <= FINANCEIRA_LAST_COL; c++) {
      const cell = ws.getCell(r, c);
      cell.value = null;
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };
      cell.border = {};
    }
  }
}

/**
 * Mescla as colunas de numeração (A) e nome (B) de itens consecutivos que têm o
 * mesmo nome, fazendo o valor aparecer uma única vez (ex.: 3 "Hospedagem").
 */
function mergeSameNameGroups(
  ws: Worksheet,
  categories: string[],
  finalFirst: Record<string, number>,
  sortedItems: Record<string, BudgetItem[]>,
): void {
  for (const categoryId of categories) {
    const base = finalFirst[categoryId];
    const items = sortedItems[categoryId];
    let i = 0;
    while (i < items.length) {
      const name = (items[i].name ?? "").trim();
      let j = i;
      while (j + 1 < items.length && (items[j + 1].name ?? "").trim() === name) j++;
      if (name !== "" && j > i) {
        const top = base + i;
        const bottom = base + j;
        ws.mergeCells(top, COL.A_NUMBER, bottom, COL.A_NUMBER);
        ws.mergeCells(top, COL.B_NAME, bottom, COL.B_NAME);
        for (const col of [COL.A_NUMBER, COL.B_NAME]) {
          const cell = ws.getCell(top, col);
          cell.alignment = { ...cell.alignment, vertical: "middle" };
        }
      }
      i = j + 1;
    }
  }
}

/**
 * Cria a coluna "120 dias" (Q): o template não a tem, mas o sistema sim. Reaproveita
 * a coluna espaçadora Q, herdando o estilo do "90 dias" (P), com cabeçalho e totais.
 */
function applyPayment120Column(
  ws: Worksheet,
  setFormula: (row: number, col: number, formula: string) => void,
  finalFirst: Record<string, number>,
  o1: number,
  O: number,
): void {
  ws.getColumn(COL.Q_120).width = ws.getColumn(COL.P_90).width;

  // Cabeçalho (linha 8).
  ws.getCell(8, COL.Q_120).style = { ...ws.getCell(8, COL.P_90).style };
  ws.getCell(8, COL.Q_120).value = "120 dias";

  const r205 = 205 + o1;
  const r245 = 245 + O;
  const r247 = 247 + O;
  const s1last = r205 - 1;
  const f2first = finalFirst["2.1"];
  const f2last = r245 - 1;

  for (const r of [r205, r245, r247]) {
    ws.getCell(r, COL.Q_120).style = { ...ws.getCell(r, COL.P_90).style };
  }
  setFormula(r205, COL.Q_120, `SUMIF($H$1:$H$${s1last},">=0",Q1:Q${s1last})`);
  setFormula(r245, COL.Q_120, `SUM(Q${f2first}:Q${f2last})`);
  setFormula(r247, COL.Q_120, `SUM(Q${r205},Q${r245})`);
}

/**
 * Escreve as fórmulas de gross-up com o fator NF recebido da API.
 * Retorna somente o acréscimo: base / fator - base.
 */
function applyTaxNfFormulas(
  setFormula: (row: number, col: number, formula: string) => void,
  taxNf: number,
  taxNfFactor: number,
  o1: number,
  O: number,
): void {
  const r207 = 207 + o1;
  const s1last = 204 + o1;
  const r251 = 251 + O;
  const r252 = 252 + O;
  const r263 = 263 + O;
  const r264 = 264 + O;
  const r265 = 265 + O;
  const r266 = 266 + O;
  const invoiceBase = `SUMIF($D12:$D${s1last},"VIA NF",I12:I${s1last})`;
  setFormula(r207, COL.H_UNIT, `((${invoiceBase})/${taxNfFactor})-(${invoiceBase})`);
  setFormula(r252, COL.I_TOTAL, `(I${r251}/${taxNfFactor})-I${r251}`);
  setFormula(r265, COL.T_SUPPLIER_VALUE, `T${r263}/100*${taxNf}`);
  setFormula(r266, COL.T_SUPPLIER_VALUE, `T${r264}/100*${taxNf}`);
}

/** Remove os preenchimentos e textos vermelhos do template. */
function removeRedFormatting(ws: Worksheet, lastRow: number): void {
  const RED_ARGB = new Set(["FFFF0000", "FFC00000"]);
  for (let r = 1; r <= lastRow; r++) {
    for (let c = 1; c <= FINANCEIRA_LAST_COL; c++) {
      const cell = ws.getCell(r, c);
      const fill = cell.fill as { type?: string; fgColor?: { argb?: string } } | undefined;
      const fillArgb = fill?.fgColor?.argb?.toUpperCase();
      if (fill?.type === "pattern" && fillArgb && RED_ARGB.has(fillArgb)) {
        cell.fill = { type: "pattern", pattern: "none" };
      }

      const fontArgb = cell.font?.color?.argb?.toUpperCase();
      if (fontArgb && RED_ARGB.has(fontArgb)) {
        cell.font = { ...cell.font, color: { argb: "FF000000" } };
      }
    }
  }
}

/** Remove lembretes internos do template (não devem ir no Excel exportado). */
function clearInternalTemplateNotes(ws: Worksheet, offsetTotal: number): void {
  // L248, L258, L259 no template base — deslocam com overflow de linhas.
  for (const original of [248, 258, 259]) {
    ws.getCell(original + offsetTotal, COL.L_ADVANCE).value = null;
  }
}

/** Habilita quebra de texto e dá altura às linhas de texto longo do rodapé. */
function applyFooterTextLayout(ws: Worksheet, offsetTotal: number): void {
  const textRows: Array<[number, number]> = [
    [256, 30], // Condição de Pagamento
    [257, 30], // ** EXCETO ...
    [258, 110], // Política de cancelamento (multilinha)
  ];
  for (const [original, height] of textRows) {
    const r = original + offsetTotal;
    ws.getRow(r).height = height;
    const cell = ws.getCell(r, 1);
    cell.alignment = { ...cell.alignment, wrapText: true, vertical: "top" };
  }
}

/**
 * Reescreve as fórmulas por linha (I/W/Y/Z) e todo o bloco de totais/financeira
 * usando as posições finais após o remanejo de linhas. O ExcelJS não reajusta
 * referências ao deslocar linhas, por isso regeneramos.
 */
function regenerateFormulas(
  setFormula: (row: number, col: number, formula: string) => void,
  finalFirst: Record<string, number>,
  renderedRows: Record<string, number>,
  o1: number,
  O: number,
): void {
  // Fórmulas por item.
  const writeRowFormulas = (r: number, isSection2: boolean) => {
    setFormula(
      r,
      COL.I_TOTAL,
      isSection2
        ? `IFERROR($H${r}*$F${r}*E${r},0)`
        : `IFERROR(IF(OR($D${r}="ND OU REPASSE", $D${r}="VIA NF", $D${r}="VIA CLIENTE", $D${r}=""), $E${r}*$F${r}*$H${r}, 0), 0)`,
    );
    setFormula(r, COL.W_RS_BV, `T${r}*U${r}*(1-V${r})`);
    setFormula(r, COL.Y_OVER, `(I${r}-T${r})*(1-X${r})`);
    setFormula(r, COL.Z_REAL, `T${r}-W${r}`);
  };

  for (const categoryId of SECTION1_CATEGORIES) {
    const base = finalFirst[categoryId];
    for (let k = 0; k < renderedRows[categoryId]; k++) writeRowFormulas(base + k, false);
  }
  const base2 = finalFirst["2.1"];
  for (let k = 0; k < renderedRows["2.1"]; k++) writeRowFormulas(base2 + k, true);

  // Âncoras do bloco de totais.
  const r205 = 205 + o1;
  const r206 = 206 + o1;
  const r207 = 207 + o1;
  const r209 = 209 + o1;
  const s1last = r205 - 1; // cobre todas as linhas de item da seção 1
  const f2first = finalFirst["2.1"];
  const r245 = 245 + O;
  const f2last = r245 - 1; // cobre todas as linhas de item da seção 2
  const r247 = 247 + O;
  const r248 = 248 + O;
  const r250 = 250 + O;
  const r251 = 251 + O;
  const r252 = 252 + O;
  const r254 = 254 + O;
  const r256 = 256 + O;
  const r257 = 257 + O;
  const r261 = 261 + O;
  const r262 = 262 + O;
  const r263 = 263 + O;
  const r264 = 264 + O;
  const r265 = 265 + O;
  const r266 = 266 + O;
  const r267 = 267 + O;
  const r268 = 268 + O;
  const r269 = 269 + O;
  const r270 = 270 + O;

  const payCols = [COL.L_ADVANCE, COL.M_30, COL.N_45, COL.O_60, COL.P_90];
  const letters: Record<number, string> = { 12: "L", 13: "M", 14: "N", 15: "O", 16: "P" };

  // Subtotal 1 (seção fornecedores).
  setFormula(r205, COL.H_UNIT, `SUMIF($D11:$D${s1last},"VIA CLIENTE",I11:I${s1last})`);
  payCols.forEach((c) => setFormula(r205, c, `SUMIF($H$1:$H$${s1last},">=0",${letters[c]}1:${letters[c]}${s1last})`));
  setFormula(r205, COL.T_SUPPLIER_VALUE, `SUM(T1:T${s1last})`);
  setFormula(r205, COL.W_RS_BV, `SUMIF($T$1:$T$${s1last},">=0",W1:W${s1last})`);
  setFormula(r205, COL.Y_OVER, `SUMIF($T$1:$T$${s1last},">=0",Y1:Y${s1last})`);
  setFormula(r205, COL.Z_REAL, `SUMIF($T$1:$T$${s1last},">=0",Z1:Z${s1last})`);
  setFormula(
    r206,
    COL.H_UNIT,
    `SUMIF($D11:$D${s1last},"VIA NF",I11:I${s1last})+SUMIF($D11:$D${s1last},"ND OU REPASSE",I11:I${s1last})`,
  );
  setFormula(r209, COL.H_UNIT, `SUM(H${r205}:I${r207})`);
  // H207 (IMPOSTO NF JOY) é escrito por applyTaxNfFormulas com a % do orçamento.

  // Subtotal 2 (serviços internos).
  const sum2 = (col: string) => `SUM(${col}${f2first}:${col}${f2last})`;
  setFormula(r245, COL.I_TOTAL, sum2("I"));
  payCols.forEach((c) => setFormula(r245, c, sum2(letters[c])));
  setFormula(r245, COL.W_RS_BV, sum2("W"));
  setFormula(r245, COL.Y_OVER, sum2("Y"));
  setFormula(r245, COL.Z_REAL, sum2("Z"));

  // Planejamento / honorários / taxas / totais gerais.
  payCols.forEach((c) => setFormula(r247, c, `SUM(${letters[c]}${r205},${letters[c]}${r245})`));
  setFormula(r248, COL.I_TOTAL, `SUM(H${r205}+H${r206})*($F$${r248})`);
  setFormula(r248, COL.W_RS_BV, `SUM(W${r205},W${r245})`);
  setFormula(
    r250,
    COL.H_UNIT,
    `IF(B3<=59,0,IF(B3<=89,(H${r206}-L${r205})*3%,IF(B3<=119,(H${r206}-L${r205})*((1+3%)^2-1),(H${r206}-L${r205})*((1+3%)^3-1))))`,
  );
  setFormula(r251, COL.I_TOTAL, `SUM(I${r245}:I${r250})`);
  setFormula(r251, COL.Y_OVER, `SUM(Y${r205},Y${r245})`);
  setFormula(r254, COL.I_TOTAL, `H${r209}+I${r251}+I${r252}`);
  // I252 (IMPOSTO NF SERVIÇOS) é escrito por applyTaxNfFormulas.

  // Termômetros e resumo financeiro.
  setFormula(6, COL.S_SUPPLIER, `IF(T${r269}<=19%, "NÃO RENTÁVEL", IF(T${r269}<=25%, "RAZOÁVEL", "RENTÁVEL"))`);
  setFormula(r256, COL.S_SUPPLIER, `IF(T${r270}<=19%, "NÃO RENTÁVEL", IF(T${r270}<=25%, "RAZOÁVEL", "RENTÁVEL"))`);
  setFormula(r257, COL.H_UNIT, `L${r247}`);
  setFormula(r261, COL.T_SUPPLIER_VALUE, `Z${r245}+Z${r205}`);
  setFormula(r262, COL.T_SUPPLIER_VALUE, `I${r207}+I${r252}`);
  setFormula(r263, COL.T_SUPPLIER_VALUE, `W${r205}+Y${r205}`);
  setFormula(r264, COL.T_SUPPLIER_VALUE, `W${r248}+Y${r251}`);
  // T265/T266 (imposto sobre BV/Over) são escritos por applyTaxNfFormulas.
  setFormula(r267, COL.T_SUPPLIER_VALUE, `I${r254}-T${r261}-T${r262}-T${r265}-Y${r245}`);
  setFormula(r268, COL.T_SUPPLIER_VALUE, `I${r254}-T${r261}-T${r262}-T${r266}`);
  setFormula(r269, COL.T_SUPPLIER_VALUE, `IFERROR((T${r267}/I${r254}),"")`);
  setFormula(r270, COL.T_SUPPLIER_VALUE, `IFERROR((T${r268}/I${r254}),"")`);
}
