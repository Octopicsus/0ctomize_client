import styled from "styled-components"
import CategoryIconPlace from "../Placeholders/CategoryIconPlace"


type Props = {
    title: string
    img: string
}

export default function CategoryCustomDemo({ title, img }: Props) {
 
    
    return (
        <DemoWrapper>
            <Content>
                <CategoryIconPlace img={img} size="80px" />
                <Title>{title}</Title>
            </Content>
        </DemoWrapper>
    )
}

const DemoWrapper = styled.div`
background-color: #555555;
`

const Content = styled.div`
display: flex;
flex-direction: column;
align-items: center;
padding: 30px 0;
`

const Title = styled.div`
font-size: 20px;
margin-top: 8px;
`

