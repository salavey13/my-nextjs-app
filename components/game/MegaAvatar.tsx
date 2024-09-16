// components/game/MegaAvatar.tsx

import React, { useEffect, useRef, useState } from 'react';
import { supabase } from "../../lib/supabaseClient";
import { useSpring, animated, to } from 'react-spring';
import { useGesture } from '@use-gesture/react';

const GAME_ID = 28;

const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

interface Player {
  id: string;
  iceCandidates?: RTCIceCandidateInit[];
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
  playerId: number;
  initialPosition: Point;
  onPositionChange: (playerId: number, position: Point) => void;
}

const MegaAvatar: React.FC<MegaAvatarProps> = ({ gameState, playerId, initialPosition, onPositionChange }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [position, setPosition] = useState<Point>(initialPosition);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [{ x, y, shadow }, api] = useSpring(() => ({
    x: initialPosition.x * window.innerWidth,
    y: initialPosition.y * window.innerHeight,
    shadow: 5,
    config: { mass: 1, tension: 200, friction: 13 },
  }));
  const isDragging = useRef(false);

  useEffect(() => {
    const initializeStream = async () => {
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
    };

    initializeStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const initWebRTC = async () => {
      peerConnection.current = new RTCPeerConnection(rtcConfig);

      if (stream) {
        stream.getTracks().forEach(track => peerConnection.current?.addTrack(track, stream));
      }

      peerConnection.current.onicecandidate = event => {
        if (event.candidate) {
          sendIceCandidateToPeers(event.candidate);
        }
      };

      peerConnection.current.ontrack = event => {
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
