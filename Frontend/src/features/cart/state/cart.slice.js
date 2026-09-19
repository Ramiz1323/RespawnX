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
                if (item.product._id === productId && item.variant === variantId) {
                    return {
                        ...item,
                        quantity: item.quantity + 1
                    }
                } else {
                    return item;
                }
            })
        }
    }
})

export const { setItems, setLoading, setError, addItem, incrementCartItem } = cartSlice.actions;
export default cartSlice.reducer;