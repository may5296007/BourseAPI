// Service compatible navigateur pour l'API Yahoo Finance
import axios from 'axios';

// API proxy pour éviter les problèmes CORS
const YAHOO_PROXY = 'https://yfapi.net';
const RAPID_API_KEY = 'votre_clé_api'; // Vous devrez obtenir une clé gratuite sur RapidAPI

// Alternative : utiliser une API publique gratuite sans proxy
// Cette méthode est moins fiable mais ne nécessite pas de clé API
export const getQuote = async (symbol) => {
  try {
    // Utiliser l'API gratuite financialmodelingprep.com
    const response = await axios.get(
      `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=demo`
    );
    
    console.log("Données FMP reçues:", response.data);
    
    if (response.data && response.data.length > 0) {
      const data = response.data[0];
      
      // Convertir au format attendu par l'application
      return {
        '01. symbol': data.symbol,
        '02. open': data.open,
        '03. high': data.dayHigh,
        '04. low': data.dayLow,
        '05. price': data.price,
        '06. volume': data.volume,
        '07. latest trading day': data.date,
        '08. previous close': data.previousClose,
        '09. change': data.change,
        '10. change percent': data.changesPercentage + '%'
      };
    }
    throw new Error("Pas de données disponibles");
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    throw error;
  }
};

// Rechercher un symbole
export const searchSymbol = async (query) => {
  try {
    // Utiliser l'API gratuite financialmodelingprep.com
    const response = await axios.get(
      `https://financialmodelingprep.com/api/v3/search?query=${query}&limit=10&apikey=demo`
    );
    
    console.log("Résultats de recherche:", response.data);
    
    if (response.data && response.data.length > 0) {
      return response.data.map(item => ({
        symbol: item.symbol,
        name: item.name,
        exchange: item.exchange,
        type: item.type
      }));
    }
    return [];
  } catch (error) {
    console.error("Erreur lors de la recherche de symbole:", error);
    throw error;
  }
};

// Obtenir des données historiques pour les graphiques
export const getHistoricalData = async (symbol, interval) => {
  try {
    // Déterminer la période en fonction de l'intervalle
    let timeseries = 'daily';
    
    switch (interval) {
      case '1d':
        timeseries = 'daily'; // Pas d'intraday gratuit disponible
        break;
      case '1w':
        timeseries = 'daily';
        break;
      case '1m':
        timeseries = 'daily';
        break;
      case '1y':
        timeseries = 'daily';
        break;
      default:
        timeseries = 'daily';
    }
    
    // Utiliser l'API gratuite financialmodelingprep.com
    const response = await axios.get(
      `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=demo`
    );
    
    console.log("Données historiques reçues:", response.data);
    
    if (response.data && response.data.historical) {
      // Limiter les données en fonction de l'intervalle
      let limit;
      switch (interval) {
        case '1d':
          limit = 1;
          break;
        case '1w':
          limit = 7;
          break;
        case '1m':
          limit = 30;
          break;
        case '1y':
          limit = 365;
          break;
        default:
          limit = 30;
      }
      
      // Obtenir les dernières données jusqu'à la limite
      const historicalData = response.data.historical
        .slice(0, limit)
        .reverse()
        .map(item => ({
          date: item.date,
          close: item.close,
          open: item.open,
          high: item.high,
          low: item.low,
          volume: item.volume
        }));
      
      return historicalData;
    }
    throw new Error("Pas de données historiques disponibles");
  } catch (error) {
    console.error("Erreur lors de la récupération des données historiques:", error);
    throw error;
  }
};

export default {
  getQuote,
  getHistoricalData,
  searchSymbol
};