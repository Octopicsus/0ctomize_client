import styled from "styled-components"
import { useLocation } from "react-router"
import { LINK_ROUTES } from "../../../enums/routes"

export default function NamePage() {
    const location = useLocation()
    
    const getPageTitle = () => {
        if (location.pathname === LINK_ROUTES.TRANSACTIONS) {
            return (
                <>
                    <Slash>/</Slash>Import
                </>
            )
        }
        return (
            <>
                <Slash>/</Slash>Dashboard
            </>
        )
    }

    return (
        <Wrapper>
            <Title>{getPageTitle()}</Title>
        </Wrapper>
    )
}

const Wrapper = styled.div`
    grid-area: namePage;
    display: flex;
    padding-top: 4px;
    padding-left: 45px;
    justify-content: flex-start;
    align-items: center;
`

const Title = styled.h4`
    margin: 0;
    font-size: 26px;
    text-align: left;
    color: #333333;
    font-weight: 400;
    font-style: italic;
    letter-spacing: 0.5px;
    padding-left: 0px;
    font-family: 'Bitter', serif;
    margin-bottom: 0;
`

const Slash = styled.span`
    color: #262626;
    font-weight: 400;
    margin-right: 14px;
`
