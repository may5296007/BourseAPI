import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import 'bulma/css/bulma.min.css';
import './styles/App.css';

import Header from './components/Header';
import SearchBar from './components/SearchBar';
import StockInfoCard from './components/StockInfoCard';
import ChartComponent from './components/ChartComponent';
import AlertForm from './components/AlertForm';
import ForecastComponent from './components/ForecastComponent';

// Importer les services financiers compatibles navigateur
import { getQuote, getHistoricalData } from './FinanceService';

function App() {
  const [stockSymbol, setStockSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [timeInterval, setTimeInterval] = useState('1d'); // Pour le graphique
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = (symbol) => {
    setStockSymbol(symbol);
    // Mise à jour de l'historique des recherches
    if (!searchHistory.includes(symbol)) {
      setSearchHistory([...searchHistory, symbol]);
    }
  };

  const addToFavorites = (symbol) => {
    if (!favorites.includes(symbol)) {
      setFavorites([...favorites, symbol]);
    }
  };

  const removeFromFavorites = (symbol) => {
    setFavorites(favorites.filter(fav => fav !== symbol));
  };

  useEffect(() => {
    const fetchStockData = async () => {
      if (!stockSymbol) return;
        
      setLoading(true);
      setError('');
        
      try {
        // Récupérer les données avec notre API financière compatible navigateur
        const data = await getQuote(stockSymbol);
        console.log("Données récupérées pour StockInfoCard:", data);
        
        // Ajouter cette vérification pour vous assurer que les données sont valides
        if (data && data['01. symbol']) {
          setStockData(data);
        } else {
          console.error("Format de données invalide:", data);
          setError(`Données incomplètes pour ${stockSymbol}`);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setError(`Impossible de récupérer les données pour ${stockSymbol}`);
      } finally {
        setLoading(false);
      }
    };
  
    fetchStockData();
  }, [stockSymbol]);
  
  return (
    <div className="App">
      <Header />
      <ToastContainer position="top-right" autoClose={5000} />
      
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column is-3">
              {/* Sidebar avec favoris et historique */}
              <div className="box">
                <h2 className="title is-4">Favoris</h2>
                <div className="content">
                  {favorites.length > 0 ? (
                    <ul>
                      {favorites.map(fav => (
                        <li key={fav}>
                          <button 
                            className="button is-small is-link is-light mr-2"
                            onClick={() => handleSearch(fav)}
                          >
                            {fav}
                          </button>
                          <button 
                            className="button is-small is-danger is-light"
                            onClick={() => removeFromFavorites(fav)}
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Aucun favori pour le moment</p>
                  )}
                </div>
              </div>

              <div className="box mt-4">
                <h2 className="title is-4">Historique</h2>
                <div className="content">
                  {searchHistory.length > 0 ? (
                    <ul>
                      {searchHistory.map(item => (
                        <li key={item}>
                          <button 
                            className="button is-small is-link is-light"
                            onClick={() => handleSearch(item)}
                          >
                            {item}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Aucune recherche récente</p>
                  )}
                </div>
              </div>
            </div>

            <div className="column is-9">
              <SearchBar onSearch={handleSearch} />
              
              {loading && (
                <div className="has-text-centered my-5">
                  <button className="button is-loading is-large is-white">Chargement</button>
                </div>
              )}

              {error && (
                <div className="notification is-danger">
                  <p>{error}</p>
                </div>
              )}

              {stockSymbol && !loading && !error && (
                <>
                  <div className="columns">
                    <div className="column">
                      {stockData ? (
                        <StockInfoCard 
                          stockData={stockData} 
                          symbol={stockSymbol} 
                          onAddToFavorites={() => addToFavorites(stockSymbol)}
                          isFavorite={favorites.includes(stockSymbol)}
                        />
                      ) : (
                        <div className="box">
                          <div className="notification is-warning">
                            <p>Aucune donnée disponible pour {stockSymbol}.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {stockData && (
                    <>
                      <div className="columns">
                        <div className="column">
                          <div className="box" id="graphiques">
                            <h2 className="title is-4">Performance</h2>
                            <div className="tabs">
                              <ul>
                                <li className={timeInterval === '1d' ? 'is-active' : ''}>
                                  <a onClick={() => setTimeInterval('1d')}>1 jour</a>
                                </li>
                                <li className={timeInterval === '1w' ? 'is-active' : ''}>
                                  <a onClick={() => setTimeInterval('1w')}>1 semaine</a>
                                </li>
                                <li className={timeInterval === '1m' ? 'is-active' : ''}>
                                  <a onClick={() => setTimeInterval('1m')}>1 mois</a>
                                </li>
                                <li className={timeInterval === '1y' ? 'is-active' : ''}>
                                  <a onClick={() => setTimeInterval('1y')}>1 an</a>
                                </li>
                              </ul>
                            </div>
                            <WebChartComponent 
                              symbol={stockSymbol} 
                              interval={timeInterval}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="columns">
                        <div className="column is-6">
                          <div className="box" id="alertes">
                            <AlertForm 
                              symbol={stockSymbol} 
                              currentPrice={parseFloat(stockData['05. price']) || 0}
                            />
                          </div>
                        </div>
                        <div className="column is-6">
                          <div className="box" id="previsions">
                            <WebForecastComponent 
                              symbol={stockSymbol}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Composant de graphique compatible navigateur
const WebChartComponent = ({ symbol, interval }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChartData = async () => {
      if (!symbol) return;
      
      setLoading(true);
      setError('');
      
      try {
        const data = await getHistoricalData(symbol, interval);
        setChartData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données du graphique:", error);
        setError("Impossible de charger les données du graphique");
      } finally {
        setLoading(false);
      }
    };
    
    fetchChartData();
  }, [symbol, interval]);

  if (loading) {
    return (
      <div className="has-text-centered my-5">
        <button className="button is-loading is-white">Chargement</button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notification is-warning">
        <p>{error}</p>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="notification is-warning">
        <p>Aucune donnée disponible pour {symbol} sur cet intervalle.</p>
      </div>
    );
  }

  // Ici, vous intégreriez votre code de graphique Recharts
  // Exemple simplifié pour démontrer que les données sont disponibles
  return (
    <div className="chart-content">
      <div className="notification is-info">
        <p>Données disponibles pour {symbol} - {chartData.length} points</p>
        <p>Premier point: {chartData[0].date} - Prix: ${chartData[0].close}</p>
        <p>Dernier point: {chartData[chartData.length-1].date} - Prix: ${chartData[chartData.length-1].close}</p>
      </div>
    </div>
  );
};

// Composant de prévision simplifié compatible navigateur
const WebForecastComponent = ({ symbol }) => {
  return (
    <div>
      <h2 className="title is-4">Prévisions sur 7 jours</h2>
      <div className="notification is-info">
        <p>Fonctionnalité en développement</p>
        <p>Les prévisions pour {symbol} seront disponibles prochainement</p>
      </div>
    </div>
  );
};

export default App;