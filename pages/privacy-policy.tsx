import React from "react";
import Footer from "../components/ui/footer";
import "../app/globals.css";
import { AppProvider, useAppContext } from "../context/AppContext";
import { ThemeProvider } from '@/context/ThemeContext'
const PrivacyPolicy = () => {
  return (
    <AppProvider>
      <ThemeProvider>
      <div className="container mx-auto p-6 bg-gray-200 text-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-extrabold mb-6 text-teal-400">Политика конфиденциальности</h1>
        <p className="text-sm text-gray-400"><strong>Дата вступления в силу: </strong>4 августа 2024 г.</p>

        <h2 className="text-3xl font-semibold mt-8 text-teal-300">Информация, которую мы собираем</h2>
        <p className="mt-4 text-lg text-gray-300">
          При использовании Бота oneSitePlsBot мы собираем следующую информацию:
          Ваше имя пользователя в Telegram
          Мы не собираем никакой другой личной информации.
        </p>

        <h2 className="text-3xl font-semibold mt-8 text-teal-300">Как мы используем вашу информацию</h2>
        <p className="mt-4 text-lg text-gray-300">
          Ваше имя пользователя в Telegram используется для управления вашей активностью в ставках и отслеживания вашего участия. Контент, отправленный через Бот, может храниться и использоваться для дальнейшей разработки, анализа и других целей.
        </p>

        <h2 className="text-3xl font-semibold mt-8 text-teal-300">Безопасность данных</h2>
        <p className="mt-4 text-lg text-gray-300">
          Мы применяем соответствующие технические и организационные меры для защиты ваших данных от несанкционированного доступа, потерь или злоупотреблений.
        </p>

        <h2 className="text-3xl font-semibold mt-8 text-teal-300">Обмен данными</h2>
        <p className="mt-4 text-lg text-gray-300">
          Мы не передаем ваши данные третьим лицам, за исключением случаев, когда это необходимо для работы Бота или в соответствии с требованиями закона.
        </p>

        <h2 className="text-3xl font-semibold mt-8 text-teal-300">Ваши права</h2>
        <p className="mt-4 text-lg text-gray-300">
          Вы можете запросить удаление ваших данных или прекращение использования Бота в любое время, связавшись с нами по адресу <span className="text-teal-400">@salavey13</span>.
        </p>

        <h2 className="text-3xl font-semibold mt-8 text-teal-300">Изменения в Политике конфиденциальности</h2>
        <p className="mt-4 text-lg text-gray-300">
          Мы можем периодически обновлять эту Политику конфиденциальности. Пожалуйста, просматривайте ее регулярно, чтобы быть в курсе изменений.
        </p>

        <h2 className="text-3xl font-semibold mt-8 text-teal-300">Свяжитесь с нами</h2>
        <p className="mt-4 text-lg text-gray-300">
          Если у вас есть вопросы по поводу этой Политики конфиденциальности, свяжитесь с нами по адресу <span className="text-teal-400">@salavey13</span>.
        </p>
        <Footer />
      </div>
      </ThemeProvider>
    </AppProvider>
  );
};

export default PrivacyPolicy;
