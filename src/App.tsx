import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/ui/Layout';
import { ProfileModal } from './components/ProfileModal';
import { Home } from './pages/Home';
import { Eksplorasi } from './pages/Eksplorasi';
import { Konstruksi } from './pages/Konstruksi';
import { Internalisasi } from './pages/Internalisasi';
import { AksiKreasi } from './pages/AksiKreasi';
import { Progress } from './pages/Progress';
import { Settings } from './pages/Settings';

function App() {
  return (
    <HashRouter>
      <ProfileModal />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/eksplorasi" element={<Eksplorasi />} />
          <Route path="/konstruksi" element={<Konstruksi />} />
          <Route path="/internalisasi" element={<Internalisasi />} />
          <Route path="/aksi" element={<AksiKreasi />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
