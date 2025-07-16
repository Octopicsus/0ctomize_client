import styled from "styled-components"
import MoneyList from "../../../../MoneyList/MoneyList"
import DateList from "../../../../Menu/DateList"
import { useRef, useState } from "react"
import { useNavigate } from "react-router"
import { LINK_ROUTES } from "../../../../../enums/routes"

export default function CashFlow() {
    const moneyListRef = useRef<any>(null)
    const [activeMonth, setActiveMonth] = useState<string>("")
    const navigate = useNavigate()

    const handleMonthSelect = (month: string) => {
        setActiveMonth(month)
        if (moneyListRef.current?.scrollToMonth) {
            moneyListRef.current.scrollToMonth(month)
        }
    }

    const handleMoreClick = () => {
        navigate(LINK_ROUTES.TRANSACTIONS)
    }

    return (
        <Wrapper>
            <Header>
                <Title>Cash Flow</Title>
                <More onClick={handleMoreClick}></More>
                <DateListWrapper>
                    <DateList 
                        onMonthSelect={handleMonthSelect}
                        activeMonth={activeMonth}
                    />
                </DateListWrapper>
            </Header>

            <TransactionWrapper>
                <MoneyList 
                    ref={moneyListRef}
                />
            </TransactionWrapper>
        </Wrapper>
    )
}

const Wrapper = styled.div`
    grid-area: cashFlow;
    background-color: #80808018;
    border-radius: 10px;
    margin-right: 2px;
    padding: 5px;
    padding-left: 10px;
    padding-right: 10px;
    display: grid;
    grid-template-rows: 90px 4fr;
    overflow: hidden;
    gap: 10px;
`

const Header = styled.div`
    display: grid;
    grid-template-areas: 
        "title more"
        "datelist datelist";
    grid-template-columns: 1fr auto;
    grid-template-rows: auto 1fr;
    align-items: start;
    gap: 10px;
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

const More = styled.div`
    grid-area: more;
    display: flex;
    justify-content: flex-end;
    
    &::after {
        content: "more >";
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
    }
`

const DateListWrapper = styled.div`
    grid-area: datelist;
    width: 100%;
`

const TransactionWrapper = styled.div`
    overflow-y: scroll;
`