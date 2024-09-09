import React, { useEffect, useRef, useState } from 'react';
import { supabase } from "../../lib/supabaseClient"; // Supabase for state management
import { useSpring, animated } from 'react-spring';
import { useGesture } from '@use-gesture/react';

const GAME_ID = 28; // Replace with actual game ID

// WebRTC configuration
const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' } // Public STUN server for connection establishment
  ]
};

// Type for the player object
interface Player {
  id: string;
  iceCandidates?: RTCIceCandidateInit[];
}
interface Card {
  id: string;
  position: Point; // Relative position (0 to 1)
  flipped: boolean;
  last_trajectory?: Point[];
  trajectory: {
    position: Point,
    rotation: number,
    velocity: Point,
    rotationSpeed: number,
  };
}
interface Point {
  x: number;
  y: number;
}
interface GameState {
  cards: Card[];
  players: Player[];
}
interface MegaAvatarProps {
  gameState: GameState;
  playerId: number;
  initialPosition: Point;
  onPositionChange: (playerId: number, position: Point) => void;
}

const MegaAvatar: React.FC<MegaAvatarProps> = ({ gameState, playerId, initialPosition, onPositionChange }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [position, setPosition] = useState<Point>(initialPosition);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [{ x, y, shadow }, set] = useSpring(() => ({
    x: initialPosition.x,
    y: initialPosition.y,
    shadow: 5,
    config: { mass: 1, tension: 200, friction: 13 },
  }));
  const [isDragging, setIsDragging] = useState(false);

  // Initialize local media stream (camera + microphone)
  useEffect(() => {
    const initializeStream = async () => {
      try {
        const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(webcamStream);
        if (videoRef.current) {
          videoRef.current.srcObject = webcamStream;
          videoRef.current.play();
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    initializeStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Initialize WebRTC connection
  useEffect(() => {
    const initWebRTC = async () => {
      peerConnection.current = new RTCPeerConnection(rtcConfig);

      if (stream) {
        stream.getTracks().forEach(track => peerConnection.current?.addTrack(track, stream));
      }

      peerConnection.current!.onicecandidate = event => {
        if (event.candidate) {
          sendIceCandidateToPeers(event.candidate);
        }
      };

      peerConnection.current!.ontrack = event => {
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
        }
      };

      const player = gameState.players.find((p) => p.id === String(playerId));
      if (player && player.iceCandidates) {
        player.iceCandidates.forEach((candidate: RTCIceCandidateInit) => {
          peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
        });
      }
    };

    initWebRTC();

    return () => {
      peerConnection.current?.close();
    };
  }, [playerId, gameState, stream]);

  const sendIceCandidateToPeers = async (candidate: RTCIceCandidateInit) => {
    const player = gameState.players.find((p) => p.id === String(playerId));
    if (player) {
      player.iceCandidates = player.iceCandidates || [];
      player.iceCandidates.push(candidate);
      const updatedGameState = { ...gameState };

      const { error } = await supabase
        .from('rents')
        .update({ game_state: updatedGameState })
        .eq('id', GAME_ID);

      if (error) {
        console.error('Error updating game state:', error);
      }
    }
  };

  const handleDragEnd = async (newX: number, newY: number) => {
    setIsDragging(false);
    set({ x: newX, y: newY, shadow: 5 });

    const updatedPosition = { x: newX, y: newY };
    setPosition(updatedPosition);
    onPositionChange(playerId, updatedPosition);

    const updatedGameState = {
      ...gameState,
      players: gameState.players.map(player => 
        player.id === playerId.toString()
          ? { ...player, position: updatedPosition }
          : player
      )
    };

    const { error } = await supabase
      .from('rents')
      .update({ game_state: updatedGameState })
      .eq('id', GAME_ID);

    if (error) {
      console.error('Error updating game state:', error);
    }
  };

  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my], memo = { x: 0, y: 0 } }) => {
      if (down) {
        setIsDragging(true);
        const newX = memo.x + mx;
        const newY = memo.y + my;
        set({ x: newX, y: newY, shadow: Math.min(30, Math.abs(mx + my) / 10) });
        return memo;
      } else {
        handleDragEnd(x.get(), y.get());
        return memo;
      }
    },
  });

  return (
    <animated.div
      {...bind()}
      style={{
        transform: x.interpolate((x) => `translate(${x}px, ${y.get()}px)`),
        boxShadow: shadow.to((s) => `0px ${s}px ${2 * s}px rgba(0,0,0,0.2)`),
        width: '256px',
        height: '256px',
        borderRadius: '50%',
        // backgroundColor: 'transparent',
        cursor: 'grab',
        position: 'absolute',
        touchAction: 'none',
      }}
    >
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          objectFit: 'cover',
        }}
        muted
      />
    </animated.div>
  );
};

export default MegaAvatar;
