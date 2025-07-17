import { useSelector } from "react-redux"
import { RootState } from "../../../../../../store/store"
import { moneyAdapter } from "../../../../../../store/features/moneyHistorySlice"
import styled from "styled-components"
import DoughnutChart from "./DoughnutChart"
import ChartLegend from "./ChartLegend"
import { useEffect, useState } from "react"
import { API_ENDPOINTS } from "../../../../../../api/api"
import { CATEGORY } from "../../../../../../enums/categoryTitles"

type CategoryType = {
    title: string
    img: string
    color: string
}

export default function CategoriesChart() {
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
    
    const categoryData = filteredTransactions.reduce((acc: Record<string, number>, transaction) => {
        const category = transaction.title || 'Other'
        acc[category] = (acc[category] || 0) + transaction.amount
        return acc
    }, {})

    const categoryNames = Object.keys(categoryData)
    const amounts = Object.values(categoryData)

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
