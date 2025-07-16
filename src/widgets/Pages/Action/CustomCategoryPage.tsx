import styled from "styled-components"
import CategoryIconsList from "../../CategoryMoneyList/CategoryIconsList"
import CategoryCustomDemo from "../../CategoryMoneyList/CategoryCustomDemo"
import { useNavigate } from "react-router"
import { LINK_ROUTES } from "../../../enums/routes"
import CategoryCustomList from "../../CategoryMoneyList/CategoryCustomList"
import { useSelector } from "react-redux"
import { RootState } from "../../../store/store"
import { CATEGORY } from "../../../enums/categoryTitles"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { createCustomCategory } from "../../../store/features/customCategorySlice"
import { AppDispatch } from "../../../store/store"


export default function CustomCategoryPage() {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const type = useSelector((state: RootState) => state.category.category)
    const { loading, error } = useSelector((state: RootState) => state.customCategory)
    const [selectedType, setSelectedType] = useState(type)
    const [categoryItem, setCategoryItem] = useState("Category")
    const [selectedIcon, setSelectedIcon] = useState<string>("/public/img/custom_icon.svg")

    const handleBack = () => {
        navigate(LINK_ROUTES.MONEY_INPUT)
    }

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedType(event.target.value)
    }

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCategoryItem(event.target.value)
    }

    const handleIconSelect = (img: string) => {
        setSelectedIcon(img)
    }

    const handleAdd = async (event: React.FormEvent) => {
        event.preventDefault()
        if (categoryItem.trim() && selectedIcon) {
            try {
                await dispatch(createCustomCategory({ 
                    name: categoryItem.trim(), 
                    iconPath: selectedIcon 
                })).unwrap()
                handleBack()
            } catch (error) {
                console.error('Failed to create category:', error)
            }
        }
    }


    return (
        <>
            <CustomCategoryPageInput>
                <div>Custom Category</div>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <Form onSubmit={handleAdd}>
                    <InputWrapper>
                        <Input 
                            type="text" 
                            name="categoryTitle" 
                            value={categoryItem}
                            onChange={handleTitleChange} 
                            placeholder="Enter category name"
                            disabled={loading}
                        />
                        <Select value={selectedType} onChange={handleSelectChange} disabled={loading}>
                            <option value={CATEGORY.EXPENSE}>Expense</option>
                            <option value={CATEGORY.INCOME}>Income</option>
                        </Select>
                    </InputWrapper>
                    <CategoryIconsList onIconSelect={handleIconSelect} />
                    <CategoryCustomDemo title={categoryItem} img={selectedIcon} />
                    <CategoryCustomList />
                    <div>
                        <button type="reset" onClick={handleBack} disabled={loading}>Cancel</button>
                        <button type="submit" disabled={loading || !categoryItem.trim()}>
                            {loading ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                </Form>
            </CustomCategoryPageInput>
        </>
    )
}


const InputWrapper = styled.div`
  margin: 0 auto;
  width: 300px;
  display: flex;
  flex-direction: column;
`

const CustomCategoryPageInput = styled.div`
height : 100vh;
position: relative;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
`

const Input = styled.input`
  margin-bottom: 10px;
  width: 90%;
  height: 28px;
  padding-left: 10px;
  box-sizing: border-box;
  border-radius: 14px;
  border: none;
  background-color: #363636;
  color: #ffffff;
  &::placeholder {
    color: #808080;
    opacity: 1;
  }
`

const Select = styled.select`
  width: 90%;
  height: 30px;
  padding-left: 10px;
  padding-right: 36px;
  border-radius: 14px;
  border: none;
  background-color: #32394f;
  color: #fff;
  font-size: 14px;
  margin-bottom: 10px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='16' height='10' viewBox='0 0 16 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L8 8L15 1' stroke='%23808080' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 10px 8px;
  transition: box-shadow 0.2s;
  cursor: pointer;

  &:focus {
    outline: none;
  }
`

const Form = styled.form`
display: flex;
flex-direction: column;
`

const ErrorMessage = styled.div`
  color: #ff4444;
  background-color: rgba(255, 68, 68, 0.1);
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 10px;
  font-size: 14px;
  text-align: center;
`
