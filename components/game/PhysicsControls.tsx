// components\game\PhysicsControls.tsx
import React from 'react';
import { useAppContext } from '../../context/AppContext'; // Translation function import
import { Input } from '../ui/input';
import { Dropdown } from '../ui/dropdown';

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
  setPhysicsParams: React.Dispatch<React.SetStateAction<PhysicsParams>>;
}

const PhysicsSlider: React.FC<PhysicsSliderProps> = ({ physicsParams, setPhysicsParams }) => {
  const { t } = useAppContext();

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPhysicsParams((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  const applyPreset = (preset: PhysicsParams) => {
    setPhysicsParams(preset);
  };

  const presets = {
    "Lunar Gravity": {
      gravity: 1.62,
      airFriction: 0.99,
      surfaceFriction: 0.8,
      mass: 5,
      liftCoefficient: 0.05,
      minRotationSpeedForLift: 2,
    },
    "Earth Gravity": {
      gravity: 9.81,
      airFriction: 0.98,
      surfaceFriction: 0.92,
      mass: 5,
      liftCoefficient: 0.03,
      minRotationSpeedForLift: 3,
    },
    "No Air Friction": {
      gravity: 9.81,
      airFriction: 1,
      surfaceFriction: 0.92,
      mass: 5,
      liftCoefficient: 0.03,
      minRotationSpeedForLift: 3,
    },
    "Jupiter Gravity": {
      gravity: 24.79,
      airFriction: 0.96,
      surfaceFriction: 0.9,
      mass: 6,
      liftCoefficient: 0.02,
      minRotationSpeedForLift: 4,
    },
  };

  return (
    <div className="absolute top-2 left-2 bg-background/80 p-2 rounded-md flex flex-col text-xs">
      {/* Presets Dropdown */}
      <div className="mb-2">
        <label>{t('presets')}</label>
        <Dropdown
          onChange={(e) => applyPreset(presets[e.target.value as keyof typeof presets])}
          className="ml-2"
        >
          <option value="">{t('selectPreset')}</option>
          {Object.keys(presets).map((preset) => (
            <option key={preset} value={preset}>
              {t(preset)}
            </option>
          ))}
        </Dropdown>
      </div>

      {/* Sliders */}
      <div className="flex justify-between items-center p-2">
        <label>{t('gravity')}</label>
        <span>{physicsParams.gravity}</span>
      </div>
      <Input
        type="range"
        name="gravity"
        min="0"
        max="30"
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
