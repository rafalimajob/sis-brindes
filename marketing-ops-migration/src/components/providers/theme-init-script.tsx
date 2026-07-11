// Aplica a classe "dark" em <html> antes da 1ª pintura, evitando flash de tema
// errado. Roda como script inline (não um componente React normal) de propósito.
const THEME_INIT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

export function ThemeInitScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />;
}
