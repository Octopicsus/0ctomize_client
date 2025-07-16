import { useDispatch, useSelector } from "react-redux"
import BackButton from "../../Buttons/BackButton"
import { RootState, AppDispatch } from "../../../store/store"
import { deleteTransaction, moneyAdapter } from "../../../store/features/moneyHistorySlice"
import { useNavigate } from "react-router"
import EditButton from "../../Buttons/EditButton"
import { LINK_ROUTES } from "../../../enums/routes"
import { formatAmount } from "../../../utils/balanceCalc"

export default function MoneyItemPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const id = useSelector((state: RootState) => state.selectedMoneyItem.id)

  const selectedById = moneyAdapter.getSelectors(
    (state: RootState) => state.moneyHistory
  ).selectById

  const item = useSelector((state: RootState) => (id !== null ? selectedById(state, id) : null))

  function formatDate(dateString?: string) {
    if (!dateString) return ""
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  const handleDelete = () => {
    if (id !== null && item) {
      dispatch(deleteTransaction({
        transactionId: item._id || '',
        itemId: id
      }))
      navigate(LINK_ROUTES.DASHBOARD)
    }
  }

  const handleMoveToEditPage = () => {
    navigate(LINK_ROUTES.TRANSACTIONS, { state: { item } })
  }

  return (
    <>
      <h3>{item?.title}</h3>
      {item?.description && (
        <div>
          <p>{item.description}</p>
        </div>
        
      )}
      <div>
        <div>
          <p>Amount: {formatAmount(item?.amount || 0)} Kč</p>
        </div>
        <div>
          <p>Type: {item?.type}</p>
        </div>
        {item?.userEmail && (
          <div>
            <p>User: {item.userEmail}</p>
          </div>
        )}
        <div>
          <p>Date: {formatDate(item?.date)}</p>
        </div>
      </div>
      <button onClick={handleDelete}>Delete</button>
      <BackButton />
      <EditButton onClick={handleMoveToEditPage} />
    </>
  )
}