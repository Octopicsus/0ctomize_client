import styled from "styled-components"
import DashboardHeader from "./SubWidgets/DashboardHeader"
import TimeRange from "./SubWidgets/TimeRange"
import CategoriesChart from "./SubWidgets/CategoriesChart"
import { useState, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../store/store'
import { moneyAdapter } from '../../../../../store/features/moneyHistorySlice'
import type { TimeRangeValue } from './SubWidgets/TimeRange'

export type DashboardTimeRange = TimeRangeValue

export default function Categories() {
    const selectAll = moneyAdapter.getSelectors((s:RootState)=>s.moneyHistory).selectAll
    const txs = useSelector(selectAll)

    const today = new Date()
    const txDates = txs.map(t=> new Date(`${t.date}T${t.time}`)).sort((a,b)=> a.getTime()-b.getTime())
    const first = txDates[0]

    const monthsDiff = first ? (today.getFullYear()-first.getFullYear())*12 + (today.getMonth()-first.getMonth()) : 0
    const hasToday = txDates.some(d => d.toDateString() === today.toDateString())
    const hasWeek = txDates.some(d => (today.getTime()-d.getTime()) <= 7*24*3600*1000)

    const ranges = useMemo(()=>{
        const r: TimeRangeValue[] = []
        // Always include at least Month & Full
        if (hasToday) r.push('Day')
        if (txDates.length && (hasWeek || hasToday)) r.push('Week')
        r.push('Month')
        if (monthsDiff > 5) r.push('6 Month')
        if (monthsDiff > 6) r.push('Year')
        if (monthsDiff > 12) r.push('5 Years')
        r.push('Full')
        // If only one month history (monthsDiff==0) remove Day/Week unless present conditions above
        if (monthsDiff===0){
          // keep only allowed minimal set among existing
          const baseList = ['Week','Month','Full'] as TimeRangeValue[]
          const base: TimeRangeValue[] = baseList.filter(x=> r.includes(x))
          return base
        }
        return r
    }, [hasToday, hasWeek, monthsDiff, txDates.length])

    // Pick default range preference: Month else first available
    const [range, setRange] = useState<DashboardTimeRange>('Month')
    if (!ranges.includes(range)) {
        // adjust to closest
        // eslint-disable-next-line react-hooks/rules-of-hooks
        setRange(ranges.includes('Month') ? 'Month' : ranges[0])
    }

    const handleChangeRange = useCallback((r:DashboardTimeRange)=> setRange(r),[])

    return (
        <Wrapper>
            <DashboardHeader title="Categories" />
            <Content>
                <ChartSection>
                    <CategoriesChart range={range} />
                </ChartSection>
                <TimeRange value={range} onChange={handleChangeRange} ranges={ranges} />
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
