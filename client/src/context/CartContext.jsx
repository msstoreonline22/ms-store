import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "ms-store-cart";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = ({ product, size, color = "Default", quantity = 1 }) => {
    if (!product) return;

    if (!size) {
      toast.error("Please select a size");
      return;
    }

    if (product.stock <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    const safeColor = color || "Default";
    const cartKey = `${product._id}-${size}-${safeColor}`;

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.cartKey === cartKey);

      if (existingItem) {
        return currentItems.map((item) =>
          item.cartKey === cartKey
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, product.stock),
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          cartKey,
          productId: product._id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || "",
          stock: product.stock,
          size,
          color: safeColor,
          quantity: Math.min(quantity, product.stock),
        },
      ];
    });

    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = (cartKey, quantity) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.cartKey === cartKey
            ? {
                ...item,
                quantity: Math.max(1, Math.min(Number(quantity), item.stock)),
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (cartKey) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.cartKey !== cartKey)
    );

    toast.success("Item removed from cart");
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    cartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}