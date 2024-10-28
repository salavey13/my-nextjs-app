// /components/game/QuizComponent.tsx

'use client'

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import useTelegram from '@/hooks/useTelegram';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const quizQuestions: QuizQuestion[] = [
{
    question: 'What is LATOKEN\'s primary goal in the context of startups?',
    options: [
    'To invest in startups that promote social good',
    'To help launch and fund startups of the future',
    'To create a regulatory sandbox for new startups',
    'To connect traditional venture capitalists with promising startups'
    ],
    correctAnswer: 'To help launch and fund startups of the future',
    explanation: 'LATOKEN assists in the launch and acquisition of future startups to help entrepreneurs gain support and investors to profit.'
},
{
    question: 'How does LATOKEN aim to differentiate its trading platform from competitors like Binance?',
    options: [
    'By focusing exclusively on blockchain-based assets',
    'By offering a significantly larger number of tradable assets',
    'By integrating artificial intelligence into trading algorithms',
    'By prioritizing assets with strong social responsibility initiatives'
    ],
    correctAnswer: 'By offering a significantly larger number of tradable assets',
    explanation: 'LATOKEN offers over 3,000 tradable assets, surpassing Binance’s 400+, as a key selling point.'
},
{
    question: 'Which of the following describes LATOKEN’s approach to liquidity?',
    options: [
    'LATOKEN provides liquidity exclusively for institutional investors',
    'LATOKEN supports the liquidity of a broad range of digital assets',
    'LATOKEN partners with banks to provide liquidity for fiat transactions',
    'LATOKEN creates liquidity through token buybacks'
    ],
    correctAnswer: 'LATOKEN supports the liquidity of a broad range of digital assets',
    explanation: 'LATOKEN facilitates liquidity for various digital assets, helping investors easily buy and sell on the platform.'
},
{
    question: 'In LATOKEN’s fundraising model, how are startups primarily funded?',
    options: [
    'Through venture capital funding rounds',
    'Through crowdfunding on LATOKEN’s platform',
    'Through initial coin offerings (ICOs)',
    'Through traditional stock offerings'
    ],
    correctAnswer: 'Through initial coin offerings (ICOs)',
    explanation: 'LATOKEN helps startups raise funds through initial coin offerings (ICOs) on its platform.'
},
{
    question: 'What is a key feature of LATOKEN’s trading fees?',
    options: [
    'LATOKEN charges a flat 1% fee on all transactions',
    'LATOKEN offers a tiered fee structure based on trading volume',
    'LATOKEN does not charge trading fees for assets under $100',
    'LATOKEN provides discounts for high-volume traders'
    ],
    correctAnswer: 'LATOKEN offers a tiered fee structure based on trading volume',
    explanation: 'LATOKEN’s fee structure is tiered based on trading volume, benefiting active traders with lower fees.'
},
{
    question: 'What role do LA Tokens play on the LATOKEN platform?',
    options: [
    'They are used as the primary trading pair for all assets',
    'They provide access to premium features and lower fees',
    'They are exclusively used for token buybacks',
    'They are used to reward community engagement'
    ],
    correctAnswer: 'They provide access to premium features and lower fees',
    explanation: 'LA Tokens enable users to access premium features and lower trading fees on LATOKEN’s platform.'
},
{
    question: 'How does LATOKEN support asset tokenization?',
    options: [
    'LATOKEN does not offer any tokenization services',
    'LATOKEN provides a platform for tokenizing real-world assets',
    'LATOKEN only supports tokenization of digital assets',
    'LATOKEN acts as an advisor for tokenization processes'
    ],
    correctAnswer: 'LATOKEN provides a platform for tokenizing real-world assets',
    explanation: 'LATOKEN allows users to tokenize real-world assets like real estate, enabling fractional ownership and trading.'
},
{
    question: 'What type of investors primarily use LATOKEN’s platform?',
    options: [
    'Traditional institutional investors',
    'Retail investors looking to invest in blockchain assets',
    'High-net-worth individuals focused on fiat currencies',
    'Governments investing in public infrastructure'
    ],
    correctAnswer: 'Retail investors looking to invest in blockchain assets',
    explanation: 'LATOKEN primarily attracts retail investors interested in blockchain and digital assets, thanks to its extensive range of options.'
},
{
    question: 'How does LATOKEN ensure regulatory compliance?',
    options: [
    'By partnering with regulatory bodies in each country of operation',
    'By self-regulating and establishing an internal compliance framework',
    'By creating a decentralized governance model for regulation',
    'By offering only unregulated digital assets'
    ],
    correctAnswer: 'By self-regulating and establishing an internal compliance framework',
    explanation: 'LATOKEN follows self-regulation and internal frameworks to comply with international regulatory standards.'
},
{
    question: 'What is a unique aspect of LATOKEN’s partnership model?',
    options: [
    'LATOKEN partners exclusively with traditional banks',
    'LATOKEN creates partnerships with blockchain startups and exchanges',
    'LATOKEN collaborates with government agencies for regulatory compliance',
    'LATOKEN avoids partnerships to maintain full independence'
    ],
    correctAnswer: 'LATOKEN creates partnerships with blockchain startups and exchanges',
    explanation: 'LATOKEN collaborates with blockchain startups and other exchanges to broaden its ecosystem and enhance service offerings.'
}
];
  
