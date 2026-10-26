
const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 1499,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    description: "Comfortable headphones with premium sound."
  },
  {
    id: 2,
    name: "Smart Watch",
    category: "Electronics",
    price: 2299,
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    description: "A stylish watch for everyday use."
  },
  {
    id: 3,
    name: "Casual Sneakers",
    category: "Fashion",
    price: 1799,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    description: "Lightweight sneakers for everyday comfort."
  },
  {
    id: 4,
    name: "Travel Backpack",
    category: "Accessories",
    price: 999,
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    description: "A practical backpack for work and travel."
  },
  {
    id: 5,
    name: "Classic Sunglasses",
    category: "Accessories",
    price: 699,
    rating: 4.1,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600",
    description: "Modern sunglasses with a timeless design."
  },
  {
    id: 6,
    name: "Minimalist T-Shirt",
    category: "Fashion",
    price: 499,
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
    description: "A versatile T-shirt for everyday outfits."
  }
];

const $ = selector => document.querySelector(selector);
const productList = $("#productList");
const overlay = $("#overlay");
const toast = $("#toast");

let cart = loadCart();
let toastTimer;

function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("novaShopCart"));

    if (!Array.isArray(saved)) return [];

    return saved
      .filter(item =>
        products.some(product => product.id === item.id) &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 1 &&
        item.quantity <= 99
      )
      .map(item => ({ id: item.id, quantity: item.quantity }));
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem("novaShopCart", JSON.stringify(cart));
  } catch {
    showToast("Unable to save cart in this browser.");
  }
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function renderProducts() {
  const query = $("#search").value.trim().toLowerCase();
  const category = $("#category").value;
  const sort = $("#sort").value;

  let filtered = products.filter(product => {
    const matchesText =
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query);

    const matchesCategory =
      category === "all" || product.category === category;

    return matchesText && matchesCategory;
  });

  if (sort === "low") filtered.sort((a, b) => a.price - b.price);
  if (sort === "high") filtered.sort((a, b) => b.price - a.price);
  if (sort === "rating") filtered.sort((a, b) => b.rating - a.rating);

  $("#resultCount").textContent = `${filtered.length} products`;

  if (!filtered.length) {
    productList.innerHTML = `
      <div class="empty-state">
        <h3>No products found</h3>
        <p>Try another search or category.</p>
        <button class="add-button" id="clearFilters">Clear filters</button>
      </div>
    `;
    return;
  }

  productList.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="category-badge">${product.category}</span>
      </div>

      <div class="product-info">
        <div class="rating"><span>★</span> ${product.rating}</div>
        <h3>${product.name}</h3>
        <p class="description">${product.description}</p>

        <div class="product-bottom">
          <span class="price">${formatPrice(product.price)}</span>
          <button class="add-button" data-add="${product.id}">+ Add</button>
        </div>
      </div>
    </article>
  `).join("");
}

function getCartProducts() {
  return cart.map(item => {
    const product = products.find(p => p.id === item.id);
    return product ? { ...product, quantity: item.quantity } : null;
  }).filter(Boolean);
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const item = cart.find(p => p.id === id);

  if (item) {
    if (item.quantity >= 99) {
      showToast("Maximum quantity is 99.");
      return;
    }
    item.quantity++;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart();
  renderCart();
  showToast(`${product.name} added to cart.`);
}

function updateQuantity(id, change) {
  const item = cart.find(p => p.id === id);
  if (!item) return;

  if (change > 0 && item.quantity >= 99) {
    showToast("Maximum quantity is 99.");
    return;
  }

  item.quantity += change;
  cart = cart.filter(p => p.quantity > 0);

  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
  showToast("Product removed.");
}

function renderCart() {
  const items = getCartProducts();

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );
  const shipping = subtotal === 0 || subtotal >= 2000 ? 0 : 99;

  $("#cartCount").textContent = count;
  $("#subtotal").textContent = formatPrice(subtotal);
  $("#shipping").textContent = shipping ? formatPrice(shipping) : "Free";
  $("#total").textContent = formatPrice(subtotal + shipping);

  $("#shippingMessage").textContent =
    subtotal > 0 && subtotal < 2000
      ? `Add ${formatPrice(2000 - subtotal)} more for free shipping.`
      : "";

  if (!items.length) {
    $("#cartItems").innerHTML = `
      <div class="empty-cart">
        <div style="font-size:45px">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some products to get started.</p>
      </div>
    `;
    $("#checkoutForm").hidden = true;
    return;
  }

  $("#checkoutForm").hidden = false;

  $("#cartItems").innerHTML = items.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">

      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <strong>${formatPrice(item.price)}</strong>
        <div class="quantity">
          <button data-change="-1" data-id="${item.id}"
            aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button data-change="1" data-id="${item.id}"
            aria-label="Increase quantity">+</button>
        </div>
      </div>

      <button class="remove-button" data-remove="${item.id}"
        aria-label="Remove ${item.name}">🗑️</button>
    </div>
  `).join("");
}

function openCart() {
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
  $("#closeCart").focus();
}

function closeCart() {
  overlay.classList.remove("open");
  document.body.style.overflow = "";
  $("#openCart").focus();
}

productList.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");

  if (addButton) addToCart(Number(addButton.dataset.add));

  if (event.target.closest("#clearFilters")) {
    $("#search").value = "";
    $("#category").value = "all";
    $("#sort").value = "featured";
    renderProducts();
  }
});

$("#cartItems").addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-change]");
  const removeButton = event.target.closest("[data-remove]");

  if (quantityButton) {
    updateQuantity(
      Number(quantityButton.dataset.id),
      Number(quantityButton.dataset.change)
    );
  }

  if (removeButton) {
    removeFromCart(Number(removeButton.dataset.remove));
  }
});

$("#search").addEventListener("input", renderProducts);
$("#category").addEventListener("change", renderProducts);
$("#sort").addEventListener("change", renderProducts);

$("#openCart").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);

overlay.addEventListener("click", event => {
  if (event.target === overlay) closeCart();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && overlay.classList.contains("open")) {
    closeCart();
  }
});

$("#checkoutForm").addEventListener("submit", event => {
  event.preventDefault();

  if (!cart.length) {
    showToast("Your cart is empty.");
    return;
  }

  const name = $("#name").value.trim();
  const email = $("#email").value.trim();

  if (!name || !email || !$("#email").checkValidity()) {
    showToast("Please enter valid customer details.");
    return;
  }

  const orderId = "DEMO-" + Date.now().toString().slice(-6);

  cart = [];
  saveCart();
  renderCart();
  $("#checkoutForm").reset();
  closeCart();

  showToast(`Thank you, ${name}! Demo order ${orderId} created.`);
});

$("#year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
