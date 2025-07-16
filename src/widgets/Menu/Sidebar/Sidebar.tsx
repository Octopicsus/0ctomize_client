import styled from "styled-components"
import LogoutButton from "./LogoutButton"

export default function Sidebar() {
  return (
    <Wrapper>
    
            <LogoutButton/>
   
    </Wrapper>
  )
}

const Wrapper = styled.div`
width: 44px;
height: calc(100vh - 40px);
box-sizing: border-box;
background-color: #161616;
position: fixed;
top: 40px;
left: 0;
z-index: 100;
display: flex;
justify-content: center;
align-items: flex-end;
padding-bottom: 70px;
`
