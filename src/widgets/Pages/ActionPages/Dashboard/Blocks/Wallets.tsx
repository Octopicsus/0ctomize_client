import styled from "styled-components"
import DashboardHeader from "./SubWidgets/DashboardHeader"

export default function Wallets() {
    return (
        <Wrapper>
            <DashboardHeader title="Wallets" />
        </Wrapper>
    )
}

const Wrapper = styled.div`
    grid-area: wallets;
    background-color: #80808018;
    border-radius: 10px;
    padding: 5px;
    padding-left: 10px;
    padding-right: 10px;
    display: grid;
    grid-template-rows: auto 1fr;
    overflow: hidden;
    gap: 10px;
`
