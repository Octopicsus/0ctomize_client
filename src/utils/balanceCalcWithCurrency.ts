import { CATEGORY } from "../enums/categoryTitles"
import { MoneyItem } from "../store/features/moneyHistorySlice"

export function getBalance(items: MoneyItem[]): number {
    const income = getIncome(items)
    const expense = getExpense(items)
    return income - expense
}

export function getIncome(items: MoneyItem[]): number {
    return items
        .filter(item => item.type === CATEGORY.INCOME)
        .reduce((acc, item) => acc + item.amount, 0)
}

export function getExpense(items: MoneyItem[]): number {
    return items
        .filter(item => item.type === CATEGORY.EXPENSE)
        .reduce((acc, item) => acc + item.amount, 0)
}

export function formatAmount(amount: number): string {
    return Math.round(amount).toString()
}

export function getBalanceInCurrency(items: MoneyItem[]): number {
    const incomeInCurrency = getIncomeInCurrency(items)
    const expenseInCurrency = getExpenseInCurrency(items)
    return incomeInCurrency - expenseInCurrency
}

export function getIncomeInCurrency(items: MoneyItem[]): number {
    return items
        .filter(item => item.type === CATEGORY.INCOME)
        .reduce((acc, item) => {
            return acc + item.amount
        }, 0)
}

export function getExpenseInCurrency(items: MoneyItem[]): number {
    return items
        .filter(item => item.type === CATEGORY.EXPENSE)
        .reduce((acc, item) => {
            return acc + item.amount
        }, 0)
}
