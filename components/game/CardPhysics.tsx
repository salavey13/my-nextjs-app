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
    minRotationSpeedForLift: number;
  }
  
  // Default physics parameters
  const defaultParams: PhysicsParams = {
    gravity: 9.81,
    airFriction: 0.98,
    surfaceFriction: 0.92,
    mass: 5,
    liftCoefficient: 0.03,
    minRotationSpeedForLift: 0,//3,
  };
  
  export class CardPhysics {
    position: Point;
    velocity: Velocity;
    rotation: RotationState;
    params: PhysicsParams;
  
    constructor(initialPosition: Point, params: PhysicsParams = {minRotationSpeedForLift: 3}) {
      this.position = initialPosition;
      this.velocity = { x: 0, y: 0 };
      this.rotation = { angle: 0, speed: 0 };
      this.params = { ...defaultParams, ...params };
    }
  
    applyFriction() {
      const friction = this.params.airFriction!;
      this.velocity.x *= friction;
      this.velocity.y *= friction;
      this.rotation.speed *= friction;
    }
  
    applyGravity() {
      this.velocity.y += (this.params.gravity! - this.rotation.speed * 0.05) * 0.01;
    }
  
    update() {
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.rotation.angle += this.rotation.speed;
    }
  
    calculateRotationSpeed(deltaX: number, deltaY: number, velocityX: number, velocityY: number) {
        const speed = Math.sqrt(velocityX ** 2 + velocityY ** 2); // Calculate total velocity magnitude
        const direction = Math.atan2(deltaY, deltaX); // Get movement direction angle
      
        if (speed > this.params.minRotationSpeedForLift) {
          // If the speed is high enough, force rotation based on the velocity and movement delta
          this.rotation.speed = direction * (speed * 1000); // Factor velocity and direction for rotation speed
        } else {
          this.rotation.speed = 0; // Otherwise, no significant rotation
        }
      }
  
    step() {
      this.applyFriction();
      //this.applyGravity();
      this.update();
    }
  }
  