import React from 'react';

const StockInfoCard = ({ stockData, symbol, onAddToFavorites, isFavorite }) => {
  console.log("Données reçues dans StockInfoCard:", stockData);

  // Extraire les valeurs en sécurité, quels que soient les noms des propriétés
  const price = stockData['05. price'] || stockData.price || 0;
  const priceChange = stockData['09. change'] || stockData.change || 0;
  const changePercent = parseFloat(
    typeof stockData['10. change percent'] === 'string' 
      ? stockData['10. change percent'].replace('%', '') 
      : stockData.changesPercentage || 0
  );
  const isPositive = priceChange >= 0;
  
  // Extraction sécurisée des autres données
  const open = stockData['02. open'] || stockData.open || 0;
  const high = stockData['03. high'] || stockData.dayHigh || stockData.high || 0;
  const low = stockData['04. low'] || stockData.dayLow || stockData.low || 0;
  const volume = stockData['06. volume'] || stockData.volume || 0;
  const latestDay = stockData['07. latest trading day'] || stockData.date || new Date().toISOString().split('T')[0];
  const prevClose = stockData['08. previous close'] || stockData.previousClose || 0;

  return (
    <div className="box">
      <div className="columns is-vcentered">
        <div className="column">
          <h2 className="title is-3">{symbol}</h2>
          <p className="subtitle is-5">{symbol}</p>
        </div>
        <div className="column has-text-right">
          <button 
            className={`button ${isFavorite ? 'is-warning' : 'is-light'}`}
            onClick={onAddToFavorites}
          >
            <span className="icon">
              <i className="fas fa-star"></i>
            </span>
            <span>{isFavorite ? 'Favori' : 'Ajouter aux favoris'}</span>
          </button>
        </div>
      </div>

      <div className="columns">
        <div className="column">
          <div className="content">
            <h3 className="title is-4">{parseFloat(price).toFixed(2)} USD</h3>
            <p className={`subtitle ${isPositive ? 'has-text-success' : 'has-text-danger'}`}>
              {isPositive ? '+' : ''}{parseFloat(priceChange).toFixed(2)} USD ({isPositive ? '+' : ''}{parseFloat(changePercent).toFixed(2)}%)
            </p>
          </div>
        </div>
        <div className="column">
          <div className="content">
            <p><strong>Ouverture:</strong> {parseFloat(open).toFixed(2)} USD</p>
            <p><strong>Haut:</strong> {parseFloat(high).toFixed(2)} USD</p>
            <p><strong>Bas:</strong> {parseFloat(low).toFixed(2)} USD</p>
          </div>
        </div>
        <div className="column">
          <div className="content">
            <p><strong>Volume:</strong> {parseInt(volume).toLocaleString()}</p>
            <p><strong>Dernier jour:</strong> {latestDay}</p>
            <p><strong>Clôture précédente:</strong> {parseFloat(prevClose).toFixed(2)} USD</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockInfoCard;