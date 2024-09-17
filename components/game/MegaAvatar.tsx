import React, { useEffect, useRef, useState } from 'react';
import { supabase } from "../../lib/supabaseClient";
import { useSpring, animated, to } from 'react-spring';
import { useGesture } from '@use-gesture/react';
import { useAppContext } from '@/context/AppContext';

interface Player {
  id: string;
  position: { x: number; y: number };
  webrtc: {
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    iceCandidates: RTCIceCandidateInit[];
  };
}

interface Point {
  x: number;
  y: number;
}

interface GameState {
  cards: any[];
  players: Player[];
}

interface MegaAvatarProps {
  gameState: GameState;
  playerId: string;
  initialPosition: Point;
  onPositionChange: (playerId: string, position: Point) => void;
}

const rtcConfig: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

const MegaAvatar: React.FC<MegaAvatarProps> = ({ gameState, playerId, initialPosition, onPositionChange }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [position, setPosition] = useState<Point>(initialPosition);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const { user } = useAppContext();
  const [{ x, y, shadow }, api] = useSpring(() => ({
    x: initialPosition.x * window.innerWidth,
    y: initialPosition.y * window.innerHeight,
    shadow: 5,
    config: { mass: 1, tension: 200, friction: 13 },
  }));
  const isDragging = useRef(false);

  useEffect(() => {
    const initializeStream = async () => {
      if (user?.id === playerId) {
        try {
          const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(webcamStream);
          if (videoRef.current) {
            videoRef.current.srcObject = webcamStream;
            await videoRef.current.play();
          }
        } catch (error) {
          console.error("Error accessing webcam:", error);
        }
      } else {
        setupPeerConnection();
      }
    };

    initializeStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, [user?.id, playerId]);

  const setupPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection(rtcConfig);

    peerConnection.current.ontrack = (event) => {
      if (videoRef.current && event.streams[0]) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        updatePlayerWebRTC({ iceCandidates: [event.candidate] });
      }
    };

    subscribeToWebRTCUpdates();
  };

  const subscribeToWebRTCUpdates = () => {
    const channel = supabase.channel('game_state_updates')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'rents', filter: `id=eq.${user?.currentGameId}` },
        async (payload) => {
          const updatedGameState = payload.new.game_state as GameState;
          const updatedPlayer = updatedGameState.players.find(p => p.id === playerId);
          
          if (updatedPlayer && peerConnection.current) {
            if (updatedPlayer.webrtc.offer && !peerConnection.current.currentRemoteDescription) {
              await peerConnection.current.setRemoteDescription(new RTCSessionDescription(updatedPlayer.webrtc.offer));
              const answer = await peerConnection.current.createAnswer();
              await peerConnection.current.setLocalDescription(answer);
              updatePlayerWebRTC({ answer });
            }

            if (updatedPlayer.webrtc.answer && peerConnection.current.signalingState === 'have-local-offer') {
              await peerConnection.current.setRemoteDescription(new RTCSessionDescription(updatedPlayer.webrtc.answer));
            }

            updatedPlayer.webrtc.iceCandidates.forEach(candidate => {
              peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updatePlayerWebRTC = async (webrtcUpdate: Partial<Player['webrtc']>) => {
    const { data, error } = await supabase
      .from('rents')
      .select('game_state')
      .eq('id', user?.currentGameId)
      .single();

    if (error) {
      console.error('Error fetching game state:', error);
      return;
    }

    const currentGameState = data.game_state as GameState;
    const updatedPlayers = currentGameState.players.map(p => 
      p.id === playerId ? { ...p, webrtc: { ...p.webrtc, ...webrtcUpdate } } : p
    );

    const { error: updateError } = await supabase
      .from('rents')
      .update({ game_state: { ...currentGameState, players: updatedPlayers } })
      .eq('id', user?.currentGameId);

    if (updateError) {
      console.error('Error updating game state:', updateError);
    }
  };

  const handleDragEnd = async (newX: number, newY: number) => {
    isDragging.current = false;
    api.start({ shadow: 5 });

    const updatedPosition = { x: newX / window.innerWidth, y: newY / window.innerHeight };
    setPosition(updatedPosition);
    onPositionChange(playerId, updatedPosition);
  };

  const bind = useGesture({
    onDragStart: () => {
      isDragging.current = true;
    },
    onDrag: ({ offset: [ox, oy] }) => {
      api.start({ x: ox, y: oy, shadow: Math.min(30, Math.sqrt(ox * ox + oy * oy) / 10) });
    },
    onDragEnd: () => {
      handleDragEnd(x.get(), y.get());
    },
  });

  return (
    <animated.div
      {...bind()}
      style={{
        transform: to([x, y], (x, y) => `translate(${x}px, ${y}px)`),
        boxShadow: shadow.to((s) => `0px ${s}px ${2 * s}px rgba(0,0,0,0.2)`),
        width: '128px',
        height: '128px',
        borderRadius: '50%',
        cursor: isDragging.current ? 'grabbing' : 'grab',
        position: 'absolute',
        touchAction: 'none',
        overflow: 'hidden',
      }}
    >
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)', // Mirror the video
        }}
        muted
        playsInline
      />
    </animated.div>
  );
};

export default MegaAvatar;
