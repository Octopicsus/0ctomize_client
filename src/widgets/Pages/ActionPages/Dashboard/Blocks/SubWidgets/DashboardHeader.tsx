import styled from "styled-components"

type Props = {
    title: string
}

export default function DashboardHeader({ title }: Props) {
    return (
        <Header>
            <Title>{title}</Title>
            <More></More>
        </Header>
    )
}

const Header = styled.div`
    display: grid;
    grid-template-areas: 
        "title more";
    grid-template-columns: 1fr auto;
    align-items: start;
    gap: 10px;
    padding-bottom: 0px;
`

const Title = styled.h3`
    grid-area: title;
    text-align: left;
    font-size: 15px;
    font-weight: 500;
    padding-left: 10px;
    display: flex;
    align-items: center;
    color: gray;
    margin: 0;
`

const More = styled.div`
    grid-area: more;
    display: flex;
    justify-content: flex-end;
    
    &::after {
        content: "more >";
        padding: 2px 12px;
        height: fit-content;
        align-self: center;
        font-size: 11px;
        font-weight: 500;
        background-color: #2d2d2d;
        color: #717171;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
`
