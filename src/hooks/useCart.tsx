import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
     const storagedCart = localStorage.getItem('@RocketShoes:cart');

     if (storagedCart) {
       return JSON.parse(storagedCart);
     }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {     // updatedCart recebe o array de cart, porem usando [...cart] 
              //  eu estou criando um novo array com os valores de cart;
         
        const updatedCart = [...cart];
        const stock = await api.get(`/stock/${productId}`)
        const findProduct = updatedCart.find(value => value.id === productId)
        const stockAmount = stock.data.amount
        const amount = findProduct ? findProduct.amount: 0
        const addAmount = amount + 1

        if(amount >= stockAmount) {
          toast.error('Quantidade solicitada fora de estoque');
          return;
        }

        if (findProduct) {
          findProduct.amount = addAmount
        } else {
          const products = await api.get(`/products/${productId}`)
          
          const newProduct = {
            ...products.data,
            amount: 1
          }
          updatedCart.push(newProduct)     
        } 
        setCart(updatedCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))       
    } catch {
      toast.error('Erro na adi????o do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart]
      const findProduct = updatedCart.find(value => value.id === productId)
          
      if (findProduct){
        const removeProduct = updatedCart.filter((value =>
          value.id != productId)
     )
      setCart(removeProduct)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))        
      }else{
        toast.error('Erro na remo????o do produto');
        return;
      }
    } catch {
      toast.error('Erro na remo????o do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    
        
    try {

      const updatedCart = [...cart];
      const findProduct = updatedCart.find(value => value.id === productId)
      const stock = await api.get(`/stock/${productId}`)
      const stockAmount = stock.data.amount

      if(amount > stockAmount){
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if(amount <= 0){
        toast.error('Erro na altera????o de quantidade do produto');
        return;
     
      }
      
      if(findProduct) {
        findProduct.amount = amount
        setCart(updatedCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
        
       } else {
        toast.error('Erro na altera????o de quantidade do produto')
        return;     
      }
     
    } catch {
      toast.error('Erro na altera????o de quantidade do produto');
      return;
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}



//yarn test src/__tests__/components/Header.spec.tsx
//yarn test src/__tests__/hooks/useCart.spec.tsx
//yarn test src/__tests__/cart/index.spec.tsx
//yarn test src/__tests__/pages/Cart/index.spec.tsx
