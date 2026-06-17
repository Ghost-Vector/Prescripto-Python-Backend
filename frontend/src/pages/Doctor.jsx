import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Doctor = () => {
    const navigate = useNavigate()
    const { doctors } = useContext(AppContext)
    const { speciality } = useParams()
    const [filterDoc, setFilterDoc] = useState([])
    const [showFilter, setShowFilter] = useState(false)

    useEffect(() => {
        if (!doctors || doctors.length === 0) return // Prevent errors if doctors data is not available

        if (speciality) {
            const filtered = doctors.filter(doc =>
                doc.speciality.toLowerCase() === speciality.toLowerCase() // Case-insensitive comparison
            )
            setFilterDoc(filtered.length ? filtered : doctors) // Show all doctors if no match
        } else {
            setFilterDoc(doctors)
        }
    }, [doctors, speciality])

    return (
        <div>
            <p className='text-gray-600'>Browse through the doctor speciality.</p>
            <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>

                <button className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-primary text-white' : ' '}`} onClick={() => setShowFilter((prev => !prev))}>
                    Filter
                </button>

                {/* Sidebar for Specialties */}
                <div className={`flex flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
                    <p
                        onClick={() => navigate(speciality === 'General Physician' ? `/doctors` : `/doctors/General Physician`)}
                        className={`w-[94wv] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "General Physician" ? "bg-indigo-100 text-black" : ""}`}>
                        General Physician
                    </p>

                    <p
                        onClick={() => navigate(speciality === 'Gynecologist' ? `/doctors` : `/doctors/Gynecologist`)}
                        className={`w-[94w] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Gynecologist" ? "bg-indigo-100 text-black" : ""}`}>
                        Gynecologist
                    </p>

                    <p
                        onClick={() => navigate(speciality === 'Dermatologist' ? `/doctors` : `/doctors/Dermatologist`)}
                        className={`w-[94w] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Dermatologist" ? "bg-indigo-100 text-black" : ""}`}>
                        Dermatologist
                    </p>

                    <p
                        onClick={() => navigate(speciality === 'Pediatricians' ? `/doctors` : `/doctors/Pediatricians`)}
                        className={`w-[94w] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Pediatricians" ? "bg-indigo-100 text-black" : ""}`}>
                        Pediatrician
                    </p>

                    <p
                        onClick={() => navigate(speciality === 'Neurologist' ? `/doctors` : `/doctors/Neurologist`)}
                        className={`w-[94w] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Neurologist" ? "bg-indigo-100 text-black" : ""}`}>
                        Neurologist
                    </p>

                    <p
                        onClick={() => navigate(speciality === 'Gastroenterologist' ? `/doctors` : `/doctors/Gastroenterologist`)}
                        className={`w-[94w] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "Gastroenterologist" ? "bg-indigo-100 text-black" : ""}`}>
                        Gastroenterologist
                    </p>
                </div>

                {/* Doctors List */}
                <div className='w-full grid grid-cols-auto gap-4 '>
                    {filterDoc.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(`/appointment/${item._id}`)}
                            className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-500'
                        >
                            <img className='bg-blue-50' src={item.image} alt={item.name} />
                            <div className='p-4'>
                                <div className={`flex items-center gap-2 text-sm ${item.available ? 'text-green-500' : 'text-gray-500'} text-center`}>
                                    <p className={`w-2 h-2 ${item.available ? 'bg-green-500' : 'bg-gray-500'} rounded-full`}></p>
                                    <p>{item.available ? 'Available' : 'Not Available'}</p>
                                </div>
                                <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                                <p className='text-gray-600 text-sm'>{item.speciality}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Doctor