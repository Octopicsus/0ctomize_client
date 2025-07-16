import { createEntityAdapter, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { transactionsAPI, Transaction } from "../../api/api";
import { RootState } from "../store";
import { sessionStorageUtils } from "../../utils/sessionStorage";

export type MoneyItem = {
    id: number
    _id?: string
    userId?: string
    userEmail?: string
    type: string
    title: string
    description: string
    notes?: string
    amount: number
    originalAmount: number
    originalCurrency: string
    date: string
    time: string
    img: string
    color: string
    createdAt?: string
    updatedAt?: string
}


export const fetchTransactions = createAsyncThunk(
    'moneyHistory/fetchTransactions',
    async (_, { getState, rejectWithValue }) => {
        try {
            const cachedData = sessionStorageUtils.getData()
            if (cachedData && cachedData.transactions.length > 0) {
                setTimeout(async () => {
                    try {
                        const state = getState() as RootState;
                        const token = state.auth.accessToken;
                        if (token) {
                            const response = await transactionsAPI.getTransactions(token);
                            sessionStorageUtils.updateTransactions(response.transactions)
                        }
                    } catch (error) {
                    }
                }, 0)
                
                return cachedData.transactions.map((transaction: Transaction) => ({
                    ...transaction,
                    id: parseInt(transaction._id || '0', 16) % 1000000,
                    _id: transaction._id, 
                }));
            }

            const state = getState() as RootState;
            const token = state.auth.accessToken;
            
            if (!token) {
                throw new Error('No authentication token');
            }

            const response = await transactionsAPI.getTransactions(token);
            const mappedTransactions = response.transactions.map((transaction: Transaction) => ({
                ...transaction,
                id: parseInt(transaction._id || '0', 16) % 1000000, 
                _id: transaction._id, 
            }));
            
            sessionStorageUtils.updateTransactions(response.transactions)
            return mappedTransactions;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const forceRefreshTransactions = createAsyncThunk(
    'moneyHistory/forceRefreshTransactions',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.accessToken;
            
            if (!token) {
                throw new Error('No authentication token');
            }

            const response = await transactionsAPI.getTransactions(token);
            const mappedTransactions = response.transactions.map((transaction: Transaction) => ({
                ...transaction,
                id: parseInt(transaction._id || '0', 16) % 1000000,
                _id: transaction._id,
            }));
            
            sessionStorageUtils.updateTransactions(response.transactions)
            return mappedTransactions;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createTransaction = createAsyncThunk(
    'moneyHistory/createTransaction',
    async (transactionData: Omit<MoneyItem, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>, { getState, rejectWithValue }) => {
        try {
            console.log('createTransaction - отправляем данные на сервер:', transactionData)
            
            const state = getState() as RootState;
            const token = state.auth.accessToken;
            
            if (!token) {
                throw new Error('No authentication token');
            }

            const response = await transactionsAPI.createTransaction(token, transactionData);
            console.log('createTransaction - ответ сервера:', response)
            
            const mappedTransaction = {
                ...response,
                id: parseInt(response._id || '0', 16) % 1000000,
                _id: response._id, 
            };
            
            console.log('createTransaction - обработанная транзакция:', mappedTransaction)
            
            sessionStorageUtils.addTransaction(response);
            return mappedTransaction;
        } catch (error: any) {
            console.error('createTransaction - ошибка:', error)
            return rejectWithValue(error.message);
        }
    }
);

export const updateTransaction = createAsyncThunk(
    'moneyHistory/updateTransaction',
    async ({ transactionId, updateData }: { transactionId: string, updateData: Partial<MoneyItem> }, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.accessToken;
            
            if (!token) {
                throw new Error('No authentication token');
            }

            const response = await transactionsAPI.updateTransaction(token, transactionId, updateData);
            const mappedTransaction = {
                ...response,
                id: parseInt(response._id || '0', 16) % 1000000,
                _id: response._id, 
            };
            
            sessionStorageUtils.updateTransaction(transactionId, response);
            return mappedTransaction;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteTransaction = createAsyncThunk(
    'moneyHistory/deleteTransaction',
    async ({ transactionId, itemId }: { transactionId: string, itemId: number }, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.accessToken;
            
            if (!token) {
                throw new Error('No authentication token');
            }

            await transactionsAPI.deleteTransaction(token, transactionId);
            sessionStorageUtils.removeTransaction(transactionId);
            return itemId;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const loadInitialTransactions = (): MoneyItem[] => {
  const cachedData = sessionStorageUtils.getData()
  if (cachedData && cachedData.transactions.length > 0) {
    return cachedData.transactions.map((transaction: Transaction) => ({
      ...transaction,
      id: parseInt(transaction._id || '0', 16) % 1000000,
      _id: transaction._id, 
    }));
  }
  return []
}

export const moneyAdapter = createEntityAdapter<MoneyItem>()
const initialState = moneyAdapter.getInitialState({
    loading: false,
    error: null as string | null,
}, loadInitialTransactions())

const moneyHisorySlice = createSlice({
    name: 'moneyHistory',
    initialState,

    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearTransactions: (state) => {
            moneyAdapter.removeAll(state);
            state.error = null;
            sessionStorageUtils.updateTransactions([]);
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.loading = false;
                moneyAdapter.setAll(state, action.payload);
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(createTransaction.pending, (state) => {
                console.log('Redux: createTransaction.pending')
                state.loading = true;
                state.error = null;
            })
            .addCase(createTransaction.fulfilled, (state, action) => {
                console.log('Redux: createTransaction.fulfilled', action.payload)
                console.log('Redux: состояние до добавления транзакции:', moneyAdapter.getSelectors().selectTotal(state))
                state.loading = false;
                moneyAdapter.addOne(state, action.payload);
                console.log('Redux: состояние после добавления транзакции:', moneyAdapter.getSelectors().selectTotal(state))
            })
            .addCase(createTransaction.rejected, (state, action) => {
                console.log('Redux: createTransaction.rejected', action.payload)
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(updateTransaction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTransaction.fulfilled, (state, action) => {
                state.loading = false;
                moneyAdapter.upsertOne(state, action.payload);
            })
            .addCase(updateTransaction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(deleteTransaction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteTransaction.fulfilled, (state, action) => {
                state.loading = false;
                moneyAdapter.removeOne(state, action.payload);
            })
            .addCase(deleteTransaction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(forceRefreshTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(forceRefreshTransactions.fulfilled, (state, action) => {
                state.loading = false;
                moneyAdapter.setAll(state, action.payload);
            })
            .addCase(forceRefreshTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            
            .addMatcher(
                (action) => action.type === 'auth/logout' || action.type === 'auth/logoutUser/fulfilled',
                (state) => {
                    moneyAdapter.removeAll(state);
                    state.loading = false;
                    state.error = null;
                    sessionStorageUtils.clearData();
                }
            );
    }
})

export const { clearError, clearTransactions } = moneyHisorySlice.actions
export default moneyHisorySlice.reducer
