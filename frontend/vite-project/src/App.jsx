// App.jsx
import { useEffect, useState } from 'react';
import Header from './components/Header';
import { Routes, Route } from 'react-router-dom';
import QuoteList from './components/QuoteList';
import CreateQuote from './components/CreateQuote';
import Home from './pages/Home';

function App() {
  const [quoteList, setQuoteList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [blockQuote, setBlockQuote] = useState(null);

  const fetchQuote = async () => {
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/quotes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch quotes');
      }

      const data = await res.json();
      setQuoteList(data);

      if (data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        setBlockQuote(data[randomIndex]);
      } else {
        setBlockQuote(null);
      }

      setError(false);
    } catch (error) {
      console.error(error.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru actualizarea unui citat
  const handleQuoteUpdated = (updatedQuote) => {
    if (updatedQuote) {
      // Actualizează lista de citate
      setQuoteList(prevList =>
        prevList.map(quote =>
          quote._id === updatedQuote._id ? updatedQuote : quote
        )
      );

      // Actualizează citatul din blockQuote dacă este cel editat
      if (blockQuote && blockQuote._id === updatedQuote._id) {
        setBlockQuote(updatedQuote);
      }
    } else {
      // Dacă s-a șters un citat, reîncarcă toate citatele
      fetchQuote();
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="color-background color-text">
      <Header />

      <Routes>
        <Route
          path="/"
          element={
            <Home
              blockQuote={blockQuote}
              loading={loading}
              error={error}
              onQuoteUpdated={handleQuoteUpdated}
            />
          }
        />
        <Route
          path="/quote-list"
          element={
            <QuoteList
              quotes={quoteList}
              loading={loading}
              error={error}
              onQuoteUpdated={handleQuoteUpdated}
            />
          }
        />
        <Route
          path="/add-quote"
          element={
            <CreateQuote
            // onQuoteAdded={() => fetchQuote()}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;