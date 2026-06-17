import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const Tickets = () => {
    const { backendUrl, token } = useContext(AppContext)
    const [tickets, setTickets] = useState([])
    const [subject, setSubject] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('General')
    const [priority, setPriority] = useState('medium')
    const [loading, setLoading] = useState(false)

    const fetchTickets = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/tickets/list`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setTickets(data.tickets)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to fetch support tickets")
        }
    }

    const raiseTicket = async (e) => {
        e.preventDefault()
        if (!subject.trim() || !description.trim()) {
            return toast.warn("Please fill in all fields")
        }

        setLoading(true)
        try {
            const { data } = await axios.post(`${backendUrl}/api/tickets/create`, {
                subject,
                description,
                category,
                priority
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                toast.success(data.message)
                setSubject('')
                setDescription('')
                setCategory('General')
                setPriority('medium')
                fetchTickets()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to submit ticket")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (token) {
            fetchTickets()
        }
    }, [token])

    return (
        <div className='py-8 min-h-[80vh]'>
            <div className='border-b pb-4 mb-8'>
                <h1 className='text-3xl font-semibold text-neutral-800'>Customer Support</h1>
                <p className='text-gray-500 mt-1'>Raise a support request or track the status of your existing tickets.</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                {/* Raise Ticket Form */}
                <div className='lg:col-span-1 bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm h-fit'>
                    <h2 className='text-xl font-medium text-neutral-800 mb-4'>Raise a Ticket</h2>
                    <form onSubmit={raiseTicket} className='flex flex-col gap-4'>
                        <div>
                            <label className='text-sm font-medium text-gray-700'>Subject</label>
                            <input
                                className='border border-zinc-300 rounded-lg w-full p-2.5 mt-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all'
                                type="text"
                                placeholder="E.g., Payment failed but debited"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-3'>
                            <div>
                                <label className='text-sm font-medium text-gray-700'>Category</label>
                                <select
                                    className='border border-zinc-300 rounded-lg w-full p-2.5 mt-1 outline-none'
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="General">General</option>
                                    <option value="Booking">Booking</option>
                                    <option value="Payment">Payment</option>
                                    <option value="Doctor">Doctor Profile</option>
                                    <option value="Technical">Technical Issue</option>
                                </select>
                            </div>
                            <div>
                                <label className='text-sm font-medium text-gray-700'>Priority</label>
                                <select
                                    className='border border-zinc-300 rounded-lg w-full p-2.5 mt-1 outline-none'
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className='text-sm font-medium text-gray-700'>Description</label>
                            <textarea
                                className='border border-zinc-300 rounded-lg w-full p-2.5 mt-1 h-32 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none'
                                placeholder="Describe your issue in detail..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type='submit'
                            disabled={loading}
                            className='bg-primary text-white w-full py-3 rounded-lg font-medium hover:bg-opacity-95 transition-all shadow-sm disabled:bg-gray-400'
                        >
                            {loading ? "Submitting..." : "Submit Ticket"}
                        </button>
                    </form>
                </div>

                {/* Tickets History List */}
                <div className='lg:col-span-2 flex flex-col gap-4'>
                    <h2 className='text-xl font-medium text-neutral-800 mb-2'>Your Tickets ({tickets.length})</h2>
                    {tickets.length === 0 ? (
                        <div className='flex flex-col items-center justify-center py-16 border border-dashed rounded-2xl bg-gray-50'>
                            <p className='text-gray-400'>You haven't raised any support tickets yet.</p>
                        </div>
                    ) : (
                        <div className='flex flex-col gap-4'>
                            {tickets.map((ticket) => (
                                <div key={ticket.id} className='bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300'>
                                    <div className='flex flex-wrap items-start justify-between gap-2 border-b pb-3 mb-3'>
                                        <div>
                                            <span className='text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 mr-2 uppercase'>
                                                {ticket.category}
                                            </span>
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${
                                                ticket.priority === 'high' ? 'bg-red-50 text-red-600' :
                                                ticket.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                                                'bg-green-50 text-green-600'
                                            }`}>
                                                {ticket.priority} Priority
                                            </span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase ${
                                                ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                ticket.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className='text-lg font-semibold text-neutral-800'>{ticket.subject}</h3>
                                    <p className='text-sm text-gray-600 mt-2 whitespace-pre-line'>{ticket.description}</p>

                                    {ticket.assignedTo && (
                                        <div className='mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg inline-block'>
                                            <span className='font-semibold'>Assigned to:</span> {ticket.assignedTo}
                                        </div>
                                    )}

                                    {ticket.response ? (
                                        <div className='mt-4 bg-green-50/50 border border-green-100 rounded-lg p-4'>
                                            <p className='text-xs font-semibold text-green-800 uppercase tracking-wide'>Admin Response</p>
                                            <p className='text-sm text-neutral-800 mt-1'>{ticket.response}</p>
                                        </div>
                                    ) : (
                                        <div className='mt-4 text-xs text-amber-600 italic bg-amber-50/30 p-2.5 rounded border border-amber-100/50 w-fit'>
                                            Awaiting administrative response.
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Tickets
