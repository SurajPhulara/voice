import React, { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isListening, setIsListening] = useState(false);

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleSendMessage = async () => {
        if (input.trim()) {
            const userMessage = { sender: 'user', text: input };
            setMessages([...messages, userMessage]);
            setInput('');

            try {
                const response = await axios.post('http://localhost:5000/api/chat', {
                    message: input,
                    chat_history: messages,
                });
                const botMessage = { sender: 'bot', text: response.data.message };
                setMessages((prevMessages) => [...prevMessages, botMessage]);
                speakText(botMessage.text);
            } catch (error) {
                console.error('Error fetching response:', error);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };


    const handleMicClick = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
        if (!SpeechRecognition) {
          console.error('Speech recognition not supported');
          return;
        }
      
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
      
        recognition.onstart = () => {
          setIsListening(true);
        };
      
        recognition.onresult = (event) => {
          const speechToText = event.results[0][0].transcript;
          setInput(speechToText);
          setIsListening(false);
          handleSendMessage();
        };
      
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      
        recognition.onend = () => {
          setIsListening(false);
        };
      
        recognition.start();
      };
      

      const speakText = (text) => {
        console.log("speaking : ", text);
        const synth = window.speechSynthesis;
      
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
      
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event.error);
          // Handle error or retry if needed
        };
      
        utterance.onstart = () => {
          console.log('Speech synthesis started');
        };
      
        utterance.onend = () => {
          console.log('Speech synthesis finished');
        };
      
        synth.speak(utterance);
      };
      

    return (
        <div className="chatbot-container">
            <div className="chatbox">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="input-container">
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                />
                <button onClick={handleSendMessage}>Send</button>
                <button onClick={handleMicClick} disabled={isListening}>
                    {isListening ? 'Listening...' : '🎤'}
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
