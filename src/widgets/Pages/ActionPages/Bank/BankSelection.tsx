import styled from 'styled-components'
import { useEffect, useState, useMemo } from 'react'
import { bankdataAPI } from '../../../../api/bankdata'
import colors from '../../../../ui/colorsPalette'
// import { forceRefreshTransactions } from '../../../../store/features/moneyHistorySlice' // removed (not used after simplifying UI)

interface Institution { id: string; name: string; logo?: string; countries?: string[] }

// LocalStorage helpers for recent selections
const RECENT_KEY = 'bank_recent_ids'
function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}
function saveRecent(ids: string[]) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0, 6))) } catch { }
}

// Human readable country labels
const COUNTRY_LABELS: Record<string, string> = {
  cz: 'Czech Republic', sk: 'Slovakia', pl: 'Poland', de: 'Germany', at: 'Austria', hu: 'Hungary', lt: 'Lithuania', lv: 'Latvia', ee: 'Estonia', se: 'Sweden', fi: 'Finland', no: 'Norway', dk: 'Denmark', es: 'Spain', pt: 'Portugal', fr: 'France', it: 'Italy', ie: 'Ireland', nl: 'Netherlands', be: 'Belgium', lu: 'Luxembourg', gb: 'United Kingdom'
}

export default function BankSelection({ country = 'cz', onSelect, onLoadAccounts }: { country?: string; onSelect: (institutionId: string) => void; onLoadAccounts?: () => void }) {
  // Data state
  const [items, setItems] = useState<Institution[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Interaction state
  const [busy] = useState(false) // simplified UI (no import actions here)
  const [limitUntil, setLimitUntil] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [recent, setRecent] = useState<string[]>(loadRecent())
  const [search, setSearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(country)
  const [availableCountries, setAvailableCountries] = useState<string[]>([])

  // const dispatch = useDispatch<AppDispatch>() // no longer needed

  // Fetch institutions for selected country
  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError(null)
        const res = await bankdataAPI.institutions(selectedCountry)
        setItems(res.institutions || [])
      } catch (e: any) { setError(e?.message || 'Failed to load institutions') }
      finally { setLoading(false) }
    })()
  }, [selectedCountry])

  // Fetch all institutions once to derive available countries
  useEffect(() => {
    (async () => {
      try {
        const res = await bankdataAPI.institutions(undefined)
        const setCodes = new Set<string>()
        for (const inst of (res.institutions as any[] || [])) {
          if (inst.countries && Array.isArray(inst.countries)) {
            inst.countries.forEach((c: string) => { if (c) setCodes.add(c.toLowerCase()) })
          }
        }
        const list = Array.from(setCodes).filter(c => COUNTRY_LABELS[c]).sort()
        setAvailableCountries(list)
        if (!list.includes(selectedCountry)) {
          setSelectedCountry(list[0] || 'cz')
        }
      } catch {/* ignore errors */ }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Rate limit countdown loader
  useEffect(() => {
    const read = () => {
      let v: number | null = null
      try { const raw = localStorage.getItem('bank_sync_limit_until'); if (raw) { const n = Number(raw); if (!isNaN(n)) v = n } } catch {}
      setLimitUntil(v)
    }
    read()
    const t = setInterval(() => { setNow(Date.now()); read() }, 1000 * 60) // update each minute
    return () => clearInterval(t)
  }, [])

  // Removed: connectRevolutCZ, importLatest, importDebug (hidden per product decision)

  const handlePick = (id: string) => {
    // Track recent
    const newRecent = [id, ...recent.filter(r => r !== id)]
    setRecent(newRecent); saveRecent(newRecent)
    onSelect(id)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(i => i.name.toLowerCase().includes(q))
  }, [items, search])

  const recentItems = recent.map(rid => filtered.find(i => i.id === rid)).filter(Boolean) as Institution[]
  const otherItems = filtered.filter(i => !recent.includes(i.id))

  // Daily limit handling moved to parent, not needed here.

  // daily limit state not needed for simplified toolbar

  return (
    <Screen>
      <PageWrapper>
        <HeaderBar>
          <Title>Bank Synchronization</Title>
          <InlineForm>
            <Select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} disabled={loading || busy || availableCountries.length === 0}>
              {availableCountries.length === 0 && <option value={selectedCountry}>{selectedCountry.toUpperCase()}</option>}
              {availableCountries.map(c => (
                <option key={c} value={c}>{c.toUpperCase()} – {COUNTRY_LABELS[c] || c}</option>
              ))}
            </Select>
            <SearchInput placeholder="Search bank" value={search} onChange={e => setSearch(e.target.value)} />
            <SmallButton onClick={() => setSearch('')} disabled={!search}>Clear</SmallButton>
          </InlineForm>
        </HeaderBar>

        <Toolbar>
          {onLoadAccounts && (
            <ExtraButtonsWrap>
              <LoadButton onClick={() => onLoadAccounts()} disabled={loading}>Load accounts</LoadButton>
            </ExtraButtonsWrap>
          )}
        </Toolbar>

        {limitUntil && limitUntil > Date.now() && (
          <LimitBanner>
            You’ve used all available bank synchronizations for today. Try again in {formatRemaining(limitUntil - now)}.
          </LimitBanner>
        )}

  {/* Status/progress removed in simplified view */}

        {loading && <Status>Loading institutions...</Status>}
        {error && <ErrorStatus>{error}</ErrorStatus>}

        {!loading && !error && (
          <SectionsWrapper>
            {recentItems.length > 0 && (
              <Section>
                <SectionTitle>Recent</SectionTitle>
                <Grid $compact>
                  {recentItems.map(it => (
                    <Card key={it.id} onClick={() => handlePick(it.id)} title={it.name}>
                      {it.logo ? <Logo src={it.logo} alt={it.name} /> : <Placeholder />}
                      <Name>{it.name}</Name>
                    </Card>
                  ))}
                </Grid>
              </Section>
            )}
            <Section>
              <SectionTitle>All Institutions ({filtered.length})</SectionTitle>
              {filtered.length === 0 && <Empty>Nothing matches query.</Empty>}
              <Grid>
                {otherItems.map(it => (
                  <Card key={it.id} onClick={() => handlePick(it.id)} title={it.name}>
                    {it.logo ? <Logo src={it.logo} alt={it.name} /> : <Placeholder />}
                    <Name>{it.name}</Name>
                  </Card>
                ))}
              </Grid>
            </Section>
          </SectionsWrapper>
        )}
      </PageWrapper>
    </Screen>
  )
}

function formatRemaining(ms: number) {
  if (ms <= 0) return '0m'
  const totalMin = Math.ceil(ms / 60000)
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  if (hours <= 0) return `${mins}m`
  if (hours < 4) return `${hours}h ${mins}m`
  return `${hours}h`
}

const Screen = styled.div`
 width:100%; 
 display:flex; 
 justify-content:center; 
 align-items:flex-start; 
 padding:12px 16px 0; 
 box-sizing:border-box;
`
const PageWrapper = styled.div`
  display:flex; 
  flex-direction:column; 
  gap:14px; 
  padding:12px 8px 12px; 
  max-width:1180px; 
  width:100%; 
  margin:0 auto; 
  border-radius:12px; 
`
const HeaderBar = styled.div`
  display:flex; 
  justify-content:space-between; 
  align-items:center; 
  gap:16px; 
  flex-wrap:wrap;  
  padding:10px 12px; 
  border-radius:8px; 
`
const Title = styled.h2`
  font-size:18px; 
  margin:0; 
  font-weight:600; 
  color:#ddd;
`
const InlineForm = styled.div`
  display:flex; 
  gap:8px; 
  align-items:center; 
  flex-wrap:wrap;
`
const Select = styled.select`
  background:#1f1f1f; 
  color:#ddd; 
  border:1px solid #333; 
  padding:6px 8px; 
  border-radius:6px; 
  font-size:13px;

  &:focus{
    outline:2px solid ${colors.brandColor};
    }
`
const SearchInput = styled.input`
  background:#1f1f1f; 
  color:#eee; 
  border:1px solid #333; 
  padding:6px 10px; 
  border-radius:6px; 
  font-size:13px; 
  min-width:180px;

  &:focus{
    outline:2px solid ${colors.brandColor};
    }
`
const SmallButton = styled.button`
  background:#2a2a2a; 
  color:#bbb; 
  border:1px solid #3a3a3a; 
  padding:6px 10px; 
  border-radius:6px; cursor:pointer; 
  font-size:12px;

  &:hover{
    background:#333; 
    color:#fff;}

  &:disabled{
    opacity:.4; 
    cursor:not-allowed;
    }
`
const Toolbar = styled.div`
  display:flex; 
  gap:8px; 
  flex-wrap:wrap; 
  padding:8px 10px; 
  border-radius:8px; 
`
const ExtraButtonsWrap = styled.div`
display:flex; 
gap:8px;
`
const LimitBanner = styled.div`
  margin: 8px 10px 0; 
  padding:12px 14px; 
  background:#2a2619; 
  border:1px solid #5a4b1a; 
  border-radius:10px; 
  color:#e8d9b2; 
  font-size:13px; 
  line-height:1.35;
`
const LoadButton = styled.button`
  padding: 8px 12px; 
  background-color: ${colors.brandColor}; 
  color: black; 
  border: none; 
  cursor: pointer; 
  border-radius: 6px; 
  font-weight: 600; 
  opacity: 0.85; 
  font-size:13px;
  &:hover{ opacity:1; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

// Removed legacy styled components (CheckboxLabel, Button, StatusBlock, ProgressBarWrapper, ProgressInner, etc.)
const Section = styled.div`
display:flex; 
flex-direction:column; 
gap:10px;
`

const SectionTitle = styled.h3`
margin:0; 
font-size:13px; 
font-weight:600; 
text-transform:uppercase; 
letter-spacing:.5px; 
color:#7e7e7e;
`

const SectionsWrapper = styled.div`
display:flex; 
flex-direction:column; 
gap:18px;
`

// RangeInfo removed (no longer displayed)

const Grid = styled.div<{ $compact?: boolean }>`
  display:grid; 
  gap:10px; 
  grid-template-columns: repeat(auto-fill, minmax(${p => p.$compact ? 120 : 140}px,1fr));
`
const Card = styled.button`
  background:#222; 
  border:1px solid #2d2d2d; 
  border-radius:10px; 
  padding:10px 8px 12px; 
  cursor:pointer; 
  text-align:center; 
  color:white; 
  display:flex; 
  flex-direction:column; 
  align-items:center; 
  gap:6px; 
  position:relative; 
  transition: .18s border-color, .18s transform, .18s background;

  &:hover{ 
    border-color:${colors.brandColor}; 
    transform:translateY(-2px); 
  }

  &:focus{ 
    outline:2px solid ${colors.brandColor};
    outline-offset:2px; 
    }
`
const Logo = styled.img`
width:48px; 
height:48px; 
object-fit:contain; 
filter:drop-shadow(0 0 2px #000);
`

const Placeholder = styled.div`
width:48px; 
height:48px; 
border-radius:10px; 
margin:0;
background:#262626; 
display:flex; 
align-items:center; 
justify-content:center; 
font-size:11px; 
color:#555;
`

const Name = styled.div`
font-size:12px; 
opacity:0.9; 
font-weight:500; 
line-height:1.2;
`

const Status = styled.div`
margin-top:4px; 
color:#bdbdbd; 
font-size:13px;
`

const ErrorStatus = styled(Status)`
color:#ff6d6d;
`

const Empty = styled.div`
font-size:12px; 
color:#666; 
padding:4px 0 12px;
`
