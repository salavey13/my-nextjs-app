// components\game\physics.tsx
export const calculateVelocity = (deltaX: number, deltaY: number, velocityX: number, velocityY: number) => {
    return Math.sqrt(velocityX ** 2 + velocityY ** 2);
  };
  
  export const calculateDirection = (deltaX: number, deltaY: number) => {
    return Math.atan2(deltaY, deltaX);
  };
  
  export const calculateFlightDuration = (
    velocity: number, 
    maxVelocity: number, 
    maxTime: number
  ): number => {
    const duration = Math.min((velocity / maxVelocity) * maxTime, maxTime);
    console.log(`Calculated flight duration: ${duration}`);
    return duration;
  };
  
  export const calculateFinalPosition = (
    startX: number, 
    startY: number, 
    velocityX: number, 
    velocityY: number, 
    flightDuration: number
  ): { x: number, y: number } => {
    const finalX = startX + velocityX * flightDuration;
    const finalY = startY + velocityY * flightDuration;
  
    console.log(`StartX: ${startX}, StartY: ${startY}`);
    console.log(`VelocityX: ${velocityX}, VelocityY: ${velocityY}`);
    console.log(`Flight duration: ${flightDuration}`);
    console.log(`Calculated Final Position: (${finalX}, ${finalY})`);
  
    return {
      x: finalX,
      y: finalY,
    };
  };
  
  export const applyAirFriction = (velocity: { x: number; y: number }, airFriction: number) => {
    return {
      x: velocity.x * airFriction,
      y: velocity.y * airFriction
    };
  };
  
  export const applySurfaceFriction = (velocity: { x: number; y: number }, surfaceFriction: number) => {
    return {
      x: velocity.x * surfaceFriction,
      y: velocity.y * surfaceFriction
    };
  };
  
  export const calculateRotationSpeed = (
    deltaX: number,
    deltaY: number,
    velocityX: number,
    velocityY: number,
    minRotationSpeedForLift: number
  ) => {
    const speed = calculateVelocity(deltaX, deltaY, velocityX, velocityY);
    const direction = calculateDirection(deltaX, deltaY);
  
    if (speed > minRotationSpeedForLift) {
      return direction * speed * 10; // Scale rotation speed based on velocity
    } else {
      return 0;
    }
  };
  
  // Helper function to apply shadow and parallax
  export const applyShadowAndParallax = (
    currentTime: number,
    flightDuration: number,
    cardRef: React.RefObject<HTMLDivElement>,
    cloneRef: React.RefObject<HTMLDivElement>
  ) => {
    const heightFactor = Math.sin((currentTime / flightDuration) * Math.PI); // Simulate height curve
    const shadowSize = heightFactor * 30;
    const parallaxShift = heightFactor * 12;
  
    cardRef.current!.style.boxShadow = `0px ${shadowSize}px ${shadowSize}px rgba(0,0,0,0.4)`;
    cloneRef.current!.style.transform += ` translateY(-${parallaxShift}px)`; // Fake height
  };