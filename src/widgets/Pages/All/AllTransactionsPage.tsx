import { RootState } from "../../../store/store"
import { moneyAdapter } from "../../../store/features/moneyHistorySlice"
import { useSelector } from "react-redux"
import { getBalance } from "../../../utils/balanceCalc"
import SubBalance from "../../Balance/SubBalance"
import MoneyList from "../../MoneyList/MoneyList"
import styled from "styled-components"
import DateList from "../../Menu/DateList"
import { useRef, useState } from "react"
import SearchTitle from "../../Filter/SearchTitle"
import SubTitle from "../../Layout/SubTitle"
import HeaderBlock from "../../Menu/Header/HeaderBlock"
import SourceFilter from "../../Filter/SourceFilter"

export default function AllTransactionsPage() {
    const selectAll = moneyAdapter.getSelectors(
        (state: RootState) => state.moneyHistory
    ).selectAll

    const items = useSelector(selectAll)
    const balance = getBalance(items)
    const moneyListRef = useRef<any>(null)
    const [visibleMonth, setVisibleMonth] = useState<string>("")

    const handleMonthSelect = (month: string) => {
        if (moneyListRef.current) {
            moneyListRef.current.scrollToMonth(month)
        }
    }

    const handleVisibleMonthChange = (month: string) => {
        setVisibleMonth(month)
    }

    return (
        <>
            <HeaderBlock />
            <Wrapper>
                <SubBalance value={balance} />
                <InfoGraph>
                </InfoGraph>
                <List>
                    <SearchTitle />
                    <SourceFilter />
                    <SubTitle title="All Transactions" sizeTitle="20px" margin="14px" />
                    <DateList
                        onMonthSelect={handleMonthSelect}
                        activeMonth={visibleMonth}
                    />
                    <MoneyList
                        ref={moneyListRef}
                        onVisibleMonthChange={handleVisibleMonthChange}
                    />
                </List>
            </Wrapper>
        </>
    )
}

const InfoGraph = styled.div`
display: flex;
justify-content: center;
margin: 0 auto;
height: 200px;
width: 300px;
background-color: #80808028;
border-radius: 6px;
align-items: center;
position: relative;
`

const Wrapper = styled.div`
display: flex;
flex-direction: column;
align-items: center;
margin: 60px auto 0 auto;
position: relative;
`

const List = styled.div`
width: 300px;
`
