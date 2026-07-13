/** Espelha os hex de `--color-brand-*` em globals.css. Usado onde uma cor
 * precisa ser um valor JS puro (SVG/Recharts, `style={{ color }}`) em vez de
 * uma classe Tailwind — mantém uma única fonte para não redeclarar os
 * mesmos hex em cada componente que desenha um gráfico ou KPI.
 *
 * primary/accent/purple/slate vêm da paleta oficial (assets/cores.png) —
 * primary é o verde institucional (#072928/#00CC88), accent e purple são as
 * famílias ciano e roxo da mesma imagem, usadas para diferenciar séries em
 * gráficos. ok/warn/crit seguem a convenção de sucesso/alerta/erro e não
 * fazem parte da paleta de marca. */
export const CHART_COLORS = {
  primary: "#00CC88",
  accent: "#00DBFF",
  purple: "#5F4AF4",
  ok: "#1F9D6E",
  warn: "#D9A441",
  crit: "#D6503F",
  slate: "#9B9B97",
} as const;

/** Paleta cíclica para séries categóricas sem um mapa fixo (ex.: uma barra
 * por projeto/área, onde a lista de nomes é dinâmica). Ordem escolhida para
 * alternar matiz entre barras vizinhas (verde → roxo → âmbar → ciano →
 * vermelho → cinza) e maximizar contraste de leitura mesmo com poucas
 * categorias. Use `categoryColor(index)` para ciclar quando N > length. */
export const CATEGORY_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.purple,
  CHART_COLORS.warn,
  CHART_COLORS.accent,
  CHART_COLORS.crit,
  CHART_COLORS.slate,
  CHART_COLORS.ok,
] as const;

export function categoryColor(index: number): string {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}
