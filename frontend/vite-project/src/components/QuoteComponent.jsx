import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { Pencil, Trash2, X, Camera, Check } from 'lucide-react'
import Loader from './Loader'

const QuoteComponent = ({ blockQuote, loading, error, onQuoteUpdated }) => {
    const [editing, setEditing] = useState(false);
    const [loadEdit, setLoadEdit] = useState(false);
    const [errorEdit, setErrorEdit] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [editingImage, setEditingImage] = useState(false);
    const [newImage, setNewImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);
    const [uploadError, setUploadError] = useState('');

    const [editedQuote, setEditedQuote] = useState({
        quote: '',
        author: ''
    });

    const defaultImage = 'http://localhost:5000/uploads/quotes/default.jpg'

    useEffect(() => {
        if (blockQuote && blockQuote.image) {
            const originalUrl = `http://localhost:5000${blockQuote.image}`;

            fetch(originalUrl, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        setImageUrl(originalUrl);
                    } else {
                        setImageUrl(defaultImage);
                    }
                })
                .catch(() => {
                    setImageUrl(defaultImage);
                });
        } else {
            setImageUrl(defaultImage);
        }
    }, [blockQuote]);

    // Actualizează starea locală atunci când blockQuote se schimbă
    useEffect(() => {
        if (blockQuote) {
            setEditedQuote({
                quote: blockQuote.quote,
                author: blockQuote.author
            });
        }
    }, [blockQuote]);

    // Curăță URL-ul de previzualizare când se închide editarea
    useEffect(() => {
        if (!editing && previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl('');
            setNewImage(null);
        }
    }, [editing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedQuote(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleEdit = () => {
        // Asigură-te că formularul începe cu valorile actuale
        if (blockQuote) {
            setEditedQuote({
                quote: blockQuote.quote,
                author: blockQuote.author
            });
        }
        setEditing(true);
        setUploadError(''); // Resetăm erorile de upload
    };

    const triggerFileInput = () => {

        if (fileInputRef.current) {
            // Resetăm valoarea pentru a permite selectarea aceluiași fișier de mai multe ori
            fileInputRef.current.value = '';
            // Simulăm un click pe input-ul de fișier
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {

        const file = e.target.files[0];
        if (file) {
            // Verificare dimensiune fișier (maxim 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setUploadError('Imaginea este prea mare. Dimensiunea maximă este de 5MB.');
                return;
            }

            // Verificare tip fișier
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                setUploadError('Tip de fișier nepermis. Încarcă o imagine JPG, PNG, WEBP sau GIF.');
                return;
            }

            setNewImage(file);
            setUploadError(''); // Resetăm erorile dacă totul e OK

            // Creează URL pentru previzualizare
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);


        }
    };

    const cancelImageEdit = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl('');
        }
        setNewImage(null);
        setEditingImage(false);
        setUploadError('');
    };

    const handleEdit = async () => {
        if (!blockQuote || !blockQuote._id) {
            console.error("Nu există un citat pentru editare");
            return;
        }

        setLoadEdit(true);
        setUploadError('');

        try {
            let res;

            if (newImage) {


                // Dacă există o nouă imagine, folosim FormData
                const formData = new FormData();
                formData.append('quote', editedQuote.quote);
                formData.append('author', editedQuote.author);
                formData.append('authorImage', newImage);

                // Log pentru a verifica ce conține FormData


                // Folosim endpoint-ul dedicat pentru upload, adica celgenerakl=
                res = await fetch(`http://localhost:5000/api/quotes/${blockQuote._id}`, {
                    method: 'PUT',
                    body: formData,
                });
            } else {


                // Dacă nu există o nouă imagine, folosim JSON normal
                res = await fetch(`http://localhost:5000/api/quotes/${blockQuote._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(editedQuote),
                });
            }

            // Verificăm răspunsul
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const responseData = await res.json();

                if (!res.ok) {
                    throw new Error(responseData.message || 'Failed to edit quote');
                }


                // Resetăm starea de editare a imaginii
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl('');
                }
                setNewImage(null);
                setEditingImage(false);
                setErrorEdit(false);

                // Apelează funcția pentru a actualiza starea din componenta părinte
                if (onQuoteUpdated) {
                    onQuoteUpdated(responseData);
                }
            } else {
                throw new Error('Răspuns neașteptat de la server');
            }
        } catch (error) {
            setErrorEdit(true);
            setUploadError(error.message || "A apărut o eroare la editare");
            console.error("Eroare la editare:", error.message);
        } finally {
            setLoadEdit(false);
            setEditing(false);
        }
    };

    const handleCancel = () => {
        setEditing(false);
        setEditingImage(false);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl('');
        }
        setNewImage(null);
        setUploadError('');
    };

    const handleDelete = async () => {
        if (!blockQuote || !blockQuote._id) return;

        if (window.confirm("Ești sigur că vrei să ștergi acest citat?")) {
            try {
                const res = await fetch(`http://localhost:5000/api/quotes/${blockQuote._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!res.ok) {
                    throw new Error('Failed to delete quote');
                }

                // Notifică componenta părinte să reîncarce datele
                if (onQuoteUpdated) {
                    onQuoteUpdated(null);
                }
                window.location.reload();
            } catch (error) {
                console.error(error.message);
            }
        }
    };

    return (
        <div className="max-w-2xl p-6 bg-white rounded-lg shadow-lg w-[350px] h-[300px] overflow-auto">
            {/* Input ascuns pentru încărcarea imaginii */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                aria-label="Selectează o imagine"
            />

            {loading ? (
                <Loader />
            ) : error ? (
                <p className="text-red-500">Error loading quote. Please try again later.</p>
            ) : editing ? (
                <div className="flex flex-col items-center">
                    <h2 className="text-2xl font-semibold mb-4">Edit Quote</h2>

                    {/* Imagine cu opțiuni de editare */}
                    <div className="relative mb-4 group">
                        <img
                            src={previewUrl || imageUrl}
                            alt={blockQuote.author}
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 shadow-md mx-auto cursor-pointer transition-all duration-300 hover:opacity-80"
                            onClick={triggerFileInput}
                            onError={(e) => {
                                console.log("Eroare la încărcarea imaginii");
                                e.target.src = defaultImage;
                                e.target.onerror = null;
                            }}
                        />
                        <div
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                            onClick={triggerFileInput}
                        >
                            <Camera className="text-white bg-black bg-opacity-50 p-1 rounded-full" size={24} />
                        </div>
                        {previewUrl && (
                            <button
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                onClick={cancelImageEdit}
                                aria-label="Anulează schimbarea imaginii"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Afișare erori upload */}
                    {uploadError && (
                        <p className="text-red-500 text-sm mb-2">{uploadError}</p>
                    )}

                    <textarea
                        className="border border-gray-300 rounded-lg p-4 mb-4 w-full"
                        name="quote"
                        id="quote"
                        value={editedQuote.quote || ''}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Introdu citatul aici..."
                    ></textarea>
                    <input
                        type="text"
                        name="author"
                        className="border border-gray-300 rounded-lg p-4 mb-4 w-full"
                        value={editedQuote.author || ''}
                        onChange={handleChange}
                        placeholder="Nume autor"
                    />
                    {errorEdit && (
                        <p className="text-red-500 mb-4">An error occurred while editing. Please try again.</p>
                    )}
                    <div className='flex justify-center gap-5 items-center mt-4'>
                        <button
                            className="bg-blue-900 text-white px-4 py-2 rounded-lg transition duration-300 ease-initial hover:bg-blue-700 disabled:bg-blue-300"
                            onClick={handleEdit}
                            disabled={loadEdit}
                        >
                            {loadEdit ? <Loader /> : <span>Save Changes</span>}
                        </button>

                        <button
                            className="bg-red-900 text-white px-4 py-2 rounded-lg transition duration-300 ease-initial hover:bg-red-700 disabled:bg-red-300"
                            onClick={handleCancel}
                            disabled={loadEdit}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : blockQuote ? (
                <div className="text-center flex flex-col items-center justify-between h-full">
                    <div className="image-container mb-4">
                        <img
                            src={imageUrl}
                            alt={blockQuote.author}
                            className="w-25 h-25 rounded-full object-cover border-2 border-gray-300 shadow-md mx-auto"
                            onError={(e) => {
                                console.log("Eroare la încărcarea imaginii în modul vizualizare");
                                e.target.src = defaultImage;
                                e.target.onerror = null;
                            }}
                        />
                    </div>
                    <div className="quote-content flex flex-col justify-center">
                        <h2 className="text-xl italic mb-3">"{blockQuote.quote}"</h2>
                        <p className="text-right font-semibold text-gray-700">— {blockQuote.author}</p>
                    </div>
                    <div className='flex justify-center gap-5 items-center mt-4'>
                        <button
                            className='text-blue-800 hover:text-blue-600 cursor-pointer transition duration-200 ease-linear hover:shadow-md hover:shadow-blue-800 p-2 rounded-md'
                            onClick={toggleEdit}
                        >
                            <Pencil />
                        </button>
                        <button
                            className='text-red-800 hover:text-red-600 cursor-pointer transition duration-200 ease-linear hover:shadow-md hover:shadow-red-800 p-2 rounded-md'
                            onClick={handleDelete}
                        >
                            <Trash2 />
                        </button>
                    </div>
                </div>
            ) : (
                <p>No quotes available. Try adding some!</p>
            )}
        </div>
    )
}

export default QuoteComponent