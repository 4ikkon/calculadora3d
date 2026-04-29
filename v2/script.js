const BUDGET_STORAGE_KEY = "marinsmanager-budget-history";
const CLIENT_STORAGE_KEY = "marinsmanager-clients-history";
const PRODUCT_STORAGE_KEY = "marinsmanager-products-history";
const ORDER_STORAGE_KEY = "marinsmanager-orders-history";

const SECTION_CONFIG = {
  dashboard: { eyebrow: "Painel principal", title: "Início" },
  clients: { eyebrow: "Tela ativa", title: "Clientes" },
  budgets: { eyebrow: "Tela ativa", title: "Orçamentos" },
  products: { eyebrow: "Tela ativa", title: "Produtos" },
  orders: { eyebrow: "Tela ativa", title: "Pedidos" },
  production: { eyebrow: "Planejamento", title: "Produção" }
};

const STATUS_LABELS = {
  novo: "Novo",
  em_producao: "Em produção",
  aguardando: "Aguardando",
  entregue: "Entregue"
};

const URGENCY_LABELS = {
  normal: "Normal",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente"
};

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
const activeSectionTitle = document.getElementById("activeSectionTitle");
const activeSectionEyebrow = document.getElementById("activeSectionEyebrow");
const menuButtons = Array.from(document.querySelectorAll(".menu-button"));
const appViews = Array.from(document.querySelectorAll(".app-view"));
const sectionLinks = Array.from(document.querySelectorAll("[data-section-target]"));
const createOrderFromBudgetButton = document.getElementById("createOrderFromBudgetButton");
const downloadBudgetPdfButton = document.getElementById("downloadBudgetPdfButton");
const approveBudgetButton = document.getElementById("approveBudgetButton");
const budgetApprovalHint = document.getElementById("budgetApprovalHint");
const addBudgetItemButton = document.getElementById("addBudgetItemButton");
const budgetItemsList = document.getElementById("budgetItemsList");

const clientForm = document.getElementById("clientForm");
const clearClientFormButton = document.getElementById("clearClientFormButton");
const clearClientsButton = document.getElementById("clearClientsButton");
const clientsList = document.getElementById("clientsList");
const clientsEmptyState = document.getElementById("clientsEmptyState");
const saveClientButton = document.getElementById("saveClientButton");
const budgetClientId = document.getElementById("budgetClientId");

const productForm = document.getElementById("productForm");
const clearProductFormButton = document.getElementById("clearProductFormButton");
const clearProductsButton = document.getElementById("clearProductsButton");
const productsList = document.getElementById("productsList");
const productsEmptyState = document.getElementById("productsEmptyState");
const saveProductButton = document.getElementById("saveProductButton");

const orderForm = document.getElementById("orderForm");
const addOrderItemButton = document.getElementById("addOrderItemButton");
const clearOrderFormButton = document.getElementById("clearOrderFormButton");
const clearOrdersButton = document.getElementById("clearOrdersButton");
const orderItemsList = document.getElementById("orderItemsList");
const ordersList = document.getElementById("ordersList");
const ordersEmptyState = document.getElementById("ordersEmptyState");
const saveOrderButton = document.getElementById("saveOrderButton");
const linkedOrderBudgetId = document.getElementById("linkedOrderBudgetId");

const fields = {
  projectName: document.getElementById("projectName")
};

const clientFields = {
  name: document.getElementById("clientName"),
  phone: document.getElementById("clientPhone"),
  notes: document.getElementById("clientNotes")
};

const productFields = {
  name: document.getElementById("productName"),
  category: document.getElementById("productCategory"),
  basePrice: document.getElementById("productBasePrice"),
  description: document.getElementById("productDescription")
};

const orderFields = {
  linkedBudgetId: document.getElementById("linkedOrderBudgetId"),
  customerName: document.getElementById("customerName"),
  customerPhone: document.getElementById("customerPhone"),
  orderStatus: document.getElementById("orderStatus"),
  orderDueDate: document.getElementById("orderDueDate"),
  orderUrgency: document.getElementById("orderUrgency"),
  orderNotes: document.getElementById("orderNotes")
};

const output = {
  heroFilament: document.getElementById("heroFilament"),
  heroTotal: document.getElementById("heroTotal"),
  heroSale: document.getElementById("heroSale"),
  resultProjectName: document.getElementById("resultProjectName"),
  resultTime: document.getElementById("resultTime"),
  resultClientName: document.getElementById("resultClientName"),
  budgetResultItemsList: document.getElementById("budgetResultItemsList"),
  filamentCost: document.getElementById("filamentCost"),
  energyCost: document.getElementById("energyCost"),
  depreciationCost: document.getElementById("depreciationCost"),
  extraCostValue: document.getElementById("extraCostValue"),
  totalCost: document.getElementById("totalCost"),
  customSaleCard: document.getElementById("customSaleCard"),
  customSaleValue: document.getElementById("customSaleValue"),
  customSaleProfit: document.getElementById("customSaleProfit"),
  customSaleMargin: document.getElementById("customSaleMargin"),
  dashboardClients: document.getElementById("dashboardClients"),
  dashboardProjects: document.getElementById("dashboardProjects"),
  dashboardProducts: document.getElementById("dashboardProducts"),
  dashboardOrders: document.getElementById("dashboardOrders"),
  dashboardOrdersRevenue: document.getElementById("dashboardOrdersRevenue"),
  clientsMetricCount: document.getElementById("clientsMetricCount"),
  clientsMetricLatest: document.getElementById("clientsMetricLatest"),
  clientsMetricPhones: document.getElementById("clientsMetricPhones"),
  productsMetricCount: document.getElementById("productsMetricCount"),
  productsMetricLatest: document.getElementById("productsMetricLatest"),
  productsMetricAverage: document.getElementById("productsMetricAverage"),
  orderTotal: document.getElementById("orderTotal"),
  orderItemsCount: document.getElementById("orderItemsCount"),
  orderLinkedBudgetName: document.getElementById("orderLinkedBudgetName"),
  orderCurrentStatus: document.getElementById("orderCurrentStatus"),
  orderCurrentDueDate: document.getElementById("orderCurrentDueDate"),
  orderCurrentUrgency: document.getElementById("orderCurrentUrgency"),
  orderSummaryTotal: document.getElementById("orderSummaryTotal"),
  ordersMetricCount: document.getElementById("ordersMetricCount"),
  ordersMetricRevenue: document.getElementById("ordersMetricRevenue"),
  ordersMetricLatest: document.getElementById("ordersMetricLatest")
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
let currentBudgetResult = null;
let editingClientId = null;
let editingProductId = null;
let editingOrderId = null;

function normalizeText(value) {
  return value.trim().toLocaleLowerCase("pt-BR");
}

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0);
}

