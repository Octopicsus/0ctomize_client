import styled from "styled-components"
import { useLocation } from "react-router"
import { LINK_ROUTES } from "../../../enums/routes"

export default function NamePage() {
    const location = useLocation()
    
    const getPageTitle = () => {
        if (location.pathname === LINK_ROUTES.TRANSACTIONS) {
            return (
                <>
                    <Slash></Slash>Import
                </>
            )
        }
        return (
            <>
                <Slash></Slash>Dashboard
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
    font-size: 46px;
    text-align: left;
    color: #535353;
    font-weight: 400;
    font-style: italic;
    letter-spacing: 0.5px;
    padding-left: 0px;
    font-family: 'Chathura';
    font-weight: 600;
    margin-bottom: 0;
    text-transform: uppercase;
`

const Slash = styled.span`
    color: #262626;
    font-weight: 400;
    margin-right: 14px;
`
