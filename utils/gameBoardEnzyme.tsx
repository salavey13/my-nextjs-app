// lib/gameBoardEnzyme.ts
export const gameBoardEnzyme = (card, currentPlayer) => {
    let normalizedPosition = card.position;
  
    // If the current player has an inverted perspective (Player 2)
    if (currentPlayer === "player2") {
      normalizedPosition = {
        x: 1 - card.position.x,  // Horizontal flip
        y: 1 - card.position.y   // Vertical flip
      };
    }
  
    // Return the card with updated position for the current player’s perspective
    return {
      ...card,
      position: normalizedPosition
    };
  };
  