// Shared cart data for the static bookstore.
// localStorage keeps quantities when you move between Catalogue and Cart.

const BOOKS = {
    "computer-science": {
        name: "Computer Science",
        author: "Robert Sedgewick",
        price: 4000,
        image: "image2.png"
    },
    "operating-system": {
        name: "Operating System Concepts",
        author: "Dr. Ikvinderpal Singh",
        price: 3800,
        image: "image3.png"
    },
    "database-system": {
        name: "Database System Concepts",
        author: "Abraham Silberschatz",
        price: 2500,
        image: "image4.png"
    }
};

const CART_KEY = "glBajajBookCart";

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || {};
    } catch (error) {
        return {};
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getQuantity(cart, id) {
    return Math.max(1, Number(cart[id]) || 1);
}

function setQuantity(id, quantity) {
    const cart = getCart();
    cart[id] = Math.max(1, Number(quantity) || 1);
    saveCart(cart);
}

function addToCart(id, quantity) {
    const cart = getCart();
    // The selected catalogue quantity becomes the cart quantity.
    cart[id] = Math.max(1, Number(quantity) || 1);
    saveCart(cart);
}

function setupCatalogue() {
    const rows = document.querySelectorAll("[data-book-id]");
    if (!rows.length) return;

    const cart = getCart();

    rows.forEach(row => {
        const id = row.dataset.bookId;
        const quantityElement = row.querySelector(".quantity");
        let quantity = cart[id] ? getQuantity(cart, id) : 2;
        quantityElement.textContent = quantity;

        row.querySelector(".qty-plus").addEventListener("click", () => {
            quantity++;
            quantityElement.textContent = quantity;
            // Keep the selected quantity ready for Add to Cart.
            setQuantity(id, quantity);
        });

        row.querySelector(".qty-minus").addEventListener("click", () => {
            if (quantity > 1) {
                quantity--;
                quantityElement.textContent = quantity;
                setQuantity(id, quantity);
            }
        });

        row.querySelector(".btn-add").addEventListener("click", () => {
            addToCart(id, quantity);
            const message = document.getElementById("cart-message");
            if (message) {
                message.textContent = `${BOOKS[id].name} added to cart (${quantity} item${quantity > 1 ? "s" : ""}).`;
            }
        });
    });
}

function renderCart() {
    const cartBody = document.getElementById("cart-body");
    if (!cartBody) return;

    const cart = getCart();
    cartBody.innerHTML = "";
    let total = 0;
    let hasItems = false;

    Object.keys(cart).forEach(id => {
        if (!BOOKS[id]) return;

        const quantity = getQuantity(cart, id);
        const book = BOOKS[id];
        const amount = book.price * quantity;
        total += amount;
        hasItems = true;

        const row = document.createElement("tr");
        row.dataset.bookId = id;
        row.innerHTML = `
            <td><img class="book-img" src="${book.image}" alt="${book.name}"></td>
            <td>${book.name}</td>
            <td>${book.author}</td>
            <td>Rs. ${book.price.toLocaleString("en-IN")}</td>
            <td>
                <div class="quantity-control">
                    <button type="button" class="qty-btn qty-minus">−</button>
                    <span class="quantity">${quantity}</span>
                    <button type="button" class="qty-btn qty-plus">+</button>
                </div>
            </td>
            <td><button type="button" class="action-btn btn-remove">Remove</button></td>
        `;

        row.querySelector(".qty-plus").addEventListener("click", () => {
            setQuantity(id, quantity + 1);
            renderCart();
        });

        row.querySelector(".qty-minus").addEventListener("click", () => {
            if (quantity > 1) {
                setQuantity(id, quantity - 1);
                renderCart();
            }
        });

        row.querySelector(".btn-remove").addEventListener("click", () => {
            const updatedCart = getCart();
            delete updatedCart[id];
            saveCart(updatedCart);
            renderCart();
        });

        cartBody.appendChild(row);
    });

    if (!hasItems) {
        cartBody.innerHTML = `<tr><td colspan="6">Your cart is empty.</td></tr>`;
    }

    document.getElementById("cart-total").textContent = total.toLocaleString("en-IN");
}

document.addEventListener("DOMContentLoaded", () => {
    setupCatalogue();
    renderCart();
});
