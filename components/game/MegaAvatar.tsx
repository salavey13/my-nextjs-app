import React, { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from "../../lib/supabaseClient";
import { useSpring, animated, to } from 'react-spring';
import { useGesture } from '@use-gesture/react';
import { useAppContext } from '@/context/AppContext';

interface Player {
  id: string;
  username: string;
  position: { x: number; y: number };
  webrtc: {
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    iceCandidates: RTCIceCandidate[];
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
  initialPosition: { x: number; y: number };
  onPositionChange: (playerId: string, newPosition: { x: number; y: number }) => void;
}

const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

const MegaAvatar: React.FC<MegaAvatarProps> = React.memo(({ gameState, playerId, initialPosition, onPositionChange }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const { user } = useAppContext();
  const player = gameState.players.find(p => p.id === playerId);

  const [{ x, y }, api] = useSpring(() => ({
    x: initialPosition.x * window.innerWidth + 64,
    y: initialPosition.y * window.innerHeight + 64,
    config: { mass: 1, tension: 200, friction: 20 },
  }));

  const handleDrag = useCallback((mx: number, my: number, vx: number, vy: number, down: boolean) => {
    if (!down) {
      const newX = (initialPosition.x * window.innerWidth + mx + window.innerWidth) % window.innerWidth;
      const newY = (initialPosition.y * window.innerHeight + my + window.innerHeight) % window.innerHeight;
      onPositionChange(playerId, { 
        x: Math.max(64, Math.min(newX, window.innerWidth - 64)) / window.innerWidth,
        y: Math.max(64, Math.min(newY, window.innerHeight - 64)) / window.innerHeight
      });
    }
    api.start({ 
      x: initialPosition.x * window.innerWidth + mx + 64,
      y: initialPosition.y * window.innerHeight + my + 64,
      immediate: down 
    });
  }, [initialPosition, playerId, onPositionChange, api]);

  const bind = useGesture({
    onDrag: ({ movement: [mx, my], velocity: [vx, vy], down }) => handleDrag(mx, my, vx, vy, down),
  });

  useEffect(() => {
    const initializeStream = async () => {
      if (user?.id && user.id.toString() === playerId) {
        try {
          const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setStream(webcamStream);
          if (videoRef.current) {
            videoRef.current.srcObject = webcamStream;
            videoRef.current.muted = false;
            await videoRef.current.play();
          }
          setupPeerConnection(webcamStream);
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

  const setupPeerConnection = useCallback((localStream?: MediaStream) => {
    peerConnection.current = new RTCPeerConnection(rtcConfig);

    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.current!.addTrack(track, localStream);
      });
    }

    peerConnection.current.ontrack = (event) => {
      if (videoRef.current && event.streams[0]) {
        videoRef.current.srcObject = event.streams[0];
        videoRef.current.muted = false;
      }
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        updatePlayerWebRTC({ iceCandidates: [event.candidate] });
      }
    };

    if (user?.id && user.id.toString() === playerId) {
      createOffer();
    }

    subscribeToWebRTCUpdates();
  }, [user?.id, playerId]);

  const createOffer = async () => {
    if (!peerConnection.current) return;

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    updatePlayerWebRTC({ offer });
  };

  const updatePlayerWebRTC = async (webrtcUpdate: Partial<Player['webrtc']>) => {
    if (!user?.currentGameId) return;

    const { data, error } = await supabase
      .from('rents')
      .select('game_state')
      .eq('id', user.currentGameId)
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
      .eq('id', user.currentGameId);

    if (updateError) {
      console.error('Error updating game state:', updateError);
    }
  };

  const subscribeToWebRTCUpdates = useCallback(() => {
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
  }, [playerId, user?.currentGameId]);

  return (
    <animated.div
      {...bind()}
      style={{
        transform: to([x, y], (x, y) => `translate(${x - 64}px, ${y - 64}px)`),
        width: '128px',
        height: '128px',
        position: 'absolute',
        touchAction: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid #E1FF01',
          boxShadow: '0px 5px 15px rgba(0,0,0,0.2)',
        }}
      >
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
          }}
          playsInline
          autoPlay
        />
      </div>
      {player && (
        <div
          style={{
            marginTop: '5px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    </animated.div>
  );
});

MegaAvatar.displayName = 'MegaAvatar';

export default MegaAvatar;