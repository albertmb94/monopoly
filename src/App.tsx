import { useGameStore } from './store/gameStore';
import { StartScreen } from './components/StartScreen';
import { MasterControl } from './components/MasterControl';

export default function App() {
  const game = useGameStore((s) => s.game);

  return (
    <div className="w-full min-h-screen">
      {!game ? <StartScreen /> : <MasterControl />}
    </div>
  );
}
