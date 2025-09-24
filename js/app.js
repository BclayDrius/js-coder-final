// Ecommerce Fitness Simulator

class ProductService {
  constructor(endpointUrl) {
    this.endpointUrl = endpointUrl;
  }

  async fetchProducts() {
    const response = await fetch(this.endpointUrl);
    if (!response.ok) throw new Error("No se pudo cargar el catálogo");
    const products = await response.json();
    return products.map((p) => new Product(p));
  }
}

class Product {
  constructor({ id, name, price, category, image, stock, rating }) {
    this.id = id;
    this.name = name;
    this.price = Number(price);
    this.category = category;
    this.image = image;
    this.stock = Number(stock);
    this.rating = Number(rating || 0);
  }
}

class CartItem {
  constructor(product, quantity = 1) {
    this.product = product;
    this.quantity = quantity;
  }

  get subtotal() {
    return this.quantity * this.product.price;
  }
}

class Cart {
  constructor() {
    this.items = [];
  }

  loadFromStorage() {
    const raw = localStorage.getItem("cart");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      this.items = parsed.map(
        ({ product, quantity }) => new CartItem(new Product(product), quantity)
      );
    } catch (_) {
      this.items = [];
    }
  }

  saveToStorage() {
    const serializable = this.items.map((ci) => ({
      product: ci.product,
      quantity: ci.quantity,
    }));
    localStorage.setItem("cart", JSON.stringify(serializable));
  }

  add(product, quantity = 1) {
    const existing = this.items.find((ci) => ci.product.id === product.id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stock);
    } else {
      this.items.push(new CartItem(product, Math.min(quantity, product.stock)));
    }
    this.saveToStorage();
  }

  remove(productId) {
    this.items = this.items.filter((ci) => ci.product.id !== productId);
    this.saveToStorage();
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find((ci) => ci.product.id === productId);
    if (!item) return;
    item.quantity = Math.min(Math.max(1, quantity), item.product.stock);
    this.saveToStorage();
  }

  clear() {
    this.items = [];
    this.saveToStorage();
  }

  get totalItems() {
    return this.items.reduce((acc, it) => acc + it.quantity, 0);
  }

  get totalPrice() {
    return this.items.reduce((acc, it) => acc + it.subtotal, 0);
  }
}

class UI {
  constructor() {
    // Catalog
    this.grid = document.getElementById("productos");
    this.searchInput = document.getElementById("buscador");
    this.categorySelect = document.getElementById("filtro-categoria");
    this.sortSelect = document.getElementById("orden-precio");
    // Cart
    this.cartEmpty = document.getElementById("carrito-vacio");
    this.cartList = document.getElementById("carrito-items");
    this.cartQty = document.getElementById("carrito-cantidad");
    this.cartTotal = document.getElementById("carrito-total");
    this.btnClear = document.getElementById("vaciar-carrito");
    this.btnCheckout = document.getElementById("btn-checkout");
    // Modal
    this.modal = document.getElementById("modal-checkout");
    this.btnCloseModal = document.getElementById("cerrar-modal");
    this.btnCancelCheckout = document.getElementById("cancelar-checkout");
    this.checkoutForm = document.getElementById("checkout-form");
    // Prefill
    this.prefillCheckout();
  }

  prefillCheckout() {
    const storedUser = JSON.parse(localStorage.getItem("checkoutUser") || "{}");
    const nombre = document.getElementById("nombre");
    const email = document.getElementById("email");
    const direccion = document.getElementById("direccion");
    const ciudad = document.getElementById("ciudad");
    nombre.value = storedUser.nombre || "Barclay Leach";
    email.value = storedUser.email || "barclay@example.com";
    direccion.value = storedUser.direccion || "Av. Siempre Viva 742";
    ciudad.value = storedUser.ciudad || "Lima";
  }

  toast(message) {
    Toastify({
      text: message,
      duration: 1800,
      gravity: "top",
      position: "right",
      backgroundColor: "#4CAF50",
    }).showToast();
  }

  alertSuccess(title, text) {
    return Swal.fire({ icon: "success", title, text, confirmButtonText: "OK" });
  }

  alertError(title, text) {
    return Swal.fire({ icon: "error", title, text, confirmButtonText: "OK" });
  }
}

class AppController {
  constructor() {
    this.products = [];
    this.filtered = [];
    this.cart = new Cart();
    this.ui = new UI();
    this.service = new ProductService("assets/products.json");
    this.bindEvents();
  }

  bindEvents() {
    this.ui.searchInput.addEventListener("input", () => this.applyFilters());
    this.ui.categorySelect.addEventListener("change", () =>
      this.applyFilters()
    );
    this.ui.sortSelect.addEventListener("change", () => this.applyFilters());

    this.ui.btnClear.addEventListener("click", () => this.clearCart());
    this.ui.btnCheckout.addEventListener("click", () => this.openCheckout());

    this.ui.btnCloseModal.addEventListener("click", () => this.closeCheckout());
    this.ui.btnCancelCheckout.addEventListener("click", () =>
      this.closeCheckout()
    );

    this.ui.checkoutForm.addEventListener("submit", (e) =>
      this.handleCheckout(e)
    );
  }

  async init() {
    try {
      this.cart.loadFromStorage();
      await this.loadProducts();
      this.populateCategories();
      this.applyFilters();
      this.renderCart();
    } catch (e) {
      this.ui.alertError("Error", e.message || "Fallo al iniciar la app");
    }
  }

  async loadProducts() {
    this.products = await this.service.fetchProducts();
    this.filtered = [...this.products];
  }

