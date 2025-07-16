import styled from "styled-components"
import AccountInfo from "./AccountInfo"

export default function HeaderBlock() {
    return (
        <Header>
            <AccountInfo />
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
justify-content: flex-end;
align-items: center;
padding: 8px 20px;
z-index: 1000;
backdrop-filter: blur(10px);
`