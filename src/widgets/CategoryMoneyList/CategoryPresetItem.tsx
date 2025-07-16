import styled from "styled-components"
import CategoryIconPlace from "../Placeholders/CategoryIconPlace"

export type Props = {
  title: string
  img: string
  color?: string
  onClick?: (title: string, img: string, color?: string) => void 
}

export default function CategoryPresetItem({ title, img, color, onClick }: Props) {
  const handleClick = () => {
    if (onClick) {
      onClick(title, img, color)  
    }
  }

  return (
    <Button type="button" onClick={handleClick}>
      <CategoryIconPlace img={img} color={color}/>
      <Desc>{title}</Desc>
    </Button>
  )
}

const Desc = styled.h5`
font-size: 14px;
font-weight: 300;
margin-top: 6px;
`

const Button = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%; 
`