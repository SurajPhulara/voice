import React, { useState } from 'react';
import './App.css';
import Chatbot from './Chatbot';

function App() {
  const [language, setLanguage] = useState(null);

  const handleLanguageSelection = (selectedLanguage) => {
    setLanguage(selectedLanguage);
  };

  return (
    <div className="App">
      {!language ? (
        <div className="overlay">
          <div className="overlay-content">
            <h1>Select Language</h1>
            <button onClick={() => handleLanguageSelection('en')}>English</button>
            <button onClick={() => handleLanguageSelection('fr')}>French</button>
          </div>
        </div>
      ) : (
        <Chatbot language={language} />
      )}
    </div>
  );
}

export default App;
