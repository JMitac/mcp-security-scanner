/**
 * COMPONENTE CON VULNERABILIDADES INTENCIONALES
 * Solo para pruebas del MCP Security Scanner
 * ⚠️ NO USAR EN PRODUCCIÓN
 */

import { useState } from 'react';

interface CommentProps {
  userInput: string;
}

// 🔴 VULNERABILIDAD: XSS via dangerouslySetInnerHTML sin sanitizar
export function VulnerableComment({ userInput }: CommentProps) {
  return (
    <div className="comment">
      <h3>Comentario del usuario:</h3>
      {/* ⚠️ VULNERABLE: No sanitiza el HTML del usuario */}
      <div dangerouslySetInnerHTML={{ __html: userInput }} />
    </div>
  );
}

// 🔴 VULNERABILIDAD: innerHTML directo
export function VulnerableInnerHTML() {
  const [content, setContent] = useState('');

  const updateContent = (userContent: string) => {
    const element = document.getElementById('output');
    if (element) {
      // ⚠️ VULNERABLE: Asignación directa a innerHTML
      element.innerHTML = userContent;
    }
  };

  return (
    <div>
      <input 
        type="text" 
        onChange={(e) => setContent(e.target.value)} 
        placeholder="Escribe algo..."
      />
      <button onClick={() => updateContent(content)}>Mostrar</button>
      <div id="output"></div>
    </div>
  );
}

export default VulnerableComment;
