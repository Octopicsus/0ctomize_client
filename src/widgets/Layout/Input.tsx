import React from 'react';
import styled from 'styled-components';

interface Props {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  className?: string;
}

export default function Input({
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  error = '',
  className = ''
}: Props) {
  return (
    <InputContainer className={className}>
      <InputField
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        hasError={!!error}
      />
      <ErrorMessage>{error}</ErrorMessage>
    </InputContainer>
  );
}

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

const InputField = styled.input.withConfig({
  shouldForwardProp: (prop) => prop !== 'hasError',
}) <{ hasError: boolean }>`
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid ${props => props.hasError ? '#dc3545' : '#2e2e2e'};
  font-size:18px;
  outline: none;
  transition: border-bottom-color 0.3s ease;
  width: 320px;
  background-color: #191919;

  &:focus {
    border-bottom-color: ${props => props.hasError ? '#dc3545' : '#ffb700'};
  }
`;

const ErrorMessage = styled.span`
  color: #dc3545;
  font-size: 14px;
  margin-top: 4px;
  min-height: 14px;
  display: block;
`;