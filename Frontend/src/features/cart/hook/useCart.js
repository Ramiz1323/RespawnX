import { useDispatch } from "react-redux";
import { addItem as addItemToCart, setItems, setLoading, setError, incrementCartItem } from "../state/cart.slice.js";
import { addItem as addItemApi, getCart, incrementCartItemAPI } from "../service/cart.api.js";

export const useCart = () => {
    const dispatch = useDispatch();

    async function handleAddItem({ productId, variantId }) {
        dispatch(setLoading(true));
        try {
            const data = await addItemApi({ productId, variantId });
            dispatch(addItemToCart({ productId, variantId }));
            return data;
        } catch (err) {
            dispatch(setError(err?.response?.data?.message || err.message));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetCart() {
        dispatch(setLoading(true));
        try {
            const data = await getCart();
            dispatch(setItems(data.cart.items));
            return data.cart;
        } catch (err) {
            dispatch(setError(err?.response?.data?.message || err.message));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleIncrementCartItem({ productId, variantId }) {
        dispatch(setLoading(true));
        try {
            const data = await incrementCartItemAPI({ productId, variantId });
            dispatch(incrementCartItem({ productId, variantId }));
            return data;
        } catch (err) {
            dispatch(setError(err?.response?.data?.message || err.message));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    }

    return {
        handleAddItem,
        handleGetCart,
        handleIncrementCartItem
    };
};

