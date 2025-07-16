import axios from "axios"
import { useEffect, useState } from "react"
import styled from "styled-components"
import CategoryPresetItem from "./CategoryPresetItem"
import { useSelector } from "react-redux"
import { RootState } from "../../store/store"
import SubTitle from "../Layout/SubTitle"
import { API_ENDPOINTS } from "../../api/api"

export type CategoryType = {
    title: string
    img: string
    color: string
}

export type CategoryMoneyListProps = {
    onPresetSelect?: (title: string, img: string, color?: string) => void
}

export default function CategoryMoneyList({ onPresetSelect }: CategoryMoneyListProps) {
    const category = useSelector((state: RootState) => state.category.category)

    const categoryType = category.toLowerCase()

    const [categories, setCategories] = useState<CategoryType[]>([])

    useEffect(() => {
        const getCategories = async () => {
            try {
                const result = await axios.get(API_ENDPOINTS.CATEGORIES)
                const categoriesData = result.data[categoryType]
                if (categoriesData && Array.isArray(categoriesData)) {
                    setCategories(categoriesData)
                } else {
                    setCategories([])
                }
            } catch (error) {
                console.error('Error loading categories:', error)
                setCategories([])
            }
        }
        getCategories()
    }, [categoryType]) 

    return (
        <>
            <SubTitle title="Presets" />
            <ListWrapper>
                <ul>
                    {categories && categories.length > 0 ? (
                        categories.map(cat => (
                            <li key={cat.title}>
                                <CategoryPresetItem
                                    title={cat.title}
                                    img={cat.img}
                                    color={cat.color}
                                    onClick={onPresetSelect}
                                />
                            </li>
                        ))
                    ) : (
                        <li>Loading categories...</li>
                    )}
                </ul>
            </ListWrapper>
        </>
    )
}

const ListWrapper = styled.div`
  margin-top: 20px;
  ul {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 12px;
  }
`

