import styled from "styled-components"
import DashboardHeader from "./SubWidgets/DashboardHeader"

export default function Habits() {
    return (
        <Wrapper>
            <DashboardHeader title="Habits" />
        </Wrapper>
    )
}

const Wrapper = styled.div`
    grid-area: habits;
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
