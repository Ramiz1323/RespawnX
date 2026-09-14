import { useDispatch } from "react-redux";
import { addItem as addItemToCart, setItems } from "../state/cart.slice.js";
import { addItem as addItemApi } from "../service/cart.api.js";
import { getCart } from "../service/cart.api.js";

export const useCart = () => {
    const dispatch = useDispatch();

    async function handleAddItem({productId, variantId}) {
        const data = await addItemApi({productId, variantId})
        
        dispatch(addItemToCart({productId, variantId}))

        return data
    }

    async function handleGetCart() {
        const data = await getCart();
        dispatch(setItems(data.cart.items));
    }

    return {
        handleAddItem,
        handleGetCart
    }
}