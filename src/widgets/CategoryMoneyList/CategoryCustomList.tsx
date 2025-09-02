import styled from "styled-components"
import CategoryPresetItem from "./CategoryPresetItem"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "../../store/store"
import { useLocation } from "react-router-dom"
import { LINK_ROUTES } from "../../enums/routes"
import { deleteCustomCategory, fetchUserCategories } from "../../store/features/customCategorySlice"
import { useEffect } from "react"

type Props = {
    onPresetSelect?: (title: string, img: string) => void
}

export default function CategoryCustomList({ onPresetSelect }: Props) {
    const { list: customCatList, loading, error } = useSelector((state: RootState) => state.customCategory)
    const dispatch = useDispatch<AppDispatch>()
    const location = useLocation()

    useEffect(() => {
        dispatch(fetchUserCategories())
    }, [dispatch])

    const filteredList = customCatList

    const isCustomCategoryPage = location.pathname.includes(LINK_ROUTES.CUSTOM_CATEGORY)

    const handleClick = async (title: string, img: string) => {
        if (isCustomCategoryPage) {
            const categoryToDelete = customCatList.find(cat => cat.name === title && cat.iconPath === img)
            if (categoryToDelete && categoryToDelete._id) {
                try {
                    await dispatch(deleteCustomCategory(categoryToDelete._id)).unwrap()
                } catch (error) {
                    console.error('Failed to delete category:', error)
                }
            }
        } else if (onPresetSelect) {
            onPresetSelect(title, img)
        }
    }

    if (loading) {
        return <LoadingMessage>Loading categories...</LoadingMessage>
    }

    if (error) {
        return <ErrorMessage>Error: {error}</ErrorMessage>
    }

    return (
        <>
            {(!filteredList || filteredList.length === 0) && <p>no items</p>}
            <ListWrapper>
                <ul>
                    {filteredList && Array.isArray(filteredList) ? (
                        filteredList.map((cat, id) => (
                            <li key={cat._id || id}>
                                <CategoryPresetItem
                                    title={cat.name}
                                    img={cat.iconPath}
                                    onClick={handleClick}
                                />
                            </li>
                        ))
                    ) : null}
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

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #808080;
`

const ErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #ff4444;
  background-color: rgba(255, 68, 68, 0.1);
  border-radius: 4px;
  margin: 10px;
`