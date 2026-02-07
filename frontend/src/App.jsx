import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SatelliteMap from './components/SatelliteMap';
import ImageAnalyzer from './components/ImageAnalyzer';
import SmartSolutions from './components/SmartSolutions';
import DataFusion from './components/DataFusion';
import LandingPage from './components/LandingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* App Routes wrapped in Layout */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/map" element={<Layout><SatelliteMap /></Layout>} />
        <Route path="/image" element={<Layout><ImageAnalyzer /></Layout>} />
        <Route path="/solutions" element={<Layout><SmartSolutions /></Layout>} />
        <Route path="/fusion" element={<Layout><DataFusion /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
