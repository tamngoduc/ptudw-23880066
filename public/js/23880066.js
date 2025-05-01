"use strict";

const addCart = async (id, quantity) => {
  const res = await fetch("/products/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, quantity }),
  });
  if (!res.ok) throw new Error(`Failed to add product to cart: ${res.status}`);
  const json = await res.json();
  document.getElementById("cart-quantity").innerText = `(${json.quantity})`;
};

const removeCart = async (id) => {
  if (confirm("Are you sure you want to remove this product?") === false)
    return;
  const res = await fetch("/products/cart", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  if (res.status !== 200)
    throw new Error(`Failed to remove product from cart: ${res.status}`);
  const json = await res.json();
  if (!json.quantity) {
    document.querySelector(
      ".cart-page .container"
    ).innerHTML = `<div class="text-center border py-3"><h3>Your cart is empty!</h3></div>`;
    return;
  }
  document.getElementById("cart-quantity").innerText = `(${json.quantity})`;
  document.getElementById("subtotal").innerText = `$${json.subtotal}`;
  document.getElementById("total").innerText = `$${json.total}`;
  document.getElementById(`product${id}`).remove();
};

const updateCart = async (id, quantity) => {
  if (!quantity) removeCart(id);
  const res = await fetch("/products/cart", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, quantity }),
  });
  if (res.status !== 200)
    throw new Error(`Failed to update cart: ${res.status}`);
  const json = await res.json();
  document.getElementById("cart-quantity").innerText = `(${json.quantity})`;
  document.getElementById("subtotal").innerText = `$${json.subtotal}`;
  document.getElementById("total").innerText = `$${json.total}`;
  document.getElementById(`total${id}`).innerText = `$${json.item.total}`;
};

const clearCart = async () => {
  if (confirm("Are you sure you want to clear the cart?") === false) return;
  const res = await fetch("/products/cart/all", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (res.status !== 200)
    throw new Error(`Failed to clear cart: ${res.status}`);
  document.getElementById("cart-quantity").innerText = `(0)`;
  document.querySelector(
    ".cart-page .container"
  ).innerHTML = `<div class="text-center border py-3"><h3>Your cart is empty!</h3></div>`;
};

const placeOrder = async (e) => {
  e.preventDefault();
  const addressId = document.querySelector('input[name="addressId"]:checked');
  if (!addressId.value && !e.target.checkValidity()) {
    return e.target.reportValidity();
  }
  return e.target.submit();
};
