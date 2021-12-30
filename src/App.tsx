import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import YouTube from 'react-youtube';

import song from './songs/frozen-let-it-go.json';
import GameOverlay from './GameOverlay';
import useWindowSize from './useWindowSize';

const dstyle = {
  position: 'absolute' as any,
  zIndex: 1, 
  backgroundColor: 'rgba(0, 0, 0, .2)',
  pointerEvents: 'none' as any,
};

function App() {
  const player = useRef<YouTube | null>(null);
  const { width, height } = useWindowSize();
  const [currentTime, setCurrentTime] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(YouTube.PlayerState.UNSTARTED);

  useEffect(() => {
    if (!player.current) {
      return;
    }
    const interval = setInterval(async () => {
      const time = await player.current!.getInternalPlayer().getCurrentTime();
      setCurrentTime(time * 1000);
    }, 16);

    return () => clearInterval(interval);
  }, [player, currentStatus]);

  if (!width || !height) return <>Loading</>;

  return (
    <div className="App">
      {currentStatus !== YouTube.PlayerState.UNSTARTED && <div style={dstyle}>
        <GameOverlay currentStatus={currentStatus} song={song} currentTime={currentTime} width={width} height={height} />
      </div>}
      <YouTube
        ref={player}
        videoId={song.video} 
        opts={{ width: String(width), height: String(height), playerVars: { autoplay: 0 }}} 
        onStateChange={e => setCurrentStatus(e.data)} 
      />
    </div>
  );
}

export default App;
