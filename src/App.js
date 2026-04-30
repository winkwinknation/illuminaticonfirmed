import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SaveProvider } from './context/SaveContext';
import { FaithScreen } from './screens/FaithScreen';
import { KnowledgeScreen } from './screens/KnowledgeScreen';
import { OrderScreen } from './screens/OrderScreen';
import { PlayLayout } from './screens/PlayLayout';
import { SavesScreen } from './screens/SavesScreen';
import { ShopScreen } from './screens/ShopScreen';
import { SocietyScreen } from './screens/SocietyScreen';
import { TitleScreen } from './screens/TitleScreen';

const App = () => (
  <HashRouter>
    <SaveProvider>
      <Routes>
        <Route path="/" element={<TitleScreen />} />
        <Route path="/saves" element={<SavesScreen />} />
        <Route path="/play" element={<PlayLayout />}>
          <Route index element={<Navigate to="faith" replace />} />
          <Route path="faith" element={<FaithScreen />} />
          <Route path="society" element={<SocietyScreen />} />
          <Route path="shop" element={<ShopScreen />} />
          <Route path="order" element={<OrderScreen />} />
          <Route path="knowledge" element={<KnowledgeScreen />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SaveProvider>
  </HashRouter>
);

export default App;
