import { Transaction, CustomCategory } from '../api/api'

export interface UserProfile {
  id: string
  email: string
  name?: string
  picture?: string
  createdAt?: string
  authProvider?: string
}

export interface SessionStorageData {
  transactions: Transaction[]
  customCategories: CustomCategory[]
  userProfile: UserProfile | null
  lastUpdated: number
}

const SESSION_STORAGE_KEY = 'exam_spa_cache'
const CACHE_DURATION = 5 * 60 * 1000 

export const sessionStorageUtils = {
  getData: (): SessionStorageData | null => {
    try {
      const data = sessionStorage.getItem(SESSION_STORAGE_KEY)
      if (!data) return null
      const parsed = JSON.parse(data) as SessionStorageData
      
      if (Date.now() - parsed.lastUpdated > CACHE_DURATION) {
        sessionStorageUtils.clearData()
        return null
      }
      
      return parsed
    } catch (error) {
      console.error('Error reading from sessionStorage:', error)
      return null
    }
  },

  setData: (data: Partial<SessionStorageData>): void => {
    try {
      const currentData = sessionStorageUtils.getData() || {
        transactions: [],
        customCategories: [],
        userProfile: null,
        lastUpdated: Date.now()
      }
      
      const updatedData: SessionStorageData = {
        ...currentData,
        ...data,
        lastUpdated: Date.now()
      }
      
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedData))
    } catch (error) {
      console.error('Error writing to sessionStorage:', error)
    }
  },

  updateTransactions: (transactions: Transaction[]): void => {
    sessionStorageUtils.setData({ transactions })
  },

  updateCustomCategories: (customCategories: CustomCategory[]): void => {
    sessionStorageUtils.setData({ customCategories })
  },

  addTransaction: (transaction: Transaction): void => {
    const data = sessionStorageUtils.getData()
    if (data) {
      const updatedTransactions = [...data.transactions, transaction]
      sessionStorageUtils.updateTransactions(updatedTransactions)
    }
  },

  updateTransaction: (transactionId: string, updatedTransaction: Partial<Transaction>): void => {
    const data = sessionStorageUtils.getData()
    if (data) {
      const updatedTransactions = data.transactions.map(t => 
        t._id === transactionId ? { ...t, ...updatedTransaction } : t
      )
      sessionStorageUtils.updateTransactions(updatedTransactions)
    }
  },

  removeTransaction: (transactionId: string): void => {
    const data = sessionStorageUtils.getData()
    if (data) {
      const updatedTransactions = data.transactions.filter(t => t._id !== transactionId)
      sessionStorageUtils.updateTransactions(updatedTransactions)
    }
  },

  addCustomCategory: (category: CustomCategory): void => {
    const data = sessionStorageUtils.getData()
    if (data) {
      const updatedCategories = [...data.customCategories, category]
      sessionStorageUtils.updateCustomCategories(updatedCategories)
    }
  },

  updateCustomCategory: (categoryId: string, updatedCategory: Partial<CustomCategory>): void => {
    const data = sessionStorageUtils.getData()
    if (data) {
      const updatedCategories = data.customCategories.map(c => 
        c._id === categoryId ? { ...c, ...updatedCategory } : c
      )
      sessionStorageUtils.updateCustomCategories(updatedCategories)
    }
  },

  removeCustomCategory: (categoryId: string): void => {
    const data = sessionStorageUtils.getData()
    if (data) {
      const updatedCategories = data.customCategories.filter(c => c._id !== categoryId)
      sessionStorageUtils.updateCustomCategories(updatedCategories)
    }
  },

  clearData: (): void => {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing sessionStorage:', error)
    }
  },

  hasValidData: (): boolean => {
    const data = sessionStorageUtils.getData()
    return data !== null
  },

  updateUserProfile: (userProfile: UserProfile | null): void => {
    sessionStorageUtils.setData({ userProfile })
  },
}