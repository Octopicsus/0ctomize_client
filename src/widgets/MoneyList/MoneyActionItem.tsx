import { useNavigate } from "react-router"
import styled from "styled-components"
import { LINK_ROUTES } from "../../enums/routes"
import CategoryIconPlace from "../Placeholders/CategoryIconPlace"
import { formatAmount } from "../../utils/balanceCalc"

type Props = {
  title: string,
  desc?: string,
  amount: number,
  date: string,
  time: string,
  img: string,
  color: string,
  type: string,
  isFirst?: boolean,
  isLast?: boolean
}

export default function MoneyActionItem({ title, desc, amount, time, img, color, type, isFirst, isLast }: Props) {
  const navigate = useNavigate()

  function handleOpenItem() {
    navigate(LINK_ROUTES.MONEY_ITEM)
  }

  const formattedTime = time.slice(0, 5)
  const sign = type === "Income" ? "+" : "-"

  return (
    <ActionItemButton onClick={handleOpenItem} $isFirst={isFirst} $isLast={isLast}>
      <Wrapper>
        <CategoryIconPlace img={img} color={color}/>
        <TitleWrapper>
          {desc && <Desc>{desc}</Desc>}
          <Category $hasDesc={!!desc}>{title}</Category>
          <Time>{formattedTime}</Time>
        </TitleWrapper>
      </Wrapper>
      <Amount>{sign} {formatAmount(amount)} 
        <Sign>
           Kč
        </Sign>
        </Amount>
    </ActionItemButton>
  )
}

const ActionItemButton = styled.button<{ $isFirst?: boolean; $isLast?: boolean }>`
  display: flex;
  justify-content: space-between;
   background-color: #45454522;
  width: 100%;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 10px;
  cursor: pointer;
  box-sizing: border-box;
  border: none;
  border-radius: ${props => {
    if (props.$isFirst && props.$isLast) return '8px'
    if (props.$isFirst) return '8px 8px 0 0'
    if (props.$isLast) return '0 0 8px 8px'
    return '0'
  }};

  &:hover {
    background-color: #8c8c8c39;
  }
`

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`

const Category = styled.h4<{ $hasDesc?: boolean }>`
width: 100%;
text-align: left;
font-size: ${props => props.$hasDesc ? '12px' : '14px'};
font-weight: ${props => props.$hasDesc ? '300' : '700'};
color: ${props => props.$hasDesc ? '#7b7b7b' : '#c6c6c6'};
margin-top: 2px;
`

const Desc = styled.h4`
width: 120px;
font-size: 14px;
text-align: left;
color: #c6c6c6;
`

const Amount = styled.h4`
width: 150px;
text-align: right;
font-size: 16px;
padding-right: 12px;
color: #afafaf;
font-weight: 500;
`

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 16px;
  flex: 1;
`

const Time = styled.h6`
color: #808080;
text-align: left;
margin-top: 6px;
font-size: 12px;
`

const Sign = styled.span`
font-size: 15px;
margin-left: 4px;
color: #afafaf;
font-weight: 400;
font-size: 12px;
`