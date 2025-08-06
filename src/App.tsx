import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StepWizard from './components/StepWizard';
import ReservationPage from './pages/[slug]/index';
import CompletePage from './pages/[slug]/complete';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StepWizard />} />
        <Route path="/:slug" element={<ReservationPage />} />
        <Route path="/:slug/complete" element={<CompletePage />} />
      </Routes>
    </Router>
  );
}


export default App;