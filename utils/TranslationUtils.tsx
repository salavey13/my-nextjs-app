// utils/TranslationUtils.tsx
"use client";
import React, { createContext, useContext, ReactNode, FC } from "react";
import { useAppContext } from "../context/AppContext";

export type LanguageDictionary = {
    [key: string]: string | LanguageDictionary;
  };
  
  
  const TranslationContext = createContext<
  { t: (key: string, variables?: Record<string, string>) => string } | undefined
>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: FC<TranslationProviderProps> = ({ children }) => {
  const { store } = useAppContext(); // Assuming useAppContext() provides current language
  const currentLanguage = store.lang || "en";

  const t = (key: string, variables?: Record<string, string>): string => {
    const keys = key.split('.');
    let translation: string | LanguageDictionary = translations[currentLanguage];

    for (const k of keys) {
      if (typeof translation === 'string') {
        return key; // Return the key if translation is not found
      }
      translation = translation[k];
      if (translation === undefined) {
        return key; // Return the key if translation is not found
      }
    }

    if (typeof translation === 'string' && variables) {
      return Object.keys(variables).reduce((str, variable) => {
        return str.replace(`{${variable}}`, variables[variable]);
      }, translation);
    }

    return typeof translation === 'string' ? translation : key;
  };

  return (
    <TranslationContext.Provider value={{ t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
  
  export const supportedLanguages = ["en", "ru", "ukr"];
  
  export const translations: LanguageDictionary = {
    en: {
    copy: "Copy Request to Clipboard",
    name: "English",
    welcome: "Welcome",
    task: "Task",
    description: "Description",
    addTask: "Add Task",
    complete: "Complete",
    delete: "Delete",
    // UI
    settings: "Settings",
    referrals: "Referrals",
    top13: "Leaderboard",
    menu: "Menu",
    startGame: "Start Game",
    endGame: "End Game",
    yourScore: "Your Score",
    topScores: "Top Scores",
    quests: "Quests",
    open: "Open",
    create: "Create a game",
    inviteText: "Join our app:",
    invitePlayButton: "Play Fool",
    invitePlayLable: "Get invite",
    gameLobby: "Game Lobby",
    gameID: "Game ID:",
    readyPlayers: "Ready Players:",
    gameBoard: "Game Board",
    trumpSuit: "Trump Suit:",
    playersHands: "Players' Hands",
    joinGame: "Join Game",
    player: "Player: ",
    lang: "Language",
    questStart: "Start",
    questClaim: "Claim",
    // Game Titles and General
    game_title: "Fool Game",
    loading_game_state: "Loading game state...",
    welcome_message: "Welcome to Fool Game!",
    waiting_for_players: "Waiting for players to join...",
    game_over: "Game Over",
    you_won: "You Won!",
    you_lost: "You Lost!",
    draw: "It's a Draw!",
    // Gameplay
    current_turn: "Current Turn",
    your_turn: "Your Turn",
    opponent_turn: "Opponent's Turn",
    select_card: "Select a Card",
    place_card: "Place the Card",
    invalid_move: "Invalid Move!",
    move_successful: "Move Successful!",
    round_start: "Round Start",
    round_end: "Round End",
    next_round: "Next Round",
    // Player Actions
    draw_card: "Draw a Card",
    pass: "Pass",
    attack: "Attack",
    defend: "Defend",
    end_turn: "End Turn",
    quit_game: "Quit Game",
    // Notifications and Messages
    message: "Message",
    new_message: "New Message",
    player_joined: "Player Joined",
    player_left: "Player Left",
    waiting_for_opponent: "Waiting for opponent...",
    opponent_disconnected: "Opponent Disconnected",
    connection_lost: "Connection Lost. Reconnecting...",
    // Game Stats and Info
    player_stats: "Player Stats",
    player_name: "Player Name",
    player_score: "Player Score",
    player_level: "Player Level",
    player_coins: "Player Coins",
    player_xp: "Player XP",
    leaderboard: "Leaderboard",
    top_players: "Top Players",
    // Game Settings
    change_language: "Change Language",
    music: "Music",
    sound_effects: "Sound Effects",
    privacy_policy: "Privacy Policy",
    terms_of_service: "Terms of Service",
    // Quests and Rewards
    daily_quests: "Daily Quests",
    weekly_quests: "Weekly Quests",
    completed_quests: "Completed Quests",
    claim_reward: "Claim Reward",
    reward_claimed: "Reward Claimed!",
    new_quest: "New Quest Available",
    // Errors and Warnings
    error_occurred: "An Error Occurred",
    try_again: "Please Try Again",
    game_not_found: "Game Not Found",
    action_not_allowed: "Action Not Allowed",
    invalid_action: "Invalid Action",
    // Miscellaneous
    yes: "Yes",
    no: "No",
    ok: "OK",
    cancel: "Cancel",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    skip: "Skip",
    continue: "Continue",
    exit: "Exit",
    calcTitle: "IQ/social indicators calculator",
    active: "Active",
    activeBets: "Active Bets and Events",
    amount: "Amount",
    outcome: "Outcome",
    status: "Status",
    upcomingEvents: "Upcoming Events",
    title: "Title",
    actions: "Actions",
    expired: "Expired",
    bet: "Bet",
    placeBet: "Place Bet",
    enterBetAmount: "Enter Bet Amount",
    referFriend: "Refer a Friend",
    friendNamePlaceholder: "Friend's Name",
    inviteFriendButton: "Invite Friend",
    inviteMessage: "Hey {name}, join me on this amazing platform! Click the link below to get started:",
    referAFriend: "Refer a Friend",
    inviteFriend: "Invite a Friend via Telegram",
    friendName: "Friend's Name",
    sendInvite: "Send Invite",
    inviteSent: "Invite Sent Successfully!",
    alreadyReferred: "This user has already been referred.",
    error: "An error occurred. Please try again.",
    profile: "Profile",
    createEvent: "Create Event",
    eventTitle: "Event Title",
    eventDescription: "Event Description",
    eventTitleRu: "Event Title In Russian",
    eventDescriptionRu: "Event Description In Russian",
    educationalVideoUrl: "Educational Video URL",
    expirationDate: "Expiration Date",
    eventCreated: "Event Created",
    eventCreationSuccessMessage: "The event has been successfully created",
    close: "Close",
    home: "Home",
    admin: "Admin",
    referral: "Referral",
    referralName: "Priglos Name",
    adminDashboard: "Admin Dashboard",
    totalReferrals: "Total Referrals",
    referralsLastMonth: "Referrals Last Month",
    referralsLastYear: "Referrals Last Year",
    referrer: "Referrer",
    referee: "Referee",
    refCode: "Referral Code",
    date: "Date",
    referralsByCode: "Referrals by Code",
    successfulInvites: "Successful Invites",
    rank: "Lvl",
    username: "Nickname",
    level: "Level",
    notifications: "Notifications",
    nonewnotifications: "You have no new notifications.",
    play: "Play",
    playWithUs: "Play with",
    startPlaying: "Start Playing",
    visitSite: "Visit Our Site",
    joinCommunity: "Join Our Community",
    youtubeChannel: "Subscribe to Our YouTube",
    profilePicture: "Profile Picture",
    userId: "ID",
    coins: "Coins",
    rp: "Reputation Points",
    X: "X Points",
    cheers_count: "Cheers Count",
    social_credit: "Social Credit",
    ref_code: "Referral Code",
    currentGameId: "Current Game ID",
    none: "None",
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    failed: "Failed",
    cancelled: "Cancelled",
    not_started: "Not Started",
    referral_sent: "Referral Sent",
    referral_accepted: "Referral Accepted",
    quest_started: "Quest Started",
    quest_completed: "Quest Completed",
    subtitle: {
      githubManager: "GitHub Manager",
    },
    button: {
      createBranch: "Create Branch",
      pushFiles: "Push Files to Branch",
      mergeBranch: "Merge Branch to Main",
    },
    log: {
      filePushed: "File {fileName} pushed to branch {branchName} with commit SHA {newCommitSha}.",
      branchMerged: "Branch {branchName} merged into main.",
      rollback: "Branch {branchName} rolled back to commit SHA {sha}.",
    },
    suberror: {
      createBranch: "Failed to create branch",
      pushFiles: "Failed to push files to branch",
      mergeBranch: "Failed to merge branch into main",
      rollback: "Failed to rollback to commit",
      branchRequired: "Branch name is required",
      translationFieldsRequired: "Please specify a language and provide translations.",
      updateTranslations: "Failed to update translations",
    },
    success: {
      translationsUpdated: "Translations updated successfully.",
    },
    hackButton: "Hack the System",
    congratulationsMessage: "You hacked the system!",

    questsTitle: "Quests to Earn Coins",
    inviteFriends: "Invite Friends",
    inviteFriendsDescription: "Invite 3 friends through referrals to earn coins.",
    inviteFriendsAction: "Invite Now",
    createFeature: "Create Your First Feature",
    createFeatureDescription: "Create your first feature in dev mode to earn coins.",
    createFeatureAction: "Create Feature",
    claimReward: "Claim Reward",
    developerToolTitle: "Developer Tool",
  currentIdeasTitle: "Current Ideas",
  enterYourIdeaTitle: "Enter Your Idea",
  describeYourIdeaPlaceholder: "Describe your idea...",
  generateRequestButton: "Generate Request",
  zeroStageRequestTitle: "Zero Stage Request",
  getResponseButton: "Get Response from Clipboard",
  parsedResponseDataTitle: "Parsed Response Data",
  branchNameTitle: "Branch Name",
  componentImplementationsTitle: "Component Implementations",
  translationKeysTitle: "Translation Keys",
  supabaseTablesTitle: "Supabase Tables",
  readmeUpdateTitle: "README.md Update",
  tryItButton: "Try It",
  deployButton: "Deploy",
  contributorsLabel: "Contributors",
  emotionMirror: "Emotion Mirror",
  typeMessage: "Type your message here...",
  clear: "Clear",
},
  ru: {
    emotionMirror: "Зеркало эмоций",
    typeMessage: "Введите ваше сообщение...",
    clear: "Очистить",
    developerToolTitle: "Инструмент разработчика",
  currentIdeasTitle: "Текущие идеи",
  enterYourIdeaTitle: "Введите свою идею",
  describeYourIdeaPlaceholder: "Опишите свою идею...",
  generateRequestButton: "Сгенерировать запрос",
  zeroStageRequestTitle: "Запрос нулевой стадии",
  getResponseButton: "Получить ответ из буфера обмена",
  parsedResponseDataTitle: "Проанализированные данные ответа",
  branchNameTitle: "Название ветки",
  componentImplementationsTitle: "Реализации компонентов",
  translationKeysTitle: "Ключи перевода",
  supabaseTablesTitle: "Таблицы супабазы",
  readmeUpdateTitle: "Обновление README.md",
  tryItButton: "Попробуй",
  deployButton: "Развернуть",
contributorsLabel: "Соавторы",
    questsTitle: "Задания для заработка монет",
    inviteFriends: "Пригласите друзей",
    inviteFriendsDescription: "Пригласите 3 друзей по реферальной ссылке, чтобы заработать монеты.",
    inviteFriendsAction: "Пригласить сейчас",
    createFeature: "Создайте свою первую функцию",
    createFeatureDescription: "Создайте свою первую функцию в режиме разработки, чтобы заработать монеты.",
    createFeatureAction: "Создать функцию",
    claimReward: "Получить награду",
    copy: "Скопировать в буфер мессадж боту",
    adminDashboard: "Панель администратора",
    totalReferrals: "Всего рефералов",
    referralsLastMonth: "Рефералы за последний месяц",
    referralsLastYear: "Рефералы за последний год",
    referrer: "Реферер",
    referee: "Реферал",
    refCode: "Код реферала",
    date: "Дата",
    referralsByCode: "Рефералы по коду",
    referrals: "Рефералы",
    name: "Русский",
    profile: "Профиль",
    profilePicture: "Фото профиля",
    userId: "ID",
    coins: "Монеты",
    rp: "Очки репутации",
    X: "X Очки",
    cheers_count: "Количество одобрений",
    social_credit: "Социальный рейтинг",
    ref_code: "Реферальный код",
    currentGameId: "ID текущей игры",
    none: "Нет",
    welcome: "Добро пожаловать",
    task: "Задача",
    description: "Описание",
    addTask: "Добавить задачу",
    complete: "Завершить",
    delete: "Удалить",
    active: "Активный",
    activeBets: "Активные ставки и события",
    amount: "Сумма",
    outcome: "Результат",
    status: "Статус",
    upcomingEvents: "Предстоящие События",
    title: "Название",
    actions: "Действия",
    expired: "Истек",
    bet: "Наспор",
    placeBet: "Сделать Ставку",
    enterBetAmount: "Введите Сумму Ставки",
    confirm: "Подтвердить",
    calcTitle: "Калькулятор IQ/социальных показателей",
    friendNamePlaceholder: "Friend's Name",
    inviteFriendButton: "Invite Friend",
    inviteMessage: "Hey {name}, join me on this amazing platform! Click the link below to get started:",
    referFriend: "Пригласи друга",
    friendsNamePlaceholder: "Имя друга",
    InviteFriendButton: "Пригласить друга",
    InviteMessage: "Эй, {name}, присоединяйся ко мне на этой удивительной платформе! Нажмите на ссылку ниже, чтобы начать:",
    referAFriend: "Пригласить друга",
    inviteFriend: "Пригласить друга через Telegram",
    friendName: "Имя друга",
    sendInvite: "Отправить приглашение",
    inviteSent: "Приглашение успешно отправлено!",
    alreadyReferred: "Этот пользователь уже был приглашен.",
    error: "Произошла ошибка. Попробуйте еще раз.",
    createEvent: "Создать Событие",
    eventTitle: "Название События",
    eventDescription: "Описание События",
    educationalVideoUrl: "Ссылка На Обучающее Видео",
    expirationDate: "Дата Истечения",
    eventCreated: "Событие Создано",
    eventCreationSuccessMessage: "Событие успешно создано",
    close: "Закрыть",
    home: "Главная",
    admin: "Админ",
    referral: "Реферал",
    notifications: "Уведомления",
    nonewnotifications: "У вас нет новых уведомлений.",
    referralName: "Название Приглоса",
    successfulInvites: "Успешные приглашения",
    rank: "Лвл",
    username: "Псевдоним",
    eventTitleRu: "Название мероприятия на русском языке",
    eventDescriptionRu: "Описание события на русском языке",
    level: "Уровень",
    play: "Играть",
    playWithUs: "Играйте с",
    startPlaying: "Начать игру",
    visitSite: "Посетить наш сайт",
    joinCommunity: "Присоединиться к сообществу",
    youtubeChannel: "Подписаться на наш YouTube",
    pending: "В процессе",
    in_progress: "Выполняется",
    completed: "Завершено",
    failed: "Не удалось",
    cancelled: "Отменено",
    not_started: "Не начато",
    referral_sent: "Реферал отправлен",
    referral_accepted: "Реферал принят",
    quest_started: "Задание начато",
    quest_completed: "Задание завершено",
    subtitle: {
      githubManager: "Менеджер GitHub",
    },
    button: {
      createBranch: "Создать ветку",
      pushFiles: "Отправить файлы в ветку",
      mergeBranch: "Слить ветку с основной",
    },
    log: {
      filePushed: "Файл {fileName} отправлен в ветку {branchName} с хэшем коммита {newCommitSha}.",
      branchMerged: "Ветка {branchName} слита с основной.",
      rollback: "Ветка {branchName} откатана к коммиту с хэшем {sha}.",
    },
    suberror: {
      createBranch: "Не удалось создать ветку",
      pushFiles: "Не удалось отправить файлы в ветку",
      mergeBranch: "Не удалось слить ветку с основной",
      rollback: "Не удалось откатить к коммиту",
      branchRequired: "Требуется название ветки",
      translationFieldsRequired: "Пожалуйста, укажите язык и предоставьте переводы.",
      updateTranslations: "Не удалось обновить переводы",
    },
    success: {
      translationsUpdated: "Переводы успешно обновлены.",
    },
    hackButton: "Взломать систему",
    congratulationsMessage: "Вы взломали систему!",
    // Add more translations...
  },
  ukr: {
    
    emotionMirror: "Дзеркало емоцій",
    typeMessage: "Введіть ваше повідомлення...",
    clear: "Очистити",
  developerToolTitle: "Інструмент розробника",
  currentIdeasTitle: "Поточні ідеї",
  enterYourIdeaTitle: "Введіть свою ідею",
  describeYourIdeaPlaceholder: "Опишіть свою ідею...",
  generateRequestButton: "Створити запит",
  zeroStageRequestTitle: "Запит на нульовий етап",
  getResponseButton: "Отримати відповідь із буфера обміну",
parsedResponseDataTitle: "Проаналізовані дані відповіді",
  branchNameTitle: "Назва гілки",
  componentImplementationsTitle: "Реалізації компонентів",
  translationKeysTitle: "Ключі перекладу",
  supabaseTablesTitle: "Надбазові таблиці",
  readmeUpdateTitle: "Оновлення README.md",
  tryItButton: "Спробуйте",
  deployButton: "Розгорнути",
contributorsLabel: "Учасники",
    questsTitle: "Завдання для заробітку монет",
    inviteFriends: "Запросіть друзів",
    inviteFriendsDescription: "Запросіть 3 друзів через реферальне посилання, щоб заробити монети.",
    inviteFriendsAction: "Запросити зараз",
    createFeature: "Створіть свою першу функцію",
    createFeatureDescription: "Створіть свою першу функцію в режимі розробки, щоб заробити монети.",
    createFeatureAction: "Створити функцію",
    claimReward: "Отримати нагороду",
    hackButton: "Зламати систему",
    congratulationsMessage: "Ви зламали систему!",
    copy: "Копіювати запит до буфера обміну",
    notifications: "Сповіщення",
    confirm: "Підтвердити",
    name: "Українська",
    welcome: "Ласкаво просимо",
    task: "Завдання",
    description: "Опис",
    addTask: "Додати завдання",
    complete: "Завершити",
    delete: "Видалити",
    active: "Активний",
    activeBets: "Активні ставки та події",сума: "Сума",
    outcome: "Результат",
    status: "Статус",
    upcomingEvents: "Майбутні події",
    title: "Назва",
    actions: "Дії",
    expired: "Минув",
    bet: "Натиск",
    placeBet: "Зробити ставку",
    enterBetAmount: "Введіть суму ставки",
    calcTitle: "Калькулятор IQ/соціальних показників",
    referFriend: "Запропонуйте другу",
    friendNamePlaceholder: "Ім'я друга",
    inviteFriendButton: "Запросити друга",
    inviteMessage: "Привіт, {name}, приєднуйся до мене на цій дивовижній платформі! Натисніть посилання нижче, щоб почати:",
    referAFriend: "Запропонуйте другу",
    inviteFriend: "Запросити друга через Telegram",
    friendName: "Ім'я друга",
    sendInvite: "Надіслати запрошення",
    inviteSent: "Запрошення надіслано успішно!",
    alreadyReferred: "Цього користувача вже було направлено.",
    error: "Сталася помилка. Повторіть спробу.",
    profile: "Профіль",
    createEvent: "Створити Подію",
    eventTitle: "Назва Події",
    eventDescription: "Опис Події",
    educationalVideoUrl: "URL Освітнього Відео",
    expirationDate: "Дата Закінчення",
    eventCreated: "Подію Створено",
    eventCreationSuccessMessage: "Подію успішно створено",
    close: "Закрити",
    home: "Головна",
    admin: "Адмін",
    referral: "Реферал",
    referralName: "Ім'я Пріглоса",
    successfulInvites: "Успішні запрошення",
    rank: "Лвл",
    username: "Псевдонім",
    eventTitleRu: "Назва події російською",
    eventDescriptionRu: "Опис події російською мовою",
    adminDashboard: "Панель адміністратора",
    referrer: "Реферер",
    referee: "Рефері",
    level: "Рівень",
    date: "Дата",
    nonewnotifications: "У вас немає нових повідомлень.",
    play: "Грати",
    playWithUs: "Грай з",
    startPlaying: "Почати гру",
    visitSite: "Відвідати наш сайт",
    joinCommunity: "Приєднатися до спільноти",
    youtubeChannel: "Підписатися на наш YouTube",
    profilePicture: "Фото профілю",
    userId: "ID",
    coins: "Монети",
    rp: "Очки репутації",
    X: "X Очки",
    cheers_count: "Кількість оплесків",
    social_credit: "Соціальний рейтинг",
    ref_code: "Реферальний код",
    currentGameId: "ID поточної гри",
    none: "Немає",
    pending: "В очікуванні",
    in_progress: "Виконується",
    completed: "Завершено",
    failed: "Не вдалося",
    cancelled: "Скасовано",
    not_started: "Не розпочато",
    referral_sent: "Реферал відправлено",
    referral_accepted: "Реферал прийнято",
    quest_started: "Завдання розпочато",
    quest_completed: "Завдання завершено",
    totalReferrals: "Загальна кількість рефералів",
    referralsLastMonth: "Реферали за минулий місяць",
    referralsLastYear: "Реферали за минулий рік",
    refCode: "Код реферала",
    referralsByCode: "Реферали за кодом",
    referrals: "Реферали",
    subtitle: {
        githubManager: "Менеджер GitHub",
    },
    button: {
        createBranch: "Створити гілку",
        pushFiles: "Надіслати файли до гілки",
        mergeBranch: "Об'єднати гілку з головною",
    },
    журнал: {
        filePushed: "Файл {fileName} направлено до гілки {branchName} із SHA комітом {newCommitSha}.",
        branchMerged: "Гілку {branchName} об’єднано з основною.",
        rollback: "Гілку {branchName} повернуто до фіксації SHA {sha}.",
    },
    suberror: {
        createBranch: "Не вдалося створити гілку",
        pushFiles: "Не вдалося відправити файли до гілки",
        mergeBranch: "Не вдалося об'єднати гілку в основну",
        rollback: "Не вдалося відкотити для фіксації",
        branchRequired: "Потрібна назва гілки",
        translationFieldsRequired: "Будь ласка, вкажіть мову та надайте переклади.",
        updateTranslations: "Не вдалося оновити переклади",
    },
    success: {
        translationsUpdated: "Переклади успішно оновлено.",
    },
    // Add more translations...
  },
};
