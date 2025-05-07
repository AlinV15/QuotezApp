import { Moon, Sun } from 'lucide-react'
import { React, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const Header = ({ handleChangeTheme }) => {  // Corectarea destructurării
  const [dark, setDark] = useState(false);

  // Sincronizează starea locală cu starea din App
  const toggleTheme = () => {
    setDark(!dark);
    handleChangeTheme();  // Acum poți folosi funcția corect
  }

  return (
    <header className={`flex justify-between items-center p-4 shadow-md montserrat-font ${!dark ? "bg-secondary color-primary shadow-[#4ECDC4]" : "bg-primary color-secondary shadow-blue-950"}`} >
      <h1 className="poppins-bold text-3xl "><Link to={"/"}>QuotezApp</Link></h1>
      <nav className={`flex gap-4 ${!dark ? "text-gray-700" : "text-amber-50"}`} >
        <Link to={"/quote-list"} className={`${!dark ? "hover:text-gray-800" : "hover:text-amber-200"} hover:underline hover:decoration-solid hover:transition hover:duration-200 hover:shadow-md hover:ease-in-out hover:shadow-black p-3`}>Quotes List</Link>
        <Link to={"/add-quote"} className={`${!dark ? "hover:text-gray-800" : "hover:text-amber-200"} hover:underline hover:decoration-solid hover:transition hover:duration-200 hover:shadow-md hover:ease-in-out hover:shadow-black p-3`}>Add Quote</Link>
      </nav>
      <div>
        <button onClick={toggleTheme}>
          {!dark ? <Moon className='text-white hover:text-yellow-300 cursor-pointer transition ease-in-out duration-300 ' /> : <Sun className='text-amber-50 hover:text-amber-300 cursor-pointer ' />}
        </button>
      </div>
    </header>
  )
}

export default Header