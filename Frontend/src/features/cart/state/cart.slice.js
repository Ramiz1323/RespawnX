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
        clearCart: (state) => {
            state.items = [];
            state.error = null;
        }
    }
})

export const { setItems, setLoading, setError, addItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;