const fs = require('fs');
const p = 'd:\\RelayOS\\src\\app\\dashboard\\workspaces\\[workspaceId]\\memory-chat\\page.tsx';
let c = fs.readFileSync(p, 'utf8');

// Add renderMarkdown and renderInline before formatTime
const fn = `function renderMarkdown(text: string) {
  const lines = text.split("\\n");
  const elements: React.ReactNode[] = [];
  let inList = false;
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      const content = trimmed.slice(2);
      if (!inList) { inList = true; elements.push(<ul key={"ul-"+i} className="list-disc pl-5 space-y-1 my-1.5">); }
      elements.push(<li key={"li-"+i} className="text-sm leading-relaxed">{renderInline(content)}</li>);
    } else {
      if (inList) { inList = false; elements.push("</ul>"); }
      if (trimmed === "") {
        if (i > 0 && i < lines.length - 1) elements.push(<br key={"br-"+i} />);
      } else {
        elements.push(<p key={"p-"+i} className="text-sm leading-relaxed">{renderInline(trimmed)}</p>);
      }
    }
  });
  if (inList) elements.push("</ul>");
  return elements;
}

function renderInline(text: string) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let idx = 0;
  while (remaining.length > 0) {
    const boldStart = remaining.indexOf("**");
    if (boldStart === -1) { parts.push(remaining); break; }
    const boldEnd = remaining.indexOf("**", boldStart + 2);
    if (boldEnd === -1) { parts.push(remaining); break; }
    if (boldStart > 0) parts.push(remaining.slice(0, boldStart));
    parts.push(<strong key={"b-"+idx}>{remaining.slice(boldStart + 2, boldEnd)}</strong>);
    remaining = remaining.slice(boldEnd + 2);
    idx++;
  }
  return parts.length > 0 ? parts : text;
}

`;

c = c.replace('function formatTime(', fn + 'function formatTime(');

// Replace the simple msg.content rendering with renderMarkdown
c = c.replace('<div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>', '<div className="text-sm leading-relaxed">{renderMarkdown(msg.content)}</div>');

fs.writeFileSync(p, c, 'utf8');
console.log('Markdown rendering added');
