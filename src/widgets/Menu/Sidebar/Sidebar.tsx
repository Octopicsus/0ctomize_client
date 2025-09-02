import styled from "styled-components"
import LogoutButton from "./LogoutButton"
import { useNavigate } from 'react-router-dom'

export default function Sidebar() {
  const navigate = useNavigate()

  return (
    <Wrapper>
      <Buttons>
        <NavButton onClick={() => navigate('/bank')} title="Bank">
        </NavButton>
        <LogoutButton/>
      </Buttons>
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
`

const Buttons = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding-bottom: 70px;
`

const NavButton = styled.button`
width: 30px;
height: 30px;
background: transparent;
background-image: url('/img/Layout/calendar.svg');
background-size: 20px 20px;
background-repeat: no-repeat;
background-position: center;
border: none;
outline: 1px solid white;
border-radius: 50%;
opacity: 0.2; 
cursor: pointer;
transition: all 0.3s ease;
filter: brightness(0) invert(1); 

&:hover {
  opacity: 0.8;
}
`
