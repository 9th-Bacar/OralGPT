import logo from './logo.svg';
import Dictaphone from './ChatPage'
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Dictaphone />
      </header>

    </div>
  );
}

export default App;
