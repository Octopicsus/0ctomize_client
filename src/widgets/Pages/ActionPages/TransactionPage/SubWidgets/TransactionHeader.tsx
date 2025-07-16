import styled from "styled-components"
import { useState, useEffect } from "react"

type Props = {
    title: string
    initialType?: 'income' | 'expense'
    onTypeChange?: (type: 'income' | 'expense') => void
}

export default function TransactionHeader({ title, initialType = 'expense', onTypeChange }: Props) {
    const [selectedType, setSelectedType] = useState<'income' | 'expense'>(initialType)

    useEffect(() => {
        onTypeChange?.(initialType)
    }, [initialType])

    const handleIncomeClick = () => {
        setSelectedType('income')
        onTypeChange?.('income')
    }

    const handleExpenseClick = () => {
        setSelectedType('expense')
        onTypeChange?.('expense')
    }

    return (
        <Header>
            <Title>{title}</Title>
            <WrapperButtons>
                <Income $isActive={selectedType === 'income'} onClick={handleIncomeClick} />
                <Expense $isActive={selectedType === 'expense'} onClick={handleExpenseClick} />
            </WrapperButtons>
        </Header>
    )
}

const Header = styled.div`
    display: grid;
    grid-template-areas: 
        "title buttons";
    grid-template-columns: 1fr auto;
    align-items: start;
    gap: 10px;
    padding-bottom: 0px;
`

const Title = styled.h3`
    grid-area: title;
    text-align: left;
    font-size: 15px;
    font-weight: 500;
    padding-left: 10px;
    display: flex;
    align-items: center;
    color: gray;
    margin: 0;
`

const WrapperButtons = styled.div`
    grid-area: buttons;
    display: flex;
    gap: 10px;
`

const Income = styled.div<{ $isActive: boolean }>`
    display: flex;
    justify-content: flex-end;
    cursor: pointer;
    
    &::after {
        content: "income";
        padding: 2px 12px;
        height: fit-content;
        align-self: center;
        font-size: 11px;
        font-weight: 500;
        background-color: ${props => props.$isActive ? '#4747478c' : '#2d2d2d64'};
        color: ${props => props.$isActive ? '#a8a8a8' : '#717171'};
        border: none;
        border-radius: 5px;
        transition: all 0.2s ease;
    }
    
    &:hover::after {
        opacity: 0.8;
    }
`

const Expense = styled.div<{ $isActive: boolean }>`
    display: flex;
    justify-content: flex-end;
    cursor: pointer;
    
    &::after {
        content: "expense";
        padding: 2px 12px;
        height: fit-content;
        align-self: center;
        font-size: 11px;
        font-weight: 500;
        background-color: ${props => props.$isActive ? '#4747478c' : '#2d2d2d64'};
        color: ${props => props.$isActive ? '#a8a8a8' : '#717171'};
        border: none;
        border-radius: 5px;
        transition: all 0.2s ease;
    }
    
    &:hover::after {
        opacity: 0.8;
    }
`


