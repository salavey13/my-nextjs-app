"use client";
//components/Dev.tsx
import React, { useEffect, useState } from 'react'; 
import { saveAs } from 'file-saver';
import { supabase } from "../lib/supabaseClient";
import { useAppContext } from '../context/AppContext';
import LoadingSpinner from "../components/ui/LoadingSpinner";
import GitHubManager from "./GitHubManager";
import TranslationUpdater from "./TranslationUpdater";
import VercelDeploymentManager from "./VercelDeploymentManager";
import SupabaseManager from "./SupabaseManager";
import ClipboardManager from './ClipboardManager';
import {LanguageDictionary} from "../utils/TranslationUtils"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NavigationLink from "./ui/bottomShelf"

import { updateReadme, fetchBottomShelfCode } from '../utils/githubUtils'; // Import the utility function
import { Textarea } from './ui/textarea';
//import { saveUpdatedBottomShelf } from '../utils/githubUtils';
type ParsedFile = {
    path: string;
    content: string;
};

type ParsedResponse = {
    branchName: string;
    files: ParsedFile[];
    translations: Record<string, any>;
    sqlTables: string[];
    readmeUpdate: string;
    bottomShelf?: ParsedFile;
};

const Dev: React.FC = () => {
  const { user, t, fetchPlayer } = useAppContext();
  const [ideaText, setIdeaText] = useState<string>("");  // Idea input state
  const [ideas, setIdeas] = useState([
    { id: 1, title: "HackButton", description: "a big button in the middle of the screen that upon clicking adds me 13k coins to the balance with flying congratulations message \"You hacked the system!\"", contributors: ["SALAVEY13"] },
    { id: 2, title: "quest4coins", description: "quests for earning coins with different type of tasksW", contributors: ["SALAVEY13"] },
    // Add more ideas as needed
  ]);
  const [requestText, setRequestText] = useState<string>("");  // Zero stage request text
  const [responseText, setResponseText] = useState<string | null>(null);  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);  // Parsed data state
  const [step, setStep] = useState<number>(0);  // Tracking the current step
  const [branchName, setBranchName] = useState<string | null>(null);

