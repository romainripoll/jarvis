import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaRobot } from 'react-icons/fa';
import axios from 'axios';

const AssistantPanel = () => {
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const chatContainerRef = useRef(null);
  const audioRef = useRef(null);

  // Faire défiler automatiquement jusqu'au dernier message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialise la reconnaissance vocale du navigateur
  useEffect(() => {
    // Vérifier si le navigateur supporte l'API MediaRecorder
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log('Le navigateur supporte la capture audio');
    } else {
      console.error('Votre navigateur ne supporte pas la capture audio');
      // Ajouter un message d'erreur à l'utilisateur
      setMessages(prev => [...prev, {
        type: 'assistant',
        text: "Votre navigateur ne supporte pas la capture audio. Veuillez utiliser Chrome, Firefox ou Edge."
      }]);
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Créer un blob à partir des chunks audio
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        processAudioInput(audioBlob);

        // Arrêter toutes les pistes du stream pour libérer le microphone
        stream.getTracks().forEach(track => track.stop());
      };

      // Commencer l'enregistrement
      recorder.start();
      setAudioChunks(chunks);
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Erreur lors de l\'accès au microphone:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        text: "Impossible d'accéder au microphone. Veuillez vérifier les permissions."
      }]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const processAudioInput = async (audioBlob) => {
    try {
      // Ajouter un message utilisateur temporaire "En cours de traitement..."
      const userMessageIndex = messages.length;
      setMessages(prev => [...prev, {
        type: 'user',
        text: "En cours de traitement...",
        processing: true
      }]);

      // Créer un FormData pour envoyer le fichier audio
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      // Envoyer au serveur
      const response = await axios.post('/api/process_voice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Mettre à jour le message utilisateur avec le texte reconnu
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        newMessages[userMessageIndex] = {
          type: 'user',
          text: response.data.text,
          processing: false
        };
        
        // Ajouter la réponse de l'assistant
        newMessages.push({
          type: 'assistant',
          text: response.data.response.message
        });
        
        return newMessages;
      });

      // Jouer la réponse audio si disponible
      if (response.data.audio_url && audioRef.current) {
        audioRef.current.src = response.data.audio_url;
        audioRef.current.play();
      }

    } catch (error) {
      console.error('Erreur lors du traitement audio:', error);
      setMessages(prev => {
        // Mettre à jour le message "En cours de traitement..." avec l'erreur
        const newMessages = [...prev];
        if (newMessages.length > 0 && newMessages[newMessages.length - 1].processing) {
          newMessages[newMessages.length - 1] = {
            type: 'user',
            text: "Erreur de reconnaissance vocale",
            processing: false
          };
        }
        
        // Ajouter un message d'erreur
        newMessages.push({
          type: 'assistant',
          text: "Désolé, une erreur est survenue lors du traitement de votre demande."
        });
        
        return newMessages;
      });
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    
    if (!userInput.trim()) return;
    
    // Ajouter le message de l'utilisateur
    setMessages(prev => [...prev, {
      type: 'user',
      text: userInput
    }]);
    
    try {
      // Envoyer le texte au serveur
      const response = await axios.post('/api/process_text', {
        text: userInput,
        voice_response: true
      });
      
      // Ajouter la réponse de l'assistant
      setMessages(prev => [...prev, {
        type: 'assistant',
        text: response.data.response.message
      }]);
      
      // Jouer la réponse audio si disponible
      if (response.data.audio_url && audioRef.current) {
        audioRef.current.src = response.data.audio_url;
        audioRef.current.play();
      }
      
    } catch (error) {
      console.error('Erreur lors du traitement du texte:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        text: "Désolé, une erreur est survenue lors du traitement de votre demande."
      }]);
    }
    
    // Réinitialiser l'entrée utilisateur
    setUserInput('');
  };

  return (
    <div className="assistant-panel">
      <div className="assistant-header">
        <div className="assistant-icon">
          <FaRobot />
        </div>
        <div>
          <div className="assistant-name">JARVIS</div>
          <div className="assistant-status">En ligne</div>
        </div>
      </div>
      
      <div className="chat-container" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="empty-chat-message">
            Dites "Bonjour JARVIS" pour commencer.
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.type === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              {message.text}
            </div>
          ))
        )}
      </div>
      
      <form onSubmit={handleTextSubmit} className="input-container">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Écrivez votre message..."
          disabled={isRecording}
        />
        <button type="submit" className="send-button">
          Envoyer
        </button>
      </form>
      
      <div className="voice-controls">
        <button 
          className={`mic-button ${isRecording ? 'mic-recording' : ''}`}
          onClick={toggleRecording}
        >
          {isRecording ? <FaStop /> : <FaMicrophone />}
        </button>
      </div>
      
      {/* Lecteur audio caché pour la réponse vocale */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default AssistantPanel;