const quizQuestionsRU: QuizQuestion[] = [
    {
      question: 'Какова основная цель LATOKEN в контексте стартапов?',
      options: [
        'Инвестировать в стартапы, которые способствуют социальному благу',
        'Помогать запускать и финансировать стартапы будущего',
        'Создать регуляторную песочницу для новых стартапов',
        'Соединять традиционных венчурных капиталистов с перспективными стартапами'
      ],
      correctAnswer: 'Помогать запускать и финансировать стартапы будущего',
      explanation: 'LATOKEN помогает запускать и приобретать стартапы будущего, чтобы предприниматели могли получить поддержку, а инвесторы – прибыль.'
    },
    {
      question: 'Как LATOKEN планирует отличаться от конкурентов, таких как Binance?',
      options: [
        'Сосредоточившись исключительно на активах на основе блокчейна',
        'Предлагая значительно большее количество торгуемых активов',
        'Интегрируя искусственный интеллект в торговые алгоритмы',
        'Приоритизируя активы с сильной социальной ответственностью'
      ],
      correctAnswer: 'Предлагая значительно большее количество торгуемых активов',
      explanation: 'LATOKEN предлагает более 3 000 торгуемых активов, что значительно больше по сравнению с Binance, у которого их более 400.'
    },
    {
      question: 'Какой подход к ликвидности использует LATOKEN?',
      options: [
        'LATOKEN предоставляет ликвидность исключительно для институциональных инвесторов',
        'LATOKEN поддерживает ликвидность широкого спектра цифровых активов',
        'LATOKEN сотрудничает с банками для обеспечения ликвидности фиатных транзакций',
        'LATOKEN создаёт ликвидность через обратные выкупы токенов'
      ],
      correctAnswer: 'LATOKEN поддерживает ликвидность широкого спектра цифровых активов',
      explanation: 'LATOKEN обеспечивает ликвидность для различных цифровых активов, что позволяет инвесторам легко покупать и продавать на платформе.'
    },
    {
      question: 'Каким образом стартапы финансируются на платформе LATOKEN?',
      options: [
        'Через раунды венчурного финансирования',
        'Через краудфандинг на платформе LATOKEN',
        'Через первичные предложения токенов (ICO)',
        'Через традиционные предложения акций'
      ],
      correctAnswer: 'Через первичные предложения токенов (ICO)',
      explanation: 'LATOKEN помогает стартапам привлекать средства через первичные предложения токенов (ICO) на своей платформе.'
    },
    {
      question: 'Какова ключевая особенность торговых сборов LATOKEN?',
      options: [
        'LATOKEN взимает фиксированную комиссию в размере 1% на все транзакции',
        'LATOKEN предлагает многоуровневую структуру сборов, основанную на объёме торгов',
        'LATOKEN не взимает торговых сборов за активы стоимостью менее $100',
        'LATOKEN предоставляет скидки для трейдеров с большим объёмом торгов'
      ],
      correctAnswer: 'LATOKEN предлагает многоуровневую структуру сборов, основанную на объёме торгов',
      explanation: 'LATOKEN имеет многоуровневую структуру сборов, которая снижает сборы для активных трейдеров.'
    },
    {
      question: 'Какую роль играют токены LA на платформе LATOKEN?',
      options: [
        'Они используются в качестве основной торговой пары для всех активов',
        'Они предоставляют доступ к премиальным функциям и сниженным комиссиям',
        'Они используются исключительно для обратных выкупов токенов',
        'Они используются для вознаграждения за вовлечённость сообщества'
      ],
      correctAnswer: 'Они предоставляют доступ к премиальным функциям и сниженным комиссиям',
      explanation: 'Токены LA позволяют пользователям получить доступ к премиальным функциям и сниженным торговым сборам на платформе LATOKEN.'
    },
    {
      question: 'Как LATOKEN поддерживает токенизацию активов?',
      options: [
        'LATOKEN не предлагает услуги токенизации',
        'LATOKEN предоставляет платформу для токенизации реальных активов',
        'LATOKEN поддерживает только токенизацию цифровых активов',
        'LATOKEN выступает в качестве консультанта по процессам токенизации'
      ],
      correctAnswer: 'LATOKEN предоставляет платформу для токенизации реальных активов',
      explanation: 'LATOKEN позволяет пользователям токенизировать реальные активы, такие как недвижимость, что способствует фракционному владению и торговле.'
    },
    {
      question: 'Какие инвесторы в основном используют платформу LATOKEN?',
      options: [
        'Традиционные институциональные инвесторы',
        'Розничные инвесторы, заинтересованные в блокчейн-активах',
        'Лица с высоким уровнем дохода, сосредоточенные на фиатных валютах',
        'Правительства, инвестирующие в общественную инфраструктуру'
      ],
      correctAnswer: 'Розничные инвесторы, заинтересованные в блокчейн-активах',
      explanation: 'LATOKEN в первую очередь привлекает розничных инвесторов, заинтересованных в блокчейне и цифровых активах, благодаря широкому выбору активов.'
    },
    {
      question: 'Как LATOKEN обеспечивает соблюдение нормативных требований?',
      options: [
        'Путём сотрудничества с регулирующими органами в каждой стране работы',
        'Путём саморегулирования и создания внутренней системы соблюдения',
        'Путём создания децентрализованной модели управления для регулирования',
        'Предлагая только нерегулируемые цифровые активы'
      ],
      correctAnswer: 'Путём саморегулирования и создания внутренней системы соблюдения',
      explanation: 'LATOKEN следует принципам саморегулирования и использует внутренние структуры для соответствия международным нормативным стандартам.'
    },
    {
      question: 'Что является уникальной особенностью партнёрской модели LATOKEN?',
      options: [
        'LATOKEN сотрудничает исключительно с традиционными банками',
        'LATOKEN создаёт партнёрства с блокчейн-стартапами и биржами',
        'LATOKEN сотрудничает с государственными агентствами для соблюдения нормативных требований',
        'LATOKEN избегает партнёрств, чтобы сохранять полную независимость'
      ],
      correctAnswer: 'LATOKEN создаёт партнёрства с блокчейн-стартапами и биржами',
      explanation: 'LATOKEN сотрудничает с блокчейн-стартапами и другими биржами для расширения своей экосистемы и улучшения качества обслуживания.'
    }
  ];
  const getQuizQuestions = (lang: string) => {
    return lang === 'en' ? quizQuestions : quizQuestionsRU;
  };
