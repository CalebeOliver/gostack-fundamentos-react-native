import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const items = await AsyncStorage.getItem('products');
      if (items) {
        setProducts(JSON.parse(items));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const newValues = [...products];
      const itemIndex = newValues.findIndex(item => item.id === product.id);
      if (itemIndex !== -1) {
        newValues[itemIndex].quantity += 1;
      } else {
        newValues.push({ ...product, quantity: 1 });
      }
      await AsyncStorage.setItem('products', JSON.stringify(newValues));
      setProducts(newValues);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const newValues = [...products];
      const itemIndex = newValues.findIndex(item => item.id === id);
      newValues[itemIndex].quantity += 1;
      await AsyncStorage.setItem('products', JSON.stringify(newValues));
      setProducts(newValues);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const newValues = [...products];
      const itemIndex = newValues.findIndex(item => item.id === id);

      if (newValues[itemIndex].quantity > 1) {
        newValues[itemIndex].quantity -= 1;
      } else {
        newValues.splice(itemIndex, 1);
      }
      await AsyncStorage.setItem('products', JSON.stringify(newValues));
      setProducts(newValues);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
