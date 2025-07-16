import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { categoriesAPI, CustomCategory } from "../../api/api"
import { RootState } from "../store"
import { sessionStorageUtils } from "../../utils/sessionStorage"

export type CustomCategoryState = {
  list: CustomCategory[]
  loading: boolean
  error: string | null
}

const loadInitialCategories = (): CustomCategory[] => {
  const cachedData = sessionStorageUtils.getData()
  return cachedData ? cachedData.customCategories : []
}

const initialState: CustomCategoryState = {
  list: loadInitialCategories(),
  loading: false,
  error: null
}

export const fetchUserCategories = createAsyncThunk(
  'customCategory/fetchUserCategories',
  async (_, { getState, rejectWithValue }) => {
    try {
      const cachedData = sessionStorageUtils.getData()
      if (cachedData && cachedData.customCategories.length > 0) {
        setTimeout(async () => {
          try {
            const state = getState() as RootState
            const token = state.auth.accessToken
            if (token) {
              const response = await categoriesAPI.getUserCategories(token)
              sessionStorageUtils.updateCustomCategories(response.categories)
            }
          } catch (error) {
          }
        }, 0)
        return cachedData.customCategories
      }

      const state = getState() as RootState
      const token = state.auth.accessToken
      
      if (!token) {
        throw new Error('No access token')
      }
      
      const response = await categoriesAPI.getUserCategories(token)
      sessionStorageUtils.updateCustomCategories(response.categories)
      return response.categories
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch categories')
    }
  }
)

export const createCustomCategory = createAsyncThunk(
  'customCategory/createCustomCategory',
  async (categoryData: { name: string; iconPath: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const token = state.auth.accessToken
      
      if (!token) {
        throw new Error('No access token')
      }
      
      const response = await categoriesAPI.createCategory(token, categoryData)
      sessionStorageUtils.addCustomCategory(response.category)
      return response.category
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create category')
    }
  }
)

export const updateCustomCategory = createAsyncThunk(
  'customCategory/updateCustomCategory',
  async ({ categoryId, updateData }: { categoryId: string; updateData: { name?: string; iconPath?: string } }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const token = state.auth.accessToken
      
      if (!token) {
        throw new Error('No access token')
      }
      
      await categoriesAPI.updateCategory(token, categoryId, updateData)
      sessionStorageUtils.updateCustomCategory(categoryId, updateData)
      return { categoryId, updateData }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update category')
    }
  }
)

export const deleteCustomCategory = createAsyncThunk(
  'customCategory/deleteCustomCategory',
  async (categoryId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const token = state.auth.accessToken
      
      if (!token) {
        throw new Error('No access token')
      }
      
      await categoriesAPI.deleteCategory(token, categoryId)
      sessionStorageUtils.removeCustomCategory(categoryId)
      return categoryId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete category')
    }
  }
)

const customCategorySlice = createSlice({
  name: "customCategory",
  initialState,
  reducers: {
    clearCustomCategories: (state) => {
      state.list = []
      state.error = null
      sessionStorageUtils.updateCustomCategories([])
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserCategories.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchUserCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      .addCase(createCustomCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCustomCategory.fulfilled, (state, action) => {
        state.loading = false
        state.list.push(action.payload)
      })
      .addCase(createCustomCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      .addCase(updateCustomCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCustomCategory.fulfilled, (state, action) => {
        state.loading = false
        const { categoryId, updateData } = action.payload
        const category = state.list.find(cat => cat._id === categoryId)
        if (category) {
          if (updateData.name) category.name = updateData.name
          if (updateData.iconPath) category.iconPath = updateData.iconPath
        }
      })
      .addCase(updateCustomCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      .addCase(deleteCustomCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCustomCategory.fulfilled, (state, action) => {
        state.loading = false
        state.list = state.list.filter(cat => cat._id !== action.payload)
      })
      .addCase(deleteCustomCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      .addMatcher(
        (action) => action.type === 'auth/logout' || action.type === 'auth/logoutUser/fulfilled',
        (state) => {
          state.list = []
          state.loading = false
          state.error = null
          sessionStorageUtils.clearData()
        }
      )
  }
})

export const { clearCustomCategories, clearError } = customCategorySlice.actions
export default customCategorySlice.reducer