import { useState, useEffect, useCallback, useRef } from 'react'
import styled from 'styled-components'
import { AreaChart, Area, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer } from 'recharts'
import { Plus, Trash2, Scale, Camera, FileText, TrendingDown } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ProgressEntryWithPhoto } from '../../types'
import { AddEntryModal } from './AddEntryModal'

// ─── Styled Components ──────────────────────────────────────────────

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 40px 48px;
  background: #F5F6FA;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: #2D3436;
  letter-spacing: -0.02em;
`

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #FF9966, #FF5E62);
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(255, 94, 98, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 94, 98, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`

// ── Chart Section ───────────────────────────────────────────────────

const ChartSection = styled.div`
  background: #FFFFFF;
  border-radius: 20px;
  padding: 28px 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`

const ChartTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const ChartPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: #A0AEC0;
  text-align: center;
  gap: 12px;
`

const PlaceholderText = styled.p`
  font-size: 0.95rem;
  color: #718096;
  line-height: 1.6;
`

// ── Custom Recharts Tooltip ─────────────────────────────────────────

const CustomTooltipContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
`

const TooltipLabel = styled.div`
  font-size: 0.8rem;
  color: #718096;
  margin-bottom: 4px;
`

const TooltipValue = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #2D3436;
`

// ── Timeline ────────────────────────────────────────────────────────

const TimelineSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const TimelineTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 8px;
`

const EntryCard = styled.div`
  background: #FFFFFF;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
`

const EntryContent = styled.div`
  display: flex;
  gap: 20px;
  padding: 20px 24px;
  align-items: center;
`

const EntryPhoto = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid #E2E8F0;
`

const EntryInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const EntryDate = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: #E17055;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const EntryWeight = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: #2D3436;
  letter-spacing: -0.02em;
`

const EntryWeightUnit = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: #718096;
  margin-left: 4px;
`

const EntryNotes = styled.div`
  font-size: 0.9rem;
  color: #718096;
  line-height: 1.5;
`

const EntryMeta = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`

const MetaTag = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: #A0AEC0;

  svg {
    width: 14px;
    height: 14px;
  }
`

const DeleteButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #CBD5E0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: #FFF5F5;
    color: #E53E3E;
  }
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  gap: 16px;
  color: #A0AEC0;
`

const EmptyTitle = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: #2D3436;
`

const EmptyDesc = styled.div`
  font-size: 0.95rem;
  color: #718096;
  max-width: 360px;
  line-height: 1.6;
