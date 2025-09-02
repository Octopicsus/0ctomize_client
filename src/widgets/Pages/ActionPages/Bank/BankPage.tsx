import styled from 'styled-components'
import { useEffect, useState, useRef } from 'react'
import colors from '../../../../ui/colorsPalette'
import { bankdataAPI } from '../../../../api/bankdata'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../../store/store'
import { forceRefreshTransactions } from '../../../../store/features/moneyHistorySlice'
import BankSelection from './BankSelection'
import { useLocation } from 'react-router-dom'
import { LINK_ROUTES } from '../../../../enums/routes'
import { useNavigate } from 'react-router'

export default function BankPage() {
  const DAILY_LIMIT_MSG = "You’ve used all available bank synchronizations for today";
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  // Institution selection retained only for potential future linking (currently unused)
  const [country] = useState<string>('cz')
  const [accounts, setAccounts] = useState<string[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const dispatch = useDispatch<AppDispatch>()
  const location = useLocation()
  const navigate = useNavigate()
  const [showProgress, setShowProgress] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<string>('')
  const progressTimerRef = useRef<number | null>(null)
  const [etaMs, setEtaMs] = useState<number | null>(null)

  // Removed official UI integration; fallback list only
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('bank_linked') === '1') {
      refreshAccounts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  // Official selector removed

  // const SANDBOX_DEFAULT = 'SANDBOXFINANCE_SFIN0000' // unused after link UI removal
  // Removed connect (link creation) UI in simplified version

  const refreshAccounts = async () => {
    setStatus('Fetching accounts...')
    const acc = await bankdataAPI.accounts()
    setAccounts(acc.accounts)
    if (acc.accounts.length && !selectedAccount) setSelectedAccount(acc.accounts[0])
    if (!acc.accounts.length) setStatus('No linked accounts')
    else setStatus(null)
  }

  const importTx = async () => {
    try {
      setBusy(true)
      if (!selectedAccount) {
        await refreshAccounts()
        if (!selectedAccount) return
      }
      setStatus('Starting import...')
      setShowProgress(true)
      setProgress(0)
      setPhase('Starting')
      const start = await bankdataAPI.importAsync(selectedAccount)
  // store jobId if needed later (currently not reused beyond immediate polling)
      setPhase('Processing')
      pollProgress(start.jobId)
    } catch (e: any) {
      setStatus(e?.message || 'Error')
      if ((e?.message || '').startsWith(DAILY_LIMIT_MSG)) {
        // Hide progress bar & reset when daily limit reached
        setShowProgress(false)
        setProgress(0)
        setPhase('')
      }
      setBusy(false)
    }
  }

  const importAll = async () => {
    if (!accounts.length) {
      await refreshAccounts()
      if (!accounts.length) return
    }
    // Sequentially start async jobs for each account; aggregate progress
    setBusy(true)
    setShowProgress(true)
    setProgress(0)
    setPhase('Starting multi-account import')
    try {
      // For simplicity process accounts one by one, awaiting each async completion while providing granular progress.
      for (let i = 0; i < accounts.length; i++) {
        const accId = accounts[i]
        setPhase(`Account ${i + 1}/${accounts.length}: starting`)
        const start = await bankdataAPI.importAsync(accId)
  // job id local only
        await pollProgressSync(start.jobId, i, accounts.length)
      }
      setPhase('Completed')
      setProgress(100)
      setStatus('All accounts imported')
      await dispatch(forceRefreshTransactions())
      finishProgress(true)
    } catch (e: any) {
      setStatus(e?.message || 'Error')
      if ((e?.message || '').startsWith(DAILY_LIMIT_MSG)) {
        setShowProgress(false)
        setProgress(0)
        setPhase('')
      }
      finishProgress(false)
    } finally {
      setBusy(false)
    }
  }

  // Poll single-account async job
  const pollProgress = (id: string) => {
    if (progressTimerRef.current) window.clearInterval(progressTimerRef.current)
    progressTimerRef.current = window.setInterval(async () => {
      try {
        const p = await bankdataAPI.importProgress(id)
        const pct = p.total ? (p.processed / p.total) * 100 : 0
        setProgress(pct)
        setPhase(p.phase === 'completed' ? 'Completed' : p.phase)
        setEtaMs(p.etaMs ?? null)
        if (p.done) {
          window.clearInterval(progressTimerRef.current!)
          progressTimerRef.current = null
          setStatus(`Imported ${p.imported}, duplicates ${p.duplicatesCount}`)
          await dispatch(forceRefreshTransactions())
          setProgress(100)
          finishProgress(true)
        }
      } catch (e: any) {
        setStatus(e?.message || 'Progress error')
      }
    }, 700)
  }

  // Poll and await completion (used for multi-account sequential)
  const pollProgressSync = async (id: string, index: number, totalAccounts: number) => {
    return new Promise<void>((resolve) => {
      const interval = window.setInterval(async () => {
        try {
          const p = await bankdataAPI.importProgress(id)
          const baseOffset = (index / totalAccounts) * 100
            // reserve segment for this account
          const segment = 100 / totalAccounts
          const pctLocal = p.total ? (p.processed / p.total) : 0
          const pct = baseOffset + pctLocal * segment
          setProgress(pct)
          setPhase(`Account ${index + 1}/${totalAccounts}: ${p.phase}`)
          setEtaMs(p.etaMs ?? null)
          if (p.done) {
            window.clearInterval(interval)
            setStatus(`Account ${index + 1} imported ${p.imported}, dup ${p.duplicatesCount}`)
            dispatch(forceRefreshTransactions())
            resolve()
          }
        } catch (e) {
          window.clearInterval(interval)
          resolve()
        }
      }, 700)
    })
  }

  const finishProgress = (redirect?: boolean) => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }
    setTimeout(() => {
      setShowProgress(false)
      setPhase('')
      setProgress(0)
      setEtaMs(null)
  // reset local markers
      if (redirect) navigate(LINK_ROUTES.DASHBOARD)
    }, 1200)
  }

  const formatEta = (ms: number | null) => {
    if (ms == null) return ''
    const sec = Math.max(0, Math.round(ms / 1000))
    if (sec < 60) return `${sec}s`
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}m ${s}s`
  }

  return (
    <Wrapper>
  <BankSelection country={country} onSelect={()=>{}} onLoadAccounts={refreshAccounts} />

      {!!accounts.length && (
        <Panel>
          <Field>
            <Label>Account</Label>
            <Select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
              {accounts.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </Select>
          </Field>
          <Row>
            <Button disabled={busy || !selectedAccount} onClick={importTx}>Import</Button>
            {accounts.length > 1 && (
              <Button disabled={busy} onClick={importAll}>Import all</Button>
            )}
          </Row>
        </Panel>
      )}

      {status && <Status>{status}</Status>}
      {showProgress && (
        <ProgressWrap>
          <ProgressBar>
            <ProgressInner style={{ width: `${Math.min(100, progress).toFixed(1)}%` }} />
          </ProgressBar>
          <ProgressMeta>
            <span>{phase}{etaMs != null && phase !== 'Completed' && <>&nbsp;ETA {formatEta(etaMs)}</>}</span>
            <span>{Math.min(100, progress).toFixed(0)}%</span>
          </ProgressMeta>
        </ProgressWrap>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
`

