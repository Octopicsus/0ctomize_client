import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { CATEGORY } from "../../enums/categoryTitles"

type CategoryState = {
    category: string
}

const initialState: CategoryState = {
    category: CATEGORY.EXPENSE
}

export const categorySlice = createSlice({
    name: 'selectedCategory',
    initialState,
    reducers: {
        setCategory(state, action: PayloadAction<string>) {
            state.category = action.payload
        }
    }
})

export const { setCategory } = categorySlice.actions
export default categorySlice.reducer