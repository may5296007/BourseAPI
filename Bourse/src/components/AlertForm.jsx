import React, { useState } from 'react';
import { toast } from 'react-toastify';

const AlertForm = ({ symbol, currentPrice }) => {
  const [alertType, setAlertType] = useState('above');
  const [priceTarget, setPriceTarget] = useState('');
  const [alerts, setAlerts] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!priceTarget || isNaN(parseFloat(priceTarget))) {
      toast.error('Veuillez entrer un prix valide');
      return;
    }

    const targetPrice = parseFloat(priceTarget);
    
    // Vérifier si le prix cible est logique par rapport au prix actuel
    if (alertType === 'above' && targetPrice <= currentPrice) {
      toast.warning(`Le prix cible doit être supérieur au prix actuel (${currentPrice})`);
      return;
    }

    if (alertType === 'below' && targetPrice >= currentPrice) {
      toast.warning(`Le prix cible doit être inférieur au prix actuel (${currentPrice})`);
      return;
    }

    // Vérifier si une alerte similaire existe déjà
    const alertExists = alerts.some(
      alert => 
        alert.symbol === symbol && 
        alert.type === alertType && 
        alert.targetPrice === targetPrice
    );

    if (alertExists) {
      toast.info('Cette alerte existe déjà');
      return;
    }

    // Ajouter la nouvelle alerte
    const newAlert = {
      id: Date.now(),
      symbol,
      type: alertType,
      targetPrice,
      created: new Date().toLocaleString()
    };

    setAlerts([...alerts, newAlert]);
    setPriceTarget('');
    toast.success(`Alerte créée pour ${symbol}`);
  };

  const deleteAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    toast.info('Alerte supprimée');
  };

  return (
    <div className="box">
      <h2 className="title is-4">Alertes de prix</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Type d'alerte</label>
          <div className="control">
            <div className="select is-fullwidth">
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
              >
                <option value="above">Prix dépasse</option>
                <option value="below">Prix descend sous</option>
              </select>
            </div>
          </div>
        </div>

        <div className="field">
          <label className="label">Prix cible (USD)</label>
          <div className="control">
            <input
              className="input"
              type="number"
              step="0.01"
              placeholder="Entrez le prix cible"
              value={priceTarget}
              onChange={(e) => setPriceTarget(e.target.value)}
            />
          </div>
          <p className="help">
            Prix actuel: ${currentPrice.toFixed(2)}
          </p>
        </div>

        <div className="field">
          <div className="control">
            <button type="submit" className="button is-info is-fullwidth">
              Créer une alerte
            </button>
          </div>
        </div>
      </form>

      <div className="content mt-5">
        <h3 className="title is-5">Alertes actives</h3>
        
        {alerts.length > 0 ? (
          <table className="table is-fullwidth">
            <thead>
              <tr>
                <th>Symbole</th>
                <th>Condition</th>
                <th>Prix</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(alert => (
                <tr key={alert.id}>
                  <td>{alert.symbol}</td>
                  <td>{alert.type === 'above' ? 'Dépasse' : 'Sous'}</td>
                  <td>${alert.targetPrice.toFixed(2)}</td>
                  <td>
                    <button
                      className="button is-small is-danger"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Aucune alerte active pour le moment</p>
        )}
      </div>
    </div>
  );
};

export default AlertForm;