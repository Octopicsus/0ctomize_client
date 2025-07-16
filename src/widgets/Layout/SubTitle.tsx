import styled from "styled-components"


type Props = {
    title: string
    sizeTitle?: string
    margin?: string
}

export default function SubTitle({ title, sizeTitle = '14px', margin = '6px' }: Props) {
    return (
        <Title $sizeTitle={sizeTitle} $margin={margin}>{title}</Title>
    )
}

const Title = styled.h3<{ $sizeTitle: string, $margin: string }>`
    margin-top: 32px;
    margin-left: 8px;
    font-size: ${props => props.$sizeTitle};
    text-align: left;
    font-weight: 700;
    margin-bottom: ${props => props.$margin};
`