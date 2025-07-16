import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type SelectedMoneyItemState = {
    id: number | null 
}

const initialState: SelectedMoneyItemState = {
    id: null
}

const selectedMoneyItemSlice = createSlice({
    name: "selectedMoneyItem",
    initialState,
    reducers: {
        setSelectedMoneyItemId(state, action: PayloadAction<number>){
            state.id = action.payload
        },
        clearSelectedMoneyItemId(state){
            state.id = null
        },
    },
})

export const {setSelectedMoneyItemId, clearSelectedMoneyItemId} = selectedMoneyItemSlice.actions

export default selectedMoneyItemSlice.reducer
