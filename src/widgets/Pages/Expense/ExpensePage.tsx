import { useNavigate } from "react-router-dom"
import InputButton from "../../Buttons/InputButton"
import SubBalance from "../../Balance/SubBalance"
import { moneyAdapter } from "../../../store/features/moneyHistorySlice"
import { RootState } from "../../../store/store"
import { useDispatch, useSelector } from "react-redux"
import { getExpense } from "../../../utils/balanceCalc"
import MoneyList from "../../MoneyList/MoneyList"
import { LINK_ROUTES } from "../../../enums/routes"
import styled from "styled-components"
import { setCategory } from "../../../store/features/categorySlice"
import { CATEGORY } from "../../../enums/categoryTitles"
import DateList from "../../Menu/DateList"
import { useRef, useState, useEffect } from "react"
import SearchTitle from "../../Filter/SearchTitle"
import SubTitle from "../../Layout/SubTitle"
import HeaderBlock from "../../Menu/Header/HeaderBlock"

export default function ExpensePage() {
    const selectAll = moneyAdapter.getSelectors(
        (state: RootState) => state.moneyHistory
    ).selectAll
    const itmes = useSelector(selectAll)
    const expense = getExpense(itmes)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const moneyListRef = useRef<any>(null)
    const [visibleMonth, setVisibleMonth] = useState<string>("")

    useEffect(() => {
        dispatch(setCategory(CATEGORY.EXPENSE))
    }, [dispatch])

    const handleInput = () => {
        dispatch(setCategory(CATEGORY.EXPENSE))
        navigate(LINK_ROUTES.MONEY_INPUT)
    }

    const handleDashboard = () => {
        navigate(LINK_ROUTES.DASHBOARD)
    }

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
                <DashboardButton onClick={handleDashboard}>
                    Dashboard
                </DashboardButton>
                <SubBalance value={expense} />
                <InfoGraph>
                    <InputButton
                        onClick={handleInput}
                    />
                </InfoGraph>

                <List>
                    <SearchTitle />
                    <SubTitle title="Cash Flow" sizeTitle="20px" margin="14px" />

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
margin-bottom: 20px;
margin-top: 20px;
position: relative;
box-sizing: border-box;
border-radius: 8px;
`

const Wrapper = styled.div`
width: 320px;
margin: 0 auto;
`

const List = styled.div`
position: sticky;
top: 0;
z-index: 1000;
`

const DashboardButton = styled.button`
background-color: #4CAF50;
color: white;
border: none;
padding: 10px 20px;
border-radius: 8px;
font-size: 14px;
font-weight: 600;
cursor: pointer;
margin-bottom: 20px;
transition: background-color 0.3s ease;

&:hover {
    background-color: #45a049;
}
`