import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useSpring, animated, to, useTransition } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import { useAppContext } from '@/context/AppContext';
import ShineBorder from '@/components/ui/ShineBorder';
import { Mic, MicOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

interface Player {
  id: string;
  username: string;
  position: { x: number; y: number };
  messages: Message[];
}

interface GameState {
  cards: any[];
  players: Player[];
}

interface EnhancedMegaAvatarProps {
  gameState: GameState;
  playerId: string;
  initialPosition: { x: number; y: number };
  onPositionChange: (playerId: string, newPosition: { x: number; y: number }) => void;
  onMessageUpdate: (playerId: string, messages: Message[]) => void;
}

interface Message {
  text: string;
  timestamp: number;
}

const MESSAGE_LIFETIME = 60000; // 1 minute in milliseconds
const INTERIM_MESSAGE_LIFETIME = 5000; // 5 seconds in milliseconds

const profanityList = [
  'fuck', 'shit', 'ass', 'bitch', 'cunt', 'dick', 'pussy', 'cock', 'asshole',
  'motherfucker', 'bastard', 'slut', 'whore', 'damn', 'hell', 'piss', 'crap',
  'nigger', 'faggot', 'retard', 'twat', 'wanker', 'bollocks', 'prick', 'tits'
];

const censorMessage = (message: string): string => {
  const words = message.split(' ');
  return words.map(word => {
    const lowerWord = word.toLowerCase();
    if (profanityList.some(profanity => lowerWord.includes(profanity))) {
      return '*'.repeat(word.length);
    }
    return word;
  }).join(' ');
};


let hasMicPermission = false;

const EnhancedMegaAvatar: React.FC<EnhancedMegaAvatarProps> = React.memo(({ 
  gameState, 
  playerId, 
  initialPosition, 
  onPositionChange, 
  onMessageUpdate 
}) => {
  const { user, t } = useAppContext();
  const player = gameState.players.find(p => p.id === playerId);
  const [messages, setMessages] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);
  const interimTimeoutRef = useRef(null);

  const [{ x, y }, api] = useSpring(() => ({
    x: initialPosition.x * window.innerWidth,
    y: initialPosition.y * window.innerHeight,
    config: { mass: 1, tension: 200, friction: 20 },
  }));

  const messageTransitions = useTransition(messages, {
    from: { opacity: 0, transform: 'translateY(10px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(-10px)' },
    config: { tension: 300, friction: 20 },
  });

  const handleDrag = useCallback((mx, my, down) => {
    if (!down) {
      const newX = Math.max(0, Math.min(initialPosition.x * window.innerWidth + mx, window.innerWidth - 128));
      const newY = Math.max(0, Math.min(initialPosition.y * window.innerHeight + my, window.innerHeight - 128));
      onPositionChange(playerId, { 
        x: newX / window.innerWidth,
        y: newY / window.innerHeight
      });
    }
    api.start({ 
      x: initialPosition.x * window.innerWidth + mx,
      y: initialPosition.y * window.innerHeight + my,
      immediate: down 
    });
  }, [initialPosition, playerId, onPositionChange, api]);

  const bind = useGesture({
    onDrag: ({ movement: [mx, my], down }) => handleDrag(mx, my, down),
  });

  useEffect(() => {
    if (player && player.messages) {
      setMessages(player.messages);
    }
  }, [player]);

  const addMessage = useCallback((text, isInterim = false) => {
    const now = Date.now();
    setMessages(prevMessages => {
      // Update only the last interim message
      const newMessages = [
        ...prevMessages.filter(msg => now - msg.timestamp < (isInterim ? INTERIM_MESSAGE_LIFETIME : MESSAGE_LIFETIME)),
        { text, timestamp: now }
      ];

      // Only push the final message to the server
      if (!isInterim) {
        onMessageUpdate(playerId, newMessages);
      }
      return newMessages;
    });

    if (isInterim) {
      if (interimTimeoutRef.current) {
        clearTimeout(interimTimeoutRef.current);
      }
      interimTimeoutRef.current = setTimeout(() => {
        setMessages(prevMessages => prevMessages.filter(msg => now - msg.timestamp < MESSAGE_LIFETIME));
      }, INTERIM_MESSAGE_LIFETIME);
    }
  }, [playerId, onMessageUpdate]);

  const startListening = useCallback(() => {
    if (hasMicPermission) {
      if (recognitionRef.current) recognitionRef.current.start();
      return;
    }

    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionConstructor) {
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (interimTranscript) {
          const censoredInterim = censorMessage(interimTranscript);
          setInterimTranscript(censoredInterim);
          addMessage(censoredInterim, true);
        }

        if (finalTranscript) {
          const censoredFinal = censorMessage(finalTranscript);
          addMessage(censoredFinal);
          setInterimTranscript('');
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Speech Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        if (!isMuted) recognitionRef.current.start();
      };

      recognitionRef.current.start();
      hasMicPermission = true; // Mark permission granted after first request
    } else {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser does not support speech recognition.",
        variant: "destructive",
      });
    }
  }, [addMessage, isMuted]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
  }, []);

  useEffect(() => {
    if (player?.id === user?.id?.toString() && !isMuted) {
      startListening();
    }
    return () => stopListening();
  }, [player, user, isMuted, startListening, stopListening]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    if (isMuted) {
      startListening();
    } else {
      stopListening();
    }
  }, [isMuted, startListening, stopListening]);

  return (
    <animated.div
      {...bind()}
      style={{
        transform: to([x, y], (x, y) => `translate(${x}px, ${y}px)`),
        width: '128px',
        height: '128px',
        position: 'absolute',
        touchAction: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <ShineBorder borderWidth={2} />
      <Button onClick={toggleMute}>
        {isMuted ? <MicOff /> : <Mic />}
      </Button>
      <div>
        {messageTransitions((style, item) => (
          <animated.div style={style}>
            {item.text}
          </animated.div>
        ))}
      </div>
    </animated.div>
  );
});
// Add the display name
EnhancedMegaAvatar.displayName = "EnhancedMegaAvatar";


export default EnhancedMegaAvatar;
