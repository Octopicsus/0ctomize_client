import styled from "styled-components"
import TransactionHeader from "./TransactionHeader"
import { useNavigate, useLocation } from "react-router-dom"
import { LINK_ROUTES } from "../../../../../enums/routes"
import { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "../../../../../store/store"
import { moneyAdapter, createTransaction, updateTransaction, fetchTransactions, applyCategoryBulk, deleteTransaction } from "../../../../../store/features/moneyHistorySlice"
import { transactionsAPI } from "../../../../../api/api";
import { getBalance } from "../../../../../utils/balanceCalc"
import * as yup from 'yup'


export default function TransactionInput() {
    const navigate = useNavigate()
    const location = useLocation()
    const editItem = location.state?.item
    const dispatch = useDispatch<AppDispatch>()
    const hiddenDateInput = useRef<HTMLInputElement>(null)
    const [currencyData, setCurrencyData] = useState<any[]>([])
    const [expenseCategories, setExpenseCategories] = useState<any[]>([])
    const [incomeCategories, setIncomeCategories] = useState<any[]>([])
    const [selectedTransactionType, setSelectedTransactionType] = useState<'income' | 'expense'>(
        editItem ? (editItem.type === 'Income' ? 'income' : 'expense') : 'expense'
    )
    // For imported bank tx: title = merchant, category stored separately (possibly undefined for manual historic entries)
    const [selectedCategory, setSelectedCategory] = useState<string>(editItem ? (editItem.category || (editItem.type ? editItem.title : '')) : '')
    // Always derive color from categories.json (transaction stored color may be outdated or empty)
    const [selectedCategoryColor, setSelectedCategoryColor] = useState<string>('')
    const [transactionValue, setTransactionValue] = useState<string>(editItem ? String(editItem.amount) : '')
    // Display merchant/title for bank, otherwise existing description (user text)
    // For manual transactions previously брали description вместо title — исправлено: всегда используем title.
    const [transactionTitle, setTransactionTitle] = useState<string>(editItem ? editItem.title : '')
    // Description при редактировании: приоритет notes, затем description
    const [transactionDescription, setTransactionDescription] = useState<string>(editItem ? (editItem.notes || editItem.description || '') : '')
    const [isInputFocused, setIsInputFocused] = useState<boolean>(false)
    const [showBulkModal, setShowBulkModal] = useState(false)
    const [similarCount, setSimilarCount] = useState<number>(0)
    const [pendingCategory, setPendingCategory] = useState<string | null>(null)
    const [manualCategoryTouched, setManualCategoryTouched] = useState(false)
    const accessToken = useSelector((state: RootState) => state.auth.accessToken)

    const selectAll = moneyAdapter.getSelectors(
        (state: RootState) => state.moneyHistory
    ).selectAll
    const items = useSelector(selectAll)
    const balance = getBalance(items)

    const currentCurrencyCode = useSelector((state: RootState) => state.currency.to)

    useEffect(() => {
        const loadCurrencyData = async () => {
            try {
                const response = await fetch('/data/currency.json')
                const data = await response.json()
                setCurrencyData(data.currencies)
            } catch (error) {
                console.error('Error loading currency data:', error)
            }
        }
        loadCurrencyData()
    }, [])

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await fetch('/data/categories.json')
                const data = await response.json()
                setExpenseCategories(data.expense)
                setIncomeCategories(data.income)
            } catch (error) {
                console.error('Error loading categories:', error)
            }
        }
        loadCategories()
    }, [])

    // When editing an existing transaction, sync category color with canonical palette once categories are loaded
    useEffect(() => {
        if (!editItem) return
        if (!selectedCategory) return
        if (!expenseCategories.length && !incomeCategories.length) return
        const pool = [...expenseCategories, ...incomeCategories]
        const meta = pool.find(c => c.title === selectedCategory)
        if (meta && meta.color && meta.color !== selectedCategoryColor) {
            setSelectedCategoryColor(meta.color)
        }
    }, [editItem, selectedCategory, expenseCategories, incomeCategories])

    const currentCurrency = currencyData.find(curr => curr.code === currentCurrencyCode)
    const currencySign = currentCurrency ? currentCurrency.sign : "Kč"

    const formatDate = (dateString: string) => {
        if (!dateString) return "Select Date"

        const date = new Date(dateString)
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }

        return date.toLocaleDateString('en-US', options)
    }

    const getCurrentDate = () => {
        const today = new Date()
        return today.toISOString().split('T')[0]
    }

    const [displayDate, setDisplayDate] = useState(() => formatDate(editItem ? editItem.date : getCurrentDate()))

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = e.target.value
        setDisplayDate(formatDate(selectedDate))
    }

    const handleDisplayDateClick = () => {
        hiddenDateInput.current?.showPicker()
    }

    const handleCancel = () => {
        navigate(LINK_ROUTES.DASHBOARD)
    }

    const handleTransactionTypeChange = (type: 'income' | 'expense') => {
        setSelectedTransactionType(type)
        if (!editItem) {
            setSelectedCategory('')
            setSelectedCategoryColor('')
        }
    }

    const handleCategorySelect = async (categoryTitle: string, categoryColor: string) => {
        setManualCategoryTouched(true)
        setSelectedCategory(categoryTitle)
        setSelectedCategoryColor(categoryColor)
        if (editItem && editItem._id && accessToken && categoryTitle !== editItem.category) {
            try {
                const similar = await transactionsAPI.getSimilarById(accessToken, editItem._id)
                if (similar.total > 1) {
                    setSimilarCount(similar.total)
                    setPendingCategory(categoryTitle)
                    setShowBulkModal(true)
                }
            } catch (e) {
                // silent
            }
        }
    }

    // Auto-suggest category for NEW manual transaction (no editItem) when title changes debounce
    useEffect(() => {
        if (editItem) return; // только для новых
        if (manualCategoryTouched) return; // не переопределяем ручной выбор
        const title = transactionTitle.trim();
        if (!title || !accessToken) return;
        if (!expenseCategories.length && !incomeCategories.length) return; // подождём загрузку
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/,'');
        const h = setTimeout(async () => {
            try {
                const resp = await fetch(`${baseUrl}/api/transactions/suggest?title=${encodeURIComponent(title)}`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
                if (!resp.ok) return;
                const data = await resp.json();
                if (data.found && data.category && !selectedCategory) {
                    const pool = [...expenseCategories, ...incomeCategories];
                    const catMeta = pool.find(c => c.title === data.category);
                    if (catMeta) {
                        setSelectedCategory(catMeta.title);
                        setSelectedCategoryColor(catMeta.color);
                        if (selectedTransactionType === 'income' && catMeta.type !== 'Income') {
                            setSelectedTransactionType('expense');
                        }
                    }
                }
            } catch {}
        }, 400);
        return () => clearTimeout(h);
    }, [transactionTitle, accessToken, editItem, selectedCategory, manualCategoryTouched, expenseCategories, incomeCategories, selectedTransactionType]);

    const handleCategorySelectorClick = () => {
        if (selectedCategory) {
            setSelectedCategory('')
            setSelectedCategoryColor('')
        }
    }

    const handleTransactionValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value
        const currencyRegex = new RegExp(`\\s*${currencySign.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)

        value = value.replace(currencyRegex, '')
        value = value.replace(/[^0-9.]/g, '')

        try {
            transactionValueSchema.validateSync(value)
            setTransactionValue(value)
        } catch (error) {
        }
    }

    const handleInputFocus = () => {
        setIsInputFocused(true)
    }

    const handleInputBlur = () => {
        setIsInputFocused(false)
    }

    const getDisplayValue = () => {
        if (!transactionValue) return ''

        if (isInputFocused) {
            return transactionValue
        }

        let formatted = transactionValue

        if (formatted && !formatted.includes('.')) {
            formatted = `${formatted}.00`
        }

        else if (formatted.endsWith('.')) {
            formatted = `${formatted}00`
        }

        else if (formatted.includes('.') && formatted.split('.')[1].length === 1) {
            formatted = `${formatted}0`
        }

        return `${formatted} ${currencySign}`
    }

    const currentCategories = selectedTransactionType === 'expense' ? expenseCategories : incomeCategories

    const calculateRemainingBalance = (): string => {
        const amount = Number(transactionValue || 0)
        return selectedTransactionType === 'expense' 
            ? (balance - amount).toFixed(2)
            : (balance + amount).toFixed(2)
    }

    const transactionValueSchema = yup.string()
        .matches(/^[0-9]*\.?[0-9]{0,2}$/, 'Invalid number format')
        .test('no-leading-zeros', 'No leading zeros allowed', (value) => {
            if (!value || value === '0' || value.startsWith('0.')) return true
            return !value.startsWith('0')
        })
        .test('valid-decimal', 'Invalid decimal format', (value) => {
            if (!value) return true
            const parts = value.split('.')
            if (parts.length > 2) return false
            if (parts.length === 2 && parts[1].length > 2) return false
            return true
        })
        .test('not-empty-decimal', 'Invalid format', (value) => {
            if (!value) return true
            return value !== '.'
        })

    const handleAdd = () => {
        const numAmount = Number(transactionValue)
        if (numAmount > 0 && selectedCategory && transactionTitle.trim()) {
            const now = new Date()
            const formattedTime = now.toTimeString().slice(0, 8)

            const currentCategory = currentCategories.find(cat => cat.title === selectedCategory)
            const categoryImg = currentCategory ? currentCategory.img : ''

            const dateValue = hiddenDateInput.current?.value || (editItem ? editItem.date : getCurrentDate())

            const transactionData = {
                type: selectedTransactionType === 'income' ? 'Income' : 'Expense',
                // Allow user to edit title (merchant) directly; fallback to previous or selected category
                title: transactionTitle.trim() || (editItem?.title || selectedCategory),
                description: transactionDescription, // move notes->description semantic
                notes: transactionDescription, // keep legacy notes for now
                amount: numAmount,
                originalAmount: numAmount,
                originalCurrency: 'CZK',
                date: dateValue,
                time: editItem && editItem.date === dateValue ? editItem.time : formattedTime,
                img: categoryImg,
                color: selectedCategoryColor,
                category: selectedCategory || editItem?.category || undefined,
            }

            if (editItem) {
                dispatch(updateTransaction({
                    transactionId: editItem._id,
                    updateData: transactionData
                }))
            } else {
                dispatch(createTransaction(transactionData))
            }

            setTransactionValue('')
            setTransactionTitle('')
            setTransactionDescription('')
            setSelectedCategory('')
            setSelectedCategoryColor('')

            dispatch(fetchTransactions())

            setTimeout(() => {
                dispatch(fetchTransactions())
                navigate(LINK_ROUTES.DASHBOARD)
            }, 370)
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            handleAdd()
        }
    }

    const handleDelete = () => {
        if (!editItem?._id) return
        const confirmed = window.confirm('Delete this transaction?')
        if (!confirmed) return
        const numericId = editItem.id || (parseInt(editItem._id, 16) % 1000000)
        dispatch(deleteTransaction({ transactionId: editItem._id, itemId: numericId }))
        setTimeout(() => navigate(LINK_ROUTES.DASHBOARD), 200)
    }

    return (
        <Wrapper>
            {showBulkModal && pendingCategory && (
                <BulkModalWrapper>
                    <BulkModal>
                        <BulkTitle>Apply "{pendingCategory}" to {similarCount} similar transactions?</BulkTitle>
                        <BulkActions>
                            <button onClick={() => { setShowBulkModal(false); setPendingCategory(null); }}>Only this</button>
                            <button onClick={() => {
                                if (editItem && pendingCategory) {
                                    const catMeta = currentCategories.find(c => c.title === pendingCategory)
                                    dispatch(applyCategoryBulk({ baseId: editItem._id, category: pendingCategory, scope: 'similar', createUserPattern: true, color: catMeta?.color, img: catMeta?.img }))
                                }
                                setShowBulkModal(false); setPendingCategory(null);
                            }}>All {similarCount}</button>
                        </BulkActions>
                    </BulkModal>
                </BulkModalWrapper>
            )}
            <TransactionHeader 
                title="Transaction" 
                initialType={selectedTransactionType}
                onTypeChange={handleTransactionTypeChange} 
            />
            <Form onKeyDown={handleKeyDown}>
                <Content>
                    <WalletWrapper>
                        <DivCenterH>
                            <MyWallet>My Wallet</MyWallet>
                            <Balance>{balance.toFixed(2)}<SignCurrency>{currencySign}</SignCurrency></Balance>
                        </DivCenterH>
                    </WalletWrapper>

                    <div>
                        <DateInput>
                            <DateIcon src="/img/Layout/calendar.svg" alt="Calendar" />
                            <DateDisplay onClick={handleDisplayDateClick}>{displayDate}</DateDisplay>
                            <HiddenDateInput
                                ref={hiddenDateInput}
                                type="date"
                                defaultValue={editItem ? editItem.date : getCurrentDate()}
                                onChange={handleDateChange}
                            />
                        </DateInput>
                    </div>

                    <TrasactionWrapper>
                        <TransactionTitleInput
                            type="text"
                            placeholder="My Transaction"
                            value={transactionTitle}
                            onChange={(e) => setTransactionTitle(e.target.value)}
                        />
                        <TransactionValueWrapper
                            $remainingAmount={calculateRemainingBalance()}
                            $currencySign={currencySign}
                        >
                            <TransactionValueInput
                                type="text"
                                placeholder="0.00 Kč"
                                value={getDisplayValue()}
                                onChange={handleTransactionValueChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                        </TransactionValueWrapper>
                    </TrasactionWrapper>

                    <CategoriesSelectorWrapper>
                        <CategoriesSelector>
                            <SelectorTitle>Category</SelectorTitle>
                            <Selector
                                $hasValue={!!selectedCategory}
                                $bgColor={selectedCategoryColor}
                                onClick={handleCategorySelectorClick}
                            >
                                {selectedCategory || '+'}
                            </Selector>
                        </CategoriesSelector>
                        <BuisnessUnitSelector>
                            <SelectorTitle>Buisness Unit</SelectorTitle>
                            <Selector>+</Selector>
                        </BuisnessUnitSelector>
                    </CategoriesSelectorWrapper>

                    <CategoriesPresets>
                        <CategoriesTitle>
                            {selectedTransactionType === 'expense' ? 'Expense Categories' : 'Income Categories'}
                        </CategoriesTitle>
                        <CategoriesWrapper>
                            {currentCategories.map((category, index) => (
                                <CategoryItem
                                    key={index}
                                    onClick={() => handleCategorySelect(category.title, category.color)}
                                    $isSelected={selectedCategory === category.title}
                                >
                                    <CategoryIcon src={category.img} alt={category.title} $bgColor={category.color} />
                                    <CategoryTitle>{category.title}</CategoryTitle>
                                </CategoryItem>
                            ))}
                        </CategoriesWrapper>
                    </CategoriesPresets>

                    <GoalSelector>
                        <SelectorTitle>Goal</SelectorTitle>
                        <Selector>+</Selector>
                    </GoalSelector>

                    <NoteArea>
                        <SelectorTitle>Note</SelectorTitle>
                        <NoteTextInput
                            placeholder="Here can be your Notes"
                            value={transactionDescription}
                            onChange={(e) => setTransactionDescription(e.target.value)}
                        />
                    </NoteArea>

                    <TagsSelector>
                        <SelectorTitle>Tags</SelectorTitle>
                        <Selector>Add Tag</Selector>
                    </TagsSelector>
                </Content>

                <ActionButtons>
                    <CancelButton
                        type="button"
                        onClick={handleCancel}
                    >
                        Cancel
                    </CancelButton>
                    {editItem && (
                        <DeleteButton type="button" onClick={handleDelete}>Delete</DeleteButton>
                    )}
                    <AddButton
                        type="button"
                        onClick={handleAdd}
                        disabled={!transactionValue || !selectedCategory || !transactionTitle.trim()}
                    >
                        {editItem ? 'Edit' : 'Add'}
                    </AddButton>
                </ActionButtons>
            </Form>
        </Wrapper>
    )
}


const Wrapper = styled.div`
  grid-area: transaction;
  background-color: #80808018;
  border-radius: 10px;
  padding: 5px;
  padding-left: 10px;
  padding-right: 10px;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 10px;
  width: 100%;
  height: auto;
  box-sizing: border-box;
`

const Form = styled.div`
display: flex;
flex-direction: column;
height: 100%;
`

const Content = styled.div`
  width: 100%;
  height: 100%;
  background-color: #212121;
  border-radius: 8px;
  padding-left: 10px;
  padding-right: 10px;
  box-sizing: border-box;
`

const ActionButtons = styled.div`
  display: flex;
  padding-left: 50%;
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 5px;
`

const CancelButton = styled.button`
  flex: 1;
  padding: 6px 10px;
  background-color: transparent;
  border: 1px solid #666;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #333;
    color: white;
  }
