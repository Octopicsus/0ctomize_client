import { useSelector } from "react-redux"
import { RootState } from "../../../../../../store/store"
import { moneyAdapter } from "../../../../../../store/features/moneyHistorySlice"
import styled from "styled-components"
import DoughnutChart from "./DoughnutChart"
import ChartLegend from "./ChartLegend"
import { useEffect, useState } from "react"
import { API_ENDPOINTS } from "../../../../../../api/api"
import { CATEGORY } from "../../../../../../enums/categoryTitles"
import { DashboardTimeRange } from '../Categories'

type CategoryType = {
    title: string
    img: string
    color: string
}

export default function CategoriesChart({ range }: { range: DashboardTimeRange }) {
    const selectAll = moneyAdapter.getSelectors(
        (state: RootState) => state.moneyHistory
    ).selectAll
    const transactions = useSelector(selectAll)
    const selectedCategory = useSelector((state: RootState) => state.category.category)
    const [categories, setCategories] = useState<CategoryType[]>([])

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.CATEGORIES)
                const data = await response.json()
                
                if (selectedCategory === CATEGORY.INCOME) {
                    setCategories(data.income || [])
                } else if (selectedCategory === CATEGORY.EXPENSE) {
                    setCategories(data.expense || [])
                } else {
                    setCategories([...(data.income || []), ...(data.expense || [])])
                }
            } catch (error) {
                console.error('Error loading categories:', error)
                setCategories([])
            }
        }
        loadCategories()
    }, [selectedCategory])

    const filteredTransactions = selectedCategory === CATEGORY.ALL 
        ? transactions 
        : transactions.filter(transaction => transaction.type === selectedCategory)
    
    const now = new Date()
    const fromDate = (() => {
        switch(range){
            case 'Day': return new Date(now.getFullYear(), now.getMonth(), now.getDate()-1)
            case 'Week': return new Date(now.getFullYear(), now.getMonth(), now.getDate()-7)
            case 'Month': return new Date(now.getFullYear(), now.getMonth(), now.getDate()-30)
            case '6 Month': return new Date(now.getFullYear(), now.getMonth()-6, now.getDate())
            case 'Year': return new Date(now.getFullYear()-1, now.getMonth(), now.getDate())
            case '5 Years': return new Date(now.getFullYear()-5, now.getMonth(), now.getDate())
            case 'Full': default: return new Date(0)
        }
    })()

    const rangeFiltered = filteredTransactions.filter(tx => {
        const d = new Date(`${tx.date}T${tx.time}`)
        return d >= fromDate && d <= now
    })

    // Aggregate by category (not raw title). Fallback to 'Other' if empty/Uncategorized.
    const rawCategoryTotals = rangeFiltered.reduce((acc: Record<string, number>, tx) => {
        const cat = (tx.category && tx.category !== 'Uncategorized') ? tx.category : 'Other'
        const value = Math.abs(tx.amount) // treat both expense/income as positive weight for distribution
        acc[cat] = (acc[cat] || 0) + value
        return acc
    }, {})

    // Sort categories by total desc for stable legend
    const sortedEntries = Object.entries(rawCategoryTotals).sort((a,b) => b[1]-a[1])
    const categoryNames = sortedEntries.map(e => e[0])
    const amounts = sortedEntries.map(e => e[1])

    const getCategoryColor = (categoryTitle: string) => {
        const category = categories.find(cat => cat.title === categoryTitle)
        return category?.color || '#c2c2c2' 
    }

    const colors = categoryNames.map(category => getCategoryColor(category))

    const getEmptyStateMessage = () => {
        if (selectedCategory === CATEGORY.INCOME) {
            return "No income data available"
        } else if (selectedCategory === CATEGORY.EXPENSE) {
            return "No expense data available"
        } else {
            return "No transaction data available"
        }
    }

    if (categoryNames.length === 0 || filteredTransactions.length === 0) {
        return (
            <EmptyState>
                <EmptyText>{getEmptyStateMessage()}</EmptyText>
            </EmptyState>
        )
    }

    return (
        <Wrapper>
            <DoughnutChart 
                categories={categoryNames}
                amounts={amounts}
                colors={colors}
            />
            <Spacer />
            <ChartLegend 
                categories={categoryNames}
                colors={colors}
            />
        </Wrapper>
    )
}

const Wrapper = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #45454522;
    border-radius: 8px;
    overflow: hidden;
`

const Spacer = styled.div`
    height: 50px;
    flex-shrink: 0;
`

const EmptyState = styled.div`
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
`

const EmptyText = styled.p`
    font-size: 14px;
    color: #999;
    margin: 0;
`
