import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ExploreProvider } from './context/ExploreContext';
import Navbar from './components/layout/Navbar';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ExploreProvider>
          <div className="min-h-screen bg-[#0b1120] flex flex-col font-sans text-slate-100 antialiased selection:bg-[#ff7200] selection:text-white">
            <Navbar />
            <main className="flex-1 w-full flex flex-col">
              <AppRoutes />
            </main>
            <footer className="border-t border-white/10 bg-[#070b14]/90 backdrop-blur-md py-6 text-xs text-slate-400 mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff7200]" />
                  <span className="font-semibold text-white">Open-Source <span className="text-[#ff7200]">Contribution Planner</span></span>
                </div>
                <div className="text-slate-400 text-xs text-center sm:text-right">
                  Intelligent GitHub repository & issue matching for developers
                </div>
              </div>
            </footer>
          </div>
        </ExploreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
