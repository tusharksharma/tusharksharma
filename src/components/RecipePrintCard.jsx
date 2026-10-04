import { ingredientText, isGroupHeader } from "../utils/recipeModel";

function fact(model, key) {
  return model.facts.find((item) => item.key === key);
}

function ingredientColumns(model) {
  const groups = model.ingredientGroups.map((group) => ({
    title: group.title,
    items: group.items.map(ingredientText).filter(Boolean),
  }));
  for (const choice of model.kidIngredientChoices || []) {
    const items = (choice.extraIngredients || []).filter((item) => !isGroupHeader(item)).map(ingredientText).filter(Boolean);
    if (items.length) groups.push({ title: choice.label, items });
  }
  if (groups.length === 1 && groups[0].items.length > 5) {
    const middle = Math.ceil(groups[0].items.length / 2);
    return [
      [{ title: groups[0].title, items: groups[0].items.slice(0, middle) }],
      [{ title: `${groups[0].title} — continued`, items: groups[0].items.slice(middle) }],
    ];
  }
  const columns = [[], []];
  const weights = [0, 0];
  for (const group of groups) {
    const side = weights[0] <= weights[1] ? 0 : 1;
    columns[side].push(group);
    weights[side] += group.items.length + 2;
  }
  return columns;
}

function methodGroups(model) {
  return model.method.phases.flatMap((phase) => {
    if (phase.choices?.length) {
      return phase.choices.map((choice) => ({
        label: `${phase.label} · ${choice.label}`,
        steps: choice.steps.map((step, index) => ({ ...step, number: phase.startAt + index })),
      }));
    }
    return [{
      label: phase.label === "Method" ? null : phase.label,
      steps: phase.steps.map((step, index) => ({ ...step, number: phase.startAt + index })),
    }];
  }).filter((group) => group.steps.length);
}

function PrintStep({ step }) {
  const match = step.text.match(/^([^:]{2,45}):\s*(.*)$/);
  return (
    <li className="print-step">
      <span className="print-step-number">{step.number}.</span>
      <span>{match ? <><strong>{match[1]}.</strong> {match[2]}</> : step.text}</span>
    </li>
  );
}

function PrintBanner({ model, compact = false }) {
  return (
    <div className={`print-banner ${compact ? "print-banner-compact" : ""}`}>
      <div className="print-banner-top">
        <span>THE SPLIT PLATE / RECIPE</span>
        {compact && <span>METHOD + NOTES</span>}
      </div>
      <h1>{model.title}</h1>
      {!compact && (model.hook || model.description) && <p>{model.hook || model.description}</p>}
    </div>
  );
}

