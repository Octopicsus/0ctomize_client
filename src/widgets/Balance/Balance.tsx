import styled from "styled-components"
import { moneyAdapter } from "../../store/features/moneyHistorySlice"
import { RootState } from "../../store/store"
import { useSelector } from "react-redux"
import { getBalance, formatAmount } from "../../utils/balanceCalc"


export default function Balance() {
  const selectAll = moneyAdapter.getSelectors(
    (state: RootState) => state.moneyHistory
  ).selectAll

  const items = useSelector(selectAll)
  const balance = getBalance(items)

  return (
    <>
      <BalanceValue>
        {formatAmount(balance)}
        <Sign>
          Kč
        </Sign>
      </BalanceValue>
    </>
  )
}

const BalanceValue = styled.div`
   font-size: 50px;
   font-weight: 600;
   display: flex;
   justify-content: center;
   align-items: center;
   gap: 10px;
   margin-bottom: 40px;
   margin-top: 80px;
   color: #f0f0f0;
   `

const Sign = styled.p`
 font-size: 40px; 
 font-weight: 400;
 color: #c0c0c0;
`