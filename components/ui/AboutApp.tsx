// components/ui/AboutApp.tsx
"use client"
import React, { useState } from 'react';
import { animated, useSpring } from 'react-spring';
import { useAppContext } from '@/context/AppContext'; // for accessing user or other app context if needed

const AboutApp: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useAppContext()
  // Spring animation for sliding the modal from the left
  const slideIn = useSpring({
    transform: isModalOpen ? 'translateX(0%)' : 'translateX(-100%)',
  });

  // Toggles modal visibility
  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  // Close modal when clicking outside of it
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as Element).id === 'modal-background') {
      toggleModal();
    }
  };

  return (
    <div>
      {/* Info Button */}
      <button
        onClick={toggleModal}
        style={{
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          color: 'transparent',
          border: 'none',
          fontSize: '16px',
          cursor: 'pointer',
        }}
        aria-label={t('about.info')}
      >
        i
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div
          id="modal-background"
          onClick={handleOutsideClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          }}
        >
          <animated.div
            style={{
              ...slideIn,
              position: 'absolute',
              top: '10%',
              left: 0,
              width: '300px',
              backgroundColor: 'black',
              padding: '20px',
              borderRadius: '8px',
              color: 'white',
            }}
          >
            <h2>{t('about.title')}</h2>
            <p>{t('about.motto')}</p>
            <a
              href="https://github.com/your-repo"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                marginTop: '20px',
                padding: '10px',
                backgroundColor: 'white',
                color: 'black',
                textAlign: 'center',
                borderRadius: '5px',
                textDecoration: 'none',
              }}
            >
              {t('about.github')}
            </a>
            <p
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '12px',
                color: 'gray',
              }}
            >
              {t('about.version')}
            </p>
          </animated.div>
        </div>
      )}
    </div>
  );
};

export default AboutApp;
