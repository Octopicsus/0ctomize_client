import styled from "styled-components"
import colors from "../../ui/colorsPalette"
import { useSelector } from "react-redux"
import { RootState } from "../../store/store"

type Events = {
    onClick: () => void,
}

function getbuttonLable(category: string): any {
    switch (category) {
        case 'Income':
            return "+"
        case 'Expense':
            return "+"
    }
}

export default function InputButton({ onClick }: Events) {
    const category = useSelector((state: RootState) => state.category.category)

    return (
        <Button
            onClick={onClick}
            type="button"
        >
            {getbuttonLable(category)}
        </Button>
    )
}

const Button = styled.button`
width: 40px;
height: 40px;
border-radius: 50%;
background-color: ${colors.brandColor};
color: black;
border: none;
font-size: 28px;
font-weight: bolder;
cursor: pointer;
position: absolute;
bottom: 20px;
right: 20px;
`