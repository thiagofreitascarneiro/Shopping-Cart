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
        const amount = findProduct ? stockAmount: 0
        
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
        console.log(stock)
        console.log(findProduct)
        console.log(stockAmount)
        console.log(amount)
        console.log(updatedCart)
                 
        if (findProduct) {
          
          return
        } 
        if(amount > stockAmount) {
          toast.error('Quantidade solicitada fora de estoque');
        }
        else{
          
        }
            
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart]
      const findProduct = updatedCart.find(value => value.id === productId)
      
      
      if (findProduct){
       delete updatedCart[productId]
       localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
      }else{
        toast.error('Erro na remoção do produto');
      }


    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    const updatedCart = [...cart];
    const stock = await api.get(`/stock/${productId}`)
    const stockAmount = stock.data.amount
      
    try {
      if( amount <= 0) {
        return 
      }

      if ( amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
      }

    localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
    } catch {
      toast.error('Quantidade solicitada fora de estoque');
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