import styled from "styled-components"
import DashboardHeader from "./SubWidgets/DashboardHeader"
import TimeRange from "./SubWidgets/TimeRange"
import CategoriesChart from "./SubWidgets/CategoriesChart"

export default function Categories() {
    return (
        <Wrapper>
            <DashboardHeader title="Categories" />
            <Content>
                <ChartSection>
                    <CategoriesChart />
                </ChartSection>
                <TimeRange />
            </Content>
        </Wrapper>
    )
}

const Wrapper = styled.div`
    grid-area: categories;
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

const Content = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
    padding: 5px 0;
    height: 100%;
    overflow: hidden;
`

const ChartSection = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    overflow: hidden;
`
