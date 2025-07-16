import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type SearchState = {
    searchTerm: string
}

const initialState: SearchState = {
    searchTerm: ""
}

const searchSlice = createSlice({
    name: "search",
    initialState,
    reducers: {
        setSearchTerm(state, action: PayloadAction<string>) {
            state.searchTerm = action.payload
        },
        clearSearchTerm(state) {
            state.searchTerm = ""
        }
    }
})

export const { setSearchTerm, clearSearchTerm } = searchSlice.actions
export default searchSlice.reducer
