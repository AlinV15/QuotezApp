import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className='flex justify-between items-center p-4 color-primary color-secondary shadow-blue-950 shadow-md montserrat-font '>
        <h1 className="poppins-bold text-3xl "><Link to={"/"}>QuotezApp</Link></h1>
      <nav className='flex gap-4 text-amber-100'>
        <Link to={"/quote-list"} className='hover:text-amber-200 hover:underline hover:decoration-solid hover:transition hover:duration-200 hover:shadow-md hover:ease-in-out hover:shadow-black p-3'>Quotes List</Link>
        <Link to={"/add-quote"} className='hover:text-amber-200 hover:underline hover:decoration-solid hover:transition hover:duration-200 hover:shadow-md hover:ease-in-out hover:shadow-black p-3'>Add Quote</Link>
      </nav>
    </header>
  )
}

export default Header
