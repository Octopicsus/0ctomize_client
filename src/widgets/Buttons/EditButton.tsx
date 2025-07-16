import styled from "styled-components"

type Events = {
    onClick: () => void,
}

export default function EditButton({ onClick }: Events) {
    return (
        <Button
            onClick={onClick}
            type="button"
        >
            Edit
        </Button>
    )
}

const Button = styled.button`
background-color: transparent;
border: none;
width: 80px;
height: 40px;
cursor: pointer;
position: fixed;
top: 40px;
right: 40px;
z-index: 1000;
`