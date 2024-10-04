export const fetchTONPrice = async (): Promise<number | null> => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd');
      const data = await response.json();
      return data['the-open-network'].usd;
    } catch (error) {
      console.error('Error fetching TON price:', error);
      return null;
    }
  };