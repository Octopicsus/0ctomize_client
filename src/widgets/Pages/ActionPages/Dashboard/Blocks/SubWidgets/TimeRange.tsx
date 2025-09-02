import styled from "styled-components"

export type TimeRangeValue = 'Day'|'Week'|'Month'|'6 Month'|'Year'|'5 Years'|'Full'

export default function TimeRange({ value, onChange, ranges }: { value: TimeRangeValue; onChange: (r:TimeRangeValue)=>void; ranges: TimeRangeValue[] }) {
    const activeRange = value
    return (
        <Wrapper>
            {ranges.map((range) => (
                <RangeItem 
                    key={range}
                    $active={range === activeRange}
                    onClick={() => onChange(range)}
                >
                    {range}
                </RangeItem>
            ))}
        </Wrapper>
    )
}

const Wrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 12px;
    padding: 4px;
    margin-bottom: 8px;
    gap: 2px;
    width: 100%;
`

const RangeItem = styled.button<{ $active?: boolean }>`
    flex: 1;
    padding: 4px 6px;
    font-size: 12px;
    font-weight: ${({ $active }) => $active ? '700' : '500'};
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    
    background-color: ${({ $active }) => $active ? '#474747a1' : 'transparent'};
    color: ${({ $active }) => $active ? '#a8a8a8' : '#666'};
    
    &:hover {
        background-color: ${({ $active }) => $active ? '#474747a1' : '#e8e8e8d6'};
    }
    
    &:active {
        transform: scale(0.98);
    }
`