// Handle the creation of the zero stage request
const handleZeroStageRequestType = () => {
    const zeroStageRequest = 
    `Please create item type description similar to existing for the following idea of a task/rent/item "${ideaText} ":
{
  "ad_info": {
    "title": "Информация об объявлении",
    "fields": [
      {
        "name": "title",
        "type": "text",
        "label": "Заголовок объявления",
        "max_length": 50,
        "placeholder": "Не более 50 символов"
      },
      {
        "name": "description",
        "type": "textarea",
        "label": "Описание объявления",
        "max_length": 50,
        "placeholder": "Не более 50 символов"
      }
    ]
  },
  "pricing": {
    "title": "Цены",
    "fields": [
      {
        "name": "cars",
        "type": "number",
        "label": "Легковые автомобили",
        "placeholder": "TON",
        "disabled_option": "Услугу не оказываю",
        "disable_checkbox": true
      },
      {
        "name": "motorcycles",
        "type": "number",
        "label": "Мототехника",
        "placeholder": "TON",
        "disabled_option": "Услугу не оказываю",
        "disable_checkbox": true
      },
      {
        "name": "suvs",
        "type": "number",
        "label": "Внедорожник",
        "placeholder": "TON",
        "disabled_option": "Услугу не оказываю",
        "disable_checkbox": true
      },
      {
        "name": "minibus",
        "type": "number",
        "label": "Микроавтобус",
        "placeholder": "TON",
        "disabled_option": "Услугу не оказываю",
        "disable_checkbox": true
      },
      {
        "name": "suburban_tariff",
        "type": "number",
        "label": "Загородный тариф",
        "placeholder": "TON/км",
        "disabled_option": "Услугу не оказываю",
        "disable_checkbox": true
      }
    ]
  },
  "agreement": {
    "title": "Согласие",
    "fields": [
      {
        "name": "consent",
        "type": "checkbox",
        "label": "Я соглашаюсь с правилами использования сервиса, а также с передачей и обработкой моих данных в oneSitePls. Я подтверждаю своё совершеннолетие и ответственность за размещение"
      }
    ]
  },
  "general_info": {
    "title": "Общая информация",
    "fields": [
      {
        "name": "city",
        "type": "dropdown",
        "label": "Выберите город",
        "options": [
          "Москва",
          "Санкт-Петербург",
          "Новосибирск"
        ],
        "placeholder": "Москва"
      },
      {
        "name": "name",
        "type": "text",
        "label": "Ваше имя",
        "placeholder": "Введите ваше имя"
      },
      {
        "name": "mobile_number",
        "type": "text",
        "label": "Номер мобильного телефона",
        "placeholder": "+7 (999) 999 99 99"
      },
      {
        "name": "landline_number",
        "type": "text",
        "label": "Номер городского телефона",
        "placeholder": "+7 (999) 999 99 99"
      },
      {
        "name": "email",
        "type": "text",
        "label": "Ваш email",
        "placeholder": "example@gmail.com"
      },
      {
        "name": "parking_address",
        "type": "text",
        "label": "Адрес стоянки эвакуатора",
        "placeholder": "Введите адрес стоянки"
      }
    ]
  },
  "photo_upload": {
    "title": "Фото",
    "fields": [
      {
        "name": "photo",
        "type": "file",
        "label": "Прикрепите фотографию к объявлению",
        "button_text": "Загрузить"
      }
    ]
  }
}
  
{
  "ad_info": {
    "title": "Информация об объявлении",
    "fields": [
      {
        "name": "title",
        "type": "text",
        "label": "Заголовок объявления",
        "max_length": 50,
        "placeholder": "Не более 50 символов"
      },
      {
        "name": "description",
        "type": "textarea",
        "label": "Описание объявления",
        "max_length": 50,
        "placeholder": "Не более 50 символов"
      }
    ]
  },
  "pricing": {
    "title": "Цены",
    "fields": [
      {
        "name": "cars",
        "type": "number",
        "label": "Легковые автомобили",
        "placeholder": "TON",
        "disabled_option": "Услугу не оказываю",
        "disable_checkbox": true
      },
      {
        "name": "motorcycles",
        "type": "number",
        "label": "Мототехника",
        "placeholder": "TON",
        "disabled_option": "Услугу не оказываю",
        "disable_checkbox": true
      },
      {
        "name": "suvs",
        "type": "number",
        "label": "Внедорожник",
        "placeholder": "TON",
        "disabled_option": "Услугу не оказываю",
        "disable_checkbox": true
      },
      {
        "name": "minibus",
        "type": "number",
        "label": "Микроавтобус",
        "placeholder": "TON",
        "disabled_option": "Услугу не оказываю",
        "disable_checkbox": true
      },
      {
        "name": "suburban_tariff",
        "type": "number",
        "label": "Загородный тариф",
        "placeholder": "руб/км",
        "disabled_option": "Услугу не оказываю",
        "disable_checkbox": true
      }
    ]
  },
  "agreement": {
    "title": "Согласие",
    "fields": [
      {
        "name": "consent",
        "type": "checkbox",
        "label": "Я соглашаюсь с правилами использования сервиса, а также с передачей и обработкой моих данных в oneSitePls. Я подтверждаю своё совершеннолетие и ответственность за размещение"
      }
    ]
  },
  "general_info": {
    "title": "Общая информация",
    "fields": [
      {
        "name": "city",
        "type": "dropdown",
        "label": "Выберите город",
        "options": [
          "Москва",
          "Санкт-Петербург",
          "Новосибирск"
        ],
        "placeholder": "Москва"
      },
      {
        "name": "name",
        "type": "text",
        "label": "Ваше имя",
        "placeholder": "Введите ваше имя"
      },
      {
        "name": "mobile_number",
        "type": "text",
        "label": "Номер мобильного телефона",
        "placeholder": "+7 (999) 999 99 99"
      },
      {
        "name": "landline_number",
        "type": "text",
        "label": "Номер городского телефона",
        "placeholder": "+7 (999) 999 99 99"
      },
      {
        "name": "email",
        "type": "text",
        "label": "Ваш email",
        "placeholder": "example@gmail.com"
      },
      {
        "name": "parking_address",
        "type": "text",
        "label": "Адрес стоянки эвакуатора",
        "placeholder": "Введите адрес стоянки"
      }
    ]
  },
  "photo_upload": {
    "title": "Фото",
    "fields": [
      {
        "name": "photo",
        "type": "file",
        "label": "Прикрепите фотографию к объявлению",
        "button_text": "Загрузить"
      }
    ]
  }
}

Example for Dota 2 personal lesson:) Please imagine some funny paid experience in dota)):
{
  "lesson_info": {
    "title": "Информация о занятии",
    "fields": [
      {
        "name": "title",
        "type": "text",
        "label": "Название занятия",
        "max_length": 50,
        "placeholder": "Например: 'Мастер-класс по Pudge'"
      },
      {
        "name": "description",
        "type": "textarea",
        "label": "Описание занятия",
        "max_length": 100,
        "placeholder": "Опишите, чему вы будете учить (например: 'Как не фидить на миде')"
      }
    ]
  },
  "pricing": {
    "title": "Цены",
    "fields": [
      {
        "name": "solo_lesson",
        "type": "number",
        "label": "Индивидуальное занятие",
        "placeholder": "TON",
        "disabled_option": "Услугу не оказываю",
        "disable_checkbox": true
      },
      {
        "name": "party_lesson",
        "type": "number",
        "label": "Занятие для пати (до 5 игроков)",
        "placeholder": "TON",
        "disabled_option": "Услугу не оказываю",
        "disable_checkbox": true
      },
      {
        "name": "in_game_coaching",
        "type": "number",
        "label": "Коучинг во время игры",
        "placeholder": "TON/час",
        "disabled_option": "Услугу не оказываю",
        "disable_checkbox": true
      },
      {
        "name": "replay_analysis",
        "type": "number",
        "label": "Анализ реплея",
        "placeholder": "TON за один реплей",
        "disabled_option": "Услугу не оказываю",
        "disable_checkbox": true
      },
      {
        "name": "meme_builds",
        "type": "number",
        "label": "Создание мемных билдов",
        "placeholder": "TON",
        "disabled_option": "Услугу не оказываю",
        "disable_checkbox": true
      }
    ]
  },
  "agreement": {
    "title": "Согласие",
    "fields": [
      {
        "name": "consent",
        "type": "checkbox",
        "label": "Я соглашаюсь с тем, что мои MMR и нервы могут пострадать в процессе обучения, а также с передачей и обработкой моих данных в oneSitePls. Я подтверждаю своё совершеннолетие и готовность к Dota 2 мукам."
      }
    ]
  },
  "general_info": {
    "title": "Общая информация",
    "fields": [
      {
        "name": "username",
        "type": "text",
        "label": "Ваш ник в Dota 2",
        "placeholder": "Введите ваш ник"
      },
      {
        "name": "discord_tag",
        "type": "text",
        "label": "Ваш Discord тег",
        "placeholder": "Например: Gamer#1234"
      },
      {
        "name": "preferred_role",
        "type": "dropdown",
        "label": "Предпочитаемая роль",
        "options": [
          "Carry",
          "Mid",
          "Offlane",
          "Support",
          "Hard Support"
        ],
        "placeholder": "Выберите роль"
      },
      {
        "name": "favorite_hero",
        "type": "text",
        "label": "Любимый герой",
        "placeholder": "Введите имя героя"
      },
      {
        "name": "tilt_level",
        "type": "dropdown",
        "label": "Уровень тильта",
        "options": [
          "Не тильтую",
          "Немного тильтую",
          "Всегда тильтую"
        ],
        "placeholder": "Выберите уровень"
      }
    ]
  },
  "photo_upload": {
    "title": "Фото",
    "fields": [
      {
        "name": "profile_picture",
        "type": "file",
        "label": "Прикрепите фото профиля (опционально)",
        "button_text": "Загрузить"
      }
    ]
  }
}
`
    

    setRequestText(zeroStageRequest);
    setStep(1);  // Activate the next step
  };
  // Handle the creation of the zero stage request
  const handleZeroStageRequest = () => {
    
    const zeroStageRequest = 
    `You are provided with the attached codebase which contains the current state of the project. Your task is to:
0. **Create a branch name for implementation of the component**

1. **Create a new React component** : ${ideaText} The component should be placed in the \`/components\` directory and should utilize existing components  and styles from the project, particularly from \`/components/ui\` like Button, Input, card, LoadingSpinner, Table. Use Tailwind CSS for styling, and ensure that the component integrates smoothly with the AppContext.

2. **Extract all UI strings** used in the new component for translation. Implement the \`t()\` translation function correctly in the component and provide the translation keys for \`en\`, \`ru\`, and \`ukr\` languages in a TypeScript format, ready to be patched into \`TranslationUtils.tsx\`.

3. **Describe any new Supabase tables** required to support this feature. Provide the SQL commands to create these tables, formatted for direct integration into Supabase. 

4. **Update the \'README.md\' file** to include a new section that documents the \`UserInfo\` component. This should include a feature description and usage instructions.

The codebase is provided as a single file (\'MegaFile.txt\'). Each component in the \`/components\` and \`/components/ui\` folders can be used as examples for implementation. The \`adminDashboard.tsx\` file should serve as a reference for how to structure and format your response. Please ensure that the response is formatted for easy parsing and direct integration into the project.

Expected Output:
Component Implementation
   - The entire React component code should be provided, with the file path included as a comment at the top.


EXAMPLES AND REFERENCES:
// components\game\Megacard.tsx
import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { useGesture } from '@use-gesture/react';
import { supabase } from '../../lib/supabaseClient';
import { cardsImages } from './CardsImgs';

interface Point {
  x: number;
  y: number;
}

interface Card {
  id: string;
  position: Point; // Relative position (0 to 1)
  flipped: boolean;
  last_trajectory?: Point[];
}

interface GameState {
  cards: Card[];
}

type CardId = keyof typeof cardsImages;

interface MegacardProps {
  gameState: GameState;
  cardId: string;
}

const Megacard: React.FC<MegacardProps> = ({ gameState, cardId }) => {
  const [cardState, setCardState] = useState<Card | null>(null);
  const [initialPosition, setInitialPosition] = useState<Point>({ x: 0, y: 0 });
  const [isFlipped, setFlipped] = useState(false);

  const [{ x, y, shadow }, set] = useSpring(() => ({
    x: 0,
    y: 0,
    shadow: 5,
    config: { mass: 1, tension: 200, friction: 13 },
  }));

  useEffect(() => {
    if (gameState) {
      const card = gameState.cards.find((c) => c.id === cardId);
      if (card) {
        setCardState(card);
        const posX = card.position.x * window.innerWidth;
        const posY = card.position.y * window.innerHeight;
        setInitialPosition({ x: posX, y: posY });
        set({ x: posX, y: posY });
        setFlipped(card.flipped);
      }
    }
  }, [gameState, cardId, set]);

  const isNearTrashPlace = (x: number, y: number) => {
    const trashPlace = { x: 200, y: 200 };
    const radius = 50;
    const distance = Math.sqrt((x - trashPlace.x) ** 2 + (y - trashPlace.y) ** 2);
    return distance < radius;
  };

  const moveToTrashPlace = async () => {
    set({ x: 200, y: 200, shadow: 5 });
    const updatedGameState = {
      ...gameState,
      cards: gameState.cards.map((card) =>
        card.id === cardId ? { ...card, position: { x: 200 / window.innerWidth, y: 200 / window.innerHeight } } : card
      ),
    };
    const { error } = await supabase.from('rents').update({ game_state: updatedGameState }).eq('id', '28');
    if (error) console.error('Error updating game state:', error);
  };

  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my], offset: [ox, oy] }) => {
      if (down) {
        set({
          x: initialPosition.x + ox,
          y: initialPosition.y + oy,
          shadow: Math.min(30, Math.abs(ox + oy) / 10),
        });
      }
    },
    onDragEnd: async ({ movement: [mx, my], velocity }) => {
      const newX = initialPosition.x + mx;
      const newY = initialPosition.y + my;
      
      if (isNearTrashPlace(newX, newY)) {
        await moveToTrashPlace();
      } else {
        set({
          x: newX,
          y: newY,
          shadow: 5,
          config: { mass: 1, tension: 200, friction: 30 },
        });

        const updatedGameState = {
          ...gameState,
          cards: gameState.cards.map((card) =>
            card.id === cardId ? { ...card, position: { x: newX / window.innerWidth, y: newY / window.innerHeight } } : card
          ),
        };
        const { error } = await supabase.from('rents').update({ game_state: updatedGameState }).eq('id', '28');
        if (error) console.error('Error updating game state:', error);
      }
    },
  });

  return (
    <animated.div
      {...bind()}
      style={{
        transform: x.interpolate((x) => \`translate(\${x}px, \${y.get()}px)\`),
        boxShadow: shadow.to((s) => \`0px \${s}px \${2 * s}px rgba(0,0,0,0.2)\`),
        width: '100px',
        height: '150px',
        backgroundImage: isFlipped ? \`url(\${cardsImages[cardId as CardId]})\` : \`url(\${cardsImages["shirt"]})\`,
        backgroundColor: isFlipped ? 'darkblue' : 'lightblue',
        borderRadius: '8px',
        cursor: 'grab',
        backgroundSize: 'cover',
        position: 'absolute',
        touchAction: 'none',
      }}
    >
      <div>{/* Additional card content if needed */}</div>
    </animated.div>
  );
};

export default Megacard;
// components/GameBoard.tsx
"use client";
// game_id,game_state
// test_game_1,"{
//   ""cards"": [
//     {
//       ""id"": ""card1"",
//       ""position"": { ""x"": 100, ""y"": 200 },
//       ""last_trajectory"": [
//         { ""x"": 100, ""y"": 200 },
//         { ""x"": 120, ""y"": 220 },
//         { ""x"": 140, ""y"": 240 }
//       ],
//       ""is_flipped"": false
//     },
//     {
//       ""id"": ""card2"",
//       ""position"": { ""x"": 300, ""y"": 100 },
//       ""last_trajectory"": [
//         { ""x"": 300, ""y"": 100 },
//         { ""x"": 320, ""y"": 80 },
//         { ""x"": 340, ""y"": 60 }
//       ],
//       ""is_flipped"": true
//     },
//     {
//       ""id"": ""trash_card"",
//       ""position"": { ""x"": 600, ""y"": 400 },
//       ""last_trajectory"": [
//         { ""x"": 600, ""y"": 400 },
//         { ""x"": 580, ""y"": 380 },
//         { ""x"": 560, ""y"": 360 }
//       ],
//       ""is_flipped"": false
//     }
//   ]
// }"

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import Megacard from './Megacard'; // Import the Megacard component
import { useAppContext } from '@/context/AppContext';

const GAME_ID = 28;  // Replace with actual game ID

interface Card {
  id: string;
  position: { x: number; y: number };
  flipped: boolean;
}

interface GameState {
  cards: Card[];
}

const GameBoard: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const { user, t } = useAppContext();

  useEffect(() => {
    // Subscribe to changes in the \`rents\` table for the current game
    const handleSubscription = async () => {
      // Initial fetch for game state
      const { data, error } = await supabase
        .from('rents')
        .select('game_state')
        .eq('id', GAME_ID)
        .single();

      if (error) {
        console.error('Error fetching game state:', error);
      } else {
        setGameState(data.game_state);
      }

      // Set up the real-time subscription using a Supabase Channel
      const channel = supabase
        .channel('game-updates')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rents', filter: \`id=eq.\${GAME_ID}\` }, (payload) => {
          setGameState(payload.new.game_state);
        })
        .subscribe();

      // Clean up the subscription on unmount
      setSubscription(channel);
      return () => {
        supabase.removeChannel(channel);
      };
    };

    handleSubscription();
  }, [GAME_ID]);

   // Fetch game state from Supabase
useEffect(() => {
    const fetchGameState = async () => {
      const { data, error } = await supabase
        .from('rents')
        .select('game_state')
        .eq('id', GAME_ID)
        .single();
      if (!error) setGameState(data.game_state);
    };
    fetchGameState();
  }, []);                              
  const shuffleCards = async () => {
    if (!gameState) return;

    // Shuffle the cards array
    const shuffledCards = gameState.cards
      .map(card => ({ ...card, position: { x: Math.random(), y: Math.random() } })) // Randomize positions
      .sort(() => Math.random() - 0.5); // Shuffle array

    // Update the game state with the shuffled cards
    const updatedGameState = { ...gameState, cards: shuffledCards };

    // Save the updated game state to Supabase
    const { error } = await supabase
      .from('rents')
      .update({ game_state: updatedGameState })
      .eq('id', GAME_ID);

    if (error) {
      console.error('Error updating game state:', error);
    } else {
      setGameState(updatedGameState); // Update local state
    }
  };

  return (
    <div className="game-board">
      {/* Render cards */}
      <div>
        {gameState && gameState.cards.map((card) => (
          <Megacard key={card.id} gameState={gameState} cardId={card.id} />
        ))}
      </div>

      <Button className="shuffle-button" onClick={shuffleCards}>
        {t("shuffle")}
      </Button>
    </div>
  );
};

export default GameBoard;
You can use/modify existing tables and components as you wish:
  public.users
  public.bets (
    id bigint generated by default as identity not null,
    user_id integer not null,
    event_id bigint null,
    amount numeric not null,
    outcome text not null default ''::text,
    status text not null default 'active'::text,
    constraint bets_pkey primary key (id),
    constraint bets_event_id_fkey foreign key (event_id) references events (id),
    constraint bets_user_id_fkey foreign key (user_id) references users (telegram_id) on delete cascade
  ) tablespace pg_default;
  public.item_types (
    id uuid not null default extensions.uuid_generate_v4 (),
    type text not null,
    fields jsonb not null,
    constraint item_types_pkey primary key (id)
  ) tablespace pg_default;
  public.items (
    id bigint generated by default as identity not null,
    title text not null,
    creator_ref_code text not null,
    item_type text not null,
    details jsonb not null,   EXAMPLE:{
  "game_info": {
    "status": "",
    "game_id": "",
    "game_type": ""
  },
  "game_state": {},
  "player_info": {
    "player1_name": "",
    "player2_name": ""
  },
  "card_settings": {
    "owner_card_positions": "",
    "opponent_card_positions": ""
  },
  "board_settings": {
    "gameboard_url": "",
    "coordinate_normalization": ""
  },
  "button_settings": {
    "invite_button_position": "",
    "shuffle_button_position": ""
  },
  "form_visibility": {},
  "game_components": {},
  "trigger_settings": {
    "card_on_click_bitmask": "",
    "card_on_drag_end_bitmask": ""
  }
}EXAMPLEOFF
    created_at timestamp with time zone not null default now(),
    game_type text null default 'FOOL'::text,
    constraint items_pkey primary key (id)
  ) tablespace pg_default;
  public.rents (
    id bigint generated by default as identity not null,
    user_id integer not null,
    rent_start timestamp with time zone not null default now(),
    rent_end timestamp with time zone not null,
    status text not null default 'active'::text,
    item_id bigint not null,
    game_state jsonb null, EXAMPLE{
  "cards": [
    {
      "id": "6_of_clubs",
      "position": {
        "x": 0.018670388180612,
        "y": 0.043583865879121664
      },
      "is_flipped": true,
      "last_trajectory": [
        {
          "x": 0.513767244829,
          "y": 0.0578535623573
        }
      ]
    },...
  ]
}EXAMPLEOFF
    constraint rents_pkey primary key (id),
    constraint rents_item_id_fkey foreign key (item_id) references items (id) on delete cascade,
    constraint rents_user_id_fkey foreign key (user_id) references users (telegram_id) on delete cascade
  ) tablespace pg_default;
Make sure to follow this format strictly to help automate the integration process.
---

Expected Response (Example)
Component Implementation:
File: components/Referral.tsx
"""tsx
//components/Referral.tsx
"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faPaperPlane, faTrophy } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";

const Referral: React.FC = () => {
  const { user, updateUserReferrals, t  } = useAppContext();
  const [referralName, setReferralName] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [inviteCount, setInviteCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, [user]);

  const fetchReferralData = async () => {
...

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-4">
          <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
          {t('inviteFriend')}
        </h1>
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">
            {t('referralName')}
          </label>
          <input
            type="text"
            value={referralName}
            onChange={(e) => handleReferralNameChange(e.target.value)}
            className="input input-bordered w-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Referral Name"
          />
        </div>
        <Button
          onClick={handleSendInvite}
          className="btn btn-primary flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition justify-center w-full"
          aria-label="Send Invite"
          variant="outline"
        >
          <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
          {t('sendInvite')}
        </Button>
        <div className="mt-6 text-center">
          <FontAwesomeIcon icon={faTrophy} className="text-yellow-400 mb-2" />
          <p className="text-gray-400">
            {t('successfulInvites')}: {inviteCount}
          </p>
        </div>
      </div>
    </Suspense>
  );
};

export default Referral;

"""


- Output the entire file for this step, including the relative path on the first line as a comment.
- Make sure the output is formatted for easy replacement in project files.
- Provide complete code snippets, not just differences, to make integration easier.
- Ensure consistent formatting for ease of parsing by script.
Remember Output format:

File: components/<NewComponent>.tsx
"""tsx
// components/<NewComponent>.tsx
<code here>
"""
`
    setRequestText(zeroStageRequest);
    setStep(1);  // Activate the next step
  };

  // Regex execution integrated with parsing function
