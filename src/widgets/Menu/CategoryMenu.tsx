import styled from "styled-components"
import { setCategory } from "../../store/features/categorySlice"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../store/store"
import { useNavigate } from "react-router"
import { LINK_ROUTES } from "../../enums/routes"

export default function Header() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const category = useSelector((state: RootState) => state.category.category)

    const handleSwitchCategory = (category: string) => {
        dispatch(setCategory(category))
        navigate(category === "Expense" ? LINK_ROUTES.EXPENSE : LINK_ROUTES.INCOME)
    }

    return (
        <HeaderWrapper>
            <CategoryButton
                type="button"
                $active={category === "Expense"}
                onClick={() => handleSwitchCategory("Expense")}
            >
                Expenses
            </CategoryButton>

            <CategoryButton
                type="button"
                $active={category === "Income"}
                onClick={() => handleSwitchCategory("Income")}
            >
                Income
            </CategoryButton>

        </HeaderWrapper>
    )
}

const HeaderWrapper = styled.header`
  display: flex;
  justify-content: center;
  width: 40%;
  gap: 40px;
  margin: 0 auto;
`

const CategoryButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: none;
  background: ${({ $active }) => ($active ? "#ffffff" : "#787878")};
  color: ${({ $active }) => ($active ? "#2f2f2f" : "#ffffff")};
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
`





