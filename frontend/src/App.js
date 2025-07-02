import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import SplashScreen from "./components/SplashScreen";

// Pages
import BoardsPage from "./pages/BoardsPage";
import KanbanBoardPage from './pages/KanbanBoardPage';

function Main() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<BoardsPage />} />
        <Route path="/board/:id" element={<KanbanBoardPage />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {showSplash ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SplashScreen />
        </motion.div>
      ) : (
        <Main key="main" />
      )}
    </AnimatePresence>
  );
};