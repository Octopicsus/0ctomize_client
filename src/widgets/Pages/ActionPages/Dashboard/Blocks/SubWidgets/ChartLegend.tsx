import styled from "styled-components"

type Props = {
    categories: string[]
    colors: string[]
}

export default function ChartLegend({ categories, colors }: Props) {
    return (
        <LegendWrapper>
            {categories.map((category, index) => (
                <LegendItem key={index}>
                    <ColorDot $color={colors[index]} />
                    <CategoryName>{category}</CategoryName>
                </LegendItem>
            ))}
        </LegendWrapper>
    )
}

const LegendWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    justify-content: center;
    padding: 0 8px;
    margin: 0 auto;
    max-width: 90%;
    flex-shrink: 0;
`

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
`

const ColorDot = styled.div<{ $color: string }>`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${({ $color }) => $color};
    flex-shrink: 0;
`

const CategoryName = styled.span`
    font-size: 12px;
    font-weight: 500;
    color: #676767;
    line-height: 1.1;
    white-space: nowrap;
`