  populateCategories() {
    const categories = Array.from(
      new Set(this.products.map((p) => p.category))
    );
    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      this.ui.categorySelect.appendChild(opt);
    });
  }

  applyFilters() {
    const term = this.ui.searchInput.value.trim().toLowerCase();
    const cat = this.ui.categorySelect.value;
    const order = this.ui.sortSelect.value;

    let result = this.products.filter(
      (p) =>
        (!cat || p.category === cat) &&
        (!term || p.name.toLowerCase().includes(term))
    );

    if (order === "asc") result.sort((a, b) => a.price - b.price);
    if (order === "desc") result.sort((a, b) => b.price - a.price);

    this.filtered = result;
    this.renderCatalog();
  }

  renderCatalog() {
    this.ui.grid.innerHTML = "";
    if (this.filtered.length === 0) {
      this.ui.grid.innerHTML =
        '<div class="no-result">No se encontraron productos</div>';
      return;
    }

    const fragment = document.createDocumentFragment();
    this.filtered.forEach((p) => {
      const card = document.createElement("article");
      card.className = "producto-card";
      card.innerHTML = `
        <div class="producto-media">
          <img src="${p.image}" alt="${p.name}" loading="lazy" />
          <span class="badge">${p.category}</span>
        </div>
        <div class="producto-info">
          <h3>${p.name}</h3>
          <div class="rating">${"★".repeat(Math.round(p.rating))}${"☆".repeat(
        5 - Math.round(p.rating)
      )}</div>
          <div class="precio">$${p.price.toFixed(2)}</div>
          <div class="stock">Stock: ${p.stock}</div>
          <div class="acciones">
            <input type="number" min="1" max="${
              p.stock
            }" value="1" class="qty-input" />
            <button class="btn-primario">Agregar</button>
          </div>
        </div>
      `;
      const qtyInput = card.querySelector(".qty-input");
      const btnAdd = card.querySelector(".btn-primario");
      btnAdd.addEventListener("click", () => {
        const qty = parseInt(qtyInput.value) || 1;
        this.cart.add(p, qty);
        this.ui.toast("Producto agregado al carrito");
        this.renderCart();
      });
      fragment.appendChild(card);
    });
    this.ui.grid.appendChild(fragment);
  }

  renderCart() {
    const hasItems = this.cart.items.length > 0;
    this.ui.cartEmpty.style.display = hasItems ? "none" : "block";
    this.ui.cartList.innerHTML = "";

    const fragment = document.createDocumentFragment();
    this.cart.items.forEach((ci) => {
      const li = document.createElement("li");
      li.className = "carrito-item";
      li.innerHTML = `
        <div class="ci-info">
          <img src="${ci.product.image}" alt="${ci.product.name}" />
          <div>
            <h4>${ci.product.name}</h4>
            <span class="ci-precio">$${ci.product.price.toFixed(2)}</span>
          </div>
        </div>
        <div class="ci-actions">
          <input type="number" min="1" max="${ci.product.stock}" value="${
        ci.quantity
      }" />
          <span class="ci-subtotal">$${ci.subtotal.toFixed(2)}</span>
          <button class="btn-icon" title="Eliminar">🗑️</button>
        </div>
      `;
      const qtyInput = li.querySelector("input");
      const btnDelete = li.querySelector(".btn-icon");
      qtyInput.addEventListener("input", () => {
        const qty = parseInt(qtyInput.value) || 1;
        this.cart.updateQuantity(ci.product.id, qty);
        this.renderCart();
      });
      btnDelete.addEventListener("click", () => {
        this.cart.remove(ci.product.id);
        this.renderCart();
      });
      fragment.appendChild(li);
    });

    this.ui.cartList.appendChild(fragment);
    this.ui.cartQty.textContent = `${this.cart.totalItems} items`;
    this.ui.cartTotal.textContent = `$${this.cart.totalPrice.toFixed(2)}`;
    this.ui.btnCheckout.disabled = !hasItems;
  }

  clearCart() {
    if (this.cart.items.length === 0) return;
    Swal.fire({
      icon: "warning",
      title: "Vaciar carrito",
      text: "¿Deseas eliminar todos los productos?",
      showCancelButton: true,
      confirmButtonText: "Sí, vaciar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (res.isConfirmed) {
        this.cart.clear();
        this.renderCart();
        this.ui.toast("Carrito vaciado");
      }
    });
  }

  openCheckout() {
    this.ui.modal.classList.remove("oculto");
  }

  closeCheckout() {
    this.ui.modal.classList.add("oculto");
  }

  async handleCheckout(e) {
    e.preventDefault();
    const formData = new FormData(this.ui.checkoutForm);
    const user = Object.fromEntries(formData.entries());

    // Simple validation
    if (!user.nombre || !user.email || !user.direccion || !user.ciudad) {
      this.ui.alertError("Campos incompletos", "Completa todos los campos");
      return;
    }

    localStorage.setItem("checkoutUser", JSON.stringify(user));

    // Simulate async payment
    const loading = Swal.fire({
      title: "Procesando pago...",
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
    });

    await new Promise((r) => setTimeout(r, 1500));
    (await loading).close && (await loading).close();

    const purchaseId = Math.random().toString(36).slice(2, 10).toUpperCase();
    await this.ui.alertSuccess(
      "Compra realizada",
      `Nº de orden: ${purchaseId}`
    );

    this.cart.clear();
    this.renderCart();
    this.closeCheckout();
  }
}

let app;

document.addEventListener("DOMContentLoaded", () => {
  app = new AppController();
  app.init();
});
