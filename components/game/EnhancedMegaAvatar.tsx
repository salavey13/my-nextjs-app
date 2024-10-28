import React, { useCallback, useState, useEffect, useRef, useMemo  } from 'react';
import { useSpring, animated, to, useTransition } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import { useAppContext } from '@/context/AppContext';
import ShineBorder from '@/components/ui/ShineBorder';
import { Mic, MicOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useTheme } from '@/hooks/useTheme'

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

const EnhancedMegaAvatar: React.FC<EnhancedMegaAvatarProps> = React.memo(({ 
  gameState, 
  playerId, 
  initialPosition, 
  onPositionChange,
  onMessageUpdate
}) => {
  const { state, t } = useAppContext();
  const player = gameState.players.find(p => p.id === playerId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const interimTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const { theme } = useTheme()
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
      setMessages(player.messages);
    }
  }, [player]);

  const addMessage = useCallback((text: string, isInterim: boolean = false) => {
    const now = Date.now();
    setMessages(prevMessages => {
      const newMessages = isInterim
        ? [{ text, timestamp: now }]
        : [...prevMessages.filter(msg => now - msg.timestamp < MESSAGE_LIFETIME), { text, timestamp: now }];
      
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
    const SpeechRecognitionConstructor = (window as Window).SpeechRecognition || (window as Window).webkitSpeechRecognition;

    if (SpeechRecognitionConstructor) {
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.results.length - 1; i >= 0; i--) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript = result[0].transcript;
            break;
          } else {
            interimTranscript = result[0].transcript;
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

      recognitionRef.current.onend = () => {
        if (!isMuted) {
          recognitionRef.current?.start();
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          toast({
            title: "Speech Recognition Error",
            description: `Error: ${event.error}. Please try again.`,
            variant: "destructive",
          });
        }
      };

      recognitionRef.current.start();
    } else {
      console.warn(t('speechRecognitionNotSupported'));
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser does not support speech recognition.",
        variant: "destructive",
      });
    }
  }, [addMessage, isMuted, t]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  useEffect(() => {
    if (player?.id === state?.user?.id?.toString() && !isMuted && permissionGranted) {
      startListening();
    }
    return () => {
      stopListening();
    };
  }, [player, state?.user, isMuted, permissionGranted, startListening, stopListening]);

  const toggleMute = useCallback(async () => {
    if (isMuted && !permissionGranted) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissionGranted(true);
      } catch (err) {
        console.error('Failed to get user media', err);
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice chat.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsMuted(prev => !prev);
    if (isMuted) {
      startListening();
    } else {
      stopListening();
    }
  }, [isMuted, permissionGranted, startListening, stopListening]);

  const tooltipPosition = useMemo(() => {
    const avatarX = initialPosition.x * window.innerWidth;
    const avatarY = initialPosition.y * window.innerHeight;
    const distanceToRight = window.innerWidth - avatarX;
    const distanceToBottom = window.innerHeight - avatarY;
    const distanceToLeft = avatarX;
    const distanceToTop = avatarY;

    const maxDistance = Math.max(distanceToRight, distanceToBottom, distanceToLeft, distanceToTop);

    if (maxDistance === distanceToRight) return { left: '100%', top: '50%', transform: 'translateY(-50%)' };
    if (maxDistance === distanceToBottom) return { left: '50%', top: '100%', transform: 'translateX(-50%)' };
    if (maxDistance === distanceToLeft) return { right: '100%', top: '50%', transform: 'translateY(-50%)' };
    return { left: '50%', bottom: '100%', transform: 'translateX(-50%)' };
  }, [initialPosition]);

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
      <ShineBorder borderWidth={2} duration={10} color={theme.colors.secondary.hex}>
        <div
          style={{
            width: '128px',
            height: '128px',
            borderRadius: '50%',
            backgroundColor: player?.id === state?.user?.id?.toString() ? 'rgba(225, 255, 1, 0.2)' : 'transparent',
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
              backgroundColor: 'hsl(var(--secondary))',
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
          {player?.id === state?.user?.id?.toString() && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
              className="mt-2"
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </ShineBorder>
      {player && (
        <div
          style={{
            marginTop: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.13)',
            color: 'hsl(var(--secondary))',
            padding: '2px 8px',
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
          ...tooltipPosition,
          zIndex: 1000,
        }}
      >
        {messageTransitions((style, message) => (
          <animated.div
            style={{
              ...style,
              backgroundColor: 'rgba(0, 0, 0, 0.13)',
              color: 'hsl(var(--secondary))',
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
    </animated.div>
  );
});

EnhancedMegaAvatar.displayName = 'EnhancedMegaAvatar';

export default EnhancedMegaAvatar;