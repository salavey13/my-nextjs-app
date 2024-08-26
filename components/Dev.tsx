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
//import { saveUpdatedBottomShelf } from '../utils/githubUtils';
type ParsedResponse = {
    branchName: string | null;
    files: ParsedFile[];
    sqlTables: string[] | null;
    translations: Record<string, any> | null;
    readmeUpdate: string | null;
  };

interface ParsedFile {
    path: string;
    content: string;
}

const Dev: React.FC = () => {
  const { user, t, fetchPlayer } = useAppContext();
  const [ideaText, setIdeaText] = useState<string>("");  // Idea input state
  const [ideas, setIdeas] = useState([
    { id: 1, title: "HackButton", description: "a big button in the middle of the screen that upon clicking adds me 13k coins to the balance with flying congratulations message \"You hacked the system!\"", contributors: ["SALAVEY13"] },
    { id: 2, title: "quest4coins", description: "quests for earning coins with different type of tasks, from inviting 3 friends through referrals to creating first feature in dev mode. quests should be loaded from quests table from supabase - states for quests for particular user should be saved to quests_ststes table: new/in_progress/finished/reward_claimed - at first no state means new, after first click state is updated to in progress and current rank of user is checked (users table id(int4), telegram_id(int8), telegram_username, rank(int4), coins(int4)) if quest is about reaching 1st rank - if rank is ≥=1 then state is changed to finished and lable \"get reward is shown\", to get reward user clicks on thisfinished wuest and his coins are incremented by 13k, then state of quest is saved as reward_claimed and grays out. create similar flows for all types of quests. quest should contain url field on db what to open upon clicking if needed for sharing or something", contributors: ["SALAVEY13"] },
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
  const handleZeroStageRequest = () => {
    //const zeroStageRequest = `Please rephrase the following idea for use in future development stages: "${ideaText}". Format it as a unified request, using best practices for clarity and completeness.`;
    
    const zeroStageRequest = 
    `You are provided with the attached codebase which contains the current state of the project. Your task is to:
0. **Create a branch name for implementation of the component**

1. **Create a new React component** : ${ideaText} The component should be placed in the \`/components\` directory and should utilize existing components  and styles from the project, particularly from \`/components/ui\` like Button, Input, card, LoadingSpinner, Table. Use Tailwind CSS for styling, and ensure that the component integrates smoothly with the AppContext.

2. **Extract all UI strings** used in the new component for translation. Implement the \`t()\` translation function correctly in the component and provide the translation keys for \`en\`, \`ru\`, and \`ukr\` languages in a TypeScript format, ready to be patched into \`TranslationUtils.tsx\`.

3. **Describe any new Supabase tables** required to support this feature. Provide the SQL commands to create these tables, formatted for direct integration into Supabase. 

4. **Update the \'README.md\' file** to include a new section that documents the \`UserInfo\` component. This should include a feature description and usage instructions.

The codebase is provided as a single file (\'MegaFile.txt\'). Each component in the \`/components\` and \`/components/ui\` folders can be used as examples for implementation. The \`adminDashboard.tsx\` file should serve as a reference for how to structure and format your response. Please ensure that the response is formatted for easy parsing and direct integration into the project.

### Expected Output:
0. **Branch Name**:
   - Branch Name
1. **Component Implementation**
   - The entire React component code should be provided, with the file path included as a comment at the top.
   - 
2. **Translation Keys**
   - The keys should be in a TypeScript format, matching the format used in \TranslationUtils.tsx\`.
    Translation Keys:
    export const languageDictionary: LanguageDictionary = {
    en: {
        userInfo: "User Information",
        email: "Email",
        joined: "Joined",
        error: "Error"
    },
    ru: {
        userInfo: "Информация о пользователе",
        email: "Электронная почта",
        joined: "Присоединился",
        error: "Ошибка"
    },
    ukr: {
        userInfo: "Інформація про користувача",
        email: "Електронна пошта",
        joined: "Приєднався",
        error: "Помилка"
    }
    };
3. **Supabase Tables**
   - SQL commands required to create any new Supabase tables should be provided, formatted for direct integration.

4. **README.md Update**
   - A markdown text ready to be appended to the existing \`README.md\` file, formatted with appropriate headers and code blocks.

5. **bottomShelf.tsx**
   - Please include implementation of adding new item to list "navigationLinks" and outputting new version of bottomShelf.tsx as a file (it can be extracted from megaFile - it is marked with "# components/ui/bottomShelf.tsx" and can be found by comment in the beginning of the file contents itself: "//componentsui/bottomShelf.tsx") and respective File: app/pageName/page.tsx. Include link to new page.ts in respective folder with the name of component like following:
   //app/profile/page.tsx
import Profile from "@/components/Profile";

export default function ProfilePage() {
  return <Profile />;
}

bottomShelf.tsx for reference:
// components/ui/bottomShelf.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faList, faPlus, faBell, faUser, faCalendarPlus, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from "@/context/AppContext";

export interface NavigationLink {
  href: string;
  icon: any;
  label: string;
}

const BottomShelf: React.FC = () => {
  const pathname = usePathname();
  const { t } = useAppContext();

  const navigationLinks: NavigationLink[] = [
    { href: '/', icon: faHome, label: t('home') },
    { href: '/admin', icon: faList, label: t('admin') },
    { href: '/createEvent', icon: faCalendarPlus, label: '' },
    { href: '/referral', icon: faPlus, label: t('referral') },
    //{ href: '/notifications', icon: faBell, label: t('notifications') },
    //{ href: '/profile', icon: faUser, label: t('profile') },
    { href: '/dev', icon: faLightbulb, label: t('dev') }
  ];

  return (
    <footer className="fixed bottom-0 left-0 w-full h-16 bg-gray-900 text-white flex justify-around items-center z-20 backdrop-blur-lg shadow-lg">
      {navigationLinks.map((link, index) => (
        <Link
          key={index}
          href={link.href}
          className="flex flex-col items-center justify-center w-12 h-12 text-blue-500">
          <FontAwesomeIcon icon={link.icon} size={link.label ===''?"2x":"lg"} />
          <span className="text-xs">{link.label}</span>
        </Link>
      ))}
    </footer>
  );
};

export default BottomShelf;

You can use existing tables as you wish:
  public.users (
    telegram_username text not null default ''::text,
    lang text not null default '''ru''::text'::text,
    coins integer not null default 0,
    rp integer not null default 100,
    updated_at timestamp with time zone not null default now(),
    created_at timestamp with time zone not null default now(),
    "X" integer not null default 0,
    last_xp_reset timestamp with time zone not null default now(),
    telegram_id bigint not null,
    referer integer null,
    initial_date timestamp with time zone not null default now(),
    initial_readings jsonb null,
    monthly_prices jsonb null,
    cheers_count integer not null default 0,
    "tasksTodo" text null,
    "currentgameId" uuid null,
    game_state text null,
    role integer not null default 1,
    id integer generated by default as identity not null,
    email text not null default ''::text,
    password text not null default ''::text,
    ton_wallet text null default ''::text,
    social_credit numeric not null default '0'::numeric,
    ref_code text not null default ''::text,
    rank text not null default ''::text,
    constraint users_pkey primary key (id),
    constraint users_id_key unique (telegram_id),
    constraint users_id_key1 unique (id),
    constraint users_referer_fkey foreign key (referer) references users (id) on delete set null
  ) tablespace pg_default;
  public.referrals (
    id bigint generated by default as identity not null,
    referral_date timestamp with time zone not null default now(),
    user_id bigint not null,
    referred_user_id bigint not null,
    ref_code text null,
    constraint referrals_pkey primary key (id),
    constraint referrals_referred_user_id_key unique (referred_user_id),
    constraint referrals_referred_user_id_fkey foreign key (referred_user_id) references users (telegram_id) on delete cascade,
    constraint referrals_user_id_fkey foreign key (user_id) references users (telegram_id) on delete cascade
  ) tablespace pg_default;
  public.quests (
    created_at timestamp with time zone not null default now(),
    title text not null default ''::text,
    description text null default ''::text,
    id integer generated by default as identity not null,
    type public.qtype not null default 'tracking'::qtype,
    reward integer not null default 500,
    category text not null default ''::text,
    image_url text not null default ''::text,
    target integer not null default 5000,
    "socialLink" text not null default ''::text,
    constraint quests_pkey primary key (id),
    constraint quests_id_key unique (id)
  ) tablespace pg_default;
  public.quest_states (
    start_date timestamp with time zone not null default now(),
    user_id integer not null,
    quest_id integer not null,
    state public.state not null,
    progress integer not null,
    streak integer not null default 0,
    constraint quest_states_pkey primary key (user_id, quest_id),
    constraint quest_states_quest_id_fkey foreign key (quest_id) references quests (id) on delete cascade,
    constraint quest_states_user_id_fkey foreign key (user_id) references users (telegram_id) on delete cascade
  ) tablespace pg_default;
  public.events (
    id bigint generated by default as identity not null,
    created_at timestamp with time zone not null default now(),
    title text not null default ''::text,
    description text not null default ''::text,
    educational_video_url text not null default ''::text,
    expired boolean not null default false,
    expiration_date timestamp with time zone null,
    title_ru text not null default ''::text,
    description_ru text not null default ''::text,
    title_ukr text not null default ''::text,
    description_ukr text not null default ''::text,
    constraint events_pkey primary key (id)
  ) tablespace pg_default;
  public.comments (
    comment_id integer generated by default as identity not null,
    created_at timestamp with time zone not null default now(),
    tg_id integer null,
    quote_id integer null,
    text text not null default ''::text,
    rating real not null default '0'::real,
    image_url text not null default ''::text,
    author_id bigint null,
    constraint comments_pkey primary key (comment_id),
    constraint comments_author_id_fkey foreign key (author_id) references authors (author_id),
    constraint comments_quote_id_fkey foreign key (quote_id) references quests (id),
    constraint comments_tg_id_fkey foreign key (tg_id) references users (telegram_id)
  ) tablespace pg_default;
  public.cheers (
    cheer_id_id integer generated by default as identity not null,
    created_at timestamp with time zone not null default now(),
    user_id integer null,
    comment_id integer null,
    constraint cheers_pkey primary key (cheer_id_id),
    constraint cheers_comment_id_fkey foreign key (comment_id) references comments (comment_id),
    constraint cheers_user_id_fkey foreign key (user_id) references users (telegram_id)
  ) tablespace pg_default;
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
  public.authors (
    author_id bigint generated by default as identity not null,
    name text not null default ''::text,
    image_url text not null default ''::text,
    rating real not null default '0'::real,
    constraint authors_pkey primary key (author_id)
  ) tablespace pg_default;

Make sure to follow this format strictly to help automate the integration process.
---

### **Expected Response (Example)**
Branch Name:
referrals_feature

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
    if (!user) return;

    try {
      const defaultReferralName = user.ref_code ? user.ref_code: user.telegram_username;
      setReferralName(defaultReferralName || '');

      if (!user.ref_code) {
        const newReferralCode = await generateReferralCode(defaultReferralName);
        setReferralCode(newReferralCode);
      } else {
        setReferralCode(user.ref_code);
      }

      const count = await getInviteCount(user.ref_code);
      setInviteCount(count);

    } catch (error) {
      console.error('Error fetching referral data:', error);
    }
  };

  const generateReferralCode = async (defaultReferralName: string) => {
    const newReferralCode = salavey13;
    try {
      const { error } = await supabase
        .from('users')
        .update({ ref_code: newReferralCode })
        .eq('id', user?.id);

      if (error) throw error;
      return newReferralCode;

    } catch (error) {
      console.error('Error generating referral code:', error);
      throw error;
    }
  };

  const getInviteCount = async (referralCode: string | null) => {
    if (!referralCode) return 0;

    try {
      const { count, error } = await supabase
        .from('referrals')
        .select('*', { count: 'exact' })
        .eq('ref_code', referralCode);

      if (error) throw error;
      return count || 0;

    } catch (error) {
      console.error('Error fetching invite count:', error);
      return 0;
    }
  };

  const handleSendInvite = useCallback(async () => {
    if (!referralCode) return;

    try {
      const inviteLink = https://t.me/oneSitePlsBot/vip?ref=referralCode;
      await navigator.clipboard.writeText(inviteLink);

      await sendTelegramInvite(referralCode);

    } catch (error) {
      console.error('Error sending invite:', error);
    }
  }, [referralCode]);

  const handleReferralNameChange = async (newName: string) => {
    if (newName.trim() === '' || isUpdating) return;

    setIsUpdating(true);

    try {
      const newReferralCode = await generateReferralCode(newName);
      setReferralCode(newReferralCode);
      setReferralName(newName);
      updateUserReferrals(newReferralCode);

    } catch (error) {
      console.error('Error updating referral name:', error);

    } finally {
      setIsUpdating(false);
    }
  };

  const sendTelegramInvite = useCallback(async (referralCode: string) => {
    if (!process.env.NEXT_PUBLIC_BOT_TOKEN || !user) {
      console.error('Bot token is missing');
      return;
    }

    const botToken = process.env.NEXT_PUBLIC_BOT_TOKEN;
    const inviteLink = https://t.me/oneSitePlsBot/vip?ref=referralCode;
    const url = new URL(https://api.telegram.org/botbotToken/sendPhoto);
    const message = "playWithUs" user.telegram_username ! 🎮✨;
    url.searchParams.append("chat_id", user.telegram_id.toFixed());
    url.searchParams.append("caption", message);
    url.searchParams.append("photo", "https://th.bing.com/th/id/OIG2.fwYLXgRzLnnm2DMcdfl1");
    url.searchParams.append("reply_markup", JSON.stringify({
      inline_keyboard: [
        [{ text: t("startPlaying"), url: inviteLink }],
        [{ text: t("visitSite"), url: "https://oneSitePls.framer.ai" }],
        [{ text: t("joinCommunity"), url: "https://t.me/aibotsites" }],
        [{ text:  t("youtubeChannel"), url: "https://youtube.com/@salavey13" }],
      ],
    }));

    try {
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to send Telegram message');

    } catch (error) {
      console.error('Error sending Telegram message:', error);
    }
  }, [user]); // Include all dependencies in the dependency array

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
Translation Keys:
export const languageDictionary: LanguageDictionary = {
  en: {
    userInfo: "User Information",
    email: "Email",
    joined: "Joined",
    error: "Error"
  },
  ru: {
    userInfo: "Информация о пользователе",
    email: "Электронная почта",
    joined: "Присоединился",
    error: "Ошибка"
  },
  ukr: {
    userInfo: "Інформація про користувача",
    email: "Електронна пошта",
    joined: "Приєднався",
    error: "Помилка"
  }
};
Supabase Tables:
CREATE TABLE referrals (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES users(id) NOT NULL,
    referred_user_id uuid REFERENCES users(id),
    ref_code text,
    referral_date timestamp with time zone DEFAULT current_timestamp NOT NULL
);

README.md Update:
## New Feature: User Information Component

- **Description**: This component displays detailed user information fetched from Supabase, such as the user's email and the date they joined.
- **Usage**:
  
tsx
  import UserInfo from 'components/UserInfo';

  const App = () => {
      return <UserInfo />;
  };

  export default App;


- Output the entire file for this step, including the relative path on the first line as a comment.
- Make sure the output is formatted for easy replacement in project files.
- Provide complete code snippets, not just differences, to make integration easier.
- Ensure consistent formatting for ease of parsing by script.
Remember Output format:
File: app/pageName/page.tsx
"""tsx
// app/pageName/page.tsx
<code here>
"""

File: components/NewComponent.tsx
"""tsx
// components/NewComponent.tsx
<code here>
"""
`
    setRequestText(zeroStageRequest);
    setStep(1);  // Activate the next step
  };

  // Enhanced parser to extract branch name
  const parseResponse = (response: string): ParsedResponse => {
    const branchNameRegex = /###\s*\d*\.?\s*\**\s*Branch Name\s*\**\s*:*\s*\**\n`([^`]+)`/;
    const fileRegex = /###\s*\d*\.*\s*\**\s*Component Implementation\s*\**\s*:*\s*\**\n*\**File:\s*`([^`]+)`\s*\**\n```tsx\n([\s\S]*?)```/gm;
    const translationKeysRegex = /###\s*\d*\.?\s*\**\s*Translation Keys\s*\**\s*:*\s*\**\n```tsx([\s\S]*?)```/;
    const sqlTablesRegex = /###\s*\d*\.?\s*\**\s*Supabase Tables\s*\**\s*:*\s*\**\n```sql([\s\S]*?)```/;
    const readmeUpdateRegex = /###\s*\d*\.?\s*\**\s*README\.md Update\s*\**\s*:*\s*\**\n```m\.*([\s\S]*?)### S/;

    const parsedData: ParsedResponse = {
        branchName: '',
        files: [],
        translations: {},
        sqlTables: [],
        readmeUpdate: ''
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
    console.log(parsedData.branchName);
    console.log(parsedData.files);
    console.log(parsedData.translations);
    console.log(parsedData.sqlTables);
    console.log(parsedData.readmeUpdate);

    return parsedData;
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
      alert('There was an error processing the response.');
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
      <h2 className="text-xl font-semibold">{t('currentIdeasTitle')}</h2>
      <ul className="mt-4">
        {ideas.map((idea) => (
          <li key={idea.id} className="mb-4">
            <h3 className="font-bold text-lg">{idea.title}</h3>
            <p className="text-sm text-gray-700">{idea.description}</p>
            <p className="text-xs text-gray-500">{t('contributorsLabel')}: {idea.contributors.join(', ')}</p>
          </li>
        ))}
      </ul>  

      {/* Idea Input */}
      <div>
        <h2 className="text-xl font-semibold">{t('enterYourIdeaTitle')}</h2>
        <textarea
          value={ideaText}
          onChange={(e) => setIdeaText(e.target.value)}
          placeholder={t("describeYourIdeaPlaceholder")}
          className="w-full p-2 border rounded mb-4"
        />
        <Button 
          onClick={handleZeroStageRequest} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          variant="outline"
        >
          {t('generateRequestButton')}
        </Button>
      </div>
  
      {/* Zero Stage Request Output */}
      {step >= 1 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">{t('zeroStageRequestTitle')}</h2>
          <textarea
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <ClipboardManager requestText={requestText} />
        </div>
      )}
  
      {/* Button to Get Response */}
      {step >= 1 && (
        <div className="mt-4">
          <Button 
            onClick={handleGetResponse} 
            variant="outline"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {t('getResponseButton')}
          </Button>
        </div>
      )}
  
      {/* Display Parsed Response */}
      {step >= 2 && parsedData && (
        <div className="parsed-data">
            <h1 className="text-2xl font-bold mb-4">{t('parsedResponseDataTitle')}</h1>
            
            <section className="branch-name mb-6">
                <h2 className="text-xl font-semibold">{t('branchNameTitle')}</h2>
                <p className="bg-gray-100 p-2 rounded">{parsedData.branchName}</p>
            </section>
            
            <section className="component-implementation mb-6">
                <h2 className="text-xl font-semibold">{t('componentImplementationsTitle')}</h2>
                {parsedData.files.map((file:ParsedFile, index:number) => (
                    <div key={index} className="file-item mb-4">
                        <h3 className="font-bold">{file.path}</h3>
                        <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{file.content}</pre>
                    </div>
                ))}
            </section>

            <section className="translations mb-6">
                <h2 className="text-xl font-semibold">{t('translationKeysTitle')}</h2>
                <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{JSON.stringify(parsedData.translations, null, 2)}</pre>
            </section>

            <section className="sql-tables mb-6">
                <h2 className="text-xl font-semibold">{t('supabaseTablesTitle')}</h2>
                {parsedData.sqlTables.map((sql:string[], index: number) => (
                    <pre key={index} className="bg-gray-100 p-2 rounded overflow-x-auto">{sql}</pre>
                ))}
            </section>

            <section className="readme-update mb-6">
                <h2 className="text-xl font-semibold">{t('readmeUpdateTitle')}</h2>
                <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{parsedData.readmeUpdate}</pre>
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
          >
            {t('deployButton')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dev;