import { useState, useEffect } from 'react';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { useGameStore } from './store/gameStore';

type AppScreen = 'start' | 'game';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('start');
  const [gameCode, setGameCode] = useState<string>('');
  const { clearSession } = useGameStore();

  // Verificar si hay parámetro de join en la URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      setGameCode(joinCode);
      setCurrentScreen('game');
    }
  }, []);

  const handleGameCreated = (code: string) => {
    setGameCode(code);
    setCurrentScreen('game');
  };

  const handleGameJoined = (code: string) => {
    setGameCode(code);
    setCurrentScreen('game');
  };

  const handleExit = () => {
    clearSession();
    setCurrentScreen('start');
    setGameCode('');
    // Limpiar URL
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return (
    <div className="w-full h-screen overflow-hidden">
      {currentScreen === 'start' ? (
        <StartScreen
          onGameCreated={handleGameCreated}
          onGameJoined={handleGameJoined}
        />
      ) : (
        <GameScreen gameCode={gameCode} onExit={handleExit} />
      )}
    </div>
  );
}
