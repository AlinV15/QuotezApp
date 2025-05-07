import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X } from 'lucide-react';
import Loader from './Loader';
import { z } from 'zod';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Schema Zod pentru validarea citatului
const quoteSchema = z.object({
  quote: z.string({
    required_error: "Quote text is required"
  }).min(5, "Quote cannot be less than 5 characters"),
  author: z.string({
    required_error: "Author is required"
  }).min(2, "Author cannot have less than 2 characters")
});

const CreateQuote = ({ onQuoteAdded }) => {
  // State-uri pentru formular
  const [formData, setFormData] = useState({
    quote: '',
    author: ''
  });
  const [authorImage, setAuthorImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadError, setUploadError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setDark(true)
    } else setDark(false)
  }, [])


  // Actualizează starea formularului când se modifică un câmp
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Șterge eroarea pentru câmpul modificat
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Declanșează dialogul de selectare a fișierului
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Procesează schimbarea imaginii
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verificare dimensiune fișier (maxim 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Imaginea este prea mare. Dimensiunea maximă este de 5MB.');
        toast.error('Imaginea este prea mare. Dimensiunea maximă este de 5MB.', {
          position: "top-right",
          autoClose: 5000
        });
        return;
      }

      // Verificare tip fișier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Tip de fișier nepermis. Încarcă o imagine JPG, PNG, WEBP sau GIF.');
        toast.error('Tip de fișier nepermis. Încarcă o imagine JPG, PNG, WEBP sau GIF.', {
          position: "top-right",
          autoClose: 5000
        });
        return;
      }

      setAuthorImage(file);
      setUploadError('');

      // Create a preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);

      toast.info('Imagine nouă selectată', {
        position: "top-right",
        autoClose: 2000
      });
    }
  };

  // Validează formularul folosind schema Zod
  const validateForm = () => {
    try {
      quoteSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = {};
        error.errors.forEach(err => {
          const path = err.path[0];
          formattedErrors[path] = err.message;

          // Afișăm fiecare eroare ca un toast
          toast.error(`${err.message}`, {
            position: "top-right",
            autoClose: 5000
          });
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  // Anulează selecția imaginii
  const cancelImageSelection = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    setAuthorImage(null);
    setUploadError('');
    toast.info('Modificarea imaginii a fost anulată', {
      position: "top-right",
      autoClose: 2000
    });
  };

  // Gestionează trimiterea formularului
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validează formularul înainte de trimitere
    if (!validateForm()) return;

    setLoading(true);
    setError(false);
    setUploadError('');

    try {
      // Create a FormData object to send both text and file data
      const submitData = new FormData();
      submitData.append('quote', formData.quote);
      submitData.append('author', formData.author);

      if (authorImage) {
        submitData.append('authorImage', authorImage);
      }

      // Send the data to the server
      const response = await fetch('http://localhost:5000/api/quotes', {
        method: 'POST',
        body: submitData,
        // Do not set Content-Type header when sending FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save quote');
      }

      const data = await response.json();

      // Reset the form and states
      setFormData({ quote: '', author: '' });
      setAuthorImage(null);
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }
      setError(false);

      // Call the callback function to update quotes in parent component
      if (onQuoteAdded) {
        onQuoteAdded();
      }

      // Afișăm un toast de succes înainte de navigare
      toast.success("Citatul a fost creat cu succes!", {
        position: "top-right",
        autoClose: 300,
        onClose: () => {
          // Navigăm doar după ce toastul se închide
          navigate('/');
        }
      });
    } catch (err) {
      console.error(err.message);
      setError(true);
      setUploadError(err.message);

      // Afișăm un toast de eroare
      toast.error(`Eroare la salvare: ${err.message}`, {
        position: "top-right",
        autoClose: 500
      });
    } finally {
      setLoading(false);
    }
  };

  // Gestionează anularea formularului
  const handleCancel = () => {
    // Curățăm resursele înainte de a naviga înapoi
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }

    toast.info("Acțiune anulată", {
      position: "top-right",
      autoClose: 200,
      onClose: () => navigate('/')
    });
  };

  return (
    <section className={`max-w-xl mx-auto mt-8 p-6 rounded-lg shadow-lg ${dark && "bg-gray-800 text-white"}`}>
      <ToastContainer />

      <h2 className="text-2xl font-semibold text-center mb-6 poppins-regular">Create a Quote</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selector de imagine modern */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <div
              onClick={triggerFileInput}
              className={`w-24 h-24 rounded-full border-2 ${previewImage ? 'border-blue-500' : 'border-gray-300'} flex items-center justify-center cursor-pointer hover:opacity-90 transition-all duration-300 overflow-hidden shadow-md `}
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Author preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="text-gray-400" size={32} />
              )}

              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Camera className="text-white" size={24} />
              </div>
            </div>

            {previewImage && (
              <button
                type="button"
                onClick={cancelImageSelection}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
          />

          <p className="text-sm text-gray-500 mt-2">
            {previewImage ? 'Click pe imagine pentru a schimba' : 'Click pentru a încărca o imagine de autor'}
          </p>

          {uploadError && (
            <p className="text-red-500 text-sm mt-1">{uploadError}</p>
          )}
        </div>

        {/* Câmp pentru citat */}
        <div className="space-y-2">
          <label htmlFor="quote" className="block text-sm font-medium text-gray-700 montserrat-font">
            Citat:
          </label>
          <textarea
            name="quote"
            id="quote"
            value={formData.quote}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Introdu citatul aici..."
            className={`w-full border ${errors.quote ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 libre-regular focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
          />
          {errors.quote && (<p className='text-red-600 text-sm'>{errors.quote}</p>)}
        </div>

        {/* Câmp pentru autor */}
        <div className="space-y-2">
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 montserrat-font">
            Autor:
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            placeholder="Numele autorului"
            className={`w-full border ${errors.author ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 libre-regular focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
          />
          {errors.author && (<p className='text-red-600 text-sm'>{errors.author}</p>)}
        </div>

        {/* Mesaj de eroare general */}
        {error && (
          <div className="text-red-600 text-center">
            Error saving quote. Please try again.
          </div>
        )}

        {/* Butoane */}
        <div className="flex justify-center gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center min-w-[100px]"
          >
            {loading ? <Loader /> : <span>Save</span>}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="bg-red-900 text-white px-6 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-red-700 disabled:bg-red-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateQuote;