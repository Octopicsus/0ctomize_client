import styled from "styled-components"
import { useSelector } from "react-redux"
import { RootState } from "../../../store/store"
import { useState } from "react"

export default function AccountInfo() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true);
  }

  const hasValidPicture = user?.picture && !imageError;

  return (
    <Wrapper>
        {hasValidPicture ? (
          <GoogleAvatar 
            src={user.picture} 
            alt={user.name || user.email || 'User'}
            onError={handleImageError}
          />
        ) : (
          <DefaultAvatar>
            {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
          </DefaultAvatar>
        )}
        <AccountName>{user?.name || user?.email || 'User'}</AccountName>
    </Wrapper>
  )
}


const Wrapper = styled.div`
margin-right: 30px;
display: flex;
align-items: center;
gap: 10px;
`

const GoogleAvatar = styled.img`
width: 20px;
height: 20px;
border-radius: 50px;
object-fit: cover;
border: 2px solid rgba(255, 255, 255, 0.1);
transition: border-color 0.3s ease;

&:hover {
  border-color: rgba(255, 255, 255, 0.3);
}

&:error {
  display: none;
}
`

const DefaultAvatar = styled.div`
width: 40px;
height: 40px;
background-color: #292929;
border-radius: 50px;
display: flex;
align-items: center;
justify-content: center;
color: white;
font-weight: 500;
font-size: 16px;
border: 2px solid rgba(255, 255, 255, 0.1);
text-transform: uppercase;
`

const AccountName = styled.h5`
font-weight: 400;
color: white;
margin: 0;
opacity: 0.8;
`
