// Home.jsx
import React, { useEffect, useState } from 'react';
import QuoteComponent from '../components/QuoteComponent';

const Home = ({ blockQuote, loading, error, onQuoteUpdated }) => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setDark(true)
    } else setDark(false)
  }, [])

  return (
    <section className={`flex flex-col items-center justify-center p-8 ${dark && "bg-gray-800 text-white"}`}>
      <h1 className="text-3xl font-bold mb-8">Welcome, user to QuotezApp</h1>

      <QuoteComponent blockQuote={blockQuote} loading={loading} error={error} onQuoteUpdated={onQuoteUpdated} />

    </section>
  );
};

export default Home;