export default function QuizComponent() {
  const { state, t } = useAppContext(); // translation hook
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const {
    openLink,
  } = useTelegram();
  const questions = getQuizQuestions(state?.user?.lang || "en");
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) setScore((prev) => prev + 1);

    setIsAnswerSubmitted(true);

    // Store the result to Supabase
    const { error } = await supabase.from('game_state').insert({
      telegram_id: state.user?.telegram_id,
      quiz_question: currentQuestion.question,
      selected_answer: selectedAnswer,
      correct: isCorrect,
    });

    if (error) console.error('Error saving quiz result:', error);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  return (
    <div className="quiz-component">
      <Card className="p-4 shadow-lg rounded-lg bg-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            {t(currentQuestion.question)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <label key={index} className="block text-sm font-medium text-gray-300">
                <input
                  type="radio"
                  name="quiz"
                  value={option}
                  onChange={() => handleAnswerSelect(option)}
                  disabled={isAnswerSubmitted}
                  className="mr-2"
                />
                {t(option)}
              </label>
            ))}
            {/* Button leading to NotebookLM */}
            <div className="mt-4">
                <Button
                onClick={() => openLink("https://notebooklm.google.com/notebook/c6d20ede-0b36-4e82-badb-6b6fd5c331dd")}
                >
                    {t('Learn More on NotebookLM')}
                </Button>
            </div>
            {!isAnswerSubmitted && (
              <Button
                className="mt-4 bg-secondary text-black"
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
              >
                {t('Submit Answer')}
              </Button>
            )}
          </div>
        </CardContent>
        {isAnswerSubmitted && (
          <div className="mt-4">
            <p className={`text-lg ${selectedAnswer === currentQuestion.correctAnswer ? 'text-green-400' : 'text-red-400'}`}>
              {selectedAnswer === currentQuestion.correctAnswer ? t('Correct!') : t('Wrong!')}
            </p>
            <p className="text-gray-300">{t(currentQuestion.explanation)}</p>
            {currentQuestionIndex < quizQuestions.length - 1 ? (
              <Button
                className="mt-4 bg-secondary text-black"
                onClick={handleNextQuestion}
              >
                {t('Next Question')}
              </Button>
            ) : (
              <p className="mt-4 text-white">{t(`Your score: ${score}/${quizQuestions.length}`)}</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