const Row = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  align-items: center;
`

const Button = styled.button`
  padding: 8px 12px;
  background-color: ${colors.brandColor};
  color: black;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-weight: 600;
  opacity: 0.85;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

// Toggle removed

const Status = styled.div`
  margin-top: 10px;
  color: #bdbdbd;
  font-size: 13px;
`

const ProgressWrap = styled.div`
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 420px;
`

const ProgressBar = styled.div`
  position: relative;
  height: 8px;
  width: 100%;
  background: #2c2c2c;
  border-radius: 6px;
  overflow: hidden;
  &:after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 8px, transparent 8px 16px);
    pointer-events: none;
  }
`

const ProgressInner = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${colors.brandColor} 0%, #52ffc7 100%);
  border-radius: 6px;
  transition: width 0.25s ease;
`

const ProgressMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #9e9e9e;
  font-variant-numeric: tabular-nums;
`

// CountrySelect components removed (handled inside BankSelection)

// OfficialWrap removed

const Panel = styled.div`
  margin-top:16px;
  background:#1e1e1e;
  border:1px solid #2b2b2b;
  border-radius:8px;
  padding:12px 14px 16px;
  color:#cfcfcf;
  width:100%;
  max-width:1180px; /* align with BankSelection PageWrapper */
  margin-left:auto;
  margin-right:auto;
  box-sizing:border-box;
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`

const Label = styled.label`
  font-size: 12px;
  color: #9e9e9e;
  margin-bottom: 4px;
`

const Select = styled.select`
  background: #2b2b2b;
  color: #fff;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  padding: 6px 8px;
`
