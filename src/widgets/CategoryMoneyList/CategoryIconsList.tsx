import { useEffect, useState, memo } from "react"
import axios from "axios"
import styled from "styled-components"
import SubTitle from "../Layout/SubTitle"
import CategoryIconPlace from "../Placeholders/CategoryIconPlace"
import { API_ENDPOINTS } from "../../api/api"

type CategoryIcon = {
  img: string
}

type Props = {
  onIconSelect?: (img: string) => void
}

const CategoryIconsList = memo(({ onIconSelect }: Props) => {
  const [icons, setIcons] = useState<CategoryIcon[]>([])

  useEffect(() => {
    const getIcons = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.ICONS)
        setIcons(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    getIcons()
  }, [])

  return (
    <div>
      <SubTitle title="Design" />
      <WrapperList>
        {icons.map((icon, id) => (
          <Wrapper key={id} onClick={() => onIconSelect?.(icon.img)}>
            <CategoryIconPlace img={icon.img} />
          </Wrapper>
        ))}
      </WrapperList>
    </div>
  )
})

CategoryIconsList.displayName = 'CategoryIconsList'
export default CategoryIconsList



const WrapperList = styled.div`
display: grid;
grid-template-columns: repeat(4, 1fr);
gap: 10px;
list-style: none;
padding: 0;
margin: 20px 0;
border: 1px darkgray solid;
padding: 20px 8px; 
`

const Wrapper = styled.div`
display: flex;
justify-content: center;
align-items: center;
cursor: pointer;
`

