import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import { LINK_ROUTES } from "../../enums/routes"
import CategoryIconPlace from "../Placeholders/CategoryIconPlace"
import { formatAmount } from "../../utils/balanceCalc"
import { prettifyTitle } from "../../utils/prettifyTitle"

type Props = {
  title: string
  amount: number
  date?: string
  time: string
  img: string
  color: string
  type: string
  category?: string
  categoryConfidence?: number
  categorySource?: string
  isFirst?: boolean
  isLast?: boolean
}

export default function MoneyActionItem({ title, amount, time, img, color, type, category, categoryConfidence, isFirst, isLast }: Props) {
  const navigate = useNavigate()

  function handleOpenItem() {
    navigate(LINK_ROUTES.MONEY_ITEM)
  }

  const formattedTime = time.slice(0, 5)
  const sign = type === "Income" ? "+" : "-"

  // Description скрывается в UI по требованию — вычисление не нужно

  const rawTitle = title.split('|')[0].trim()
  const displayTitle = prettifyTitle(rawTitle)

  return (
    <ActionItemButton onClick={handleOpenItem} $isFirst={isFirst} $isLast={isLast}>
      <Wrapper>
        <CategoryIconPlace img={img} color={color} />
        <TitleWrapper>
          <Category>{displayTitle}</Category>
          {(category && category !== 'Uncategorized') && (
            <CategoryLine title={`Category: ${category}${categoryConfidence !== undefined ? ' ('+Math.round(categoryConfidence*100)+'%)' : ''}`}>
              {category}
            </CategoryLine>
          )}
          <Time>{formattedTime}</Time>
        </TitleWrapper>
      </Wrapper>
  <Amount $income={type === 'Income'}>{sign} {formatAmount(amount)}<Sign $income={type === 'Income'}> Kč</Sign></Amount>
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
 display: flex;
 align-items: center;
 gap: 6px;
`

// Category line (gray text) replacing colored badge duplication
const CategoryLine = styled.span`
  display: block;
  width: 100%;
  margin-top: 2px;
  font-size: 11px;
  font-weight: 400;
  text-align: left;
  color: #8d8d8d;
`

// Description removed from UI

const Amount = styled.h4<{ $income?: boolean }>`
width: 150px;
text-align: right;
font-size: 16px;
padding-right: 12px;
color: ${p=> p.$income ? '#29c770' : '#afafaf'};
font-weight: 600;
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

const Sign = styled.span<{ $income?: boolean }>`
font-size: 15px;
margin-left: 4px;
color: ${p=> p.$income ? '#29c770' : '#afafaf'};
font-weight: 500;
font-size: 12px;
`