`

const AddButton = styled.button<{ disabled?: boolean }>`
  flex: 1;
  padding: 6px 10px;
  background-color: ${props => props.disabled ? '#1a1a1a' : '#2d2d2d'};
  border: none;
  color: ${props => props.disabled ? '#444' : '#717171'};
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.disabled ? '#1a1a1a' : '#e6a500'};
    color: ${props => props.disabled ? '#444' : 'white'};
  }
`

const DeleteButton = styled.button`
    flex: 1;
    padding: 6px 10px;
    background-color: #3b1f1f;
    border: 1px solid #633;
    color: #d07777;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s ease;
    &:hover { background:#b83434; color:#fff; border-color:#b83434; }
`

const WalletWrapper = styled.div`
width: 100%;
display: flex;
flex-direction: column;
align-items: flex-end;
margin-top: 10px;
`

const DivCenterH = styled.div`
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding-right: 10px;
`

const MyWallet = styled.div`
font-size: 13px;
font-weight: 800;
padding: 4px 10px;
border-radius: 15px;
background-color: #363636;
color: #5b5b5b;
width: fit-content;
cursor: pointer;
`

const SignCurrency = styled.span`
font-size: 12px;
font-weight: 300;
padding-left: 4px;
`

const Balance = styled.h5`
margin-top: 4px;
font-size: 12px;
display: flex;
font-weight: 300;
color: #5b5b5b96;
`

const DateInput = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  position: relative;
`

const DateIcon = styled.img`
  width: 14px;
  opacity: 0.3;
`

const DateDisplay = styled.div`
  border: none;
  background-color: transparent;
  color: #707070;
  font-size: 14px;
  font-weight: 300;
  font-family: 'Arial';
  outline: none;
  width: fit-content;
  padding: 4px 8px;
  cursor: pointer;
  user-select: none;
`

const HiddenDateInput = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
`

const TrasactionWrapper = styled.div`
display: flex;
width: 100%;
padding: 0px 10px;
box-sizing: border-box;
justify-content: space-between;
`

const TransactionTitleInput = styled.input`
border: none;
outline: none;
background-color: transparent;
color: white;
font-size: 24px;
font-weight: 800;

&::placeholder{
    color: #bbbbbb;
}
`

const TransactionValueWrapper = styled.div<{ $remainingAmount: string; $currencySign: string }>`
position: relative;

&::after {
    content: '';
    width: 100px;
    position: absolute;
    bottom: -25px;
 
    right: 0;
    height: 2px;
    background: repeating-linear-gradient(
        to right,
        #373737af 0px,
        #4d4d4d8f 4px,
        transparent 4px,
        transparent 8px
    );
}

&::before {
    content: '${props => props.$remainingAmount} ${props => props.$currencySign}';
    position: absolute;
    bottom: -50px;
    right: 0;
    font-size: 12px;
    color: #5b5b5b96;
    white-space: nowrap;
    padding-right: 5px;
}
`

const TransactionValueInput = styled.input`
border: none;
outline: none;
background-color: transparent;
color: white;
font-size: 22px;
font-weight: 800;
text-align: right;
width: 100%;

&::placeholder{
    color: #bbbbbb;
}
`

const CategoriesSelectorWrapper = styled.div`
width: 100%;
display: flex;
justify-content: flex-start;
padding: 10px;
box-sizing: border-box;
gap: 30px;
margin-top: 10px;
`

const CategoriesSelector = styled.div`
display: flex;
flex-direction: column;
`

const SelectorTitle = styled.div`
color: #707070;
font-size: 14px;
font-weight: 300;
margin-bottom: 6px;
text-align: left;
`

const Selector = styled.div<{ $hasValue?: boolean; $bgColor?: string }>`
padding: 5px 14px;
min-width: 50px;
font-weight: 600;
font-size: 14px;
border-radius: 15px;
background-color: ${props => props.$bgColor || (props.$hasValue ? '#474747a1' : '#404040')};
color: ${props => props.$bgColor ? '#2a2a2a' : (props.$hasValue ? '#a8a8a8' : '#989898')};
width: fit-content;
display: flex;
justify-content: center;
border: 1px solid ${props => props.$hasValue ? '#666' : 'grey'};
cursor: pointer;
transition: all 0.2s ease;

&:hover {
    background-color: #555;
}
`

const BuisnessUnitSelector = styled.div`
display: flex;
flex-direction: column;
`

const CategoriesPresets = styled.div`
text-align: left;
padding: 0 10px;
margin-top: 10px;
`

const CategoriesTitle = styled.div`
font-size: 14px;
font-weight: 500;
color: grey;
`

const CategoriesWrapper = styled.div`
width: 100%;
min-height: 80px;
background-color: #272727;
box-sizing: border-box;
margin-top: 10px;
border-radius: 5px;
display: grid;
grid-template-columns: repeat(6, 1fr);
gap: 0px;
padding: 5px;
`

const CategoryItem = styled.div<{ $isSelected?: boolean }>`
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 5px 5px;
cursor: pointer;
min-height: 70px;
transition: transform 0.2s ease;
filter: ${props => props.$isSelected ? 'grayscale(0)' : 'grayscale(1)'};
opacity: ${props => props.$isSelected ? '1' : '0.5'};

&:hover {
    transform: scale(1.05);
    filter: grayscale(0);
    opacity: 1;
}
`

const CategoryIcon = styled.img<{ $bgColor: string }>`
width: 34px;
height: 34px;
border-radius: 50%;
background-color: ${props => props.$bgColor};
border: 3px solid ${props => props.$bgColor};
margin-bottom: 6px;
`

const CategoryTitle = styled.span`
font-size: 11px;
font-weight: 400;
color: #cccccc;
text-align: center;
line-height: 1.2;
max-width: 60px;
`

const GoalSelector = styled.div`
text-align: left;
padding: 5px 10px;
margin-top: 10px;
`

const NoteArea = styled.div`
text-align: left;
padding: 10px;
margin-top: 10px;
box-sizing: border-box;
`

const NoteTextInput = styled.textarea`
width: 100%;
min-height: 50px;
padding: 10px;
box-sizing: border-box;
background-color: #2e2e2e;
resize: none;
border: none;
outline: none;
color: white;
font-family: inherit;
border-radius: 5px;

&::placeholder {
    color: #6f6f6f;
}
`

const TagsSelector = styled.div`
text-align: left;
padding: 10px;
margin-top: 10px;
`

const BulkModalWrapper = styled.div`
    position: fixed;
    top: 0; left:0; right:0; bottom:0;
    background: rgba(0,0,0,0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`

const BulkModal = styled.div`
    background: #1f1f1f;
    border: 1px solid #444;
    border-radius: 10px;
    padding: 20px;
    width: 320px;
    box-shadow: 0 4px 18px rgba(0,0,0,0.5);
    font-family: inherit;
`

const BulkTitle = styled.h4`
    margin: 0 0 14px 0;
    font-size: 15px;
    font-weight: 600;
    color: #ddd;
    line-height: 1.3;
`

const BulkActions = styled.div`
    display: flex;
    gap: 10px;
    & > button {
        flex: 1;
        background: #333;
        border: 1px solid #555;
        color: #bbb;
        border-radius: 8px;
        padding: 8px 10px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        transition: all .18s;
    }
    & > button:hover { background:#e6a500; color:#fff; border-color:#e6a500; }
`