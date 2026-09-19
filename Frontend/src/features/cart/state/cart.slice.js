import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {
        setItems: (state, action) => {
            state.items = action.payload || [];
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        addItem: (state, action) => {
            state.items.push(action.payload);
        },
        incrementCartItem: (state, action) => {
            const { productId, variantId } = action.payload;

            state.items = state.items.map(item => {
                const itemProductId = item.product?._id ? String(item.product._id) : String(item.product);
                const itemVariantId = item.variant?._id ? String(item.variant._id) : String(item.variant);
                if (itemProductId === String(productId) && itemVariantId === String(variantId)) {
                    return {
                        ...item,
                        quantity: (Number(item.quantity) || 0) + 1
                    };
                } else {
                    return item;
                }
            });
        },
        decrementCartItem: (state, action) => {
            const { productId, variantId } = action.payload;

            state.items = state.items
                .map(item => {
                    const itemProductId = item.product?._id ? String(item.product._id) : String(item.product);
                    const itemVariantId = item.variant?._id ? String(item.variant._id) : String(item.variant);
                    if (itemProductId === String(productId) && itemVariantId === String(variantId)) {
                        return {
                            ...item,
                            quantity: (Number(item.quantity) || 1) - 1
                        };
                    } else {
                        return item;
                    }
                })
                .filter(item => item.quantity > 0);
        }
    }
})

export const { setItems, setLoading, setError, addItem, incrementCartItem, decrementCartItem } = cartSlice.actions;
export default cartSlice.reducer;