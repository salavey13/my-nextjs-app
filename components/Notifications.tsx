"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from "../context/AppContext";
const Notifications: React.FC = () => {
    const {  t  } = useAppContext();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4"><FontAwesomeIcon icon={faBell} className="gradient-icon mr-2" />{t("notifications")}</h1>
      <p>{t("nonewnotifications")}</p>
      {/* Implement actual notification logic here */}
    </div>
  );
};

export default Notifications;
