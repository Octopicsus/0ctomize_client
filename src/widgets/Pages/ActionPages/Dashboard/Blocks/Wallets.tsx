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
    background-color: #191919;
    border-radius: 8px;
    padding: 10px;
`
