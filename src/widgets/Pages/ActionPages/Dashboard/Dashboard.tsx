import styled from "styled-components"
import { useEffect } from 'react'
import { bankdataAPI } from '../../../../api/bankdata'
import NamePage from "../NamePage"
import Balance from "./Blocks/Balance"
import Activities from "./Blocks/Activities"
import Goals from "./Blocks/Goals"
import Habits from "./Blocks/Habits"
import Categories from "./Blocks/Categories"
import Wallets from "./Blocks/Wallets"
import Payment from "./Blocks/Payment"
import CashFlow from "./Blocks/CashFlow"

export default function Dashboard() {
    useEffect(() => {
        const LS_KEY = 'bank_auto_sync_last'
        const now = Date.now()
        const last = Number(localStorage.getItem(LS_KEY) || '0')
        // Avoid spamming: only attempt if > 5 min since last check
        if (now - last > 5 * 60 * 1000) {
            localStorage.setItem(LS_KEY, String(now))
            bankdataAPI.autoSync().catch(() => {})
        }
    }, [])
    return (
        <Wrapper>
            <NamePage />
            <Balance />
            <Activities />
            <Goals />
            <Habits />
            <Categories />
            <Wallets />
            <Payment />
            <CashFlow />
        </Wrapper>
    )
}

const Wrapper = styled.div`
    width: calc(100vw - 70px);
    height: calc(100vh - 70px);
    position: absolute;
    top: 60px;
    left: 60px;
    box-sizing: border-box;
    display: grid;
    grid-template-areas:
        "namePage namePage namePage namePage cashFlow"
        "balance balance categories categories cashFlow"
        "activities activities categories categories cashFlow"
        "goals habits wallets wallets cashFlow"
        "payment payment payment payment cashFlow";
    grid-template-columns: 0.8fr 1.2fr 1fr 0.5fr 380px;
    grid-template-rows: 50px 16% 1fr 1fr 100px;
    gap: 8px;
    padding: 5px;
`

