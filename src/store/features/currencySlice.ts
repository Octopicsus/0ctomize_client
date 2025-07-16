import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type CurrencyState = {
    from: string
    to: string
}

const initialState: CurrencyState = {
    from: 'CZK',
    to: 'CZK'
}

export const currencySlice = createSlice({
    name: 'currency',
    initialState,
    reducers: {
        setCurrency(state, action: PayloadAction<string>) {
            state.from = state.to
            state.to = action.payload
            localStorage.setItem('selectedCurrency', action.payload)
        },
        setCurrencyPair(state, action: PayloadAction<{ from: string, to: string }>) {
            state.from = action.payload.from
            state.to = action.payload.to
            localStorage.setItem('selectedCurrency', action.payload.to)
        },
        swapCurrencies(state) {
            const temp = state.from
            state.from = state.to
            state.to = temp
            localStorage.setItem('selectedCurrency', state.to)
        }
    }
})

export const { setCurrency, setCurrencyPair, swapCurrencies } = currencySlice.actions
export default currencySlice.reducer