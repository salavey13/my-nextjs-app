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
      if (user?.id && user.id.toString() === playerId) {
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

  // ... rest of the component remains the same

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
