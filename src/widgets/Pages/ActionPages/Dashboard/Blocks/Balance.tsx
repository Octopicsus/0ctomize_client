import styled from "styled-components"
import colors from "../../../../../ui/colorsPalette"
import { useSelector, useDispatch } from "react-redux"
import { useState } from "react"
import { RootState } from "../../../../../store/store"
import { getBalance, getIncome, getExpense, formatAmount } from "../../../../../utils/balanceCalc"
import { moneyAdapter } from "../../../../../store/features/moneyHistorySlice"
import { setCategory } from "../../../../../store/features/categorySlice"
import { CATEGORY } from "../../../../../enums/categoryTitles"


export default function Balance() {
    const dispatch = useDispatch()
    const [period, setPeriod] = useState<'month' | 'year'>('month')
    const allTransactions = useSelector((state: RootState) => moneyAdapter.getSelectors().selectAll(state.moneyHistory))

    const filterTransactionsByPeriod = (transactions: any[], period: 'month' | 'year') => {
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth()

        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date)

            if (period === 'month') {
                const isInMonthRange = isInCurrentMonthRange(transactionDate, currentYear, currentMonth)

                return isInMonthRange
            } else {
                return transactionDate.getFullYear() === currentYear
            }
        })
    }

    const isInCurrentMonthRange = (date: Date, currentYear: number, currentMonth: number) => {
        const startDate = getLastWorkingDayOfPreviousMonth(currentYear, currentMonth)

        const endDate = getLastWorkingDayOfCurrentMonth(currentYear, currentMonth)
        endDate.setDate(endDate.getDate() - 1)

        return date >= startDate && date <= endDate
    }

    const getLastWorkingDayOfPreviousMonth = (currentYear: number, currentMonth: number) => {
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear

        const lastDayOfPrevMonth = new Date(prevYear, prevMonth + 1, 0)
        let lastWorkingDay = new Date(lastDayOfPrevMonth)

        while (lastWorkingDay.getDay() === 0 || lastWorkingDay.getDay() === 6) {
            lastWorkingDay.setDate(lastWorkingDay.getDate() - 1)
        }

        return lastWorkingDay
    }

    const getLastWorkingDayOfCurrentMonth = (currentYear: number, currentMonth: number) => {
        const lastDayOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0)
        let lastWorkingDay = new Date(lastDayOfCurrentMonth)

        while (lastWorkingDay.getDay() === 0 || lastWorkingDay.getDay() === 6) {
            lastWorkingDay.setDate(lastWorkingDay.getDate() - 1)
        }

        return lastWorkingDay
    }

    const transactions = filterTransactionsByPeriod(allTransactions, period)

    const totalBalance = getBalance(allTransactions)
    const totalIncome = getIncome(transactions)
    const totalExpense = getExpense(transactions)

    const difference = Math.abs(totalIncome - totalExpense)
    const maxAmount = Math.max(totalIncome, totalExpense)

    const incomePercent = maxAmount > 0 ? (difference / maxAmount) * 100 : 0
    const expensePercent = 100 - incomePercent

    const handleIncomeClick = () => {
        dispatch(setCategory(CATEGORY.INCOME))
    }

    const handleExpenseClick = () => {
        dispatch(setCategory(CATEGORY.EXPENSE))
    }

    const handleTotalClick = () => {
        dispatch(setCategory(CATEGORY.ALL))
    }

    const handlePeriodToggle = () => {
        setPeriod(period === 'month' ? 'year' : 'month')
    }

    return (
        <Wrapper>
            <Title>Total Balance</Title>
            <More>
                <Button onClick={handlePeriodToggle}>{period}</Button>
            </More>
            <Totale onClick={handleTotalClick}>
                <Value>{formatAmount(totalBalance)} <Cents>,00</Cents> <Currency>Kc</Currency></Value>
                <Gauge>
                    <IncomeGauge width={incomePercent} />
                    <ExpenseGauge width={expensePercent} />
                </Gauge>
            </Totale>
            <IncomeBlock onClick={handleIncomeClick}>
                <BlockTitle>Income</BlockTitle>
                <BlockValue>{formatAmount(totalIncome)} <BlockCents>,00</BlockCents> <SubCur>Kc</SubCur></BlockValue>
            </IncomeBlock>
            <ExpenseBlock onClick={handleExpenseClick}>
                <BlockTitle>Expenses</BlockTitle>
                <BlockValue>{formatAmount(totalExpense)} <BlockCents>,00</BlockCents> <SubCur>Kc</SubCur></BlockValue>
            </ExpenseBlock>
        </Wrapper>
    )
}

