// import './App.css';

// import song from './songs/dummy.json';
import song from './songs/netflix-toss-a-coin-to-your-witcher.json';

import Singing from './Scenes/Singing/Singing';

function App() {
    return <Singing song={song} />
}

export default App;
