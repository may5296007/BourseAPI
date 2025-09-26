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
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const ForecastComponent = ({ symbol, apiKey }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        // Récupérer les données historiques journalières
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${apiKey}`
        );
        
        if (response.data['Time Series (Daily)']) {
          const timeSeries = response.data['Time Series (Daily)'];
          const dataPoints = [];
          
          // Convertir les données en format utilisable
          Object.keys(timeSeries).forEach(date => {
            dataPoints.push({
              date,
              close: parseFloat(timeSeries[date]['4. close']),
            });
          });
          
          // Trier par date (de la plus ancienne à la plus récente)
          dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
          
          // Prendre les 30 derniers jours
          const last30Days = dataPoints.slice(-30);
          setHistoricalData(last30Days);
          
          // Générer une prévision simple basée sur les moyennes mobiles
          generateForecast(last30Days);
        } else if (response.data.Note) {
          setError("Limite d'API atteinte. Veuillez réessayer plus tard.");
        } else {
          setError("Aucune donnée disponible pour ce symbole.");
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
  }, [symbol, apiKey]);

  // Fonction pour générer une prévision simple basée sur des moyennes mobiles
  const generateForecast = (data) => {
    if (!data || data.length < 5) return;
    
    // Calculer la moyenne mobile sur 5 jours
    const movingAvg5 = calculateMovingAverage(data, 5);
    
    // Calculer la moyenne mobile sur 10 jours
    const movingAvg10 = calculateMovingAverage(data, 10);
    
    // Utiliser la différence entre ces moyennes pour prédire la tendance
    const lastPrice = data[data.length - 1].close;
    const trend = movingAvg5 > movingAvg10 ? 'up' : 'down';
    
    // Calculer la variation moyenne des 5 derniers jours
    const last5Days = data.slice(-5);
    let avgChange = 0;
    
    for (let i = 1; i < last5Days.length; i++) {
      avgChange += last5Days[i].close - last5Days[i-1].close;
    }
    avgChange = avgChange / 4; // Moyenne des changements quotidiens
    
    // Ajuster la variation en fonction de la tendance
    const changeMultiplier = trend === 'up' ? 1.1 : 0.9;
    const adjustedChange = avgChange * changeMultiplier;
    
    // Générer des prévisions pour les 7 prochains jours
    const forecastData = [];
    let previousDay = new Date(data[data.length - 1].date);
    let previousPrice = lastPrice;
    
    for (let i = 1; i <= 7; i++) {
      // Calculer la date de la prévision
      const nextDay = new Date(previousDay);
      nextDay.setDate(nextDay.getDate() + 1);
      
      // Ajuster le prix en ajoutant la variation moyenne, avec un peu d'aléatoire
      const randomFactor = 0.5 + Math.random(); // Entre 0.5 et 1.5
      const priceChange = adjustedChange * randomFactor;
      const predictedPrice = previousPrice + priceChange;
      
      // Formater la date
      const forecastDate = nextDay.toISOString().split('T')[0];
      
      // Ajouter aux données de prévision
      forecastData.push({
        date: forecastDate,
        forecast: predictedPrice,
      });
      
      previousDay = nextDay;
      previousPrice = predictedPrice;
    }
    
    setForecast(forecastData);
  };

  // Fonction pour calculer une moyenne mobile
  const calculateMovingAverage = (data, period) => {
    if (data.length < period) return 0;
    
    const lastNDays = data.slice(-period);
    const sum = lastNDays.reduce((total, day) => total + day.close, 0);
    return sum / period;
  };

  // Formatage des données pour l'affichage
  const prepareChartData = () => {
    if (historicalData.length === 0) return [];
    
    // Prendre seulement les 14 derniers jours d'historique
    const recentHistory = historicalData.slice(-14);
    
    // Combiner l'historique et les prévisions
    const chartData = [...recentHistory.map(item => ({
      date: formatDate(item.date),
      close: item.close,
      forecast: null
    }))];
    
    // Ajouter les données de prévision
    forecast.forEach(item => {
      chartData.push({
        date: formatDate(item.date),
        close: null,
        forecast: item.forecast
      });
    });
    
    return chartData;
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  if (loading) {
    return (
      <div className="box">
        <div className="has-text-centered my-5">
          <button className="button is-loading is-white">Chargement</button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="box">
        <div className="notification is-danger">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (historicalData.length === 0) {
    return (
      <div className="box">
        <div className="notification is-warning">
          <p>Données insuffisantes pour générer des prévisions.</p>
        </div>
      </div>
    );
  }

  const chartData = prepareChartData();
  const lastRealPrice = historicalData[historicalData.length - 1].close;
  const predictedPrices = forecast.map(item => item.forecast);
  const lastPredictedPrice = predictedPrices[predictedPrices.length - 1];
  const priceChange = lastPredictedPrice - lastRealPrice;
  const percentChange = (priceChange / lastRealPrice) * 100;
  const isPositive = percentChange >= 0;

  return (
    <div className="box">
      <h2 className="title is-4">Prévisions sur 7 jours</h2>
      
      <div className="notification is-light is-info">
        <p className="has-text-weight-bold">
          Note: Ces prévisions sont basées sur des moyennes mobiles simples et ne constituent pas des conseils financiers.
        </p>
      </div>
      
      <div className="content mb-4">
        <h3 className="title is-5">
          Tendance prévue: 
          <span className={isPositive ? 'has-text-success' : 'has-text-danger'}>
            {isPositive ? ' Hausse ' : ' Baisse '}
            ({percentChange.toFixed(2)}%)
          </span>
        </h3>
        <p>
          Prix actuel: <strong>${lastRealPrice.toFixed(2)}</strong>
        </p>
        <p>
          Prix prévu (dans 7 jours): 
          <strong className={isPositive ? 'has-text-success' : 'has-text-danger'}>
            {' $'}{lastPredictedPrice.toFixed(2)}
            {' ('}{isPositive ? '+' : ''}{priceChange.toFixed(2)}{')'}
          </strong>
        </p>
      </div>
      
      <div className="chart-container" style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => value ? [`$${value.toFixed(2)}`] : ['N/A']} />
            <Legend />
            <ReferenceLine x={formatDate(historicalData[historicalData.length - 1].date)} 
              stroke="#888" strokeDasharray="3 3" 
              label={{ value: 'Aujourd\'hui', position: 'top' }} />
            <Line 
              type="monotone" 
              dataKey="close" 
              stroke="#3273dc" 
              name="Historique" 
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="forecast" 
              stroke="#ff9234" 
              strokeDasharray="5 5"
              name="Prévision" 
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForecastComponent;