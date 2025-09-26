import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const ChartComponent = ({ symbol, interval, apiKey }) => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      let timeSeriesFunction;
      let timeSeriesKey;
      
      // Définir la fonction API et la clé correspondante en fonction de l'intervalle
      switch (interval) {
        case '1d':
          timeSeriesFunction = 'TIME_SERIES_INTRADAY';
          timeSeriesKey = 'Time Series (5min)';
          break;
        case '1w':
          timeSeriesFunction = 'TIME_SERIES_DAILY';
          timeSeriesKey = 'Time Series (Daily)';
          break;
        case '1m':
          timeSeriesFunction = 'TIME_SERIES_DAILY';
          timeSeriesKey = 'Time Series (Daily)';
          break;
        case '1y':
          timeSeriesFunction = 'TIME_SERIES_MONTHLY';
          timeSeriesKey = 'Monthly Time Series';
          break;
        default:
          timeSeriesFunction = 'TIME_SERIES_DAILY';
          timeSeriesKey = 'Time Series (Daily)';
      }

      // Construire l'URL de l'API
      let apiUrl = `https://www.alphavantage.co/query?function=${timeSeriesFunction}&symbol=${symbol}`;
      
      // Ajouter des paramètres supplémentaires en fonction de l'intervalle
      if (interval === '1d') {
        apiUrl += '&interval=5min&outputsize=compact';
      } else if (interval === '1w' || interval === '1m') {
        apiUrl += '&outputsize=compact';
      }
      
      apiUrl += `&apikey=${apiKey}`;

      try {
        const response = await axios.get(apiUrl);
        
        if (response.data[timeSeriesKey]) {
          const timeSeries = response.data[timeSeriesKey];
          const formattedData = [];
          
          // Limiter le nombre de points de données en fonction de l'intervalle
          let dataLimit;
          switch (interval) {
            case '1d':
              dataLimit = 78; // Environ 6.5 heures de trading (5 min par point)
              break;
            case '1w':
              dataLimit = 7;
              break;
            case '1m':
              dataLimit = 30;
              break;
            case '1y':
              dataLimit = 12;
              break;
            default:
              dataLimit = 30;
          }

          // Formater les données pour Recharts
          Object.keys(timeSeries)
            .slice(0, dataLimit)
            .reverse()
            .forEach(date => {
              const dataPoint = {
                date: formatDate(date, interval),
                close: parseFloat(timeSeries[date]['4. close']),
                open: parseFloat(timeSeries[date]['1. open']),
                high: parseFloat(timeSeries[date]['2. high']),
                low: parseFloat(timeSeries[date]['3. low']),
                volume: parseFloat(timeSeries[date]['5. volume'])
              };
              formattedData.push(dataPoint);
            });

          setStockData(formattedData);
        } else if (response.data.Note) {
          setError("Limite d'API atteinte. Veuillez réessayer plus tard.");
        } else {
          setError("Aucune donnée disponible pour cet intervalle.");
        }
      } catch (err) {
        setError("Erreur lors de la récupération des données.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchData();
    }
  }, [symbol, interval, apiKey]);

  // Fonction pour formater la date selon l'intervalle
  const formatDate = (dateString, interval) => {
    const date = new Date(dateString);
    
    switch (interval) {
      case '1d':
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      case '1w':
      case '1m':
        return `${date.getDate()}/${date.getMonth() + 1}`;
      case '1y':
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        return months[date.getMonth()];
      default:
        return dateString;
    }
  };

  if (loading) {
    return (
      <div className="has-text-centered my-5">
        <button className="button is-loading is-white">Chargement</button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notification is-danger">
        <p>{error}</p>
      </div>
    );
  }

  if (stockData.length === 0) {
    return (
      <div className="notification is-warning">
        <p>Aucune donnée disponible pour {symbol} sur cet intervalle.</p>
      </div>
    );
  }

  // Calculer les valeurs min et max pour l'axe Y
  const allPrices = stockData.flatMap(item => [item.high, item.low]);
  const minPrice = Math.min(...allPrices) * 0.995; // Ajouter une marge de 0.5%
  const maxPrice = Math.max(...allPrices) * 1.005; // Ajouter une marge de 0.5%

  return (
    <div className="chart-container" style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={stockData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="date" 
            padding={{ left: 10, right: 10 }}
          />
          <YAxis 
            domain={[minPrice, maxPrice]} 
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <Tooltip 
            formatter={(value) => [`$${value.toFixed(2)}`, 'Prix']}
            labelFormatter={(value) => `Date: ${value}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="close" 
            stroke="#3273dc" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            name="Prix de clôture"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartComponent;