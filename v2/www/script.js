const BUDGET_STORAGE_KEY = "marinsmanager-budget-history";
const PRODUCT_STORAGE_KEY = "marinsmanager-products-history";
const ORDER_STORAGE_KEY = "marinsmanager-orders-history";

const SECTION_CONFIG = {
  dashboard: {
    eyebrow: "Painel principal",
    title: "Início"
  },
  budgets: {
    eyebrow: "Tela ativa",
    title: "Orçamentos"
  },
  products: {
    eyebrow: "Tela ativa",
    title: "Produtos"
  },
  orders: {
    eyebrow: "Tela ativa",
    title: "Pedidos"
  },
  production: {
    eyebrow: "Planejamento",
    title: "Produção"
  },
  clients: {
    eyebrow: "Planejamento",
    title: "Clientes"
  }
};

const STATUS_LABELS = {
  novo: "Novo",
  em_producao: "Em produção",
  aguardando: "Aguardando",
  entregue: "Entregue"
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

const fields = {
  projectName: document.getElementById("projectName"),
  weight: document.getElementById("weight"),
  printTime: document.getElementById("printTime"),
  filamentPrice: document.getElementById("filamentPrice"),
  printerConsumption: document.getElementById("printerConsumption"),
  energyRate: document.getElementById("energyRate"),
  extraCosts: document.getElementById("extraCosts")
};

const productFields = {
  name: document.getElementById("productName"),
  category: document.getElementById("productCategory"),
  basePrice: document.getElementById("productBasePrice"),
  description: document.getElementById("productDescription")
};

const orderFields = {
  customerName: document.getElementById("customerName"),
  customerPhone: document.getElementById("customerPhone"),
  orderStatus: document.getElementById("orderStatus"),
  orderNotes: document.getElementById("orderNotes")
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
  totalCost: document.getElementById("totalCost"),
  dashboardProjects: document.getElementById("dashboardProjects"),
  dashboardProducts: document.getElementById("dashboardProducts"),
  dashboardOrders: document.getElementById("dashboardOrders"),
  dashboardOrdersRevenue: document.getElementById("dashboardOrdersRevenue"),
  orderTotal: document.getElementById("orderTotal"),
  orderItemsCount: document.getElementById("orderItemsCount"),
  orderLinkedItemsCount: document.getElementById("orderLinkedItemsCount"),
  orderCurrentStatus: document.getElementById("orderCurrentStatus"),
  orderSummaryTotal: document.getElementById("orderSummaryTotal"),
  ordersMetricCount: document.getElementById("ordersMetricCount"),
  ordersMetricRevenue: document.getElementById("ordersMetricRevenue"),
  ordersMetricLatest: document.getElementById("ordersMetricLatest"),
  productsMetricCount: document.getElementById("productsMetricCount"),
  productsMetricLatest: document.getElementById("productsMetricLatest"),
  productsMetricAverage: document.getElementById("productsMetricAverage")
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

function calculateCosts(values) {
  const hours = parseTimeToHours(values.printTime);
  if (hours === null) {
    throw new Error("Informe o tempo de impressão no formato hh:mm, usando somente horas e minutos.");
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

    return { multiplier, salePrice, profit, margin };
  });

  return {
    id: generateId("budget"),
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
  currentBudgetResult = result;
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

function addToBudgetHistory(result) {
  const currentHistory = getBudgetHistory();
  const normalizedName = normalizeText(result.projectName);
  const previousEntry = currentHistory.find((item) => normalizeText(item.projectName) === normalizedName);
  const history = currentHistory.filter((item) => normalizeText(item.projectName) !== normalizedName);

  const savedEntry = {
    ...result,
    id: previousEntry?.id || result.id,
    createdAt: previousEntry ? previousEntry.createdAt : result.createdAt,
    updatedAt: new Date().toISOString()
  };

  history.unshift(savedEntry);
  const trimmedHistory = history.slice(0, 20);
  saveBudgetHistory(trimmedHistory);
  renderBudgetHistory();
  refreshBudgetOptionsForOrderItems();
  updateDashboard();
  return savedEntry;
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
          <p class="history-meta">${item.weight} g • ${formatHours(item.hours)}</p>
        </div>
        <time datetime="${item.updatedAt || item.createdAt}">${new Date(item.updatedAt || item.createdAt).toLocaleDateString("pt-BR")}</time>
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
      activateSection("budgets");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    historyList.appendChild(article);
  });
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

function getBudgetById(id) {
  return getBudgetHistory().find((budget) => budget.id === id) || null;
}

function getProductById(id) {
  return getProducts().find((product) => product.id === id) || null;
}

function populateBudgetSelect(selectElement, selectedId = "") {
  const budgets = getBudgetHistory();
  selectElement.innerHTML = "";

  const manualOption = document.createElement("option");
  manualOption.value = "";
  manualOption.textContent = "Sem vínculo";
  selectElement.appendChild(manualOption);

  budgets.forEach((budget) => {
    const option = document.createElement("option");
    option.value = budget.id;
    option.textContent = `${budget.projectName} • ${formatCurrency(budget.suggestions[1].salePrice)}`;
    selectElement.appendChild(option);
  });

  selectElement.value = selectedId;
}

function populateProductSelect(selectElement, selectedId = "") {
  const products = getProducts();
  selectElement.innerHTML = "";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = products.length === 0 ? "Cadastre produtos primeiro" : "Selecione um produto";
  selectElement.appendChild(placeholderOption);

  products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = `${product.name} • ${formatCurrency(product.basePrice)}`;
    selectElement.appendChild(option);
  });

  selectElement.value = selectedId;
}

