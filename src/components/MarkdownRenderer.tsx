import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple, robust zero-dependency parser for markdown elements
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';

  lines.forEach((line, index) => {
    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <div key={`code-${index}`} className="my-4 rounded-lg overflow-hidden border border-slate-800 bg-black/90 shadow-md">
            {codeLanguage && (
              <div className="px-4 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-cyan-400">
                {codeLanguage}
              </div>
            )}
            <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
              {codeBuffer.join('\n')}
            </pre>
          </div>
        );
        codeBuffer = [];
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        // Start code block
        inCodeBlock = true;
        codeLanguage = line.trim().replace(/^```/, '');
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      elements.push(<div key={`sp-${index}`} className="h-3" />);
      return;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${index}`} className="text-2xl font-bold text-white mt-6 mb-3 border-b border-slate-800 pb-2 flex items-center gap-2">
          <span>📌</span>
          {renderInline(line.replace('# ', ''))}
        </h1>
      );
      return;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${index}`} className="text-xl font-bold text-indigo-300 mt-5 mb-2.5">
          {renderInline(line.replace('## ', ''))}
        </h2>
      );
      return;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${index}`} className="text-lg font-semibold text-cyan-300 mt-4 mb-2">
          {renderInline(line.replace('### ', ''))}
        </h3>
      );
      return;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={`bq-${index}`} className="border-l-4 border-amber-500 bg-amber-500/10 px-4 py-2.5 rounded-r my-3 text-amber-200/90 text-sm italic">
          {renderInline(line.replace('> ', ''))}
        </blockquote>
      );
      return;
    }

    // Unordered List
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const text = line.trim().replace(/^[\*\-]\s+/, '');
      elements.push(
        <li key={`li-${index}`} className="ml-5 list-disc text-slate-300 text-sm leading-relaxed my-1">
          {renderInline(text)}
        </li>
      );
      return;
    }

    // Ordered List
    const numMatch = line.trim().match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      elements.push(
        <div key={`ol-${index}`} className="flex items-start gap-2 text-slate-300 text-sm leading-relaxed my-1 ml-2">
          <span className="font-bold text-indigo-400 font-mono text-xs mt-0.5">{numMatch[1]}.</span>
          <div>{renderInline(numMatch[2])}</div>
        </div>
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${index}`} className="text-slate-300 text-sm leading-relaxed my-1.5">
        {renderInline(line)}
      </p>
    );
  });

  // Helper to render bold, code and links inline
  function renderInline(text: string): React.ReactNode {
    // Split by inline code `...`
    const codeParts = text.split(/(`[^`]+`)/g);

    return codeParts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 mx-0.5 bg-slate-900 border border-slate-700/80 rounded font-mono text-xs text-cyan-300">
            {part.slice(1, -1)}
          </code>
        );
      }

      // Parse bold **...**
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, j) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return (
            <strong key={`${i}-${j}`} className="font-semibold text-white">
              {bPart.slice(2, -2)}
            </strong>
          );
        }
        return bPart;
      });
    });
  }

  return <div className="space-y-0.5">{elements}</div>;
}
