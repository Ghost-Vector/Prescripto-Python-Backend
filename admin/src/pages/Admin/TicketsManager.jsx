import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const TicketsManager = () => {
    const { aToken, backendUrl, doctors, getAllDoctors } = useContext(AdminContext)
    const [tickets, setTickets] = useState([])
    const [activeTab, setActiveTab] = useState('all') // all, open, resolved
    const [resolvingTicketId, setResolvingTicketId] = useState(null)
    const [responseMessage, setResponseMessage] = useState('')

    const fetchTickets = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/tickets/admin/list`, {
                headers: { aToken }
            })
            if (data.success) {
                setTickets(data.tickets)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load tickets")
        }
    }

    const assignTicket = async (ticketId, assignee) => {
        if (!assignee) return
        try {
            const { data } = await axios.post(`${backendUrl}/api/tickets/admin/assign`, {
                ticketId,
                assignedTo: assignee
            }, {
                headers: { aToken }
            })
            if (data.success) {
                toast.success(data.message)
                fetchTickets()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to assign ticket")
        }
    }

    const resolveTicket = async (ticketId) => {
        if (!responseMessage.trim()) {
            return toast.warn("Please type a resolution message")
        }
        try {
            const { data } = await axios.post(`${backendUrl}/api/tickets/admin/resolve`, {
                ticketId,
                response: responseMessage
            }, {
                headers: { aToken }
            })
            if (data.success) {
                toast.success(data.message)
                setResolvingTicketId(null)
                setResponseMessage('')
                fetchTickets()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to resolve ticket")
        }
    }

    useEffect(() => {
        if (aToken) {
            fetchTickets()
            getAllDoctors()
        }
    }, [aToken])

    const filteredTickets = tickets.filter(t => {
        if (activeTab === 'open') return t.status !== 'resolved'
        if (activeTab === 'resolved') return t.status === 'resolved'
        return true
    })

    return (
        <div className='m-5 w-full max-w-6xl'>
            <div className='flex justify-between items-center mb-6'>
                <div>
                    <h1 className='text-2xl font-semibold text-neutral-800'>Support Tickets Manager</h1>
                    <p className='text-sm text-gray-500 mt-1'>Manage, assign, and resolve user-raised support requests.</p>
                </div>

                <div className='flex bg-white rounded-lg border p-1 shadow-sm'>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-primary text-white' : 'text-gray-600 hover:text-neutral-800'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab('open')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'open' ? 'bg-primary text-white' : 'text-gray-600 hover:text-neutral-800'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setActiveTab('resolved')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'resolved' ? 'bg-primary text-white' : 'text-gray-600 hover:text-neutral-800'}`}
                    >
                        Resolved
                    </button>
                </div>
            </div>

            {filteredTickets.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-20 bg-white border rounded-xl shadow-sm'>
                    <p className='text-gray-400 text-lg'>No tickets found in this tab.</p>
                </div>
            ) : (
                <div className='flex flex-col gap-5'>
                    {filteredTickets.map((ticket) => (
                        <div key={ticket.id} className='bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300'>
                            <div className='flex flex-wrap items-center justify-between gap-3 border-b pb-4 mb-4'>
                                <div className='flex items-center gap-3'>
                                    <span className='text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 uppercase'>
                                        {ticket.category}
                                    </span>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${
                                        ticket.priority === 'high' ? 'bg-red-50 text-red-600' :
                                        ticket.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                                        'bg-green-50 text-green-600'
                                    }`}>
                                        {ticket.priority}
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

                            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                                <div className='md:col-span-2'>
                                    <h3 className='text-lg font-bold text-neutral-800'>{ticket.subject}</h3>
                                    <p className='text-sm text-gray-600 mt-2 whitespace-pre-line bg-gray-50/50 p-3 rounded-lg border border-gray-100'>
                                        {ticket.description}
                                    </p>
                                    
                                    <div className='flex flex-wrap gap-4 mt-3 text-xs text-gray-500'>
                                        <p><span className='font-medium'>Raised by:</span> {ticket.userName} ({ticket.userEmail})</p>
                                    </div>

                                    {ticket.response && (
                                        <div className='mt-4 bg-green-50 border border-green-100 rounded-lg p-4'>
                                            <p className='text-xs font-bold text-green-800 uppercase tracking-wide'>Resolution Details</p>
                                            <p className='text-sm text-neutral-800 mt-1'>{ticket.response}</p>
                                        </div>
                                    )}
                                </div>

                                <div className='border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 flex flex-col gap-4 justify-between'>
                                    <div>
                                        <label className='text-xs font-bold text-gray-500 uppercase block mb-1.5'>Assign Ticket</label>
                                        <select
                                            disabled={ticket.status === 'resolved'}
                                            value={ticket.assignedTo || ''}
                                            onChange={(e) => assignTicket(ticket.id, e.target.value)}
                                            className='border rounded-lg p-2 text-sm w-full bg-white outline-none cursor-pointer disabled:bg-gray-50 disabled:text-gray-400'
                                        >
                                            <option value="">-- Unassigned --</option>
                                            <option value="Admin">Admin</option>
                                            {doctors.map(doc => (
                                                <option key={doc.id} value={doc.email}>
                                                    Dr. {doc.name} ({doc.speciality})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {ticket.status !== 'resolved' && (
                                        <div>
                                            {resolvingTicketId === ticket.id ? (
                                                <div className='flex flex-col gap-2 mt-2'>
                                                    <textarea
                                                        value={responseMessage}
                                                        onChange={(e) => setResponseMessage(e.target.value)}
                                                        placeholder="Type resolution response..."
                                                        className='border rounded-lg p-2 text-sm w-full h-24 outline-none resize-none'
                                                    />
                                                    <div className='flex gap-2'>
                                                        <button
                                                            onClick={() => resolveTicket(ticket.id)}
                                                            className='bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-green-700 transition-all flex-1'
                                                        >
                                                            Submit
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setResolvingTicketId(null)
                                                                setResponseMessage('')
                                                            }}
                                                            className='border text-gray-600 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-50 transition-all'
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setResolvingTicketId(ticket.id)}
                                                    className='bg-primary text-white w-full py-2 rounded-lg text-sm font-medium hover:bg-opacity-95 transition-all shadow-sm'
                                                >
                                                    Resolve Ticket
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default TicketsManager
