// components\ThemeHandler.tsx
import { useContext } from 'react';
import { useAppContext } from '@/context/AppContext'; 

const ThemeToggle: React.FC = () => {
  const { t, user, toggleTheme } = useAppContext();

  return (
    <div>
      <label>
        {t("darkTheme")}
        <input 
          type="checkbox" 
          checked={user? user.dark_theme : true} 
          onChange={() =>toggleTheme()} 
        />
      </label>
    </div>
  );
};

export default ThemeToggle;