function updateOrderItemBudgetNote(row, budgetId) {
  const note = row.querySelector(".budget-link-note");
  const budget = getBudgetById(budgetId);

  if (!budget) {
    note.textContent = "Sem vínculo com orçamento.";
    return;
  }

  note.textContent = `Usando o orçamento "${budget.projectName}" com venda sugerida x3 de ${formatCurrency(budget.suggestions[1].salePrice)}.`;
}

function updateOrderItemSubtotal(row) {
  const quantity = Number(row.querySelector(".order-product-quantity").value) || 0;
  const unitPrice = Number(row.querySelector(".order-product-price").value) || 0;
  row.querySelector(".order-item-subtotal").textContent = formatCurrency(quantity * unitPrice);
}

function createOrderItemElement(item = {}) {
  const row = document.createElement("article");
  row.className = "order-item-row";
  row.innerHTML = `
    <div class="order-item-header">
      <h4>Item do pedido</h4>
      <button type="button" class="ghost-button remove-order-item-button">Remover</button>
    </div>
    <div class="order-item-grid">
      <label>
        <span>Produto cadastrado</span>
        <select class="order-product-select"></select>
      </label>
      <label>
        <span>Orçamento vinculado</span>
        <select class="order-budget-select"></select>
        <p class="budget-link-note">Sem vínculo com orçamento.</p>
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
  const budgetSelect = row.querySelector(".order-budget-select");
  const quantityInput = row.querySelector(".order-product-quantity");
  const priceInput = row.querySelector(".order-product-price");

  populateProductSelect(productSelect, item.productId || "");
  populateBudgetSelect(budgetSelect, item.linkedBudgetId || "");

  quantityInput.value = item.quantity || 1;
  priceInput.value = item.unitPrice ?? 0;
  updateOrderItemBudgetNote(row, item.linkedBudgetId || "");
  updateOrderItemSubtotal(row);

  productSelect.addEventListener("change", () => {
    const product = getProductById(productSelect.value);
    if (product && !budgetSelect.value) {
      priceInput.value = product.basePrice.toFixed(2);
    }
    updateOrderItemSubtotal(row);
    updateOrderSummary();
  });

  budgetSelect.addEventListener("change", () => {
    const budget = getBudgetById(budgetSelect.value);
    if (budget) {
      priceInput.value = budget.suggestions[1].salePrice.toFixed(2);
    } else {
      const product = getProductById(productSelect.value);
      priceInput.value = product ? product.basePrice.toFixed(2) : "0";
    }
    updateOrderItemBudgetNote(row, budgetSelect.value);
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

function refreshBudgetOptionsForOrderItems() {
  Array.from(orderItemsList.querySelectorAll(".order-budget-select")).forEach((selectElement) => {
    const currentValue = selectElement.value;
    populateBudgetSelect(selectElement, currentValue);
    updateOrderItemBudgetNote(selectElement.closest(".order-item-row"), selectElement.value);
  });
}

function refreshProductOptionsForOrderItems() {
  Array.from(orderItemsList.querySelectorAll(".order-product-select")).forEach((selectElement) => {
    const currentValue = selectElement.value;
    populateProductSelect(selectElement, currentValue);
  });
}

function getOrderItemsFromForm() {
  return Array.from(orderItemsList.querySelectorAll(".order-item-row")).map((row) => {
    const productId = row.querySelector(".order-product-select").value || null;
    const linkedBudgetId = row.querySelector(".order-budget-select").value || null;
    const product = productId ? getProductById(productId) : null;
    const linkedBudget = linkedBudgetId ? getBudgetById(linkedBudgetId) : null;
    const quantity = Number(row.querySelector(".order-product-quantity").value) || 0;
    const unitPrice = Number(row.querySelector(".order-product-price").value) || 0;

    return {
      productId,
      productName: product ? product.name : "",
      quantity,
      unitPrice,
      subtotal: quantity * unitPrice,
      linkedBudgetId,
      linkedBudgetName: linkedBudget ? linkedBudget.projectName : null
    };
  });
}

function updateOrderSummary() {
  const items = getOrderItemsFromForm();
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const linkedItems = items.filter((item) => item.linkedBudgetId).length;

  output.orderTotal.textContent = formatCurrency(total);
  output.orderItemsCount.textContent = String(items.length);
  output.orderLinkedItemsCount.textContent = String(linkedItems);
  output.orderCurrentStatus.textContent = STATUS_LABELS[orderFields.orderStatus.value] || "Novo";
  output.orderSummaryTotal.textContent = formatCurrency(total);
  saveOrderButton.textContent = editingOrderId ? "Atualizar pedido" : "Salvar pedido";
}

function collectOrderData() {
  const customerName = orderFields.customerName.value.trim();
  const customerPhone = orderFields.customerPhone.value.trim();
  const status = orderFields.orderStatus.value;
  const notes = orderFields.orderNotes.value.trim();
  const items = getOrderItemsFromForm();

  if (!customerName || !customerPhone) {
    throw new Error("Preencha nome e telefone do cliente.");
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
    customerName,
    customerPhone,
    status,
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
      const budgetTag = item.linkedBudgetName ? ` <span class="order-budget-tag">• ${item.linkedBudgetName}</span>` : "";
      return `<div><strong>${item.quantity}x</strong> ${item.productName}${budgetTag}</div>`;
    }).join("");

    card.innerHTML = `
      <div class="order-card-header">
        <div>
          <h4>${order.customerName}</h4>
          <div class="order-card-meta">
            <span>${order.customerPhone}</span>
            <span>${new Date(order.updatedAt || order.createdAt).toLocaleDateString("pt-BR")}</span>
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
  orderFields.customerName.value = order.customerName;
  orderFields.customerPhone.value = order.customerPhone;
  orderFields.orderStatus.value = order.status;
  orderFields.orderNotes.value = order.notes || "";
  orderItemsList.innerHTML = "";
  order.items.forEach((item) => addOrderItem(item));
  updateOrderSummary();
}

