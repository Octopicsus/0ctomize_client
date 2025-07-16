import { useSelector } from "react-redux"
import styled from "styled-components"
import { RootState } from "../../store/store"
import { moneyAdapter } from "../../store/features/moneyHistorySlice"
import { getSortedList, groupActionsByDate } from "../MoneyList/MoneyList"
import { formatDate } from "../../utils/formatDate"

type Props = {
    onMonthSelect?: (month: string) => void
    activeMonth?: string
}

function monthList(groupedByDate: any) {
    const currentYear = new Date().getFullYear()
    const monthsWithActions = Object.keys(groupedByDate).map(dateKey => {
        const date = new Date(dateKey)
        const year = date.getFullYear()

        return year === currentYear
            ? formatDate(dateKey, 'month-only')
            : formatDate(dateKey, 'month-year')
    })
    const monthList = [...new Set(monthsWithActions)]

    return monthList
}

export default function DateList({ onMonthSelect, activeMonth }: Props) {
    const category = useSelector((state: RootState) => state.category.category)
    const selectAll = moneyAdapter.getSelectors(
        (state: RootState) => state.moneyHistory
    ).selectAll
    const moneyAction = useSelector(selectAll)
    const sortedList = getSortedList(moneyAction, category)
    const groupedByDate = groupActionsByDate(sortedList)
    const months = monthList(groupedByDate)

    const handleMonthClick = (month: string) => {
        if (onMonthSelect) {
            onMonthSelect(month)
        }
    }

    return (
        <Wrapper>
            <List>
                {months.map((month, index) => (
                    <Item 
                        key={index} 
                        onClick={() => handleMonthClick(month)}
                        $active={month === activeMonth}
                    >
                        {month}
                    </Item>
                ))}
            </List>
        </Wrapper>
    )
}

const Wrapper = styled.div`
display: flex;
align-items: center;
height: 62px;
width: 100%;
padding: 0 10px;
box-sizing: border-box;
`

const List = styled.ul`
display:flex;
gap: 10px;
overflow-x: scroll;
direction: rtl;
scrollbar-width: none;
-ms-overflow-style: none;

&::-webkit-scrollbar {
    display: none;
}
`

const Item = styled.li<{ $active?: boolean }>`
list-style: none;
font-size: small;
font-weight: ${({ $active }) => $active ? '600' : '400'};
padding: 6px 12px;
background-color: ${({ $active }) => $active ? '#ffb700' : '#2a2a2a'};
color: ${({ $active }) => $active ? '#000' : '#fff'};
border: ${({ $active }) => $active ? '2px solid #ffb700' : '2px solid transparent'};
border-radius: 15px;
white-space: nowrap;
cursor: pointer;
transition: all 0.3s ease;
user-select: none;

&:hover {
    background-color: ${({ $active }) => $active ? '#e6a500' : '#454545'};
    transform: translateY(-1px);
}

&:active {
    transform: translateY(0);
}
`