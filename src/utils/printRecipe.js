import { isMobileDevice } from "./downloadFiles";

export default function printRecipe(title) {
  if (!isMobileDevice()) {
    window.print();
    return;
  }

  const sheet = document.querySelector(".print-sheet");
  if (!sheet) return;
  // Open during the tap, before any asynchronous work, to retain popup permission.
  const preview = window.open("", "_blank");
  if (!preview) {
    window.print();
    return;
  }
  const doc = preview.document;
  doc.title = `${title} — Print recipe`;
  doc.documentElement.lang = "en";
  const viewport = doc.createElement("meta");
  viewport.name = "viewport";
  viewport.content = "width=816";
  doc.head.appendChild(viewport);
  // Reuse the exact paper styling instead of printing the mobile page layout.
  const printRules = [];
  for (const stylesheet of document.styleSheets) {
    try {
      for (const rule of stylesheet.cssRules) {
        if (rule.type === CSSRule.MEDIA_RULE && rule.conditionText === "print") {
          printRules.push(...Array.from(rule.cssRules, (child) => child.cssText));
        }
      }
    } catch {
      // Third-party stylesheets do not contain this site's recipe print styles.
    }
  }
  const style = doc.createElement("style");
  style.textContent = `${printRules.join("\n")}
    body { margin: 0; padding: 24px; background: white; color: #111; }
    .print-sheet { display: block !important; }
    .print-toolbar { font: 16px Arial, sans-serif; margin-bottom: 20px; padding: 16px; background: #fff5db; }
    .print-toolbar button { font: bold 18px Arial, sans-serif; padding: 12px 24px; cursor: pointer; }
    .print-toolbar p { margin-bottom: 0; }
    @media print { body { padding: 0; } .print-toolbar { display: none !important; } }
  `;
  doc.head.appendChild(style);
  const toolbar = doc.createElement("div");
  toolbar.className = "print-toolbar";
  const button = doc.createElement("button");
  button.textContent = "Print recipe";
  button.onclick = () => preview.print();
  toolbar.appendChild(button);
  const help = doc.createElement("p");
  help.textContent = "If the print dialog doesn't open, use your browser's Share or menu button, then Print. You can also save as PDF from the print options.";
  toolbar.appendChild(help);
  doc.body.append(toolbar, doc.importNode(sheet, true));
  preview.opener = null;
}
