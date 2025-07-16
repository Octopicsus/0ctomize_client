import { CATEGORY } from "../enums/categoryTitles"
import { MoneyItem } from "../store/features/moneyHistorySlice"

export function getBalance(items: MoneyItem[]) {
    const income = getIncome(items)
    const expense = getExpense(items)
    return income - expense
}

export function getIncome(items: MoneyItem[]) {
    return items.filter(item => item.type === CATEGORY.INCOME).reduce((acc, item) => acc + item.amount, 0)
}

export function getExpense(items: MoneyItem[]) {
    return items.filter(item => item.type === CATEGORY.EXPENSE).reduce((acc, item) => acc + item.amount, 0)
}

export function formatAmount(amount: number): string {
    return Math.round(amount).toString()
}