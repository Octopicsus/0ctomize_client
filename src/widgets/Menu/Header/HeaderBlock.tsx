import styled from "styled-components"
import AccountInfo from "./AccountInfo"
import RefreshTransactionsButton from "../../Buttons/RefreshTransactionsButton"

export default function HeaderBlock() {
    return (
        <Header>
            <Left>
                <RefreshTransactionsButton />
            </Left>
            <Right>
                <AccountInfo />
            </Right>
        </Header>
    )
}

const Header = styled.div`
    width: 100vw;
    box-sizing: border-box;
    position: fixed;
    top: 0;
    left: 0;
    background-color: #161616;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 20px;
    z-index: 1000;
    backdrop-filter: blur(10px);
`

const Left = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`

const Right = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`