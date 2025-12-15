import React, { useState } from 'react';
import './App.css'; // Seu CSS normal

function App() {
  const [contador, setContador] = useState(0);

  return (
    <div className="container-principal">
      <h1>Painel de Controle (Web)</h1>
      <p>Você clicou {contador} vezes.</p>
      
      <button onClick={() => setContador(contador + 1)}>
        Aumentar Contagem
      </button>
    </div>
  );
}

export default App;