import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import AuthPage from '../Auth/AuthPage';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    if (!isAuthenticated) {
        return <AuthPage />;
    }

    return <>{children}</>;
}