const regex = /###\s*\d*\.*\s*\**\s*Component Implementation\s*\**\s*:*\s*\**\n*\**File:\s*`([^`]+)`\s*\**\n```tsx\n([\s\S]*?)```/gm;

const parseResponse = (response: string): ParsedResponse => {
    const branchNameRegex = /\s*\d*\.?\s*\**\s*Branch Name\s*\**\s*:*\s*\**\n`([^`]+)`/;
    const fileRegex = /Component Implementation\s*\**\s*:*\s*\**\nFile:\s*`([^`]+)`\s*\**\n```tsx\n([\s\S]*?)```/gm;
    const translationKeysRegex = /Translation Keys\s*\**\s*:\s*```tsx([\s\S]*?)```/;
    const sqlTablesRegex = /\s*\d*\.?\s*\**\s*Supabase Tables\s*\**\s*:\s*```sql([\s\S]*?)```/;
    const readmeUpdateRegex = /README\.md Update\s*\**\s*:\s*```markdown([\s\S]*?)```/;
    const bottomShelfRegex = /\s*\d*\.?\s*\**\s*bottomShelf\.tsx\s*\**\s*:\s*File:\s*`([^`]+)`\s*```tsx([\s\S]*?)```/;

    const parsedData: ParsedResponse = {
        branchName: '',
        files: [],
        translations: {},
        sqlTables: [],
        readmeUpdate: '',
        bottomShelf: undefined
    };

    // Extract the branch name
    const branchNameMatch = response.match(branchNameRegex);
    if (branchNameMatch) {
        parsedData.branchName = branchNameMatch[1].trim();
    }

    // Extract file implementations
    let fileMatch;
    while ((fileMatch = fileRegex.exec(response)) !== null) {
        parsedData.files.push({
            path: fileMatch[1].trim(),
            content: fileMatch[2].trim(),
        });
    }

    // Extract translation keys
    const translationKeysMatch = response.match(translationKeysRegex);
    if (translationKeysMatch) {
        parsedData.translations = eval(`(${translationKeysMatch[1].trim()})`);
    }

    // Extract SQL table creation commands
    const sqlTablesMatch = response.match(sqlTablesRegex);
    if (sqlTablesMatch) {
        parsedData.sqlTables = sqlTablesMatch[1].trim().split(/\n{2,}/);
    }

    // Extract README.md update
    const readmeUpdateMatch = response.match(readmeUpdateRegex);
    if (readmeUpdateMatch) {
        parsedData.readmeUpdate = readmeUpdateMatch[1].trim();
    }

    // Extract bottomShelf.tsx content
    const bottomShelfMatch = response.match(bottomShelfRegex);
    if (bottomShelfMatch) {
        parsedData.bottomShelf = {
            path: bottomShelfMatch[1].trim(),
            content: bottomShelfMatch[2].trim()
        };
    }

    // Debugging logs
    console.log(`Parsed branch name: ${parsedData.branchName}`);
    parsedData.files.forEach((file, index) => {
        console.log(`Parsed component file [${index + 1}]: ${file.path}`);
        console.log(`File content [${index + 1}]:\n${file.content.slice(0, 1000)}...`); // Log first 1000 chars
    });
    console.log('Parsed translation keys:', parsedData.translations);
    console.log('Parsed SQL tables:', parsedData.sqlTables);
    console.log(`Parsed README.md update:\n${parsedData.readmeUpdate}`);
    if (parsedData.bottomShelf) {
        console.log(`Parsed bottomShelf.tsx file path: ${parsedData.bottomShelf.path}`);
        console.log(`BottomShelf content:\n${parsedData.bottomShelf.content.slice(0, 1000)}...`); // Log first 1000 chars
    } else {
        console.log('BottomShelf.tsx content not found.');
    }

    return parsedData;
};

// Copy to clipboard utility function
const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    }, (err) => {
        console.error('Failed to copy: ', err);
    });
};

  // Function to save extracted files to the local system
  async function saveFiles(files: ParsedFile[]) {
    files.forEach((file) => {
      const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, file.path);
    });
  }

  // Function to merge new translations with existing ones
  async function mergeTranslations(newTranslations: Record<string, any>) {
    const existingTranslations: Record<string, any> = {}; // Assume this object holds the existing translations

    Object.keys(newTranslations).forEach((lang) => {
      if (!existingTranslations[lang]) {
        existingTranslations[lang] = newTranslations[lang];
      } else {
        existingTranslations[lang] = {
          ...existingTranslations[lang],
          ...newTranslations[lang],
        };
      }
    });

    return existingTranslations; // This would typically be saved back to a file
  }

  // Function to execute SQL in Supabase
  async function executeSQL(sql: string) {
    const { error } = await supabase.rpc('execute_sql', { query: sql });
    if (error) {
      console.error('Failed to execute SQL:', error.message);
    }
  }

  // Handle the response after it's been fetched
  const handleGetResponse = async () => {
    try {
      const response = await navigator.clipboard.readText();
      setResponseText(response);
      const parsed = await parseResponse(response);  // Parse the response to get components, translations, etc.
      setParsedData(parsed);
      setBranchName(parsed.branchName); // Save the branch name
      updateBottomShelfAndPage()
      setStep(2);  // Activate the next step
    } catch (error) {
      console.error('Error handling response:', error);
      alert(`There was an error processing the response:${error}`);
    }
  };

  // Handle the "Try It" stage
  const handleTryIt = async () => {
    try {
      // Simulate trying out the parsed data
      console.log("Feature is being tried...");
      setStep(3);  // Activate the next step
    } catch (error) {
      console.error('Error trying feature:', error);
    }
  };

  // Handle the "Deploy" stage
  const handleDeploy = async () => {
    if (!parsedData || !branchName) return;
  
    try {
      // Push the updated README if it exists
      if (parsedData.readmeUpdate) {
        const updateMessage = await updateReadme(branchName, parsedData.readmeUpdate);
        console.log(updateMessage);
      }
      if (parsedData.tableDescription) {
        const updateSupabase = await executeSQL(parsedData.tableDescription);
        console.log(updateSupabase);
      }
      if (parsedData.tableDescription) {
        const updateTranslations = await mergeTranslations(parsedData.transactions);
        console.log(updateTranslations);
      }
  
      // Push all parsed files to the repository
      for (const file of parsedData.files) {
        await saveFiles([file]);  // Adjust saveFiles to handle GitHub API calls
      }
  
      console.log("Feature has been deployed successfully!");
      setStep(4);  // Final step
    } catch (error) {
      console.error('Error deploying feature:', error);
      alert('There was an error during deployment.');
    }
  };

  // Automatically update BottomShelf.tsx and create page.tsx for new component
  const updateBottomShelfAndPage = async () => {
    if (!parsedData) return;
  
    try {
      // Fetch the current BottomShelf.tsx code from GitHub
      let bottomShelfCode = await fetchBottomShelfCode();
  
    //   // Modify the BottomShelf code to add the new link
    //   const newLink = {
    //     href: `/app/${parsedData.branchName}`,
    //     icon: 'faLightbulb',  // Replace with appropriate icon
    //     label: parsedData.branchName,
    //   };
    //   const updatedBottomShelfCode = bottomShelfCode.replace(
    //     /(const navigationLinks: NavigationLink\[] = \[)/,
    //     `$1\n    { href: '${newLink.href}', icon: ${newLink.icon}, label: '${newLink.label}' },`
    //   );
  
    //   // Save the updated BottomShelf.tsx code back to GitHub
    //   await saveUpdatedBottomShelf(updatedBottomShelfCode);
  
      // Create the new page.tsx file for the new component
      const pagePath = `app/${parsedData.branchName}/page.tsx`;
      const pageContent = `
        import ${parsedData.branchName} from "../../components/${parsedData.branchName}";
    
        export default function Page() {
          return <${parsedData.branchName} />;
        }
      `;
  
      // Add the new page.tsx file to the parsed files list
      parsedData.files.push({
        path: pagePath,
        content: pageContent,
      });
  
      console.log("BottomShelf.tsx updated and new page.tsx created, ready for deployment");
  
    } catch (error) {
      console.error('Error updating BottomShelf or creating page.tsx:', error);
    }
  };


//     useEffect(() => {
//         fetchIdeas();
//   }, []);

//   const fetchIdeas = async () => {
//     const ideasFromSupabase = user//await fetchIdeasFromSupabase();
//     setIdeas(ideasFromSupabase);
//   };

return (
    <div className="dev-container p-4 bg-gray-100 rounded-md">
      <h1 className="text-2xl font-bold mb-4">{t('developerToolTitle')}</h1>
      {/* <h2 className="text-xl font-semibold">{t('currentIdeasTitle')}</h2>
      <ul className="mt-4">
        {ideas.map((idea) => (
          <li key={idea.id} className="mb-4">
            <h3 className="font-bold text-lg">{idea.title}</h3>
            <p className="text-sm text-gray-700">{idea.description}</p>
            <p className="text-xs text-gray-500">{t('contributorsLabel')}: {idea.contributors.join(', ')}</p>
          </li>
        ))}
      </ul>   */}

      {/* Idea Input */}
      <div>
        <h2 className="text-xl font-semibold">{t('enterYourIdeaTitle')}</h2>
        <Textarea
          value={ideaText}
          onChange={(e) => setIdeaText(e.target.value)}
          placeholder={t("describeYourIdeaPlaceholder")}
        />
        <div className="grid grid-cols-1 gap-4"><Button 
          onClick={handleZeroStageRequest} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          variant="outline"
        >
          {t('generateRequestButton')}
        </Button>
        <Button 
          onClick={handleZeroStageRequestType} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          variant="outline"
        >
          {t('generateRequestButton')}4TYPE
        </Button>
        </div>
      </div>
  
      {/* Zero Stage Request Output */}
      {step >= 1 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">{t('zeroStageRequestTitle')}</h2>
          <Textarea
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
          />
          <ClipboardManager requestText={requestText} />
        </div>
      )}
  
      {/* Button to Get Response 
      {step >= 1 && (
        <div className="grid grid-cols-1 gap-4">
          <Button 
            onClick={handleGetResponse} 
            variant="outline"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {t('getResponseButton')}
          </Button>
        </div>
      )}*/}
  
    
    {/*// Enhanced UI display Display Parsed Response */}
    {step >= 2 && parsedData && (
        <div className="parsed-data">
            <h1 className="text-2xl font-bold mb-4">{t('parsedResponseDataTitle')}</h1>

            <section className="branch-name mb-6">
                <h2 className="text-xl font-semibold">{t('branchNameTitle')}</h2>
                <p className="bg-gray-100 p-2 rounded">{parsedData.branchName}</p>
                <Button onClick={() => copyToClipboard(parsedData.branchName)} className="mt-2 p-2 bg-blue-500 text-white rounded" variant="outline">
                    {t('copyBranchName')}
                </Button>
            </section>

            <section className="component-implementation mb-6">
                <h2 className="text-xl font-semibold">{t('componentImplementationsTitle')}</h2>
                {parsedData.files.map((file: ParsedFile, index: number) => (
                    <div key={index} className="file-item mb-4">
                        <h3 className="font-bold">{file.path}</h3>
                        <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{file.content}</pre>
                        <Button onClick={() => copyToClipboard(file.content)} className="mt-2 p-2 bg-blue-500 text-white rounded" variant="outline">
                            {t('copyFileContent')}
                        </Button>
                    </div>
                ))}
            </section>

            <section className="translations mb-6">
                <h2 className="text-xl font-semibold">{t('translationKeysTitle')}</h2>
                <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{JSON.stringify(parsedData.translations, null, 2)}</pre>
                <Button onClick={() => copyToClipboard(JSON.stringify(parsedData.translations, null, 2))} className="mt-2 p-2 bg-blue-500 text-white rounded"
          variant="outline">
                    {t('copyTranslationKeys')}
                </Button>
            </section>

            <section className="sql-tables mb-6">
                <h2 className="text-xl font-semibold">{t('supabaseTablesTitle')}</h2>
                {parsedData.sqlTables.map((sql: string, index: number) => (
                    <div key={index} className="sql-item mb-4">
                        <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{sql}</pre>
                        <Button onClick={() => copyToClipboard(sql)} className="mt-2 p-2 bg-blue-500 text-white rounded"
          variant="outline">
                            {t('copySQLTable')}
                        </Button>
                    </div>
                ))}
            </section>

            <section className="readme-update mb-6">
                <h2 className="text-xl font-semibold">{t('readmeUpdateTitle')}</h2>
                <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{parsedData.readmeUpdate}</pre>
                <Button onClick={() => copyToClipboard(parsedData.readmeUpdate)} className="mt-2 p-2 bg-blue-500 text-white rounded"
          variant="outline">
                    {t('copyReadmeUpdate')}
                </Button>
            </section>
        </div>
    )}
  
      {/* Try It and Deploy Buttons */}
      {step >= 2 && (
        <div className="mt-8">
          <GitHubManager />
          <Button 
            onClick={handleTryIt} 
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-4"
          variant="outline"
          >
            {t('tryItButton')}
          </Button>
        </div>
      )}
  
      {step >= 3 && (
        <div className="mt-8">
          <VercelDeploymentManager />
          <Button 
            onClick={handleDeploy} 
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          variant="outline"
          >
            {t('deployButton')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dev;