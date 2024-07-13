import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Chatbot = ({ language }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        const welcomeMessage = language === 'fr' 
            ? "Bienvenue à votre test de langue DELF. Veuillez vous présenter."
            : "Welcome to your IELTS language test. Please introduce yourself.";
        const botMessage = { sender: 'bot', text: welcomeMessage };
        setMessages([botMessage]);
        // Speak the welcome message only once
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        speakText(welcomeMessage);
    }, [language]);

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
                    language,
                });

                const botMessage = { sender: 'bot', text: response.data.message };
                speakText(botMessage.text);
                setMessages((prevMessages) => [...prevMessages, botMessage]);

                // Play audio response if available
                const audioUrl = response.data.audioUrl;
                if (audioUrl) {
                    const audio = new Audio(audioUrl);
                    audio.play();
                }
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
        recognition.lang = language === 'fr' ? 'fr-FR' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const speechToText = event.results[0][0].transcript;
            setInput(speechToText);
            setIsListening(false);
            // handleSendMessage();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            handleSendMessage();
        };

        recognition.start();
    };

    const speakText = (text) => {
        console.log("speaking : ", text);
        const synth = window.speechSynthesis;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'fr' ? 'fr-FR' : 'en-US';

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
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
