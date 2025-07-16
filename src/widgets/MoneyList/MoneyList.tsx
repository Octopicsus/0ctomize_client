import { useDispatch, useSelector } from "react-redux"
import { moneyAdapter, MoneyItem } from "../../store/features/moneyHistorySlice"
import { RootState } from "../../store/store"
import MoneyActionItem from "./MoneyActionItem"
import styled from "styled-components"
import { setSelectedMoneyItemId } from "../../store/features/selectedMoneyActionSlice"
import { Link } from "react-router"
import { LINK_ROUTES } from "../../enums/routes"
import { formatDate } from "../../utils/formatDate"
import { useRef, useImperativeHandle, useEffect, useCallback, forwardRef } from "react"
import { searchNames } from "../../utils/searchNames"
import { formatAmount } from "../../utils/balanceCalc"

function getDates(moneyActions: MoneyItem[]): string[] {
  const uniqueDates = new Set<string>()

  moneyActions.forEach(action => {
    uniqueDates.add(action.date)
  })

  return Array.from(uniqueDates).sort((a, b) => {
    const dateA = new Date(a)
    const dateB = new Date(b)
    return dateB.getTime() - dateA.getTime()
  })
}

function getActionsByDate(moneyActions: MoneyItem[], Date: string): MoneyItem[] {
  return moneyActions.filter(action => action.date === Date)
}

export function getSortedList(moneyActions: MoneyItem[], category: string): MoneyItem[] {
  const filteredActions = category === "All" 
    ? moneyActions 
    : moneyActions.filter((moneyAction: MoneyItem) => moneyAction.type === category)
    
  return filteredActions.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateB.getTime() - dateA.getTime()
  })
}

export function groupActionsByDate(moneyActions: MoneyItem[]): Record<string, MoneyItem[]> {
  const datesList = getDates(moneyActions)
  const result: Record<string, MoneyItem[]> = {}

  datesList.forEach(date => {
    result[date] = getActionsByDate(moneyActions, date)
  })
  return result
}

function calcAmountGroup(actions: MoneyItem[]): number {
  return actions.reduce((sum, action) => {
    return action.type === "Expense" ? sum - action.amount : sum + action.amount
  }, 0)
}

type Props = {
  onVisibleMonthChange?: (month: string) => void
}

const MoneyList = forwardRef<any, Props>(({ onVisibleMonthChange }, ref) => {
  const category = useSelector((state: RootState) => state.category.category)
  const searchPattern = useSelector((state: RootState) => state.search.searchTerm)
  const dispatch = useDispatch()
  const selectAll = moneyAdapter.getSelectors(
    (state: RootState) => state.moneyHistory
  ).selectAll
  const moneyAction = useSelector(selectAll)
  const dateGroupRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const observerRef = useRef<IntersectionObserver | null>(null)

  const sortedList = getSortedList(moneyAction, category)
  const filteredList = searchNames(sortedList, searchPattern)
  const groupedByDate = groupActionsByDate(filteredList)

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        const date = entry.target.getAttribute('data-date')
        if (date && onVisibleMonthChange) {
          const itemDate = new Date(date)
          const currentYear = new Date().getFullYear()
          const itemYear = itemDate.getFullYear()

          const formattedMonth = itemYear === currentYear
            ? formatDate(date, 'month-only')
            : formatDate(date, 'month-year')

          onVisibleMonthChange(formattedMonth)
        }
      }
    })
  }, [onVisibleMonthChange])

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: [0, 0.5, 1]
    })

    Object.values(dateGroupRefs.current).forEach(element => {
      if (element) {
        observerRef.current?.observe(element)
      }
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [handleIntersection, groupedByDate])

  useImperativeHandle(ref, () => ({
    scrollToMonth: (month: string) => {
      const currentYear = new Date().getFullYear()

      for (const [date] of Object.entries(groupedByDate)) {
        const itemDate = new Date(date)
        const itemYear = itemDate.getFullYear()

        let formattedMonth: string
        if (itemYear === currentYear) {
          formattedMonth = formatDate(date, 'month-only')
        } else {
          formattedMonth = formatDate(date, 'month-year')
        }

        if (formattedMonth === month) {
          const element = dateGroupRefs.current[date]
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            })
            break
          }
        }
      }
    }
  }))


  return (
    <>
      <ListWrapper>
        {Object.entries(groupedByDate).map(([date, actions]) => (
          <DateGroup
            key={date}
            ref={(el) => {
              dateGroupRefs.current[date] = el
              if (el && observerRef.current) {
                observerRef.current.observe(el)
              }
            }}
            data-date={date}
          >
            <SubWrapper>
              <DateHeader>
                {new Date(date).getFullYear() === new Date().getFullYear()
                  ? formatDate(date, 'day-month')
                  : formatDate(date, 'day-month-year')
                }
              </DateHeader>
              <AmountGroup>
                {(() => {
                  const amount = calcAmountGroup(actions)
                  const sign = amount >= 0 ? "+" : "-"
                  return `${sign} ${formatAmount(Math.abs(amount))}`
                })()}
              </AmountGroup>
            </SubWrapper>

            {actions.map((moneyAction: MoneyItem, index) => (
              <List key={moneyAction.id}>
                <StyledLink
                  to={LINK_ROUTES.MONEY_ITEM}
                  onClick={() => dispatch(setSelectedMoneyItemId(moneyAction.id))}
                >
                  <MoneyActionItem
                    title={moneyAction.title}
                    desc={moneyAction.description}
                    amount={moneyAction.amount}
                    date={moneyAction.date}
                    time={moneyAction.time}
                    img={moneyAction.img}
                    color={moneyAction.color}
                    type={moneyAction.type}
                    isFirst={index === 0}
                    isLast={index === actions.length - 1}
                  />
                </StyledLink>
              </List>
            ))}
          </DateGroup>
        ))}
      </ListWrapper>
    </>
  )
})

MoneyList.displayName = 'MoneyList'

export default MoneyList

const StyledLink = styled(Link)`
  width: 100%;
  text-decoration: none;
`

const List = styled.li`
  display: flex;
  width: 100%;
`

const SubWrapper = styled.div`
display: flex;
justify-content: space-between;
align-items: center;
width: 100%;
`

const AmountGroup = styled.h5`
color: #454545;
margin-right: 10px;
`

const DateGroup = styled.div`
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const DateHeader = styled.h3`
  text-align: left;
  margin: 10px 0;
  font-size: 12px;
  font-weight: 600;
  color: #7d7d7d;
`

const ListWrapper = styled.ul`
margin-top: 18px;
width: 100%;
`