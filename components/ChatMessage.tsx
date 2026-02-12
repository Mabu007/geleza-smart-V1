import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'model';
  
  return (
    <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] ${isBot ? 'flex-row' : 'flex-row-reverse'} items-end gap-2`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${isBot ? 'bg-white text-fun-purple' : 'bg-primary-600 text-white'}`}>
          {isBot ? (
            <i className="fas fa-comment-dots text-lg"></i>
          ) : (
            <i className="fas fa-user text-xs"></i>
          )}
        </div>

        {/* Bubble */}
        <div 
          className={`relative p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-hidden transition-all
            ${isBot 
              ? 'bg-white text-gray-800 rounded-bl-none w-full' 
              : 'bg-primary-600 text-white rounded-br-none'
            }`}
        >
          {message.imageUrl && (
            <div className="mb-3 rounded-lg overflow-hidden border border-black/10 bg-gray-50">
              <img src={message.imageUrl} alt="Homework upload" className="max-w-full h-auto object-contain max-h-64 mx-auto" />
            </div>
          )}
          
          <div className={`prose prose-sm max-w-none ${isBot ? 'prose-headings:text-primary-700' : 'prose-invert'} prose-p:my-2 prose-headings:my-2 prose-ul:my-2`}>
            <ReactMarkdown 
               remarkPlugins={[remarkMath, remarkGfm]}
               rehypePlugins={[rehypeKatex]}
               components={{
                 p: ({node, ...props}) => <p className={`mb-2 leading-relaxed ${isBot ? 'text-gray-700' : 'text-white'}`} {...props} />,
                 
                 // Highlight bold text as "Keywords" or "Action Badges" inside steps
                 strong: ({node, ...props}) => (
                   <strong className={`font-bold ${isBot ? 'text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded border border-primary-200 shadow-sm text-xs md:text-sm align-middle' : 'text-white'}`} {...props} />
                 ),
                 
                 // Style numbered lists as "Steps" cards with a clean Flexbox layout
                 ol: ({node, ...props}) => (
                   <div className="relative my-4">
                     <ol className={`space-y-3 list-none pl-0 counter-reset-step ${isBot ? '' : ''}`} {...props} />
                   </div>
                 ),
                 
                 // Use 'any' type to handle custom props passed by react-markdown without TS errors
                 li: ({node, ...props}: any) => {
                   const { ordered, index, ...rest } = props;
                   
                   if (ordered && isBot) {
                     return (
                        <li className="flex items-start gap-3 bg-white border border-blue-100 rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-all">
                           {/* The counter is handled via CSS ::before to ensure it is a flex item and doesn't overlap */}
                           <div className="flex-1 min-w-0" {...rest} />
                        </li>
                     );
                   }
                   return <li className="ml-4 list-disc" {...rest} />;
                 },
                 
                 // Standard Bullet lists
                 ul: ({node, ...props}) => <ul className="list-disc ml-5 space-y-1" {...props} />,
                 
                 // Block quotes for "Key concepts"
                 blockquote: ({node, ...props}) => (
                   <blockquote className="border-l-4 border-fun-yellow bg-yellow-50 p-4 rounded-r-lg my-3 italic text-gray-700 shadow-sm flex items-start gap-3" {...props}>
                      <i className="fas fa-lightbulb text-fun-yellow mt-1 flex-shrink-0"></i>
                      <div className="flex-1">{props.children}</div>
                   </blockquote>
                 ),

                 // Table Styles - Card style ensuring readability in both bubbles
                 table: ({node, ...props}) => (
                   <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 shadow-sm bg-white">
                      <table className="min-w-full divide-y divide-gray-300" {...props} />
                   </div>
                 ),
                 thead: ({node, ...props}) => <thead className="bg-gray-100" {...props} />,
                 tbody: ({node, ...props}) => <tbody className="divide-y divide-gray-200" {...props} />,
                 tr: ({node, ...props}) => <tr className="hover:bg-gray-50" {...props} />,
                 th: ({node, ...props}) => <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider" {...props} />,
                 td: ({node, ...props}) => <td className="px-3 py-2 text-sm text-gray-700" {...props} />,
                 
                 // Code block handler - Detects 'svg' language to render diagrams
                 code: ({node, className, children, ...props}: any) => {
                   const match = /language-(\w+)/.exec(className || '');
                   const isSvg = match && match[1] === 'svg';

                   if (isSvg) {
                     return (
                       <div className="my-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex justify-center overflow-hidden">
                         <div 
                           className="w-full max-w-[300px]"
                           dangerouslySetInnerHTML={{ __html: String(children).replace(/\\n/g, ' ') }} 
                         />
                       </div>
                     );
                   }

                   return !match ? (
                     <code className={`px-1.5 py-0.5 rounded font-mono text-sm ${isBot ? 'bg-gray-100 text-pink-600 border border-gray-200' : 'bg-primary-700 text-white'}`} {...props}>
                       {children}
                     </code>
                   ) : (
                     <code className={className} {...props}>
                       {children}
                     </code>
                   )
                 }
               }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
          
          <span className={`text-[10px] absolute bottom-1 ${isBot ? 'right-3 text-gray-400' : 'left-3 text-primary-200'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          {/* CSS for ordered list counters - Using Flexbox behaviour */}
          {isBot && (
            <style>{`
              ol.counter-reset-step {
                counter-reset: step;
              }
              ol.counter-reset-step > li {
                counter-increment: step;
              }
              /* The step number circle */
              ol.counter-reset-step > li::before {
                content: counter(step);
                flex-shrink: 0;
                width: 2rem;
                height: 2rem;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                color: white;
                border-radius: 50%;
                text-align: center;
                line-height: 2rem;
                font-weight: bold;
                font-family: 'Fredoka', sans-serif;
                box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
                margin-right: 0.5rem; /* Space between number and content */
              }
            `}</style>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;