function formatHours(hours) {
  const totalMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${wholeHours}h ${String(minutes).padStart(2, "0")}min`;
}

function maskTimeInput(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function maskPhoneInput(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length === 0) {
    return "";
  }

  if (digits.length < 3) {
    return `(${digits}`;
  }

  const ddd = digits.slice(0, 2);
  const number = digits.slice(2);

  if (number.length <= 4) {
    return `(${ddd}) ${number}`;
  }

  if (number.length <= 8) {
    return `(${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`;
  }

  return `(${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`;
}

function isValidPhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}

function formatDateForDisplay(value) {
  if (!value) {
    return "Não definida";
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return "Não definida";
  }

  return `${day}/${month}/${year}`;
}

async function fetchAssetAsDataUrl(path) {
  const response = await fetch(path);
  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function ensurePdfPage(doc, cursorY, neededHeight = 14) {
  if (cursorY + neededHeight <= 280) {
    return cursorY;
  }

  doc.addPage();
  return 20;
}

async function generateBudgetPdf(budget) {
  const jsPdfApi = window.jspdf?.jsPDF;
  if (!jsPdfApi) {
    throw new Error("A biblioteca de PDF não foi carregada corretamente.");
  }

  const doc = new jsPdfApi({ unit: "mm", format: "a4" });
  const logoDataUrl = await fetchAssetAsDataUrl("./assets/logo-pdf.png");
  let cursorY = 18;

  doc.addImage(logoDataUrl, "PNG", 14, 10, 24, 24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Marins Maker", 44, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Orçamento de impressão 3D", 44, 24);
  doc.text(`Emitido em ${new Date().toLocaleDateString("pt-BR")}`, 44, 29);

  cursorY = 42;
  doc.setDrawColor(210, 220, 235);
  doc.line(14, cursorY, 196, cursorY);
  cursorY += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Dados do orçamento", 14, cursorY);
  cursorY += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Projeto: ${budget.projectName}`, 14, cursorY);
  cursorY += 6;
  doc.text(`Cliente: ${budget.clientName || "Não informado"}`, 14, cursorY);
  cursorY += 6;
  doc.text(`Status: ${budget.isApproved ? "Aprovado" : "Pendente de aprovação"}`, 14, cursorY);
  cursorY += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Produtos calculados", 14, cursorY);
  cursorY += 8;

  budget.items.forEach((item, index) => {
    cursorY = ensurePdfPage(doc, cursorY, 48);
    doc.setFillColor(240, 245, 252);
    doc.roundedRect(14, cursorY - 5, 182, 37, 3, 3, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${index + 1}. ${item.productName}`, 18, cursorY + 1);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(`Quantidade: ${item.quantity} | Peso: ${item.weight} g | Tempo: ${item.printTime}`, 18, cursorY + 7);
    doc.text(`Filamento/kg: ${formatCurrency(item.filamentPrice)} | Consumo: ${item.printerConsumption} kWh | Energia: ${formatCurrency(item.energyRate)}`, 18, cursorY + 13);
    doc.text(`Custo do filamento: ${formatCurrency(item.filamentCost)} | Energia: ${formatCurrency(item.energyCost)} | Depreciação: ${formatCurrency(item.depreciation)}`, 18, cursorY + 19);
    doc.text(`Custos extras: ${formatCurrency(item.extraCosts)} | Custo total: ${formatCurrency(item.totalCost)}`, 18, cursorY + 25);
    doc.text(`Venda x2: ${formatCurrency(item.priceOptions.x2.totalPrice)} | x3: ${formatCurrency(item.priceOptions.x3.totalPrice)} | x4: ${formatCurrency(item.priceOptions.x4.totalPrice)}`, 18, cursorY + 31);
    if (item.customSale) {
      doc.text(`Venda personalizada: ${formatCurrency(item.customSale.totalPrice)} | Lucro: ${formatCurrency(item.customSale.profit)} | Margem: ${percentFormatter.format(item.customSale.margin)}`, 18, cursorY + 37);
      cursorY += 44;
    } else {
      cursorY += 38;
    }
    doc.setTextColor(0, 0, 0);
  });

  cursorY = ensurePdfPage(doc, cursorY, 38);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Resumo consolidado", 14, cursorY);
  cursorY += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Filamento total: ${formatCurrency(budget.filamentCost)}`, 14, cursorY);
  cursorY += 6;
  doc.text(`Energia total: ${formatCurrency(budget.energyCost)}`, 14, cursorY);
  cursorY += 6;
  doc.text(`Depreciação total: ${formatCurrency(budget.depreciation)}`, 14, cursorY);
  cursorY += 6;
  doc.text(`Custos extras totais: ${formatCurrency(budget.extraCosts)}`, 14, cursorY);
  cursorY += 6;
  doc.text(`Custo total do orçamento: ${formatCurrency(budget.totalCost)}`, 14, cursorY);
  cursorY += 8;
  doc.text(`Venda sugerida x2: ${formatCurrency(budget.suggestions[0].salePrice)}`, 14, cursorY);
  cursorY += 6;
  doc.text(`Venda sugerida x3: ${formatCurrency(budget.suggestions[1].salePrice)}`, 14, cursorY);
  cursorY += 6;
  doc.text(`Venda sugerida x4: ${formatCurrency(budget.suggestions[2].salePrice)}`, 14, cursorY);
  if (budget.customSale) {
    cursorY += 6;
    doc.text(`Venda personalizada total: ${formatCurrency(budget.customSale.salePrice)} | Lucro: ${formatCurrency(budget.customSale.profit)} | Margem: ${percentFormatter.format(budget.customSale.margin)}`, 14, cursorY);
  }

  const safeProjectName = budget.projectName.replace(/[\\/:*?"<>|]/g, "-");
  doc.save(`orcamento-${safeProjectName}.pdf`);
}

function parseTimeToHours(value) {
  const normalized = value.trim();
  const match = normalized.match(/^(\d{1,3}):([0-5]\d)$/);
  if (!match) {
    return null;
  }
  return Number(match[1]) + Number(match[2]) / 60;
}

function readStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error(`Erro ao ler dados de ${key}:`, error);
    return [];
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getClients() {
  return readStorage(CLIENT_STORAGE_KEY);
}

function saveClients(clients) {
  writeStorage(CLIENT_STORAGE_KEY, clients);
}

function getBudgetHistory() {
  return readStorage(BUDGET_STORAGE_KEY);
}

function saveBudgetHistory(history) {
  writeStorage(BUDGET_STORAGE_KEY, history);
}

function getProducts() {
  return readStorage(PRODUCT_STORAGE_KEY);
}

function saveProducts(products) {
  writeStorage(PRODUCT_STORAGE_KEY, products);
}

function getOrders() {
  return readStorage(ORDER_STORAGE_KEY);
}

function saveOrders(orders) {
  writeStorage(ORDER_STORAGE_KEY, orders);
}

function getClientById(id) {
  return getClients().find((client) => client.id === id) || null;
}

function getBudgetById(id) {
  return getBudgetHistory().find((budget) => budget.id === id) || null;
}

function getProductById(id) {
  return getProducts().find((product) => product.id === id) || null;
}

function syncOrderCustomerFromBudget(budgetId, force = false) {
  const budget = getBudgetById(budgetId);
  if (!budget || !budget.clientName) {
    return;
  }

  if (force || !orderFields.customerName.value.trim()) {
    orderFields.customerName.value = budget.clientName;
  }

  const client = budget.clientId ? getClientById(budget.clientId) : null;
  if (client && (force || !orderFields.customerPhone.value.trim())) {
    orderFields.customerPhone.value = client.phone;
  }
}

function getBudgetPriceOptions(budget) {
  if (!budget) {
    return [];
  }

  const options = [
    { value: "x2", label: `Venda x2 • ${formatCurrency(budget.suggestions[0].salePrice)}`, price: budget.suggestions[0].salePrice },
    { value: "x3", label: `Venda x3 • ${formatCurrency(budget.suggestions[1].salePrice)}`, price: budget.suggestions[1].salePrice },
    { value: "x4", label: `Venda x4 • ${formatCurrency(budget.suggestions[2].salePrice)}`, price: budget.suggestions[2].salePrice }
  ];

  if (budget.customSale) {
    options.push({
      value: "custom",
      label: `Venda personalizada • ${formatCurrency(budget.customSale.salePrice)}`,
      price: budget.customSale.salePrice
    });
  }

  return options;
}

function getBudgetItemPriceOptionMap(item) {
  return item?.priceOptions || {};
}

function getBudgetItemUnitPrice(item, mode) {
  if (!item || !mode) {
    return 0;
  }

  return Number(getBudgetItemPriceOptionMap(item)[mode]?.unitPrice || 0);
}

function getBudgetItemPriceSelectOptions(item) {
  const priceOptions = getBudgetItemPriceOptionMap(item);
  const orderedModes = ["x2", "x3", "x4", "custom"];

  return orderedModes
    .filter((mode) => priceOptions[mode])
    .map((mode) => ({
      value: mode,
      label: `${priceOptions[mode].label} • ${formatCurrency(priceOptions[mode].unitPrice)}`
    }));
}

function getApprovedBudgets() {
  return getBudgetHistory().filter((budget) => budget.isApproved);
}

function findBudgetItemById(budget, itemId) {
  return budget?.items?.find((item) => item.id === itemId) || null;
}

function findBudgetItemByProductId(budget, productId) {
  return budget?.items?.find((item) => item.productId === productId) || null;
}

function formatBudgetStatusLabel(isApproved) {
  return isApproved ? "Aprovado" : "Pendente";
}

function formatBudgetStatusClass(isApproved) {
  return isApproved ? "status-entregue" : "status-aguardando";
}

function populateClientsSelect(selectedId = "") {
  const clients = getClients();
  budgetClientId.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = clients.length === 0 ? "Cadastre clientes primeiro" : "Selecione um cliente";
  budgetClientId.appendChild(placeholder);

  clients.forEach((client) => {
    const option = document.createElement("option");
    option.value = client.id;
    option.textContent = `${client.name} • ${client.phone}`;
    budgetClientId.appendChild(option);
  });

  budgetClientId.value = selectedId;
}

function populateProductSelect(selectElement, selectedId = "") {
  const products = getProducts();
  selectElement.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = products.length === 0 ? "Cadastre produtos primeiro" : "Selecione um produto";
  selectElement.appendChild(placeholder);

  products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = `${product.name} • ${formatCurrency(product.basePrice)}`;
    selectElement.appendChild(option);
  });

  selectElement.value = selectedId;
}

function populateOrderBudgetSelect(selectedId = "") {
  const budgets = getApprovedBudgets();
  linkedOrderBudgetId.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = budgets.length === 0 ? "Nenhum orçamento aprovado disponível" : "Pedido avulso (sem orçamento)";
  linkedOrderBudgetId.appendChild(placeholder);

  budgets.forEach((budget) => {
    const option = document.createElement("option");
    option.value = budget.id;
    option.textContent = `${budget.projectName} • ${budget.clientName || "Sem cliente"} • ${formatCurrency(budget.suggestions[1].salePrice)}`;
    linkedOrderBudgetId.appendChild(option);
  });

  linkedOrderBudgetId.value = selectedId;
}

function populateOrderItemPriceSelect(selectElement, budgetId, budgetItemId, selectedMode = "", fallbackPrice = 0) {
  selectElement.innerHTML = "";
  const budget = budgetId ? getBudgetById(budgetId) : null;
  const budgetItem = budget ? findBudgetItemById(budget, budgetItemId) : null;

  const manualOption = document.createElement("option");
  manualOption.value = "";
  manualOption.textContent = budgetItem ? "Preço manual ou do produto" : "Sem preço do orçamento";
  selectElement.appendChild(manualOption);

  if (budgetItem) {
    getBudgetItemPriceSelectOptions(budgetItem).forEach((priceOption) => {
      const option = document.createElement("option");
      option.value = priceOption.value;
      option.textContent = priceOption.label;
      selectElement.appendChild(option);
    });
  }

  selectElement.value = selectedMode;

  if (!budgetItem || !selectedMode) {
    return fallbackPrice;
  }

  return getBudgetItemUnitPrice(budgetItem, selectedMode) || fallbackPrice;
}

function calculateBudgetItem(item, index) {
  const product = item.productId ? getProductById(item.productId) : null;
  if (!product) {
    throw new Error(`Selecione um produto cadastrado no item ${index + 1} do orçamento.`);
  }

  const quantity = Number(item.quantity) || 0;
  if (quantity <= 0) {
    throw new Error(`Informe uma quantidade válida no item ${index + 1} do orçamento.`);
  }

  const hours = parseTimeToHours(item.printTime || "");
  if (hours === null) {
    throw new Error(`Informe o tempo de impressão do item ${index + 1} no formato hh:mm.`);
  }

  const weight = Number(item.weight) || 0;
  const filamentPrice = Number(item.filamentPrice) || 0;
  const consumption = Number(item.printerConsumption) || 0;
  const energyRate = Number(item.energyRate) || 0;
  const extraCosts = Number(item.extraCosts) || 0;
  const customSalePrice = Number(item.customSalePrice) || 0;

  const filamentCost = (filamentPrice / 1000) * weight;
  const energyCost = consumption * hours * energyRate;
  const depreciation = hours * 1.0;
  const totalCost = filamentCost + energyCost + depreciation + extraCosts;

  const suggestions = [2, 3, 4].map((multiplier) => {
    const totalPrice = totalCost * multiplier;
    const profit = totalPrice - totalCost;
    const margin = totalPrice === 0 ? 0 : profit / totalPrice;
    return {
      multiplier,
      totalPrice,
      unitPrice: quantity > 0 ? totalPrice / quantity : 0,
      profit,
      margin
    };
  });

  const customSale = customSalePrice > 0
    ? {
        totalPrice: customSalePrice,
        unitPrice: quantity > 0 ? customSalePrice / quantity : 0,
        profit: customSalePrice - totalCost,
        margin: customSalePrice === 0 ? 0 : (customSalePrice - totalCost) / customSalePrice
      }
    : null;

  const priceOptions = {
    x2: {
      label: "Venda x2",
      totalPrice: suggestions[0].totalPrice,
      unitPrice: suggestions[0].unitPrice
    },
    x3: {
      label: "Venda x3",
      totalPrice: suggestions[1].totalPrice,
      unitPrice: suggestions[1].unitPrice
    },
    x4: {
      label: "Venda x4",
      totalPrice: suggestions[2].totalPrice,
      unitPrice: suggestions[2].unitPrice
    }
  };

  if (customSale) {
    priceOptions.custom = {
      label: "Venda personalizada",
      totalPrice: customSale.totalPrice,
      unitPrice: customSale.unitPrice
    };
  }

  return {
    id: item.id || generateId("budget-item"),
    productId: product.id,
    productName: product.name,
    quantity,
    weight,
    printTime: item.printTime,
    hours,
    filamentPrice,
    printerConsumption: consumption,
    energyRate,
    extraCosts,
    filamentCost,
    energyCost,
    depreciation,
    totalCost,
    suggestions,
    customSale,
    priceOptions
  };
}

function calculateCosts(values) {
  const client = values.clientId ? getClientById(values.clientId) : null;
  const items = (values.items || []).map((item, index) => calculateBudgetItem(item, index));

  if (items.length === 0) {
    throw new Error("Adicione pelo menos um produto ao orçamento.");
  }

  const totals = items.reduce((accumulator, item) => {
    accumulator.filamentCost += item.filamentCost;
    accumulator.energyCost += item.energyCost;
    accumulator.depreciation += item.depreciation;
    accumulator.extraCosts += item.extraCosts;
    accumulator.totalCost += item.totalCost;
    accumulator.hours += item.hours;
    return accumulator;
  }, {
    filamentCost: 0,
    energyCost: 0,
    depreciation: 0,
    extraCosts: 0,
    totalCost: 0,
    hours: 0
  });

  const suggestions = [2, 3, 4].map((multiplier) => {
    const salePrice = items.reduce((sum, item) => {
      const suggestion = item.suggestions.find((entry) => entry.multiplier === multiplier);
      return sum + (suggestion ? suggestion.totalPrice : 0);
    }, 0);
    const profit = salePrice - totals.totalCost;
    const margin = salePrice === 0 ? 0 : profit / salePrice;
    return { multiplier, salePrice, profit, margin };
  });

  const hasCustomSale = items.some((item) => item.customSale);
  const customSaleTotal = items.reduce((sum, item) => sum + (item.customSale ? item.customSale.totalPrice : 0), 0);
  const customSale = hasCustomSale
    ? {
        salePrice: customSaleTotal,
        profit: customSaleTotal - totals.totalCost,
        margin: customSaleTotal === 0 ? 0 : (customSaleTotal - totals.totalCost) / customSaleTotal
      }
    : null;

  return {
    id: generateId("budget"),
    clientId: client ? client.id : null,
    clientName: client ? client.name : "",
    projectName: values.projectName.trim(),
    printTime: items.length === 1 ? items[0].printTime : "",
    hours: totals.hours,
    filamentCost: totals.filamentCost,
    energyCost: totals.energyCost,
    depreciation: totals.depreciation,
    extraCosts: totals.extraCosts,
    totalCost: totals.totalCost,
    suggestions,
    customSale,
    items,
    isApproved: false,
    createdAt: new Date().toISOString()
  };
}

function renderResult(result) {
  currentBudgetResult = result;
  emptyState.classList.add("hidden");
  resultContent.classList.remove("hidden");

  output.heroFilament.textContent = formatCurrency(result.filamentCost);
  output.heroTotal.textContent = formatCurrency(result.totalCost);
  output.heroSale.textContent = formatCurrency(result.suggestions[1].salePrice);
  output.resultProjectName.textContent = result.projectName;
  output.resultTime.textContent = formatHours(result.hours);
  output.resultClientName.textContent = result.clientName || "Cliente não selecionado";
  output.budgetResultItemsList.innerHTML = "";
  output.filamentCost.textContent = formatCurrency(result.filamentCost);
  output.energyCost.textContent = formatCurrency(result.energyCost);
  output.depreciationCost.textContent = formatCurrency(result.depreciation);
  output.extraCostValue.textContent = formatCurrency(result.extraCosts);
  output.totalCost.textContent = formatCurrency(result.totalCost);

  result.items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "helper-item";
    card.innerHTML = `
      <strong>${item.productName}</strong>
      <p>${item.quantity} unidade(s) • ${item.weight} g • ${formatHours(item.hours)}</p>
      <p>Custo: ${formatCurrency(item.totalCost)} • Venda x3: ${formatCurrency(item.priceOptions.x3.totalPrice)}</p>
    `;
    output.budgetResultItemsList.appendChild(card);
  });

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

  if (result.customSale) {
    output.customSaleCard.classList.remove("hidden");
    output.customSaleValue.textContent = formatCurrency(result.customSale.salePrice);
    output.customSaleProfit.textContent = formatCurrency(result.customSale.profit);
    output.customSaleMargin.textContent = percentFormatter.format(result.customSale.margin);
  } else {
    output.customSaleCard.classList.add("hidden");
  }

  approveBudgetButton.textContent = result.isApproved
    ? "Orçamento aprovado pelo cliente"
    : "Cliente aceitou este orçamento";
  budgetApprovalHint.textContent = result.isApproved
    ? "Esse orçamento já está liberado para aparecer na tela de pedidos."
    : "Aprove o orçamento para liberá-lo na tela de pedidos.";
  createOrderFromBudgetButton.classList.toggle("hidden", !result.isApproved);
}

function renderBudgetHistory() {
  const history = getBudgetHistory();
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
          <p class="history-meta">${item.clientName || "Sem cliente"} • ${item.items?.length || 0} produto(s) • ${formatHours(item.hours)}</p>
        </div>
        <span class="status-badge ${formatBudgetStatusClass(item.isApproved)}">${formatBudgetStatusLabel(item.isApproved)}</span>
        <time datetime="${item.updatedAt || item.createdAt}">${new Date(item.updatedAt || item.createdAt).toLocaleDateString("pt-BR")}</time>
      </div>
      <div class="history-stats">
        <div><span>Custo</span><strong>${formatCurrency(item.totalCost)}</strong></div>
        <div><span>Venda x3</span><strong>${formatCurrency(item.suggestions[1].salePrice)}</strong></div>
        <div><span>Personalizada</span><strong>${item.customSale ? formatCurrency(item.customSale.salePrice) : "—"}</strong></div>
      </div>
    `;

    article.addEventListener("click", () => {
      populateClientsSelect(item.clientId || "");
      fields.projectName.value = item.projectName;
      loadBudgetItemsIntoForm(item.items || []);
      renderResult(item);
      activateSection("budgets");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    historyList.appendChild(article);
  });
}

function addToBudgetHistory(result) {
  const currentHistory = getBudgetHistory();
  const normalizedName = normalizeText(result.projectName);
  const previousEntry = currentHistory.find((item) => normalizeText(item.projectName) === normalizedName);
  const history = currentHistory.filter((item) => normalizeText(item.projectName) !== normalizedName);

  const savedEntry = {
    ...result,
    id: previousEntry?.id || result.id,
    isApproved: previousEntry?.isApproved || false,
    createdAt: previousEntry ? previousEntry.createdAt : result.createdAt,
    updatedAt: new Date().toISOString()
  };

  history.unshift(savedEntry);
  saveBudgetHistory(history.slice(0, 20));
  renderBudgetHistory();
  populateOrderBudgetSelect(orderFields.linkedBudgetId.value);
  updateDashboard();
  return savedEntry;
}

function collectClientData() {
  const name = clientFields.name.value.trim();
  const phone = clientFields.phone.value.trim();

  if (!name || !phone) {
    throw new Error("Preencha nome e telefone do cliente.");
  }

  if (!isValidPhone(phone)) {
    throw new Error("Informe um telefone com DDD e 8 ou 9 dígitos.");
  }

  return {
    id: editingClientId || generateId("client"),
    name,
    phone,
    notes: clientFields.notes.value.trim(),
    createdAt: new Date().toISOString()
  };
}

function saveClient(clientData) {
  const existingClients = getClients();
  const previousClient = existingClients.find((client) => client.id === clientData.id);
  const nextClients = existingClients.filter((client) => client.id !== clientData.id);

  nextClients.unshift({
    ...clientData,
    createdAt: previousClient ? previousClient.createdAt : clientData.createdAt,
    updatedAt: new Date().toISOString()
  });

  saveClients(nextClients.slice(0, 100));
  renderClients();
  populateClientsSelect();
  updateDashboard();
}

function renderClients() {
  const clients = getClients();
  clientsList.innerHTML = "";

  if (clients.length === 0) {
    clientsEmptyState.classList.remove("hidden");
    updateDashboard();
    return;
  }

  clientsEmptyState.classList.add("hidden");

  clients.forEach((client) => {
    const card = document.createElement("article");
    card.className = "order-card";
    card.innerHTML = `
      <div class="order-card-header">
        <div>
          <h4>${client.name}</h4>
          <div class="order-card-meta">
            <span>${client.phone}</span>
            <span>${client.notes || "Sem observação"}</span>
          </div>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      editingClientId = client.id;
      clientFields.name.value = client.name;
      clientFields.phone.value = client.phone;
      clientFields.notes.value = client.notes || "";
      saveClientButton.textContent = "Atualizar cliente";
      activateSection("clients");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    clientsList.appendChild(card);
  });

  updateDashboard();
}

function resetClientForm() {
  editingClientId = null;
  clientForm.reset();
  saveClientButton.textContent = "Salvar cliente";
}

function collectProductData() {
  const name = productFields.name.value.trim();
  if (!name) {
    throw new Error("Informe o nome do produto.");
  }

  return {
    id: editingProductId || generateId("product"),
    name,
    category: productFields.category.value.trim(),
    basePrice: Number(productFields.basePrice.value) || 0,
    description: productFields.description.value.trim(),
    createdAt: new Date().toISOString()
  };
}

function saveProduct(productData) {
  const existingProducts = getProducts();
  const previousProduct = existingProducts.find((product) => product.id === productData.id);
  const nextProducts = existingProducts.filter((product) => product.id !== productData.id);

  nextProducts.unshift({
    ...productData,
    createdAt: previousProduct ? previousProduct.createdAt : productData.createdAt,
    updatedAt: new Date().toISOString()
  });

  saveProducts(nextProducts.slice(0, 100));
  renderProducts();
  refreshProductOptionsForOrderItems();
  updateDashboard();
}

function renderProducts() {
  const products = getProducts();
  productsList.innerHTML = "";

  if (products.length === 0) {
    productsEmptyState.classList.remove("hidden");
    updateDashboard();
    return;
  }

  productsEmptyState.classList.add("hidden");

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "order-card";
    card.innerHTML = `
      <div class="order-card-header">
        <div>
          <h4>${product.name}</h4>
          <div class="order-card-meta">
            <span>${product.category || "Sem categoria"}</span>
            <span>${product.description || "Sem descrição"}</span>
          </div>
        </div>
      </div>
      <div class="order-card-total">
        <span>Preço base</span>
        <strong>${formatCurrency(product.basePrice)}</strong>
      </div>
    `;

    card.addEventListener("click", () => {
      editingProductId = product.id;
      productFields.name.value = product.name;
      productFields.category.value = product.category || "";
      productFields.basePrice.value = product.basePrice ?? 0;
      productFields.description.value = product.description || "";
      saveProductButton.textContent = "Atualizar produto";
      activateSection("products");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    productsList.appendChild(card);
  });

  updateDashboard();
}

function resetProductForm() {
  editingProductId = null;
  productForm.reset();
  productFields.basePrice.value = "0";
  saveProductButton.textContent = "Salvar produto";
}

function createBudgetItemElement(item = {}) {
  const row = document.createElement("article");
  row.className = "order-item-row";
  row.dataset.itemId = item.id || "";
  row.innerHTML = `
    <div class="order-item-header">
      <h4>Produto do orçamento</h4>
      <button type="button" class="ghost-button remove-budget-item-button">Remover</button>
    </div>
    <div class="order-item-grid">
      <label>
        <span>Produto cadastrado</span>
        <select class="budget-product-select"></select>
      </label>
      <label>
        <span>Quantidade</span>
        <input type="number" class="budget-product-quantity" min="1" step="1" value="1" required>
      </label>
      <label>
        <span>Peso em gramas</span>
        <input type="number" class="budget-product-weight" min="0" step="0.01" placeholder="0,00" required>
      </label>
      <label>
        <span>Tempo de impressão (somente horas e minutos - hh:mm)</span>
        <input type="text" class="budget-product-time" inputmode="numeric" maxlength="5" placeholder="03:30" required>
      </label>
      <label>
        <span>Preço do kg do filamento</span>
        <input type="number" class="budget-product-filament-price" min="0" step="0.01" placeholder="0,00" required>
      </label>
      <label>
        <span>Custos extras</span>
        <input type="number" class="budget-product-extra-costs" min="0" step="0.01" value="0">
      </label>
      <label>
        <span>Consumo da impressora (kWh)</span>
        <input type="number" class="budget-product-consumption" min="0" step="0.01" value="0.12">
      </label>
      <label>
        <span>Tarifa de energia</span>
        <input type="number" class="budget-product-energy-rate" min="0" step="0.01" value="0.80">
      </label>
      <label>
        <span>Venda personalizada do produto (opcional)</span>
        <input type="number" class="budget-product-custom-sale" min="0" step="0.01" placeholder="0,00">
      </label>
    </div>
  `;

  const productSelect = row.querySelector(".budget-product-select");
  const quantityInput = row.querySelector(".budget-product-quantity");
  const weightInput = row.querySelector(".budget-product-weight");
  const timeInput = row.querySelector(".budget-product-time");
  const filamentPriceInput = row.querySelector(".budget-product-filament-price");
  const extraCostsInput = row.querySelector(".budget-product-extra-costs");
  const consumptionInput = row.querySelector(".budget-product-consumption");
  const energyRateInput = row.querySelector(".budget-product-energy-rate");
  const customSaleInput = row.querySelector(".budget-product-custom-sale");
  populateProductSelect(productSelect, item.productId || "");
  quantityInput.value = item.quantity || 1;
  weightInput.value = item.weight ?? "";
  timeInput.value = item.printTime || "";
  filamentPriceInput.value = item.filamentPrice ?? "";
  extraCostsInput.value = item.extraCosts ?? 0;
  consumptionInput.value = item.printerConsumption ?? 0.12;
  energyRateInput.value = item.energyRate ?? 0.80;
  customSaleInput.value = item.customSale?.totalPrice ?? item.customSalePrice ?? "";

  timeInput.addEventListener("input", () => {
    timeInput.value = maskTimeInput(timeInput.value);
  });

  timeInput.addEventListener("blur", () => {
    const hours = parseTimeToHours(timeInput.value);
    if (hours !== null) {
      const totalMinutes = Math.round(hours * 60);
      const wholeHours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      timeInput.value = `${String(wholeHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
  });

  row.querySelector(".remove-budget-item-button").addEventListener("click", () => {
    row.remove();
    if (budgetItemsList.children.length === 0) {
      addBudgetItem();
    }
  });

  return row;
}

function addBudgetItem(item = {}) {
  budgetItemsList.appendChild(createBudgetItemElement(item));
}

function loadBudgetItemsIntoForm(items = []) {
  budgetItemsList.innerHTML = "";
  if (items.length > 0) {
    items.forEach((item) => addBudgetItem(item));
    return;
  }
  addBudgetItem();
}

function refreshProductOptionsForBudgetItems() {
  Array.from(budgetItemsList.querySelectorAll(".budget-product-select")).forEach((selectElement) => {
    populateProductSelect(selectElement, selectElement.value);
  });
}

function getBudgetItemsFromForm() {
  return Array.from(budgetItemsList.querySelectorAll(".order-item-row"))
    .map((row) => {
      const productId = row.querySelector(".budget-product-select").value || null;
      const quantity = Number(row.querySelector(".budget-product-quantity").value) || 0;
      const weight = Number(row.querySelector(".budget-product-weight").value) || 0;
      const printTime = row.querySelector(".budget-product-time").value.trim();
      const filamentPrice = Number(row.querySelector(".budget-product-filament-price").value) || 0;
      const extraCosts = Number(row.querySelector(".budget-product-extra-costs").value) || 0;
      const printerConsumption = Number(row.querySelector(".budget-product-consumption").value) || 0.12;
      const energyRate = Number(row.querySelector(".budget-product-energy-rate").value) || 0.80;
      const customSalePrice = Number(row.querySelector(".budget-product-custom-sale").value) || 0;
      const product = productId ? getProductById(productId) : null;

      return {
        id: row.dataset.itemId || generateId("budget-item"),
        productId,
        productName: product ? product.name : "",
        quantity,
        weight,
        printTime,
        filamentPrice,
        extraCosts,
        printerConsumption,
        energyRate,
        customSalePrice
      };
    })
    .filter((item) => item.productId);
}

function updateOrderItemSubtotal(row) {
  const quantity = Number(row.querySelector(".order-product-quantity").value) || 0;
  const unitPrice = Number(row.querySelector(".order-product-price").value) || 0;
  row.querySelector(".order-item-subtotal").textContent = formatCurrency(quantity * unitPrice);
}

function updateOrderItemBudgetNote(row, budgetId, budgetItemId) {
  const note = row.querySelector(".budget-link-note");
  const budget = budgetId ? getBudgetById(budgetId) : null;
  const budgetItem = budget ? findBudgetItemById(budget, budgetItemId) : null;

  if (!budget) {
    note.textContent = "Pedido avulso, sem orçamento vinculado.";
    return;
  }

  if (!budgetItem) {
    note.textContent = `Orçamento "${budget.projectName}" vinculado, mas este item está livre para ajuste manual.`;
    return;
  }

  note.textContent = `Produto vindo do orçamento "${budget.projectName}" com ${budgetItem.quantity} unidade(s) previstas.`;
}

function syncOrderItemPricing(row) {
  const productSelect = row.querySelector(".order-product-select");
  const priceSelect = row.querySelector(".order-budget-price-select");
  const priceInput = row.querySelector(".order-product-price");
  const budgetId = orderFields.linkedBudgetId.value;
  const budget = budgetId ? getBudgetById(budgetId) : null;
  const matchedBudgetItem = budget ? findBudgetItemByProductId(budget, productSelect.value) : null;

  row.dataset.budgetItemId = matchedBudgetItem?.id || "";

  const syncedPrice = populateOrderItemPriceSelect(
    priceSelect,
    budgetId,
    row.dataset.budgetItemId,
    priceSelect.value,
    Number(priceInput.value) || 0
  );

  if (priceSelect.value && syncedPrice) {
    priceInput.value = syncedPrice.toFixed(2);
  } else {
    const product = getProductById(productSelect.value);
    priceInput.value = product ? Number(product.basePrice || 0).toFixed(2) : "0";
  }

  updateOrderItemBudgetNote(row, budgetId, row.dataset.budgetItemId);
  updateOrderItemSubtotal(row);
}

function createOrderItemElement(item = {}) {
  const row = document.createElement("article");
  row.className = "order-item-row";
  row.dataset.budgetItemId = item.budgetItemId || "";
  row.innerHTML = `
    <div class="order-item-header">
      <h4>Item do pedido</h4>
      <button type="button" class="ghost-button remove-order-item-button">Remover</button>
    </div>
    <div class="order-item-grid">
      <label>
        <span>Produto cadastrado</span>
        <select class="order-product-select"></select>
        <p class="budget-link-note">Pedido avulso, sem orçamento vinculado.</p>
      </label>
      <label>
        <span>Preço sugerido</span>
        <select class="order-budget-price-select"></select>
      </label>
      <label>
        <span>Quantidade</span>
        <input type="number" class="order-product-quantity" min="1" step="1" value="1" required>
      </label>
      <label>
        <span>Valor unitário</span>
        <input type="number" class="order-product-price" min="0" step="0.01" value="0" required>
      </label>
    </div>
    <div class="item-subtotal">
      <span>Subtotal do item</span>
      <strong class="order-item-subtotal">R$ 0,00</strong>
    </div>
  `;

  const productSelect = row.querySelector(".order-product-select");
  const budgetPriceSelect = row.querySelector(".order-budget-price-select");
  const quantityInput = row.querySelector(".order-product-quantity");
  const priceInput = row.querySelector(".order-product-price");

  populateProductSelect(productSelect, item.productId || "");
  quantityInput.value = item.quantity || 1;
  priceInput.value = item.unitPrice ?? 0;
  budgetPriceSelect.value = item.priceMode || "";

  syncOrderItemPricing(row);

  if (item.priceMode && Number(item.unitPrice ?? 0) > 0) {
    priceInput.value = Number(item.unitPrice).toFixed(2);
    budgetPriceSelect.value = item.priceMode;
    updateOrderItemSubtotal(row);
  } else if (item.unitPrice !== undefined && item.unitPrice !== null) {
    priceInput.value = Number(item.unitPrice).toFixed(2);
    updateOrderItemSubtotal(row);
  }

  productSelect.addEventListener("change", () => {
    syncOrderItemPricing(row);
    updateOrderSummary();
  });

  budgetPriceSelect.addEventListener("change", () => {
    const budgetId = orderFields.linkedBudgetId.value;
    const budget = budgetId ? getBudgetById(budgetId) : null;
    const budgetItem = budget ? findBudgetItemById(budget, row.dataset.budgetItemId) : null;
    const selectedPrice = getBudgetItemUnitPrice(budgetItem, budgetPriceSelect.value);

    if (selectedPrice) {
      priceInput.value = selectedPrice.toFixed(2);
    }

    updateOrderItemSubtotal(row);
    updateOrderSummary();
  });

  quantityInput.addEventListener("input", () => {
    updateOrderItemSubtotal(row);
    updateOrderSummary();
  });

  priceInput.addEventListener("input", () => {
    updateOrderItemSubtotal(row);
    updateOrderSummary();
  });

  row.querySelector(".remove-order-item-button").addEventListener("click", () => {
    row.remove();
    if (orderItemsList.children.length === 0) {
      addOrderItem();
    }
    updateOrderSummary();
  });

  return row;
}

function addOrderItem(item = {}) {
  orderItemsList.appendChild(createOrderItemElement(item));
  updateOrderSummary();
}

function buildOrderItemsFromBudget(budget) {
  return (budget.items || []).map((item) => ({
    productId: item.productId,
    productName: item.productName,
    budgetItemId: item.id,
    priceMode: item.priceOptions?.custom ? "custom" : "x3",
    quantity: item.quantity,
    unitPrice: item.priceOptions?.custom
      ? Number(item.priceOptions.custom.unitPrice.toFixed(2))
      : Number((item.priceOptions?.x3?.unitPrice || item.productBasePrice || 0).toFixed(2))
  }));
}

function loadApprovedBudgetIntoOrder(budgetId) {
  const budget = budgetId ? getBudgetById(budgetId) : null;
  orderItemsList.innerHTML = "";

  if (!budget) {
    orderFields.customerName.value = "";
    orderFields.customerPhone.value = "";
    addOrderItem();
    updateOrderSummary();
    return;
  }

  syncOrderCustomerFromBudget(budgetId, true);
  const items = buildOrderItemsFromBudget(budget);
  if (items.length > 0) {
    items.forEach((item) => addOrderItem(item));
  } else {
    addOrderItem();
  }

  updateOrderSummary();
}

function refreshOrderItemsFromCurrentBudget() {
  Array.from(orderItemsList.querySelectorAll(".order-item-row")).forEach((row) => {
    syncOrderItemPricing(row);
  });
  updateOrderSummary();
}

function refreshProductOptionsForOrderItems() {
  Array.from(orderItemsList.querySelectorAll(".order-product-select")).forEach((selectElement) => {
    populateProductSelect(selectElement, selectElement.value);
  });
  refreshProductOptionsForBudgetItems();
}

function getOrderItemsFromForm() {
  return Array.from(orderItemsList.querySelectorAll(".order-item-row")).map((row) => {
    const productId = row.querySelector(".order-product-select").value || null;
    const priceMode = row.querySelector(".order-budget-price-select").value || null;
    const product = productId ? getProductById(productId) : null;
    const quantity = Number(row.querySelector(".order-product-quantity").value) || 0;
    const unitPrice = Number(row.querySelector(".order-product-price").value) || 0;

    return {
      productId,
      productName: product ? product.name : "",
      quantity,
      unitPrice,
      subtotal: quantity * unitPrice,
      budgetItemId: row.dataset.budgetItemId || null,
      priceMode
    };
  });
}

function updateOrderSummary() {
  const items = getOrderItemsFromForm();
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const linkedBudget = orderFields.linkedBudgetId.value ? getBudgetById(orderFields.linkedBudgetId.value) : null;

  output.orderTotal.textContent = formatCurrency(total);
  output.orderItemsCount.textContent = String(items.length);
  output.orderLinkedBudgetName.textContent = linkedBudget ? linkedBudget.projectName : "Pedido avulso";
  output.orderCurrentStatus.textContent = STATUS_LABELS[orderFields.orderStatus.value] || "Novo";
  output.orderCurrentDueDate.textContent = formatDateForDisplay(orderFields.orderDueDate.value);
  output.orderCurrentUrgency.textContent = URGENCY_LABELS[orderFields.orderUrgency.value] || "Normal";
  output.orderSummaryTotal.textContent = formatCurrency(total);
  saveOrderButton.textContent = editingOrderId ? "Atualizar pedido" : "Salvar pedido";
}

function collectOrderData() {
  const customerName = orderFields.customerName.value.trim();
  const customerPhone = orderFields.customerPhone.value.trim();
  const linkedBudgetId = orderFields.linkedBudgetId.value || null;
  const linkedBudget = linkedBudgetId ? getBudgetById(linkedBudgetId) : null;
  const status = orderFields.orderStatus.value;
  const dueDate = orderFields.orderDueDate.value;
  const urgency = orderFields.orderUrgency.value;
  const notes = orderFields.orderNotes.value.trim();
  const items = getOrderItemsFromForm();

  if (!customerName || !customerPhone) {
    throw new Error("Preencha nome e telefone do cliente.");
  }

  if (!isValidPhone(customerPhone)) {
    throw new Error("Informe um telefone com DDD e 8 ou 9 dígitos.");
  }

  if (items.length === 0) {
    throw new Error("Adicione pelo menos um item ao pedido.");
  }

  items.forEach((item, index) => {
    if (!item.productId) {
      throw new Error(`Selecione um produto cadastrado no item ${index + 1}.`);
    }
    if (item.quantity <= 0) {
      throw new Error(`Informe uma quantidade válida no item ${index + 1}.`);
    }
  });

  return {
    id: editingOrderId || generateId("order"),
    linkedBudgetId,
    linkedBudgetName: linkedBudget ? linkedBudget.projectName : null,
    customerName,
    customerPhone,
    status,
    dueDate,
    urgency,
    notes,
    items,
    total: items.reduce((sum, item) => sum + item.subtotal, 0),
    createdAt: new Date().toISOString()
  };
}

function saveOrder(orderData) {
  const existingOrders = getOrders();
  const previousOrder = existingOrders.find((order) => order.id === orderData.id);
  const nextOrders = existingOrders.filter((order) => order.id !== orderData.id);

  nextOrders.unshift({
    ...orderData,
    createdAt: previousOrder ? previousOrder.createdAt : orderData.createdAt,
    updatedAt: new Date().toISOString()
  });

  saveOrders(nextOrders.slice(0, 50));
  renderOrders();
  updateDashboard();
}

function renderOrders() {
  const orders = getOrders();
  ordersList.innerHTML = "";

  if (orders.length === 0) {
    ordersEmptyState.classList.remove("hidden");
    updateDashboard();
    return;
  }

  ordersEmptyState.classList.add("hidden");

  orders.forEach((order) => {
    const card = document.createElement("article");
    card.className = "order-card";
    const itemsPreview = order.items.slice(0, 3).map((item) => {
      return `<div><strong>${item.quantity}x</strong> ${item.productName}</div>`;
    }).join("");

    card.innerHTML = `
      <div class="order-card-header">
        <div>
          <h4>${order.customerName}</h4>
          <div class="order-card-meta">
            <div class="order-card-meta-line">
              <span>${order.customerPhone}</span>
              <span>${new Date(order.updatedAt || order.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
            <div class="order-card-meta-line">
              <span>${order.linkedBudgetName ? `Orçamento: ${order.linkedBudgetName}` : "Pedido avulso"}</span>
            </div>
            <div class="order-card-meta-line">
              <span>Entrega: ${formatDateForDisplay(order.dueDate)}</span>
              <span class="urgency-badge urgency-${order.urgency || "normal"}">${URGENCY_LABELS[order.urgency || "normal"]}</span>
            </div>
          </div>
        </div>
        <span class="status-badge status-${order.status}">${STATUS_LABELS[order.status] || order.status}</span>
      </div>
      <div class="order-items-preview">${itemsPreview}</div>
      <div class="order-card-total">
        <span>${order.items.length} item(ns)</span>
        <strong>${formatCurrency(order.total)}</strong>
      </div>
    `;

    card.addEventListener("click", () => {
      loadOrderIntoForm(order);
      activateSection("orders");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    ordersList.appendChild(card);
  });

  updateDashboard();
}

function loadOrderIntoForm(order) {
  editingOrderId = order.id;
  orderFields.linkedBudgetId.value = order.linkedBudgetId || "";
  populateOrderBudgetSelect(order.linkedBudgetId || "");
  orderFields.customerName.value = order.customerName;
  orderFields.customerPhone.value = order.customerPhone;
  orderFields.orderStatus.value = order.status;
  orderFields.orderDueDate.value = order.dueDate || "";
  orderFields.orderUrgency.value = order.urgency || "normal";
  orderFields.orderNotes.value = order.notes || "";
  orderItemsList.innerHTML = "";
  order.items.forEach((item) => addOrderItem(item));
  updateOrderSummary();
}

function resetOrderForm(prefill = {}) {
  const { items = [], linkedBudgetId = "" } = prefill;

  editingOrderId = null;
  orderForm.reset();
  populateOrderBudgetSelect(linkedBudgetId);
  orderFields.linkedBudgetId.value = linkedBudgetId;
  orderFields.orderStatus.value = "novo";
  orderFields.orderUrgency.value = "normal";
  orderFields.orderDueDate.value = "";
  orderItemsList.innerHTML = "";

  if (linkedBudgetId) {
    loadApprovedBudgetIntoOrder(linkedBudgetId);
    return;
  }

  if (items.length > 0) {
    items.forEach((item) => addOrderItem(item));
  } else {
    addOrderItem();
  }

  updateOrderSummary();
}

function resetBudgetForm() {
  calculatorForm.reset();
  populateClientsSelect();
  loadBudgetItemsIntoForm();
  emptyState.classList.remove("hidden");
  resultContent.classList.add("hidden");
  output.heroFilament.textContent = formatCurrency(0);
  output.heroTotal.textContent = formatCurrency(0);
  output.heroSale.textContent = formatCurrency(0);
  output.customSaleCard.classList.add("hidden");
  output.resultClientName.textContent = "Cliente não selecionado";
  output.budgetResultItemsList.innerHTML = "";
  createOrderFromBudgetButton.classList.add("hidden");
  approveBudgetButton.textContent = "Cliente aceitou este orçamento";
  budgetApprovalHint.textContent = "Aprove o orçamento para liberá-lo na tela de pedidos.";
  currentBudgetResult = null;
}

function resetBudgetEntryFields() {
  calculatorForm.reset();
  populateClientsSelect();
  loadBudgetItemsIntoForm();
}

function setBudgetApproval(isApproved) {
  if (!currentBudgetResult) {
    return;
  }

  const history = getBudgetHistory();
  const updatedHistory = history.map((budget) => {
    if (budget.id !== currentBudgetResult.id) {
      return budget;
    }

    return {
      ...budget,
      isApproved,
      updatedAt: new Date().toISOString()
    };
  });

  saveBudgetHistory(updatedHistory);
  currentBudgetResult = updatedHistory.find((budget) => budget.id === currentBudgetResult.id) || currentBudgetResult;
  renderResult(currentBudgetResult);
  renderBudgetHistory();
  populateOrderBudgetSelect(orderFields.linkedBudgetId.value);
}

function updateDashboard() {
  const clients = getClients();
  const budgets = getBudgetHistory();
  const products = getProducts();
  const orders = getOrders();
  const totalOrdersRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const latestClient = clients[0];
  const latestProduct = products[0];
  const averageProductPrice = products.length === 0
    ? 0
    : products.reduce((sum, product) => sum + Number(product.basePrice || 0), 0) / products.length;
  const clientsWithPhones = clients.filter((client) => client.phone).length;

  output.dashboardClients.textContent = String(clients.length);
  output.dashboardProjects.textContent = String(budgets.length);
  output.dashboardProducts.textContent = String(products.length);
  output.dashboardOrders.textContent = String(orders.length);
  output.dashboardOrdersRevenue.textContent = formatCurrency(totalOrdersRevenue);
  output.clientsMetricCount.textContent = String(clients.length);
  output.clientsMetricLatest.textContent = latestClient ? latestClient.name : "Nenhum";
  output.clientsMetricPhones.textContent = String(clientsWithPhones);
  output.productsMetricCount.textContent = String(products.length);
  output.productsMetricLatest.textContent = latestProduct ? latestProduct.name : "Nenhum";
  output.productsMetricAverage.textContent = formatCurrency(averageProductPrice);
  output.ordersMetricCount.textContent = String(orders.length);
  output.ordersMetricRevenue.textContent = formatCurrency(totalOrdersRevenue);
  output.ordersMetricLatest.textContent = orders[0] ? orders[0].customerName : "Nenhum";
}

function activateSection(sectionName) {
  const config = SECTION_CONFIG[sectionName];
  if (!config) {
    return;
  }

  activeSectionEyebrow.textContent = config.eyebrow;
  activeSectionTitle.textContent = config.title;

  menuButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.section === sectionName);
  });

  appViews.forEach((view) => {
    const isTarget = view.dataset.view === sectionName;
    view.classList.toggle("hidden", !isTarget);
    view.classList.toggle("active-view", isTarget);
  });
}

function setupNavigation() {
  menuButtons.forEach((button) => {
    button.addEventListener("click", () => activateSection(button.dataset.section));
  });

  sectionLinks.forEach((button) => {
    button.addEventListener("click", () => activateSection(button.dataset.sectionTarget));
  });
}

function setupInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.classList.remove("hidden");
    installHint.textContent = "Aplicativo pronto para instalação.";
  });

  installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      return;
    }

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installButton.classList.add("hidden");
    installHint.textContent = "Se preferir, você também pode instalar pelo menu do navegador.";
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
    clientId: budgetClientId.value,
    projectName: fields.projectName.value,
    items: getBudgetItemsFromForm()
  };

  try {
    const result = calculateCosts(values);
    const savedBudget = addToBudgetHistory(result);
    renderResult(savedBudget);
    resetBudgetEntryFields();
    activateSection("budgets");
  } catch (error) {
    window.alert(error.message);
  }
});

clientForm.addEventListener("submit", (event) => {
  event.preventDefault();

  try {
    const clientData = collectClientData();
    saveClient(clientData);
    resetClientForm();
  } catch (error) {
    window.alert(error.message);
  }
});

productForm.addEventListener("submit", (event) => {
  event.preventDefault();

  try {
    const productData = collectProductData();
    saveProduct(productData);
    resetProductForm();
  } catch (error) {
    window.alert(error.message);
  }
});

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();

  try {
    const orderData = collectOrderData();
    saveOrder(orderData);
    resetOrderForm();
    activateSection("orders");
  } catch (error) {
    window.alert(error.message);
  }
});

clearFormButton.addEventListener("click", resetBudgetForm);
clearClientFormButton.addEventListener("click", resetClientForm);
clearProductFormButton.addEventListener("click", resetProductForm);
clearOrderFormButton.addEventListener("click", () => resetOrderForm());
addBudgetItemButton.addEventListener("click", () => addBudgetItem());
addOrderItemButton.addEventListener("click", () => addOrderItem());

clearHistoryButton.addEventListener("click", () => {
  localStorage.removeItem(BUDGET_STORAGE_KEY);
  renderBudgetHistory();
  populateOrderBudgetSelect();
  resetBudgetForm();
  resetOrderForm();
  updateDashboard();
});

clearClientsButton.addEventListener("click", () => {
  localStorage.removeItem(CLIENT_STORAGE_KEY);
  renderClients();
  populateClientsSelect();
  resetClientForm();
  updateDashboard();
});

clearProductsButton.addEventListener("click", () => {
  localStorage.removeItem(PRODUCT_STORAGE_KEY);
  renderProducts();
  refreshProductOptionsForOrderItems();
  resetProductForm();
  loadBudgetItemsIntoForm();
  resetOrderForm();
  updateDashboard();
});

clearOrdersButton.addEventListener("click", () => {
  localStorage.removeItem(ORDER_STORAGE_KEY);
  renderOrders();
  resetOrderForm();
});

createOrderFromBudgetButton.addEventListener("click", () => {
  if (!currentBudgetResult) {
    window.alert("Calcule ou selecione um orçamento antes de criar um pedido.");
    return;
  }

  if (!currentBudgetResult.isApproved) {
    window.alert("Aprove o orçamento antes de criar um pedido.");
    return;
  }

  resetOrderForm({ linkedBudgetId: currentBudgetResult.id });
  activateSection("orders");
});

downloadBudgetPdfButton.addEventListener("click", async () => {
  if (!currentBudgetResult) {
    window.alert("Calcule ou selecione um orçamento antes de gerar o PDF.");
    return;
  }

  try {
    await generateBudgetPdf(currentBudgetResult);
  } catch (error) {
    window.alert(error.message || "Não foi possível gerar o PDF deste orçamento.");
  }
});

approveBudgetButton.addEventListener("click", () => {
  if (!currentBudgetResult) {
    window.alert("Calcule ou selecione um orçamento antes de aprová-lo.");
    return;
  }

  setBudgetApproval(true);
});

orderFields.orderStatus.addEventListener("change", updateOrderSummary);
orderFields.orderDueDate.addEventListener("change", updateOrderSummary);
orderFields.orderUrgency.addEventListener("change", updateOrderSummary);
orderFields.linkedBudgetId.addEventListener("change", () => {
  loadApprovedBudgetIntoOrder(orderFields.linkedBudgetId.value);
});

clientFields.phone.addEventListener("input", () => {
  clientFields.phone.value = maskPhoneInput(clientFields.phone.value);
});

orderFields.customerPhone.addEventListener("input", () => {
  orderFields.customerPhone.value = maskPhoneInput(orderFields.customerPhone.value);
});

populateClientsSelect();
populateOrderBudgetSelect();
renderBudgetHistory();
renderClients();
renderProducts();
renderOrders();
setupNavigation();
activateSection("dashboard");
setupInstallPrompt();
registerServiceWorker();
resetClientForm();
resetProductForm();
loadBudgetItemsIntoForm();
resetOrderForm();
updateDashboard();
