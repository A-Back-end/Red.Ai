'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

// Типы для управления состоянием
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

type Language = 'en' | 'ru' | null;

// Быстрые команды на английском
const QUICK_COMMANDS = [
  "Explain this code",
  "Refactor this function", 
  "Find potential bugs",
  "Write documentation for this",
  "Generate unit tests"
];

// Приветственные сообщения
const WELCOME_MESSAGES = {
  en: "Hello! I am your AI assistant. How can I help you today?",
  ru: "Здравствуйте! Я ваш AI-ассистент. Чем я могу помочь?"
};

const InteractiveAIAssistant: React.FC = () => {
  // Состояние компонента
  const [languageSelected, setLanguageSelected] = useState<boolean>(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Автоскролл к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Обработчик выбора языка
  const handleLanguageSelect = (language: 'en' | 'ru') => {
    setCurrentLanguage(language);
    setLanguageSelected(true);
    
    // Добавляем приветственное сообщение
    const welcomeMessage: Message = {
      id: 1,
      text: WELCOME_MESSAGES[language],
      sender: 'assistant',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  };

  // Определение языка сообщения (простая эвристика)
  const detectLanguage = (text: string): 'en' | 'ru' => {
    const russianChars = /[а-яё]/i;
    return russianChars.test(text) ? 'ru' : 'en';
  };

  // Симуляция ответа AI (здесь можно подключить реальный API)
  const generateAIResponse = async (userMessage: string, detectedLang: 'en' | 'ru'): Promise<string> => {
    // Симуляция задержки
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = {
      en: [
        "I understand your request. Let me help you with that.",
        "That's an interesting question. Here's what I think...",
        "I can definitely assist you with that. Let me break it down:",
        "Great question! Here's my analysis:",
        "I'd be happy to help you with this task."
      ],
      ru: [
        "Я понял ваш запрос. Позвольте мне помочь вам с этим.",
        "Это интересный вопрос. Вот что я думаю...",
        "Я определенно могу помочь вам с этим. Позвольте мне разъяснить:",
        "Отличный вопрос! Вот мой анализ:",
        "Я буду рад помочь вам с этой задачей."
      ]
    };
    
    const randomResponse = responses[detectedLang][Math.floor(Math.random() * responses[detectedLang].length)];
    return `${randomResponse}\n\nВаш запрос: "${userMessage}"`;
  };

  // Отправка сообщения
  const handleSendMessage = async (messageText: string = inputText) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Определяем язык сообщения
      const detectedLang = detectLanguage(messageText);
      
      // Генерируем ответ AI
      const aiResponse = await generateAIResponse(messageText, detectedLang);
      
      const assistantMessage: Message = {
        id: messages.length + 2,
        text: aiResponse,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: messages.length + 2,
        text: currentLanguage === 'ru' 
          ? "Извините, произошла ошибка. Попробуйте еще раз."
          : "Sorry, an error occurred. Please try again.",
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Обработчик быстрых команд
  const handleQuickCommand = (command: string) => {
    setInputText(command);
    handleSendMessage(command);
  };

  // Обработчик нажатия Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Компонент выбора языка
  const LanguageSelector = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <Bot className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">AI Assistant</h1>
          <p className="text-gray-600">Choose your preferred language</p>
          <p className="text-gray-600 text-sm">Выберите предпочитаемый язык</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => handleLanguageSelect('en')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <span className="text-2xl">🇺🇸</span>
            <span>English</span>
          </button>
          
          <button
            onClick={() => handleLanguageSelect('ru')}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <span className="text-2xl">🇷🇺</span>
            <span>Русский</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Основной интерфейс чата
  const ChatInterface = () => (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <Bot className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-800">AI Assistant</h1>
            <p className="text-sm text-gray-500">
              {currentLanguage === 'ru' ? 'Умный помощник готов к работе' : 'Smart assistant ready to help'}
            </p>
          </div>
          <div className="ml-auto">
            <span className="text-2xl">{currentLanguage === 'ru' ? '🇷🇺' : '🇺🇸'}</span>
          </div>
        </div>
      </div>

      {/* Область сообщений */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 shadow-sm border border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.sender === 'assistant' && (
                  <Bot className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <User className="w-5 h-5 text-white mt-1 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow-sm border border-gray-200 px-4 py-2 rounded-2xl">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Панель быстрых команд */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Quick commands:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_COMMANDS.map((command, index) => (
              <button
                key={index}
                onClick={() => handleQuickCommand(command)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors duration-200"
                disabled={isLoading}
              >
                {command}
              </button>
            ))}
          </div>
        </div>

        {/* Поле ввода */}
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              currentLanguage === 'ru' 
                ? 'Напишите ваше сообщение...' 
                : 'Type your message...'
            }
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-xl transition-colors duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  // Основной рендер
  return (
    <div className="w-full h-screen">
      {!languageSelected ? <LanguageSelector /> : <ChatInterface />}
    </div>
  );
};

export default InteractiveAIAssistant; 