const STORAGE_KEY = "print3d-calculator-history-v2";

const calculatorForm = document.getElementById("calculatorForm");
const clearFormButton = document.getElementById("clearFormButton");
const clearHistoryButton = document.getElementById("clearHistoryButton");
const historyList = document.getElementById("historyList");
const historyEmptyState = document.getElementById("historyEmptyState");
const emptyState = document.getElementById("emptyState");
const resultContent = document.getElementById("resultContent");
const salesGrid = document.getElementById("salesGrid");
const installButton = document.getElementById("installButton");
const installHint = document.getElementById("installHint");

const fields = {
  projectName: document.getElementById("projectName"),
  weight: document.getElementById("weight"),
  printTime: document.getElementById("printTime"),
  filamentPrice: document.getElementById("filamentPrice"),
  printerConsumption: document.getElementById("printerConsumption"),
  energyRate: document.getElementById("energyRate"),
  extraCosts: document.getElementById("extraCosts")
};

const output = {
  heroFilament: document.getElementById("heroFilament"),
  heroTotal: document.getElementById("heroTotal"),
  heroSale: document.getElementById("heroSale"),
  resultProjectName: document.getElementById("resultProjectName"),
  resultTime: document.getElementById("resultTime"),
  filamentCost: document.getElementById("filamentCost"),
  energyCost: document.getElementById("energyCost"),
  depreciationCost: document.getElementById("depreciationCost"),
  extraCostValue: document.getElementById("extraCostValue"),
  totalCost: document.getElementById("totalCost")
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

let deferredInstallPrompt = null;

function parseTimeToHours(value) {
  const normalized = value.trim();
  const match = normalized.match(/^(\d{1,3}):([0-5]\d)$/);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours + minutes / 60;
}

function formatHours(hours) {
  const totalMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${wholeHours}h ${String(minutes).padStart(2, "0")}min`;
}

function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0);
}

function calculateCosts(values) {
  const hours = parseTimeToHours(values.printTime);

  if (hours === null) {
    throw new Error("Informe o tempo de impressao no formato hh:mm.");
  }

  const weight = Number(values.weight);
  const filamentPrice = Number(values.filamentPrice);
  const consumption = Number(values.printerConsumption);
  const energyRate = Number(values.energyRate);
  const extraCosts = Number(values.extraCosts);

  const filamentCost = (filamentPrice / 1000) * weight;
  const energyCost = consumption * hours * energyRate;
  const depreciation = hours * 1.0;
  const totalCost = filamentCost + energyCost + depreciation + extraCosts;

  const suggestions = [2, 3, 4].map((multiplier) => {
    const salePrice = totalCost * multiplier;
    const profit = salePrice - totalCost;
    const margin = salePrice === 0 ? 0 : profit / salePrice;

    return {
      multiplier,
      salePrice,
      profit,
      margin
    };
  });

  return {
    projectName: values.projectName.trim(),
    weight,
    printTime: values.printTime,
    hours,
    filamentPrice,
    consumption,
    energyRate,
    extraCosts,
    filamentCost,
    energyCost,
    depreciation,
    totalCost,
    suggestions,
    createdAt: new Date().toISOString()
  };
}

function renderResult(result) {
  emptyState.classList.add("hidden");
  resultContent.classList.remove("hidden");

  output.heroFilament.textContent = formatCurrency(result.filamentCost);
  output.heroTotal.textContent = formatCurrency(result.totalCost);
  output.heroSale.textContent = formatCurrency(result.suggestions[1].salePrice);
  output.resultProjectName.textContent = result.projectName;
  output.resultTime.textContent = formatHours(result.hours);
  output.filamentCost.textContent = formatCurrency(result.filamentCost);
  output.energyCost.textContent = formatCurrency(result.energyCost);
  output.depreciationCost.textContent = formatCurrency(result.depreciation);
  output.extraCostValue.textContent = formatCurrency(result.extraCosts);
  output.totalCost.textContent = formatCurrency(result.totalCost);

  salesGrid.innerHTML = "";

  result.suggestions.forEach((suggestion) => {
    const card = document.createElement("article");
    card.className = "sale-card";
    card.innerHTML = `
      <span>Venda x${suggestion.multiplier}</span>
      <strong>${formatCurrency(suggestion.salePrice)}</strong>
      <div class="sale-meta">Lucro: <span class="profit">${formatCurrency(suggestion.profit)}</span></div>
      <div class="sale-meta">Margem: ${percentFormatter.format(suggestion.margin)}</div>
    `;
    salesGrid.appendChild(card);
  });
}

function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Erro ao ler historico:", error);
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function addToHistory(result) {
  const history = getHistory().filter((item) => item.createdAt !== result.createdAt);
  history.unshift(result);
  saveHistory(history.slice(0, 20));
  renderHistory();
}

function renderHistory() {
  const history = getHistory();
  historyList.innerHTML = "";

  if (history.length === 0) {
    historyEmptyState.classList.remove("hidden");
    return;
  }

  historyEmptyState.classList.add("hidden");

  history.forEach((item) => {
    const article = document.createElement("article");
    article.className = "history-item";
    article.innerHTML = `
      <div class="history-item-header">
        <div>
          <h3>${item.projectName}</h3>
          <p class="history-meta">${item.weight} g • ${formatHours(item.hours)}</p>
        </div>
        <time datetime="${item.createdAt}">${new Date(item.createdAt).toLocaleDateString("pt-BR")}</time>
      </div>
      <div class="history-stats">
        <div><span>Custo</span><strong>${formatCurrency(item.totalCost)}</strong></div>
        <div><span>Venda x3</span><strong>${formatCurrency(item.suggestions[1].salePrice)}</strong></div>
        <div><span>Lucro x3</span><strong>${formatCurrency(item.suggestions[1].profit)}</strong></div>
      </div>
    `;

    article.addEventListener("click", () => {
      fields.projectName.value = item.projectName;
      fields.weight.value = item.weight;
      fields.printTime.value = item.printTime;
      fields.filamentPrice.value = item.filamentPrice;
      fields.printerConsumption.value = item.consumption;
      fields.energyRate.value = item.energyRate;
      fields.extraCosts.value = item.extraCosts;
      renderResult(item);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    historyList.appendChild(article);
  });
}

function resetForm() {
  calculatorForm.reset();
  fields.printerConsumption.value = "0.12";
  fields.energyRate.value = "0.80";
  fields.extraCosts.value = "0";
  emptyState.classList.remove("hidden");
  resultContent.classList.add("hidden");
  output.heroFilament.textContent = formatCurrency(0);
  output.heroTotal.textContent = formatCurrency(0);
  output.heroSale.textContent = formatCurrency(0);
}

function setupInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.classList.remove("hidden");
    installHint.textContent = "Aplicativo pronto para instalacao.";
  });

  installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      return;
    }

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installButton.classList.add("hidden");
    installHint.textContent = "Se preferir, voce tambem pode instalar pelo menu do navegador.";
  });

  window.addEventListener("appinstalled", () => {
    installButton.classList.add("hidden");
    installHint.textContent = "Aplicativo instalado com sucesso.";
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("Falha ao registrar service worker:", error);
    });
  }
}

calculatorForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const values = {
    projectName: fields.projectName.value,
    weight: fields.weight.value,
    printTime: fields.printTime.value,
    filamentPrice: fields.filamentPrice.value,
    printerConsumption: fields.printerConsumption.value,
    energyRate: fields.energyRate.value,
    extraCosts: fields.extraCosts.value
  };

  try {
    const result = calculateCosts(values);
    renderResult(result);
    addToHistory(result);
  } catch (error) {
    window.alert(error.message);
  }
});

clearFormButton.addEventListener("click", resetForm);

clearHistoryButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  renderHistory();
});

fields.printTime.addEventListener("blur", () => {
  const hours = parseTimeToHours(fields.printTime.value);
  if (hours !== null) {
    const totalMinutes = Math.round(hours * 60);
    const wholeHours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    fields.printTime.value = `${String(wholeHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }
});

renderHistory();
setupInstallPrompt();
registerServiceWorker();
