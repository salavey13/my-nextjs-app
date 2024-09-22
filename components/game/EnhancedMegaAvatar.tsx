import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useSpring, animated, to } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import { useAppContext } from '@/context/AppContext';
import ShineBorder from '@/components/ui/ShineBorder';
import { Mic, MicOff } from 'lucide-react';
import { Button } from "@/components/ui/button"
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
  messages: string[];
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
  onMessageUpdate: (playerId: string, messages: string[]) => void;
}

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


// ... (keep all the existing interfaces)

interface Message {
  text: string;
  timestamp: number;
}

const MESSAGE_LIFETIME = 60000; // 1 minute in milliseconds

const EnhancedMegaAvatar: React.FC<EnhancedMegaAvatarProps> = React.memo(({ 
  gameState, 
  playerId, 
  initialPosition, 
  onPositionChange,
  onMessageUpdate
}) => {
  const { user, t } = useAppContext();
  const player = gameState.players.find(p => p.id === playerId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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

  const handleDrag = useCallback((mx: number, my: number, down: boolean) => {
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
      setMessages(player.messages.map(text => ({ text, timestamp: Date.now() })));
    }
  }, [player]);

  const addMessage = useCallback((text: string) => {
    const now = Date.now();
    setMessages(prevMessages => {
      const newMessages = [
        ...prevMessages.filter(msg => now - msg.timestamp < MESSAGE_LIFETIME),
        { text, timestamp: now }
      ];
      onMessageUpdate(playerId, newMessages.map(msg => msg.text));
      return newMessages;
    });
  }, [playerId, onMessageUpdate]);

  const startListening = useCallback(() => {
    const SpeechRecognitionConstructor = (window as Window).SpeechRecognition || (window as Window).webkitSpeechRecognition;

    if (SpeechRecognitionConstructor) {
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(interimTranscript);

        if (finalTranscript !== '') {
          const censoredMessage = censorMessage(finalTranscript);
          addMessage(censoredMessage);
          setInterimTranscript('');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive",
        });
      };

      recognitionRef.current.start();
      setIsListening(true);
    } else {
      console.warn(t('speechRecognitionNotSupported'));
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser does not support speech recognition.",
        variant: "destructive",
      });
    }
  }, [addMessage, t]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript('');
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const getTooltipPosition = useCallback(() => {
    const avatarX = x.get();
    const avatarY = y.get();
    const distanceToRight = window.innerWidth - avatarX;
    const distanceToBottom = window.innerHeight - avatarY;
    const distanceToLeft = avatarX;
    const distanceToTop = avatarY;

    const maxDistance = Math.max(distanceToRight, distanceToBottom, distanceToLeft, distanceToTop);

    if (maxDistance === distanceToRight) return { left: '100%', top: '50%', transform: 'translateY(-50%)' };
    if (maxDistance === distanceToBottom) return { left: '50%', top: '100%', transform: 'translateX(-50%)' };
    if (maxDistance === distanceToLeft) return { right: '100%', top: '50%', transform: 'translateY(-50%)' };
    return { left: '50%', bottom: '100%', transform: 'translateX(-50%)' };
  }, [x, y]);

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
      <ShineBorder borderWidth={2} duration={10} color="#E1FF01">
        <div
          style={{
            width: '128px',
            height: '128px',
            borderRadius: '50%',
            backgroundColor: player?.id === user?.id?.toString() ? 'rgba(225, 255, 1, 0.2)' : 'transparent',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#E1FF01',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#000000',
              fontWeight: 'bold',
              fontSize: '24px',
            }}
          >
            {player?.username.charAt(0).toUpperCase()}
          </div>
          {player?.id === user?.id?.toString() && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleListening}
              className="mt-2"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </ShineBorder>
      {player && (
        <div
          style={{
            marginTop: '5px',
            backgroundColor: 'rgba(0, 0, 0, 0.13)',
            color: '#E1FF01',
            padding: '2px 6px',
            borderRadius: '10px',
            fontSize: '0.75rem',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {player.username}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          ...getTooltipPosition(),
          zIndex: 1000,
        }}
      >
        {messageTransitions((style, message) => (
          <animated.div
            style={{
              ...style,
              backgroundColor: 'rgba(0, 0, 0, 0.13)',
              color: '#E1FF01',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '0.75rem',
              maxWidth: '200px',
              marginBottom: '5px',
            }}
          >
            {message.text}
          </animated.div>
        ))}
      </div>
      {interimTranscript && (
        <div
          style={{
            position: 'absolute',
            ...getTooltipPosition(),
            zIndex: 1001,
            backgroundColor: 'rgba(0, 0, 0, 0.13)',
            color: '#E1FF01',
            padding: '2px 6px',
            borderRadius: '10px',
            fontSize: '0.75rem',
            maxWidth: '200px',
            fontStyle: 'italic',
          }}
        >
          {interimTranscript}
        </div>
      )}
    </animated.div>
  );
});

EnhancedMegaAvatar.displayName = 'EnhancedMegaAvatar';

export default EnhancedMegaAvatar;
