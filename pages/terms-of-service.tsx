import React from "react";
import Footer from "../components/ui/footer";
import "../app/globals.css";
import { AppProvider, useAppContext } from "../context/AppContext";
import { ThemeProvider } from '@/context/ThemeContext'
const TermsOfService = () => {
  return (
    <AppProvider>
      <ThemeProvider>
      <div className="container mx-auto p-6 bg-gray-200 text-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-extrabold mb-6 text-teal-400">Условия использования</h1>
        <p className="text-sm text-gray-400"><strong>Дата вступления в силу: </strong>4 августа 2024 г.</p>

        <h2 className="text-3xl font-semibold mt-8 text-teal-300">Введение</h2>
        <p className="mt-4 text-lg text-gray-300">
          Используя oneSitePlsBot («Бот»), вы соглашаетесь с настоящими Условиями использования («Условия»). Если вы не согласны с этими Условиями, пожалуйста, прекратите использование Бота.
        </p>

        <h2 className="text-3xl font-semibold mt-8 text-teal-300">Использование</h2>
        <p className="mt-4 text-lg text-gray-300">
          Бот позволяет вам участвовать в ставках, связанных с текущими событиями, и бороться с враждебными элементами, такими как ватники, через систему ставок в кредитах. Все ставки и взаимодействия происходят в кредитах, что упрощает процесс и устраняет необходимость в реальных денежных операциях.
        </p>

        <h2 className="text-3xl font-semibold mt-8 text-teal-300">Ставки и Взаиморасчеты</h2>
        <p className="mt-4 text-lg text-gray-300">
          Ставки делаются в кредитах, которые не имеют денежного эквивалента. Когда исходы событий определяются, проигравшим пользователям отправляется уведомление с просьбой перевести кредиты в общий банк. Проигравшие могут отказаться от выплаты, но тем самым лишаются уважения сообщества. Оставшиеся кредиты перераспределяются между победителями пропорционально их ставкам.
        </p>

        <h2 className="text-3xl font-semibold mt-8 text-teal-300">Борьба с Ватниками</h2>
        <p className="mt-4 text-lg text-gray-300">
          Бот поддерживает активное участие в борьбе с дезинформацией и враждебными элементами. Участвуя в ставках, вы не только получаете возможность выиграть кредиты, но и вносите вклад в общее дело, поддерживая правду и свободу.
        </p>

        <h2 className="text-3xl font-semibold mt-8 text-teal-300">Изменения в Условиях</h2>
        <p className="mt-4 text-lg text-gray-300">
          Мы можем периодически обновлять эти Условия. Пожалуйста, просматривайте их регулярно, чтобы быть в курсе изменений.
        </p>

        <h2 className="text-3xl font-semibold mt-8 text-teal-300">Свяжитесь с нами</h2>
        <p className="mt-4 text-lg text-gray-300">
          Если у вас есть вопросы по поводу этих Условий, свяжитесь с нами по адресу <span className="text-teal-400">@salavey13</span>.
        </p>
        <Footer />
      </div>
      </ThemeProvider>
    </AppProvider>
  );
};

export default TermsOfService;
