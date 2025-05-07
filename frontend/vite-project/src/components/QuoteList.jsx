import { React, useState, useEffect } from 'react'
import QuoteComponent from './QuoteComponent'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const QuoteList = ({ quotes, loading, error, onQuoteUpdated }) => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setDark(true)
    } else setDark(false)
  }, [])

  return (
    <div>
      <ToastContainer />
      <div className='mt-10 flex flex-col justify-center items-center gap-4 flex-wrap md:flex-row'>
        {
          quotes.map((quote) => (
            <div key={quote._id} className="quote-item">
              <QuoteComponent blockQuote={quote} loading={loading} error={error} onQuoteUpdated={onQuoteUpdated} />
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default QuoteList