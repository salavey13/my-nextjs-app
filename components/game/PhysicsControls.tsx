import React from 'react';
import { useSpring, animated } from 'react-spring';
import { useAppContext } from '../../context/AppContext'; // Translation function import
import { Input } from '../ui/input';
interface PhysicsParams {
    gravity: number;
    airFriction: number;
    surfaceFriction: number;
    mass: number;
    liftCoefficient: number;
    minRotationSpeedForLift: number;
  }
  interface PhysicsSliderProps {
    physicsParams: PhysicsParams;
    setPhysicsParams: React.Dispatch<React.SetStateAction<PhysicsParams>>;//(params: PhysicsParams) => void;
  }
  
  const PhysicsSlider: React.FC<PhysicsSliderProps> = ({ physicsParams, setPhysicsParams }) => {
    const { t } = useAppContext()
    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPhysicsParams((prev) => ({
        ...prev,
        [name]: parseFloat(value),
    }));
  };

  return (
    <div  style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'hsl(var(--background) / 0.8)', padding: '10px', borderRadius: '5px' }}>
      <div className="flex justify-between items-center">
        <label>{t('gravity')}</label>
        <span>{physicsParams.gravity}</span>
      </div>
        <Input
            type="range"
            name="gravity"
            min="0"
            max="20"
            step="0.1"
            value={physicsParams.gravity}
            onChange={handleSliderChange}
        />
    

    <div className="flex justify-between items-center">
    <label>{t('airFriction')}</label>
      <span>{physicsParams.airFriction}</span>
      </div>
      <Input
        type="range"
        name="airFriction"
        min="0"
        max="1"
        step="0.01"
        value={physicsParams.airFriction}
        onChange={handleSliderChange}
      />

<div className="flex justify-between items-center">
<label>{t('surfaceFriction')}</label>
      <span>{physicsParams.surfaceFriction}</span>
      </div>
      <Input
        type="range"
        name="surfaceFriction"
        min="0"
        max="1"
        step="0.01"
        value={physicsParams.surfaceFriction}
        onChange={handleSliderChange}
      />

<div className="flex justify-between items-center">
<label>{t('mass')}</label>
    <span>{physicsParams.mass}</span>
    </div>
      <Input
        type="range"
        name="mass"
        min="1"
        max="10"
        step="0.1"
        value={physicsParams.mass}
        onChange={handleSliderChange}
      />
      

      <div className="flex justify-between items-center">
    <label>{t('liftCoefficient')}</label>
      <span>{physicsParams.liftCoefficient}</span>
      </div>
      <Input
        type="range"
        name="liftCoefficient"
        min="0"
        max="0.1"
        step="0.01"
        value={physicsParams.liftCoefficient}
        onChange={handleSliderChange}
      />

      <div className="flex justify-between items-center">
    <label>{t('minRotationSpeedForLift')}</label>
      <span>{physicsParams.minRotationSpeedForLift}</span>
    </div>
      <Input
        type="range"
        name="minRotationSpeedForLift"
        min="0"
        max="10"
        step="0.1"
        value={physicsParams.minRotationSpeedForLift}
        onChange={handleSliderChange}
      />
    </div>
  );
};

export default PhysicsSlider;
