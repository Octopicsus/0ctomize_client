import styled from "styled-components"
import Dashboard from "./ActionPages/Dashboard/Dashboard"
import Transaction from "./ActionPages/TransactionPage/Transaction"


export default function PageView() {
  return (
    <MainWrapper>
        <Dashboard/>
        <Transaction/>
    </MainWrapper>
  )
}

const MainWrapper = styled.div`
width: 1670px;
height: 1030px;
position: absolute;
top: 60px;
left: 60px;
padding: 10px;
box-sizing: border-box;
`