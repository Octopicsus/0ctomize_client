import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { setCredentials } from '../../store/features/authSlice';
import styled from 'styled-components';

interface GoogleLoginButtonProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export default function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
    const dispatch = useDispatch<AppDispatch>();

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            if (!credentialResponse.credential) {
                throw new Error('No credential received from Google');
            }

            const response = await fetch('http://localhost:3001/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    credential: credentialResponse.credential,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Google authentication failed: ${response.status} ${errorText}`);
            }

            const data = await response.json();

            dispatch(setCredentials({
                user: data.user,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            }));

            onSuccess?.();
        } catch (error) {
            onError?.(error instanceof Error ? error.message : 'Google authentication failed');
        }
    };

    const handleGoogleError = () => {
        onError?.('Google authentication failed');
    };

    return (
        <GoogleLoginWrapper>
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                text="continue_with"
                theme="filled_black"
                size="large"
                width="100%"
            />
        </GoogleLoginWrapper>
    );
}

const GoogleLoginWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  opacity: 0.5;

  & svg {
  filter: grayscale(1) brightness(0.5);
  }
  
  & > div {
    width: 100% !important;
    max-width: 400px;
  }
`;