export default function RecipePrintCard({ model }) {
  const [left, right] = ingredientColumns(model);
  const time = fact(model, "time");
  const yieldFact = fact(model, "yield");
  const method = fact(model, "method");
  const protein = fact(model, "protein");
  const calories = fact(model, "calories");
  const serving = fact(model, "servingSize");
  const nutritionLine = [calories && `${calories.estimated ? "~" : ""}${calories.value} cal`, protein && `${protein.estimated ? "~" : ""}${protein.value} protein`].filter(Boolean).join(" | ");
  const hasStorage = model.storage && [model.storage.storage, model.storage.reheat, model.storage.lasts].some(Boolean);
  const hasNutrition = nutritionLine || model.nutrition.honesty;
  const otherKeys = model.keys.slice(1);
  const hasNotes = otherKeys.length > 0 || model.troubleshooting.length > 0;
  const safety = model.safety;

  return (
    <div className="print-sheet" aria-label={`Printable recipe: ${model.title}`}>
      <section className="print-page print-first-page">
        <PrintBanner model={model} />
        <div className="print-facts">
          <div><span>YIELD</span><strong>{yieldFact?.value || serving?.value || "See recipe"}</strong></div>
          <div><span>TOTAL TIME</span><strong>{time?.value || "See method"}</strong></div>
          <div><span>COOK METHOD</span><strong>{method?.value || "See method"}</strong></div>
          <div><span>EST. / SERVING</span><strong>{nutritionLine || "See nutrition notes"}</strong></div>
        </div>
        {model.keys[0] && (
          <div className="print-rule"><strong>KEY TO SUCCESS:</strong> {model.keys[0]}</div>
        )}
        <h2 className="print-section-title">Ingredients</h2>
        <div className="print-ingredients">
          {[left, right].map((column, side) => (
            <div key={side} className={`print-ingredient-column ${side === 0 ? "print-ingredient-left" : "print-ingredient-right"}`}>
              {column.map((group, index) => (
                <div key={`${group.title}-${index}`} className="print-ingredient-group">
                  <h3>{group.title}</h3>
                  <ul>{group.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul>
                </div>
              ))}
            </div>
          ))}
        </div>
        {(safety.allergens.length > 0 || safety.critical.length > 0) && (
          <p className="print-safety-line">
            {safety.allergens.length > 0 && <><strong>Allergens:</strong> {safety.allergens.join(", ")}. </>}
            {safety.critical.map((warning) => `${warning.label}${warning.detail ? `: ${warning.detail}` : ""}`).join(" ")}
          </p>
        )}
        <p className="print-source">thesplitplate.com{model.path}</p>
      </section>

      <section className="print-page print-method-page">
        <PrintBanner model={model} compact />
        {(model.method.splitPoint || model.makeThisWhen) && (
          <p className="print-method-intro">{model.method.splitPoint || model.makeThisWhen}</p>
        )}
        <h2 className="print-section-title">Method</h2>
        <div className="print-method-groups">
          {methodGroups(model).map((group, index) => (
            <div key={`${group.label}-${index}`} className="print-method-group">
              {group.label && <h3>{group.label}</h3>}
              <ol>{group.steps.map((step, stepIndex) => <PrintStep key={stepIndex} step={step} />)}</ol>
            </div>
          ))}
        </div>
        {model.split && (
          <div className="print-split-box">
            <h3>SPLIT PLATE SERVING</h3>
            <div>
              <p><strong>{model.split.adult.label}:</strong> {model.split.adult.note || "Serve the adult portion as described above."}</p>
              <p><strong>{model.split.kid.label}:</strong> {model.split.kid.note || "Serve the kid portion as described above."}</p>
            </div>
          </div>
        )}
        {hasNotes && (
          <div className="print-notes-grid">
            {otherKeys.length > 0 && (
              <div className="print-note-panel">
                <h3>Keys to success</h3>
                <ul>{otherKeys.map((key, index) => <li key={index}>{key}</li>)}</ul>
              </div>
            )}
            {model.troubleshooting.length > 0 && (
              <div className="print-note-panel">
                <h3>If something fails</h3>
                {model.troubleshooting.map((item, index) => (
                  <p key={index}><strong>{item.problem}:</strong> {item.fix}</p>
                ))}
              </div>
            )}
          </div>
        )}
        {(hasStorage || hasNutrition) && (
          <div className="print-bottom-grid">
            {hasStorage && (
              <div className="print-bottom-panel print-storage-panel">
                <h3>Storage and reheating</h3>
                {model.storage.storage && <p><strong>Store:</strong> {model.storage.storage}</p>}
                {model.storage.reheat && <p><strong>Reheat:</strong> {model.storage.reheat}</p>}
                {model.storage.lasts && <p><strong>Lasts:</strong> {model.storage.lasts}</p>}
              </div>
            )}
            {hasNutrition && (
              <div className="print-bottom-panel print-nutrition-panel">
                <h3>Estimated nutrition</h3>
                {nutritionLine && <p><strong>{nutritionLine}</strong>{serving && ` per ${serving.value}`}.</p>}
                {model.nutrition.honesty && <p>{model.nutrition.honesty}</p>}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
