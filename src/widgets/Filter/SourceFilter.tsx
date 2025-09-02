import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState } from '../../store/store';
import { setSourceFilter, SourceFilter as SourceFilterType } from '../../store/features/sourceFilterSlice';

export default function SourceFilter() {
  const dispatch = useDispatch();
  const value = useSelector((s: RootState) => s.sourceFilter.source);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSourceFilter(e.target.value as SourceFilterType));
  };

  return (
    <Wrap>
      <label>
        Source:
        <Select value={value} onChange={onChange}>
          <option value="all">All</option>
          <option value="bank">Bank</option>
          <option value="manual">Manual</option>
        </Select>
      </label>
    </Wrap>
  );
}

const Wrap = styled.div`
  margin: 8px 0;
  color: #c6c6c6;
  font-size: 12px;
`;

const Select = styled.select`
  margin-left: 8px;
  padding: 4px 8px;
  background: #2b2b2b;
  color: #e0e0e0;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
`;
