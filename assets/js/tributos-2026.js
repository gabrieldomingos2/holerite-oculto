/**
 * Regras tributárias de 2026 (Brasil)
 *
 * - INSS do empregado: Portaria Interministerial MPS/MF nº 13/2026
 * - IRRF: tabela progressiva mensal + redutor da Lei nº 15.270/2025
 *
 * Atualize este arquivo a cada virada de ano.
 * O restante do site (app.js) só usa as funções inss() e ir().
 */

/* ------------------------------------------------------------------ */
/* INSS do empregado                                                   */
/* ------------------------------------------------------------------ */

const SALARIO_MINIMO_2026 = 1621.00;
const TETO_INSS_2026 = 8475.55;

/** Faixas progressivas: [limite superior da faixa, alíquota] */
const FAIXAS_INSS = [
  [1621.00, 0.075],
  [2902.84, 0.09],
  [4354.27, 0.12],
  [8475.55, 0.14],
];

/**
 * Contribuição do empregado ao INSS (cálculo progressivo, faixa a faixa).
 * @param {number} base Salário de contribuição do mês.
 * @returns {number} Valor descontado.
 */
function inss(base) {
  let total = 0;
  let limiteAnterior = 0;
  for (const [limite, aliquota] of FAIXAS_INSS) {
    if (base > limiteAnterior) {
      total += (Math.min(base, limite) - limiteAnterior) * aliquota;
    }
    limiteAnterior = limite;
  }
  return total;
}

/* ------------------------------------------------------------------ */
/* Imposto de Renda Retido na Fonte (IRRF)                             */
/* ------------------------------------------------------------------ */

const DEDUCAO_DEPENDENTE = 189.59;
const DESCONTO_SIMPLIFICADO = 607.20;

/** Faixas: [limite superior da base, alíquota, parcela a deduzir] */
const FAIXAS_IR = [
  [2428.80, 0, 0],
  [2826.65, 0.075, 182.16],
  [3751.05, 0.15, 394.16],
  [4664.68, 0.225, 675.49],
  [Infinity, 0.275, 908.73],
];

/** Redutor da Lei 15.270/2025 */
const LIMITE_ISENCAO = 5000.00;
const LIMITE_REDUTOR = 7350.00;
const REDUCAO_MAXIMA = 312.89;
const REDUTOR_CONSTANTE = 978.62;
const REDUTOR_FATOR = 0.133145;

/** Imposto pela tabela progressiva, antes do redutor. */
function irTabela(base) {
  for (const [limite, aliquota, deducao] of FAIXAS_IR) {
    if (base <= limite) return Math.max(0, base * aliquota - deducao);
  }
  return 0;
}

/**
 * Redução mensal de 2026: zera o imposto até R$ 5.000 e
 * diminui gradualmente até R$ 7.350. Nunca deixa o imposto negativo.
 */
function redutor(rendimento, imposto) {
  let reducao = 0;
  if (rendimento <= LIMITE_ISENCAO) reducao = REDUCAO_MAXIMA;
  else if (rendimento <= LIMITE_REDUTOR) reducao = REDUTOR_CONSTANTE - REDUTOR_FATOR * rendimento;
  return Math.max(0, Math.min(imposto, reducao));
}

/**
 * IRRF do mês.
 * @param {number} rendimento Rendimento tributável bruto.
 * @param {number} dependentes Quantidade de dependentes.
 * @param {boolean} simplificado Permite usar o desconto simplificado
 *   (false no 13º, que tem tributação exclusiva).
 * @returns {number} Imposto retido.
 */
function ir(rendimento, dependentes, simplificado) {
  let deducoes = inss(rendimento) + dependentes * DEDUCAO_DEPENDENTE;
  if (simplificado) deducoes = Math.max(deducoes, DESCONTO_SIMPLIFICADO);
  const imposto = irTabela(Math.max(0, rendimento - deducoes));
  return Math.max(0, imposto - redutor(rendimento, imposto));
}
