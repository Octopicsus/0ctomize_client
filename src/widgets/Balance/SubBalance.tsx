import styled from "styled-components"
import colors from "../../ui/colorsPalette"
import { formatAmount } from "../../utils/balanceCalc"

type CatValues = {
    value: number
}

export default function SubBalance({ value }: CatValues) {
    return (
        <ShowValue>{formatAmount(value)}</ShowValue>
    )
}

const ShowValue = styled.h4`
color: ${colors.brandColor};
width: 300px;
margin-top: 20px;
`