`

// ─── Custom Tooltip Component ───────────────────────────────────────

function CustomChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <CustomTooltipContainer>
      <TooltipLabel>{label}</TooltipLabel>
      <TooltipValue>{payload[0].value} kg</TooltipValue>
    </CustomTooltipContainer>
  )
}

// ─── Main Component ─────────────────────────────────────────────────

export function HistoryScreen() {
  const { state } = useApp()
  const [entries, setEntries] = useState<ProgressEntryWithPhoto[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const initialEntryAddedRef = useRef(false)

  const loadEntries = useCallback(async () => {
    if (!state.vaultPath || !window.electronAPI?.history) return
    setLoading(true)
    try {
      const result = await window.electronAPI.history.getAll(state.vaultPath)
      if (result.success && result.entries) {
        setEntries(result.entries)
      }
    } catch (error) {
      console.error('[History] Error loading entries:', error)
    } finally {
      setLoading(false)
    }
  }, [state.vaultPath])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  // If user has profile weight but no history entries yet (e.g. existing user), add initial entry once
  useEffect(() => {
    if (!state.vaultPath || !state.profile?.weight || !window.electronAPI?.history) return
    if (entries.length !== 0 || loading || initialEntryAddedRef.current) return
    initialEntryAddedRef.current = true
    window.electronAPI.history
      .addEntry(state.vaultPath, {
        date: new Date().toISOString(),
        weight: state.profile.weight,
        notes: 'Starting weight (from profile)'
      })
      .then(() => loadEntries())
      .catch(() => {
        initialEntryAddedRef.current = false
      })
  }, [state.vaultPath, state.profile?.weight, entries.length, loading, loadEntries])

  const handleDelete = async (entryId: string) => {
    if (!state.vaultPath || !window.electronAPI?.history) return
    try {
      const result = await window.electronAPI.history.deleteEntry(state.vaultPath, entryId)
      if (result.success) {
        setEntries(prev => prev.filter(e => e.id !== entryId))
      }
    } catch (error) {
      console.error('[History] Error deleting entry:', error)
    }
  }

  const handleEntryAdded = () => {
    setShowModal(false)
    loadEntries()
  }

  // Prepare chart data (only entries with weight, oldest first)
  const chartData = entries
    .filter(e => e.weight !== undefined)
    .reverse()
    .map(e => ({
      date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: e.weight,
    }))

  const hasWeightData = chartData.length > 0

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <Container>
      <Header>
        <Title>My Journey</Title>
        <AddButton onClick={() => setShowModal(true)}>
          <Plus size={18} />
          New Entry
        </AddButton>
      </Header>

      {/* ── Weight Chart ── */}
      <ChartSection>
        <ChartTitle>
          <TrendingDown size={18} color="#E17055" />
          Weight Progress
        </ChartTitle>
        {hasWeightData ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E17055" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#E17055" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#A0AEC0' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#A0AEC0' }}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <ReTooltip content={<CustomChartTooltip />} />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#E17055"
                strokeWidth={3}
                fill="url(#chartGradient)"
                dot={{ r: 4, fill: '#E17055', stroke: '#FFFFFF', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#E17055', stroke: '#FFFFFF', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ChartPlaceholder>
            <Scale size={32} color="#CBD5E0" />
            <PlaceholderText>
              No weight data yet. Add your first entry to see your progress over time.
            </PlaceholderText>
          </ChartPlaceholder>
        )}
      </ChartSection>

      {/* ── Timeline ── */}
      <TimelineSection>
        <TimelineTitle>Timeline</TimelineTitle>
        {!loading && entries.length === 0 ? (
          <EmptyState>
            <Camera size={40} color="#CBD5E0" />
            <EmptyTitle>Start Your Journey</EmptyTitle>
            <EmptyDesc>
              Track your progress with photos, weight, or just notes. 
              No scale? No problem — a mirror selfie is worth a thousand numbers.
            </EmptyDesc>
            <AddButton onClick={() => setShowModal(true)} style={{ marginTop: 8 }}>
              <Plus size={18} />
              Add First Entry
            </AddButton>
          </EmptyState>
        ) : (
          entries.map(entry => (
            <EntryCard key={entry.id}>
              <EntryContent>
                {entry.photoBase64 && (
                  <EntryPhoto src={entry.photoBase64} alt="Progress" />
                )}
                <EntryInfo>
                  <EntryDate>{formatDate(entry.date)}</EntryDate>
                  {entry.weight !== undefined && (
                    <EntryWeight>
                      {entry.weight}
                      <EntryWeightUnit>kg</EntryWeightUnit>
                    </EntryWeight>
                  )}
                  {entry.notes && <EntryNotes>{entry.notes}</EntryNotes>}
                  <EntryMeta>
                    {entry.weight !== undefined && (
                      <MetaTag><Scale size={14} /> Weight</MetaTag>
                    )}
                    {entry.photoBase64 && (
                      <MetaTag><Camera size={14} /> Photo</MetaTag>
                    )}
                    {entry.notes && (
                      <MetaTag><FileText size={14} /> Note</MetaTag>
                    )}
                  </EntryMeta>
                </EntryInfo>
                <DeleteButton onClick={() => handleDelete(entry.id)} title="Delete entry">
                  <Trash2 size={18} />
                </DeleteButton>
              </EntryContent>
            </EntryCard>
          ))
        )}
      </TimelineSection>

      {/* ── Modal ── */}
      {showModal && (
        <AddEntryModal
          onClose={() => setShowModal(false)}
          onSaved={handleEntryAdded}
        />
      )}
    </Container>
  )
}
