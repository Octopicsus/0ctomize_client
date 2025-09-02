import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LINK_ROUTES } from './enums/routes'
import styled from 'styled-components'
import Balance from './widgets/Balance/Balance'
import CategoryMenu from './widgets/Menu/CategoryMenu'
import IncomePage from './widgets/Pages/Income/IncomePage'
import ExpensePage from './widgets/Pages/Expense/ExpensePage'
import AllTransactionsPage from './widgets/Pages/All/AllTransactionsPage'
import MoneyInputPage from './widgets/Pages/Action/MoneyInputPage'
import MoneyItemPage from './widgets/Pages/Action/MoneyItemPage'
import CustomCategoryPage from './widgets/Pages/Action/CustomCategoryPage'
import AuthPage from './widgets/Auth/AuthPage'
import ProtectedRoute from './widgets/Auth/ProtectedRoute'
import HeaderBlock from './widgets/Menu/Header/HeaderBlock'
import { RootState, AppDispatch } from './store/store'
import { verifyToken } from './store/features/authSlice'
import { fetchTransactions, forceRefreshTransactions } from './store/features/moneyHistorySlice'
import { fetchUserCategories } from './store/features/customCategorySlice'
import Sidebar from './widgets/Menu/Sidebar/Sidebar'
import Dashboard from './widgets/Pages/ActionPages/Dashboard/Dashboard'
import Transaction from './widgets/Pages/ActionPages/TransactionPage/Transaction'
import BankPage from './widgets/Pages/ActionPages/Bank/BankPage'
import SyncStatusModal from './widgets/BankSync/SyncStatusModal'


function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, accessToken, isLoading, user } = useSelector((state: RootState) => state.auth)
  const [showSyncModal, setShowSyncModal] = useState(false)

  useEffect(() => {
    console.log('App - состояние аутентификации:')
    console.log('  isAuthenticated:', isAuthenticated)
    console.log('  accessToken:', accessToken ? 'Есть' : 'Нет')
    console.log('  user:', user)
    console.log('  isLoading:', isLoading)
    console.log('  location.pathname:', location.pathname)
  }, [isAuthenticated, accessToken, user, isLoading, location.pathname])

  useEffect(() => {
    if (accessToken && (!user || !isAuthenticated)) {
      dispatch(verifyToken())
    }
  }, [dispatch, accessToken, isAuthenticated, user])

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      // Сначала быстрая загрузка (кеш/фон), затем обязательное принудительное обновление
      dispatch(fetchTransactions()).finally(() => {
        dispatch(forceRefreshTransactions())
      })
      dispatch(fetchUserCategories())

      if (location.pathname === '/' || location.pathname === '/login') {
        navigate(LINK_ROUTES.DASHBOARD)
      }
    }
  }, [dispatch, isAuthenticated, accessToken, navigate, location.pathname])

  useEffect(() => {
    if (window.location.pathname === '/' && isAuthenticated) {
      navigate(LINK_ROUTES.DASHBOARD)
    }
  }, [navigate, isAuthenticated])

  const isActionPage =
    location.pathname === LINK_ROUTES.MONEY_INPUT ||
    location.pathname === LINK_ROUTES.MONEY_ITEM ||
    location.pathname === LINK_ROUTES.CUSTOM_CATEGORY ||
    location.pathname === LINK_ROUTES.DASHBOARD ||
    location.pathname === LINK_ROUTES.TRANSACTIONS ||
    location.pathname === '/users' ||
    location.pathname === LINK_ROUTES.BANK

  if (isLoading) {
    return (
      <AppContainer>
        <div style={{ padding: '50px', textAlign: 'center' }}>
          Loading...
        </div>
      </AppContainer>
    )
  }

  return (
    <div>
      {!isAuthenticated ? (
        <AuthPage />
      ) : (
        <AppContainer>
          <HeaderBlock />
          <SyncButtonWrapper>
            <SyncBtn onClick={() => setShowSyncModal(true)}>Bank Sync</SyncBtn>
          </SyncButtonWrapper>
          <Sidebar />
          {!isActionPage && (
            <>
              <Balance />
              <CategoryMenu />
            </>
          )}
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path={LINK_ROUTES.DASHBOARD} element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path={LINK_ROUTES.INCOME} element={
              <ProtectedRoute>
                <IncomePage />
              </ProtectedRoute>
            } />
            <Route path={LINK_ROUTES.EXPENSE} element={
              <ProtectedRoute>
                <ExpensePage />
              </ProtectedRoute>
            } />
            <Route path={LINK_ROUTES.ALL} element={
              <ProtectedRoute>
                <AllTransactionsPage />
              </ProtectedRoute>
            } />
            <Route path={LINK_ROUTES.MONEY_INPUT} element={
              <ProtectedRoute>
                <MoneyInputPage />
              </ProtectedRoute>
            } />
            <Route path={LINK_ROUTES.MONEY_ITEM} element={
              <ProtectedRoute>
                <MoneyItemPage />
              </ProtectedRoute>
            } />
            <Route path={LINK_ROUTES.CUSTOM_CATEGORY} element={
              <ProtectedRoute>
                <CustomCategoryPage />
              </ProtectedRoute>
            } />
            <Route path={LINK_ROUTES.TRANSACTIONS} element={
              <ProtectedRoute>
                <Transaction />
              </ProtectedRoute>
            } />
            <Route path={LINK_ROUTES.BANK} element={
              <ProtectedRoute>
                <BankPage />
              </ProtectedRoute>
            } />
          </Routes>
        </AppContainer>
      )}
  {showSyncModal && <SyncStatusModal onClose={() => setShowSyncModal(false)} />}
    </div>
  )
}


const AppContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  text-align: center;
  padding-top: 60px; 
  padding-left: 60px; 
`

const SyncButtonWrapper = styled.div`
  position: fixed;
  top: 10px;
  right: 14px;
  z-index: 1500;
`

const SyncBtn = styled.button`
  background: #252525;
  color: #ddd;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  letter-spacing: 0.5px;
  &:hover { background: #303030; }
`

export default App