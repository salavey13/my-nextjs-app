import React, { useEffect, useRef, useState } from 'react';
import { supabase } from './supabaseClient'; // Supabase for state management

// WebRTC configuration
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' } // Public STUN server for connection establishment
  ]
};

const MegaAvatar = ({ playerId, initialPosition, onPositionChange }) => {
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const [position, setPosition] = useState(initialPosition);
  const peerConnection = useRef(null);

  // Initialize local media stream (camera + microphone)
  useEffect(() => {
    const initializeStream = async () => {
      try {
        const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(webcamStream);
        videoRef.current.srcObject = webcamStream;
        videoRef.current.play();
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

      // Add local stream to peer connection
      if (stream) {
        stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));
      }

      // Handle ICE candidates
      peerConnection.current.onicecandidate = event => {
        if (event.candidate) {
          sendIceCandidateToPeers(event.candidate);
        }
      };

      // Handle remote stream
      peerConnection.current.ontrack = event => {
        // Handle remote stream
      };

      // Fetch existing ICE candidates and add them to peer connection
      const { data } = await supabase
        .from('rents')
        .select('game_state')
        .eq('id', 'your_rent_id') // Replace with actual rent ID
        .single();

      const gameState = data?.game_state || {};
      const player = gameState.players.find(p => p.id === playerId);
      if (player && player.iceCandidates) {
        player.iceCandidates.forEach(candidate => {
          peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        });
      }
    };

    initWebRTC();

    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, [playerId, stream]);

  const sendIceCandidateToPeers = async (candidate) => {
    const { data, error } = await supabase
      .from('rents')
      .select('game_state')
      .eq('id', 'your_rent_id') // Replace with actual rent ID
      .single();

    const gameState = data?.game_state || {};
    const player = gameState.players.find(player => player.id === playerId);
    if (player) {
      player.iceCandidates = player.iceCandidates || [];
      player.iceCandidates.push(candidate);
      await supabase
        .from('rents')
        .update({ game_state: gameState })
        .eq('id', 'your_rent_id'); // Replace with actual rent ID
    }
  };

  const handleDrag = (e) => {
    const newPos = { x: e.clientX, y: e.clientY };
    setPosition(newPos);
    onPositionChange(playerId, newPos);
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: '256px',
        height: '256px',
        borderRadius: '50%',
        backgroundColor: 'transparent',
        cursor: 'pointer'
      }}
      onMouseDown={handleDrag}
    >
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
        }}
        muted
      />
    </div>
  );
};

export default MegaAvatar;
