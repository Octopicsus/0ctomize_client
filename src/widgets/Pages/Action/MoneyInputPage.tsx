import { useDispatch, useSelector } from "react-redux"
import BackButton from "../../Buttons/BackButton"
import { RootState, AppDispatch } from "../../../store/store"
import styled from "styled-components"
import { useState, useEffect } from "react"
import { createTransaction, updateTransaction, moneyAdapter, fetchTransactions } from "../../../store/features/moneyHistorySlice"
import { getBalance } from "../../../utils/balanceCalc"
import { useLocation, useNavigate } from "react-router"
import { CATEGORY } from "../../../enums/categoryTitles"
import colors from "../../../ui/colorsPalette"
import CategoryMoneyList from "../../CategoryMoneyList/CategoryMoneyList"
import CategoryCustomList from "../../CategoryMoneyList/CategoryCustomList"
import CategoryPresetItem from "../../CategoryMoneyList/CategoryPresetItem"
import { LINK_ROUTES } from "../../../enums/routes"
import { setCategory } from "../../../store/features/categorySlice"



export default function MoneyInputPage() {
  const location = useLocation()
  const editItem = location.state?.item
  const isShowTitle = true
  const [amount, setAmount] = useState(editItem ? String(editItem.originalAmount || editItem.amount) : "")
  const [actionDesc, setActionDesc] = useState(editItem ? editItem.description : "")
  const [actionTitle, setActionTitle] = useState(editItem ? editItem.title : "")
  const [img, setImg] = useState(editItem ? editItem.img || "" : "")
  const [currentColor, setColor] = useState(editItem ? editItem.color : "#353434")
  const [date, setDate] = useState(
    editItem && editItem.date ? editItem.date : new Date().toISOString().slice(0, 10)
  )
  const dispatch = useDispatch<AppDispatch>()
  const category = useSelector((state: RootState) => state.category.category)
  const selectAll = moneyAdapter.getSelectors(
    (state: RootState) => state.moneyHistory
  ).selectAll
  const navigate = useNavigate()
  const items = useSelector(selectAll)
  const balance = getBalance(items)
  const pageTitle = category
  const numAmount = Number(amount)
  const isExpense = category === CATEGORY.EXPENSE
  const isBlocked = isExpense && numAmount > balance

  useEffect(() => {
    if (editItem && editItem.type) {
      dispatch(setCategory(editItem.type))
    }
  }, [editItem, dispatch])

  const handlePresetSelect = (title: string, img: string, color?: string) => {
    setActionTitle(title)
    setImg(img)
    if (color) {
      setColor(color)
    }
  }

  const handleCustomPage = () => {
    navigate(LINK_ROUTES.CUSTOM_CATEGORY)
  }

  const handleAdd = () => {
    if (numAmount > 0 && !isBlocked) {
      const now = new Date()
      const formattedDate = date
      let formattedTime = now.toTimeString().slice(0, 8)

      if (editItem) {
        if (editItem.date === formattedDate) {
          formattedTime = editItem.time
        }

        dispatch(updateTransaction({
          transactionId: editItem._id,
          updateData: {
            type: editItem.type, 
            title: actionTitle,
            description: actionDesc,
            amount: numAmount,
            originalAmount: numAmount,
            originalCurrency: 'CZK',
            date: formattedDate,
            time: formattedTime,
            img: img,
            color: currentColor,
          }
        }))

        dispatch(fetchTransactions())

        setTimeout(() => {
          dispatch(fetchTransactions()) 
          navigate(LINK_ROUTES.DASHBOARD)
        }, 300)

      } else {
        dispatch(createTransaction({
          type: category,
          title: actionTitle,
          description: actionDesc,
          amount: numAmount,
          originalAmount: numAmount,
          originalCurrency: 'CZK',
          date: formattedDate,
          time: formattedTime,
          img: img,
          color: currentColor,
        }))
      }

      setAmount("")
      setActionTitle("")
      setActionDesc("")
      setDate(new Date().toISOString().slice(0, 10))

      navigate(LINK_ROUTES.DASHBOARD)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter") {
      handleAdd()
    }
  }

  return (
    <MoneyPageInput>
      <InputWrapper >
        <CategoryTypeTitle>{pageTitle}</CategoryTypeTitle>
        <Form onKeyDown={handleKeyDown}>
          {isShowTitle && (<InputItem
            type="text"
            name="moneyTitleInput"
            value={actionTitle}
            onChange={event => setActionTitle(event.target.value)}
            placeholder="Category"
            readOnly
            style={{
              outline: 'none',
              pointerEvents: 'none',
            }}
          />
          )}

          <InputItem
            type="text"
            name="moneyDescInput"
            value={actionDesc}
            onChange={event => setActionDesc(event.target.value)}
            placeholder="Description"
          />

          <InputItem
            type="number"
            name="moneyAmountInput"
            value={amount}
            onChange={event => setAmount(event.target.value)}
            placeholder="Amount"
          />

          <CustomItemWrapper onClick={handleCustomPage}>
            <CategoryPresetItem
              title="Add"
              img="/img/custom_icon.svg"
            />
          </CustomItemWrapper>

          <CategoryCustomList onPresetSelect={handlePresetSelect} />

          <CategoryMoneyList onPresetSelect={handlePresetSelect} />

          {editItem && (<InputItem
            type="date"
            name="moneyDateInput"
            lang="en"
            value={date}
            onChange={event => setDate(event.target.value)}
            $empty={!date}
          />
          )}

          <SubmitButton
            onClick={handleAdd}
            disabled={
              !actionTitle.trim() ||
              !amount.trim() ||
              isBlocked ||
              numAmount <= 0
            }
          >
            {editItem ? "Edit" : "Add"}
          </SubmitButton>
        </Form>
      </InputWrapper>
      <BackButton />
    </MoneyPageInput >
  )
}



const CategoryTypeTitle = styled.h2`
text-align: left;
margin-bottom: 30px;
`

const MoneyPageInput = styled.div`
height : 100vh;
position: relative;
display: flex;
justify-content: center;
align-items: center;
`

const InputWrapper = styled.div`
margin: 0 auto;
width: 300px;
display: flex;
flex-direction: column;
`

const Form = styled.form`
display: flex;
flex-direction: column;
`

const InputItem = styled.input<{ $empty?: boolean }>`
  margin-bottom: 10px;
  width: 90%;
  height: 28px;
  padding-left: 10px;
  box-sizing: border-box;
  border-radius: 14px;
  border: none;
  background-color: #363636;
  color: ${({ $empty }) => ($empty ? "#808080" : "#ffffff")};

  &::placeholder {
    color: #808080;
    opacity: 1;
  }

  &::-webkit-calendar-picker-indicator {
    filter: invert(50%) saturate(0%);
    margin-right: 10px;
    cursor: pointer;
  }
`

const SubmitButton = styled.button`
background-color: transparent;
color: ${colors.brandColor};
border: solid 1px  ${colors.brandColor};
padding: 8px 20px;
font-weight: bolder;
border-radius: 20px;
cursor: pointer;
margin-top: 30px;
`

const CustomItemWrapper = styled.div`
width: 34px;
height: 34px;
background-color: #3a5268;
border-radius: 50%;
margin: 14px;
`