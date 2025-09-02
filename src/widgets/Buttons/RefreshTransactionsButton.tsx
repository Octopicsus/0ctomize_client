import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { forceRefreshTransactions } from '../../store/features/moneyHistorySlice';
import { RootState, AppDispatch } from '../../store/store';
import { } from 'react';

const Btn = styled.button`
  background-color: #2d2d2d;
  color: #717171;
  border: none;
  padding: 2px 12px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  line-height: 1.3;
  transition: background-color .2s ease, color .2s ease;

  &:hover:not(:disabled) {
    background-color: #343434;
    color: #8a8a8a;
  }
  &:active:not(:disabled) {
    background-color: #3d3d3d;
  }
  &:disabled { opacity: .55; cursor: default; }
`;

export default function RefreshTransactionsButton() {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((s: RootState) => s.moneyHistory.loading);
  const onClick = () => {
    dispatch(forceRefreshTransactions());
  };
  return (
    <Btn onClick={onClick} disabled={loading} title="Refresh transactions">
      {loading ? 'refreshing…' : 'refresh'}
    </Btn>
  );
}
