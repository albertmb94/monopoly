import { useEffect, useRef } from 'react';
import { useGameStore } from './store/gameStore';
import { StartScreen } from './components/StartScreen';
import { MasterControl } from './components/MasterControl';
import { PlayerView } from './components/PlayerView';

export default function App() {
  const game = useGameStore(s => s.game);
  const mode = useGameStore(s => s.mode);
  const myPlayerId = useGameStore(s => s.myPlayerId);
  const syncToCloud = useGameStore(s => s.syncToCloud);
  const syncFromCloud = useGameStore(s => s.syncFromCloud);

  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-sync for admin in multi mode: push on changes
  useEffect(() => {
    if (mode !== 'multi' || !game) return;

    const unsub = useGameStore.subscribe((state, prevState) => {
      if (state.game && state.game !== prevState.game) {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(() => {
          syncToCloud();
        }, 400);
      }
    });

    return () => {
      unsub();
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [mode, game?.id, syncToCloud]);

  // Polling for admin in multi mode: pull every 3 seconds
  useEffect(() => {
    if (mode !== 'multi' || !game) return;
    const interval = setInterval(() => {
      syncFromCloud();
    }, 3000);
    return () => clearInterval(interval);
  }, [mode, game?.id, syncFromCloud]);

  // No game → start screen
  if (!game) {
    return (
      <div className="w-full min-h-screen">
        <StartScreen />
      </div>
    );
  }

  // Multi-device player (not admin) → read-only player view
  const isAdmin = myPlayerId === game.adminId;
  if (mode === 'multi' && !isAdmin) {
    return (
      <div className="w-full min-h-screen">
        <PlayerView />
      </div>
    );
  }

  // Admin or single-device → full control
  return (
    <div className="w-full min-h-screen">
      <MasterControl />
    </div>
  );
}