function resetOrderForm(prefillItems = []) {
  editingOrderId = null;
  orderForm.reset();
  orderFields.orderStatus.value = "novo";
  orderItemsList.innerHTML = "";

  if (prefillItems.length > 0) {
    prefillItems.forEach((item) => addOrderItem(item));
  } else {
    addOrderItem();
  }

  updateOrderSummary();
}

function resetBudgetForm() {
  calculatorForm.reset();
  fields.printerConsumption.value = "0.12";
  fields.energyRate.value = "0.80";
  fields.extraCosts.value = "0";
  emptyState.classList.remove("hidden");
  resultContent.classList.add("hidden");
  output.heroFilament.textContent = formatCurrency(0);
  output.heroTotal.textContent = formatCurrency(0);
  output.heroSale.textContent = formatCurrency(0);
  currentBudgetResult = null;
}

function updateDashboard() {
  const budgets = getBudgetHistory();
  const products = getProducts();
  const orders = getOrders();
  const totalOrdersRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const latestProduct = products[0];
  const averageProductPrice = products.length === 0
    ? 0
    : products.reduce((sum, product) => sum + Number(product.basePrice || 0), 0) / products.length;

  output.dashboardProjects.textContent = String(budgets.length);
  output.dashboardProducts.textContent = String(products.length);
  output.dashboardOrders.textContent = String(orders.length);
  output.dashboardOrdersRevenue.textContent = formatCurrency(totalOrdersRevenue);
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
    const savedBudget = addToBudgetHistory(result);
    renderResult(savedBudget);
    activateSection("budgets");
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
clearProductFormButton.addEventListener("click", resetProductForm);
clearOrderFormButton.addEventListener("click", () => resetOrderForm());
addOrderItemButton.addEventListener("click", () => addOrderItem());

clearHistoryButton.addEventListener("click", () => {
  localStorage.removeItem(BUDGET_STORAGE_KEY);
  renderBudgetHistory();
  refreshBudgetOptionsForOrderItems();
  updateDashboard();
});

clearProductsButton.addEventListener("click", () => {
  localStorage.removeItem(PRODUCT_STORAGE_KEY);
  renderProducts();
  refreshProductOptionsForOrderItems();
  resetProductForm();
  resetOrderForm();
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

  resetOrderForm([{
    productId: "",
    linkedBudgetId: currentBudgetResult.id,
    quantity: 1,
    unitPrice: Number(currentBudgetResult.suggestions[1].salePrice.toFixed(2))
  }]);
  activateSection("orders");
});

fields.printTime.addEventListener("input", () => {
  fields.printTime.value = maskTimeInput(fields.printTime.value);
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

orderFields.orderStatus.addEventListener("change", updateOrderSummary);

renderBudgetHistory();
renderProducts();
renderOrders();
setupNavigation();
activateSection("dashboard");
setupInstallPrompt();
registerServiceWorker();
resetProductForm();
resetOrderForm();
updateDashboard();
