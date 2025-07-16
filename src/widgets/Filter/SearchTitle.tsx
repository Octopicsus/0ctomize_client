import styled from "styled-components"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../store/store"
import { setSearchTerm, clearSearchTerm } from "../../store/features/searchSlice"

export default function SearchTitle() {
    const dispatch = useDispatch()
    const searchValue = useSelector((state: RootState) => state.search.searchTerm)

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        dispatch(setSearchTerm(value))
    }

    const handleClear = () => {
        dispatch(clearSearchTerm())
    }

    return (
        <Wrapper>
            <Icon />
            <Input
                placeholder="Search"
                value={searchValue}
                onChange={handleInputChange}
            />
            {searchValue && (<ClearButton onClick={handleClear} />)}
        </Wrapper>
    )
}

const Wrapper = styled.div`
width: 100%;
height: 34px;
margin-bottom: 14px;
border-radius: 16px;
background-color: #2c2c2c;
display: flex;
align-items: center;
margin-left: auto;
margin-right: auto;

`

const Input = styled.input`
width: 300px;
height: 34px;
background-color: transparent;
border: none;
box-sizing: border-box;
padding: 0 6px;
font-size: 14px;

&:focus {
    outline: none;
    border: none;
}
`

const Icon = styled.div`
width: 30px;
height: 30px;
margin-left: 8px;
box-sizing: border-box;
background-image: url('/img/icon-search.svg');
background-size: 20px;
background-repeat: no-repeat;
background-position: center;
opacity: 0.7;
`

const ClearButton = styled.div`
width: 24px;
height: 24px;
margin-right: 8px;
background-image: url('/img/icon-cancel.svg');
background-size: 20px;
background-repeat: no-repeat;
background-position: center;
cursor: pointer;
`