import { useEffect, useState } from 'react'
import styled from 'styled-components'
import colors from '../../ui/colorsPalette'
import { bankdataAPI } from '../../api/bankdata'

interface JobInfo { jobId: string; accountId: string; total?: number }
interface Progress { jobId: string; processed: number; total: number; done: boolean; etaMs?: number | null }

const POLL_INTERVAL = 1200

export default function SyncStatusModal({ onClose }: { onClose: () => void }) {
  const [jobs, setJobs] = useState<JobInfo[]>([])
  const [progress, setProgress] = useState<Record<string, Progress>>({})
  const [remaining, setRemaining] = useState<number | null>(null)
  const [softLimit, setSoftLimit] = useState<number | null>(null)

  // Initial load: trigger autoSync (lightweight) and fill jobs list if any started
  useEffect(() => {
    (async () => {
      try {
        const auto = await bankdataAPI.autoSync()
        const list = (auto.started || []).map((s:any) => ({ jobId: s.jobId, accountId: s.accountId, total: s.total }))
        setJobs(list)
      } catch {/* ignore */}
      try {
        const counters = await fetchCounters()
        if (counters) {
          setSoftLimit(counters.softLimit)
          // Sum remaining for accounts? take max remaining as global perspective
          const maxRem = Math.max(...counters.accounts.map((a:any)=>a.remaining))
          setRemaining(maxRem)
        }
      } catch {/* ignore */}
    })()
  }, [])

  useEffect(() => {
    if (!jobs.length) return
    const id = window.setInterval(async () => {
      for (const j of jobs) {
        try {
            const p = await bankdataAPI.importProgress(j.jobId)
            setProgress(prev => ({ ...prev, [j.jobId]: { jobId: j.jobId, processed: p.processed, total: p.total, done: p.done, etaMs: p.etaMs } }))
        } catch {/* ignore */}
      }
    }, POLL_INTERVAL)
    return () => window.clearInterval(id)
  }, [jobs])

  const allDone = jobs.length > 0 && jobs.every(j => progress[j.jobId]?.done)

  const formatEta = (ms?: number | null) => {
    if (!ms && ms !== 0) return ''
    const sec = Math.round(ms / 1000)
    if (sec < 60) return sec + 's'
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}m ${s}s`
  }

  return (
    <Overlay>
      <Modal>
        <Header>
          <h3>Bank Sync</h3>
          <CloseBtn onClick={onClose}>×</CloseBtn>
        </Header>
        <Body>
          {jobs.length === 0 && <Info>Нет активных синхронизаций (возможно лимит или всё актуально)</Info>}
          {jobs.map(j => {
            const p = progress[j.jobId]
            const pct = p?.total ? (p.processed / p.total) * 100 : 0
            return (
              <JobRow key={j.jobId}>
                <JobTitle>{j.accountId}</JobTitle>
                <BarWrap>
                  <BarBg><BarInner style={{ width: pct + '%' }} /></BarBg>
                  <Meta>{pct.toFixed(0)}% {p?.done ? '✓' : p?.etaMs ? 'ETA ' + formatEta(p.etaMs) : ''}</Meta>
                </BarWrap>
              </JobRow>
            )
          })}
          <Divider />
          <Quota>
            {softLimit != null && remaining != null ? (
              <span>Осталось синхронизаций сегодня: {remaining} / {softLimit}</span>
            ) : <span>Загрузка лимита...</span>}
          </Quota>
          {allDone && <Info>Все задания завершены</Info>}
        </Body>
      </Modal>
    </Overlay>
  )
}

async function fetchCounters() {
  try {
    const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api/bankdata/debug/account-calls', {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Authorization: localStorage.getItem('accessToken') ? 'Bearer ' + localStorage.getItem('accessToken') : '' }
    })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
`

const Modal = styled.div`
  width: 460px;
  background: #1e1e1e;
  border: 1px solid #2c2c2c;
  border-radius: 10px;
  padding: 16px 18px 20px;
  color: #e0e0e0;
  font-size: 14px;
  box-shadow: 0 6px 22px rgba(0,0,0,0.4);
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  h3 { margin: 0; font-size: 16px; font-weight: 600; }
`

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: #999;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
  &:hover { color: #fff; }
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Info = styled.div`
  font-size: 12px;
  color: #9aa0a6;
`

const JobRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const JobTitle = styled.div`
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.5px;
  color: ${colors.brandColor};
`

const BarWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const BarBg = styled.div`
  height: 8px;
  border-radius: 6px;
  background: #2b2b2b;
  overflow: hidden;
  position: relative;
`

const BarInner = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${colors.brandColor} 0%, #52ffc7 100%);
  transition: width .4s ease;
`

const Meta = styled.div`
  font-size: 11px;
  color: #9e9e9e;
  font-variant-numeric: tabular-nums;
`

const Divider = styled.div`
  height: 1px;
  background: #2a2a2a;
  margin: 4px 0 2px;
`

const Quota = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #d0d0d0;
`
