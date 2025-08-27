import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainInteraction } from './components/MainInteraction';
import StyleExtractionDemo from './pages/StyleExtractionDemo';
import { UserIntentAnalysisDemo } from './pages/UserIntentAnalysisDemo';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StyleExtractionDemo />} />
        <Route path="/canvas-generator" element={<MainInteraction />} />
        <Route path="/style-extraction" element={<StyleExtractionDemo />} />
        <Route path="/user-intent-analysis" element={<UserIntentAnalysisDemo />} />
      </Routes>
    </Router>
  );
}

export default App;