import React from 'react'
import QuoteComponent from './QuoteComponent'

const QuoteList = ({ quotes, loading, error, onQuoteUpdated }) => {

  return (
    <div className='mt-10 flex flex-col justify-center items-center gap-4 flex-wrap md:flex-row'>
      {
        quotes.map((quote) => (
          <div key={quote._id} className="quote-item">
            <QuoteComponent blockQuote={quote} loading={loading} error={error} onQuoteUpdated={onQuoteUpdated} />
          </div>
        ))
      }
    </div>
  )
}

export default QuoteList
