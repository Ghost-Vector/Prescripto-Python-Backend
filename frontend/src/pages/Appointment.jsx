import React, { useContext, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets_frontend/assets'
import RelatedDoctor from '../components/RelatedDoctor'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Appointment = () => {
    const { docId } = useParams()
    const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext)
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const navigate = useNavigate()

    const [docInfo, setDocInfo] = useState(null)
    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')

    const fetchDocInfo = async () => {
        if (doctors && doctors.length > 0) {
            const docInfo = doctors.find(doc => doc._id === docId)
            setDocInfo(docInfo)
        }
    }

    const getAvailableSlots = () => {
        if (!docInfo || !docInfo.slots_booked) {
            setDocSlots([])
            return
        }

        let today = new Date();
        let slots = [];

        for (let i = 0; i < 7; i++) {
            let currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);
            currentDate.setHours(10, 0, 0, 0); // Start at 10 AM
            let endTime = new Date(currentDate);
            endTime.setHours(21, 0, 0, 0); // End at 9 PM

            let timeSlots = [];
            while (currentDate < endTime) {

                const formatedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                let day = currentDate.getDate();
                let month = currentDate.getMonth() + 1;
                let year = currentDate.getFullYear();
                const slotDate = `${day}_${month}_${year}`
                const slotTime = formatedTime

                const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true

                if (isSlotAvailable) {
                    timeSlots.push({
                        datetime: new Date(currentDate),
                        time: formatedTime,

                    });
                }

                // timeSlots.push({
                //     datetime: new Date(currentDate),
                //     time: formatedTime,

                // });




                currentDate.setMinutes(currentDate.getMinutes() + 30);
            }

            slots.push(timeSlots);
        }

        // Immediately filter today's past slots
        filterPastSlots(slots);
    };

    // Function to filter past slots dynamically
    const filterPastSlots = (slots) => {
        const now = new Date();
        const updatedSlots = slots.map((daySlots, index) => {
            if (index === 0) { // Only filter today's slots
                return daySlots.filter(slot => slot.datetime > now);
            }
            return daySlots;
        });

        setDocSlots(updatedSlots);
    };

    // Run getAvailableSlots once on mount
    useEffect(() => {
        getAvailableSlots();
    }, []);

    // Periodically update to filter past slots when docSlots updates
    useEffect(() => {
        if (docSlots.length === 0) return;
        const interval = setInterval(() => {
            filterPastSlots(docSlots);
        }, 60000);
        return () => clearInterval(interval);
    }, [docSlots]);

    const bookAppointment = async () => {
        if (!token) {
            toast.warn('Please login to book an appointment')
            return navigate('/login')
        }

        try {
            const date = docSlots[slotIndex][0].datetime
            let day = date.getDate()
            let month = date.getMonth() + 1
            let year = date.getFullYear()

            const slotDate = `${day}_${month}_${year}`

            const { data } = await axios.post(
                backendUrl + '/api/user/book-appointment',
                {
                    docId,
                    slotDate,
                    slotTime
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (data.success) {
                toast.success(data.message)
                getDoctorsData()
                navigate('/my-appointment')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to book appointment')
        }
    }

    useEffect(() => {
        fetchDocInfo()
    }, [doctors, docId])

    useEffect(() => {
        getAvailableSlots()  // Function call was missing
    }, [docInfo])

    return docInfo && (
        <div>
            {/* Doctor Details */}
            <div className='flex flex-col sm:flex-row gap-4'>
                <div>
                    <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt={docInfo.name} />
                </div>
                <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0 '>
                    <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'> {docInfo.name}
                        <img className='w-5' src={assets.verified_icon} alt="" />
                    </p>
                    <div className='flex items-center gap-2 text-sm text-gray-600 mt-1'>
                        <p>{docInfo.degree} - {docInfo.speciality}</p>
                        <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
                    </div>

                    {/* Doctor About Section */}
                    <div>
                        <p className='flex item-center gap-1 text-sm font-medium text-gray-900 mt-3'>About <img src={assets.info_icon} alt="" /></p>
                        <p className='text-sm text-gray-500 max-w-[-700px] mt-1'>{docInfo.about}</p>
                    </div>
                    <p className='text-gray-500 font-medium mt-4'>
                        Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
                    </p>
                </div>
            </div>

            {/* Booking slot */}
            <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
                <p>Booking Slots</p>
                <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
                    {
                        docSlots.length > 0 && docSlots.map((daySlots, index) => (
                            <div
                                key={index}
                                className={`text-center py-6 min-w-16 rounded-full cursor-pointer 
                        ${slotIndex === index ? 'bg-blue-600 text-white' : 'border border-gray-400 text-gray-700'}`}
                                onClick={() => setSlotIndex(index)}>
                                <p className="text-sm font-medium">{daySlots[0] && dayOfWeek[daySlots[0].datetime.getDay()]}</p>
                                <p className="text-lg font-semibold">{daySlots[0] && daySlots[0].datetime.getDate()}</p>
                            </div>
                        ))
                    }
                </div>
                <div className='flex items-center gap-3 mt-4 w-full overflow-x-scroll'>
                    {docSlots.length > 0 && docSlots[slotIndex].map((item, index) => (
                        <p onClick={() => setSlotTime(item.time)} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`} key={index}>
                            {item.time.toLowerCase()}
                        </p>
                    ))}
                </div>
                <button className='bg-primary text-white text-white text-sm font-light px-14 py-3 rounded-full my-6' onClick={bookAppointment}>Book an appointment</button>
            </div>
            {/* lisiting realted doctor*/}
            <RelatedDoctor speciality={docInfo.speciality} docId={docId} />

        </div>
    )
}

export default Appointment
