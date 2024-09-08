// CardPhysics.tsx
interface Point {
    x: number;
    y: number;
  }
  
  interface Velocity {
    x: number;
    y: number;
  }
  
  interface RotationState {
    angle: number; // Current rotation in degrees
    speed: number; // Rotation speed (degrees per frame)
  }
  
  interface PhysicsParams {
    gravity?: number;
    airFriction?: number;
    surfaceFriction?: number;
    mass?: number;
    liftCoefficient?: number;
    minRotationSpeedForLift?: number;
  }
  
  // Default physics parameters
  const defaultParams: PhysicsParams = {
    gravity: 9.81,
    airFriction: 0.98,
    surfaceFriction: 0.92,
    mass: 5,
    liftCoefficient: 0.03,
    minRotationSpeedForLift: 3,
  };
  
  export class CardPhysics {
    position: Point;
    velocity: Velocity;
    rotation: RotationState;
    isOnSurface: boolean;
    params: PhysicsParams;
  
    constructor(initialPosition: Point, params: PhysicsParams = {}) {
      this.position = initialPosition;
      this.velocity = { x: 0, y: 0 };
      this.rotation = { angle: 0, speed: 0 };
      this.isOnSurface = false;
      this.params = { ...defaultParams, ...params }; // Allow custom parameters, fallback to defaults
    }
  
    // Apply air or surface friction
    applyFriction() {
      const friction = this.isOnSurface
        ? this.params.surfaceFriction ?? defaultParams.surfaceFriction
        : this.params.airFriction ?? defaultParams.airFriction;
  
      this.velocity.x *= friction!;
      this.velocity.y *= friction!;
      this.rotation.speed *= friction!;
    }
  
    // Apply gravity and calculate new position
    applyGravity() {
        if (!this.isOnSurface) {
        const gravity = this.params.gravity ?? defaultParams.gravity;
        const liftCoefficient = (this.params.liftCoefficient ?? defaultParams.liftCoefficient) as number;
        const minRotationSpeedForLift = (this.params.minRotationSpeedForLift ?? defaultParams.minRotationSpeedForLift) as number;
    
        const lift = this.rotation.speed > minRotationSpeedForLift ? this.rotation.speed * liftCoefficient : 0;
        const effectiveGravity = gravity! - lift;
        this.velocity.y += effectiveGravity * 0.01; // Adjust for time step
        }
    }
  
    // Update position and rotation based on velocity
    update() {
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.rotation.angle += this.rotation.speed;
    }
  
    // Calculate rotation speed based on drag gesture
    calculateRotationSpeed(grabX: number, grabY: number, velocityX: number, velocityY: number) {
      const torque = grabX * velocityY - grabY * velocityX;
      this.rotation.speed = torque * 0.001;
    }
  
    // Check if card is stopped (minimal movement)
    isStopped() {
      return (
        Math.abs(this.velocity.x) < 0.01 &&
        Math.abs(this.velocity.y) < 0.01 &&
        Math.abs(this.rotation.speed) < 0.01
      );
    }
  
    // Main physics step
    step() {
      this.applyFriction();
      this.applyGravity();
      this.update();
    }
  }
  