const Wrapper = styled.div`
    grid-area: balance;
    background-color: #80808018;
    border-radius: 10px;
    padding: 5px;
    padding-right: 10px;
    display: grid;
    grid-template-areas:
        "title title more"
        "total total income"
        "total total expenses";
    grid-template-columns: 0.8fr 1fr 1fr;
    grid-template-rows: 0.9fr 1.1fr 1fr;
    gap: 5px;
`

const Title = styled.div`
    grid-area: title;
    text-align: left;
    font-size: 15px;
    font-weight: 500;
    padding-left: 10px;
    display: flex;
    align-items: center;
    color: gray;
`

const More = styled.div`
    grid-area: more;
    display: flex;
    justify-content: flex-end;
`

const Button = styled.button`
    padding: 2px 12px;
    height: fit-content;
    align-self: center;
    font-size: 11px;
    font-weight: 500;
    background-color: #2d2d2d;
    color: #717171;
    border: none;
    border-radius: 5px;
    cursor: pointer;
`

const Totale = styled.div`
    grid-area: total;
    text-align: left;
    display: grid;
    grid-template-rows: 1fr auto;
    font-size: 34px;
    font-weight: 800;
    padding-left: 16px;
    border-radius: 5px;
    cursor: pointer;

    &:hover{
    background-color: #8080803d;
    }
`

const Value = styled.div`
    display: flex;
    padding-top: 38px;
    align-items: baseline;
    font-size: 48px;
    font-weight: 800;
`

const Gauge = styled.div`
    width: 90%;
    height: 2px;
    border-radius: 4px;
    display: flex;
    overflow: hidden;
    margin-bottom: 10px;
    gap: 3px;
`

const Cents = styled.span`
    color: #999;
    font-size: 38px;
    font-weight: 400;
`

const IncomeBlock = styled.div`
    grid-area: income;
    background-color: #45454522;
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 5px;
    padding-left: 10px;
    padding-top: 10px;
    border-radius: 10px;
    margin-bottom: 2px;
    cursor: pointer;

    &:hover{
    background-color: #8080803d;
    }
`

const ExpenseBlock = styled.div`
    grid-area: expenses;
    background-color: #45454522;
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 5px;
    padding-left: 10px;
    padding-top: 10px;
    margin-bottom: 5px;
    border-radius: 10px;
    cursor: pointer;

    &:hover{
    background-color: #8080803d;
    }
`

const BlockTitle = styled.div`
    font-size: 12px;
    color: #888;
    text-align: left;
`

const BlockValue = styled.div`
    font-size: 21px;
    font-weight: 700;
    color: #b1b1b1;
    display: flex;
    align-items: baseline;
    margin-bottom: 5px;
`

const BlockCents = styled.span`
    color: #999;
    font-size: 14px;
    font-weight: 400;
`

const Currency = styled.span`
    color: #666;
    font-size: 32px;
    font-weight: 400;
    margin-left: 12px;
`

const IncomeGauge = styled.div<{ width: number }>`
    width: ${props => props.width}%;
    height: 100%;
    background-color: ${colors.brandColor};
    border-radius: 5px;
`

const ExpenseGauge = styled.div<{ width: number }>`
    width: ${props => props.width}%;
    height: 100%;
    background-color: #ff6b6b;
    border-radius: 5px;
`

const SubCur = styled.span`
    color: #888;
    font-size: 16px;
    font-weight: 400;
    margin-left: 6px;
`


