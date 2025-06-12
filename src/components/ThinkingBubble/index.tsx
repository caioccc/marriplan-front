import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { Card } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface ThinkingBubbleProps {
  content: string;
  isThinking: boolean;
}

export const ThinkingBubble: React.FC<ThinkingBubbleProps> = ({ content, isThinking }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dots, setDots] = useState('');
  const hasContent = content && content.trim().length > 0;

  // Animação dos pontos enquanto está pensando
  useEffect(() => {
    if (isThinking) {
      const interval = setInterval(() => {
        setDots((prev) => {
          if (prev === '...') return '';
          return prev + '.';
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isThinking]);

  const toggleExpanded = () => {
    if (hasContent) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card 
      className="mb-1 p-2 bg-gray-100 dark:bg-gray-800 cursor-pointer transition-all duration-200 hover:shadow-md"
      onClick={toggleExpanded}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {isThinking ? `Pensando${dots}` : 'Raciocínio utilizado'}
          </span>
        </div>
        {hasContent && (
          <div className="text-gray-500 transition-transform duration-200">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        )}
      </div>
      
      {isExpanded && hasContent && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <div className="text-xs text-gray-600 dark:text-gray-400 prose prose-xs dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </Card>
  );
};