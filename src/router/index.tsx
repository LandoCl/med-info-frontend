import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';

import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { Dashboard } from '../pages/patient/Dashboard';
import { Profile } from '../pages/patient/Profile';
import { MedicalData } from '../pages/patient/MedicalData';
import { Scanner } from '../pages/doctor/Scanner';
import { PatientSheet } from '../pages/doctor/PatientSheet';

export const AppRouter: React.FC = () => {
    return (
        <Routes>
            {/* Rutas Públicas de Acceso */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/ficha/:token" element={<PatientSheet />} />

            {/* Rutas Privadas del Paciente */}
            <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/medical-data" element={<MedicalData />} />
            </Route>

            {/* Redirección por Defecto */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};