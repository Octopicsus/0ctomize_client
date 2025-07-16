import styled from "styled-components"

type Props = {
    img: string
    size?: string
    color?: string
}

export default function CategoryIconPlace({ img, size = "40px", color = "#353434" }: Props) {
    return (
        <IconWrapper $size={size} $color={color}>
            <Icon src={img} $size={size} />
        </IconWrapper>
    )
}

const IconWrapper = styled.div<{ $size: string; $color: string }>`
    width: ${({ $size }) => $size};
    height: ${({ $size }) => $size};
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: ${({ $color }) => $color};
`

const Icon = styled.img<{ $size: string }>`
    width: calc(${({ $size }) => $size} * 0.8);
    height: calc(${({ $size }) => $size} * 0.8);
    object-fit: contain;
`