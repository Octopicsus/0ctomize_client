import { createEntityAdapter, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { transactionsAPI, Transaction } from "../../api/api";
import { RootState } from "../store";
import { sessionStorageUtils } from "../../utils/sessionStorage";

export type MoneyItem = {
    // numeric id убран из ключа сущности; можно оставить как кэш для старых ссылок, но необязателен
    id?: number
    _id?: string
    userId?: string
    userEmail?: string
    type: string
    title: string
    description: string
    notes?: string
    bankAccountId?: string
    amount: number
    originalAmount: number
    originalCurrency: string
    date: string
    time: string
    img: string
    color: string
    // mark origin when imported from bank
    source?: 'bank' | 'manual'
    createdAt?: string
    updatedAt?: string
    category?: string
    categoryConfidence?: number
    categorySource?: 'auto' | 'manual' | 'rule' | 'llm' | 'override'
    categoryReason?: string
}


export const fetchTransactions = createAsyncThunk(
    'moneyHistory/fetchTransactions',
    async (_, { getState, rejectWithValue, dispatch }) => {
        try {
            const cachedData = sessionStorageUtils.getData();
            if (cachedData && cachedData.transactions.length > 0) {
                // 1) Немедленно отдаем кешированные данные для быстрой отрисовки
                        const immediate = cachedData.transactions.map((transaction: Transaction) => ({
                            ...transaction,
                            _id: transaction._id,
                        }));

                // 2) Фоном получаем актуальные данные и гидратируем стор (раньше этого не было — поэтому оставались только первые N записей)
                setTimeout(async () => {
                    try {
                        const state = getState() as RootState;
                        const token = state.auth.accessToken;
                        if (token) {
                            const response = await transactionsAPI.getTransactions(token);
                            sessionStorageUtils.updateTransactions(response.transactions);
                                            const freshMapped = response.transactions.map((t: Transaction) => ({
                                                ...t,
                                                _id: t._id,
                                            }));
                            dispatch(hydrateTransactions(freshMapped));
                        }
                    } catch {}
                }, 0);

                return immediate;
            }

            // Нет кеша — обычный полный запрос
            const state = getState() as RootState;
            const token = state.auth.accessToken;
            if (!token) throw new Error('No authentication token');

            const response = await transactionsAPI.getTransactions(token);
                    const mappedTransactions = response.transactions.map((transaction: Transaction) => ({
                        ...transaction,
                        _id: transaction._id,
                    }));
            sessionStorageUtils.updateTransactions(response.transactions);
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

export const applyCategoryBulk = createAsyncThunk(
    'moneyHistory/applyCategoryBulk',
    async ({ baseId, category, scope, createUserPattern, color, img }: { baseId: string; category: string; scope: 'one' | 'similar'; createUserPattern?: boolean; color?: string; img?: string }, { getState, rejectWithValue, dispatch }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.accessToken;
            if (!token) throw new Error('No authentication token');
            const result = await transactionsAPI.applyCategory(token, baseId, { category, scope, createUserPattern, color, img });
            // После массового обновления — обновим список (минимально можно было бы локально применить)
            await dispatch(forceRefreshTransactions());
            return result;
        } catch (e: any) {
            return rejectWithValue(e.message);
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
            _id: transaction._id, 
        }));
  }
  return []
}

// ВАЖНО: раньше использовался numeric id (mod 1_000_000) => вызывало коллизии и сжатие списка (часть транзакций терялась)
// Теперь первичный ключ сущности = Mongo _id (гарантированно уникален). Числовой id остаётся только вспомогательным.
export const moneyAdapter = createEntityAdapter<MoneyItem, string | number>({
    selectId: (m: MoneyItem) => m._id || (m.id as number | string)
})
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
        },
        hydrateTransactions: (state, action) => {
            // Полная замена на актуальные данные из бэкграунд-фетча
            moneyAdapter.setAll(state, action.payload);
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
                state.loading = true;
                state.error = null;
            })
            .addCase(createTransaction.fulfilled, (state, action) => {
                state.loading = false;
                moneyAdapter.addOne(state, action.payload);
            })
            .addCase(createTransaction.rejected, (state, action) => {
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
            .addCase(applyCategoryBulk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(applyCategoryBulk.fulfilled, (state) => { state.loading = false; })
            .addCase(applyCategoryBulk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

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

export const { clearError, clearTransactions, hydrateTransactions } = moneyHisorySlice.actions
export default moneyHisorySlice.reducer

// Reusable memoized selectors
const baseSelectors = moneyAdapter.getSelectors<RootState>((state) => state.moneyHistory)
export const selectAllTransactions = baseSelectors.selectAll
export const selectTransactionsLoaded = (state: RootState) => baseSelectors.selectTotal(state) > 0
