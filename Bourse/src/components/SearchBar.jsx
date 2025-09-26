import React, { useState } from 'react';
import { searchSymbol } from '../FinanceService';

const SearchBar = ({ onSearch }) => {
  const [symbol, setSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!symbol.trim()) {
      setError('Veuillez entrer un symbole d\'action');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      console.log("Recherche pour:", symbol);
      
      // Recherche simple pour les symboles courants (évite un appel API inutile)
      const knownSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'IBM', 'NFLX', 'INTC'];
      if (knownSymbols.includes(symbol.toUpperCase())) {
        console.log("Symbole connu trouvé, utilisation directe");
        onSearch(symbol.toUpperCase());
        setIsLoading(false);
        return;
      }
      
      // Recherche avec notre API compatible navigateur
      const results = await searchSymbol(symbol);
      
      if (results && results.length > 0) {
        // Chercher une correspondance exacte d'abord
        const exactMatch = results.find(
          result => result.symbol.toUpperCase() === symbol.toUpperCase()
        );
        
        if (exactMatch) {
          console.log("Correspondance exacte trouvée:", exactMatch.symbol);
          onSearch(exactMatch.symbol);
        } else {
          // Sinon utiliser le premier résultat
          console.log("Premier résultat utilisé:", results[0].symbol);
          onSearch(results[0].symbol);
        }
      } else {
        setError('Aucun résultat trouvé. Essayez AAPL, MSFT, GOOGL, AMZN, TSLA ou META.');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      
      // En cas d'erreur, essayer directement le symbole saisi
      if (symbol.length <= 5 && /^[A-Za-z]+$/.test(symbol)) {
        console.log("Tentative directe avec le symbole saisi:", symbol.toUpperCase());
        onSearch(symbol.toUpperCase());
      } else {
        setError('Erreur de recherche. Essayez un symbole connu comme AAPL (Apple) ou MSFT (Microsoft).');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="box">
      <form onSubmit={handleSubmit}>
        <div className="field has-addons">
          <div className="control is-expanded">
            <input
              className={`input ${error ? 'is-danger' : ''}`}
              type="text"
              placeholder="Entrez un symbole d'action (ex: AAPL, TSLA, MSFT)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
            {error && <p className="help is-danger">{error}</p>}
          </div>
          <div className="control">
            <button 
              type="submit" 
              className={`button is-info ${isLoading ? 'is-loading' : ''}`}
              disabled={isLoading}
            >
              <span className="icon">
                <i className="fas fa-search"></i>
              </span>
              <span>Rechercher</span>
            </button>
          </div>
        </div>
      </form>
      <p className="help">
        Symboles populaires: AAPL (Apple), MSFT (Microsoft), TSLA (Tesla), AMZN (Amazon), GOOGL (Google), META (Meta/Facebook)
      </p>
    </div>
  );
};

export default SearchBar;