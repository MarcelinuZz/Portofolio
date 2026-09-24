import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AboutPage from './pages/AboutPage';
import JourneyPage from './pages/JourneyPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AboutPage />} />
        <Route path="/Journey" element={<JourneyPage />} />
        <Route path="/journey" element={<JourneyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
