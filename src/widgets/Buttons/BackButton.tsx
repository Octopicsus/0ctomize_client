import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from '../../store/store'
import styled from 'styled-components'
import getCategoryPath from '../../utils/categoryPath'

export default function BackButton() {
    const navigate = useNavigate()
    const category = useSelector((state: RootState) => state.category.category)

    const handleBack = () => {
        navigate(getCategoryPath(category))
    }

    return (
        <ReturnButton onClick={handleBack}>Back</ReturnButton>
    )
}

const ReturnButton = styled.button`
background-color: transparent;
padding: 10px 15px;
border: none;
color: white;
position: fixed;
top: 40px;
left: 40px;
z-index: 1000;
cursor: pointer;
`