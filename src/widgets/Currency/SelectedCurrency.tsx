import styled from 'styled-components'

export default function SelectedCurrency() {
    return (
        <div>
            <Select disabled>
                <option value="CZK">CZK</option>
            </Select>
        </div>
    )
}

const Select = styled.select`
padding: 8px 12px;
border: none;
border-radius: 4px;
font-size: 14px;
width: 74px;
color: #ffffff3f;
cursor: pointer;
background-color: transparent;
position: absolute;
top: 20px;
right: 25px;
z-index: 1001;

&:focus{
    outline: none;
}
`