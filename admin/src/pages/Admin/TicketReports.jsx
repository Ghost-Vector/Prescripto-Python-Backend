import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const TicketReports = () => {
    const { aToken, backendUrl } = useContext(AdminContext)
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchReport = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(`${backendUrl}/api/tickets/admin/report`, {
                headers: { aToken }
            })
            if (data.success) {
                setReport(data.report)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load reporting dashboard")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (aToken) {
            fetchReport()
        }
    }, [aToken])

    if (loading) {
        return (
            <div className='m-5 flex items-center justify-center h-[60vh] w-full'>
                <p className='text-gray-400 text-lg'>Loading reporting analytics...</p>
            </div>
        )
    }

    if (!report) {
        return (
            <div className='m-5 flex items-center justify-center h-[60vh] w-full'>
                <p className='text-gray-400 text-lg'>No data available.</p>
            </div>
        )
    }

    const { total, status, priority, categories } = report

    // Helper to calculate percentages
    const pct = (val) => total > 0 ? ((val / total) * 100).toFixed(1) : 0

    return (
        <div className='m-5 w-full max-w-5xl'>
            <div className='mb-6'>
                <h1 className='text-2xl font-semibold text-neutral-800'>Support Tickets Analytics</h1>
                <p className='text-sm text-gray-500 mt-1'>Detailed report on customer support requests, priority distribution, and resolution performance.</p>
            </div>

            {/* Top Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8'>
                <div className='bg-white p-5 rounded-xl border border-gray-100 shadow-sm'>
                    <p className='text-sm text-gray-500 font-medium'>Total Tickets Raised</p>
                    <p className='text-3xl font-bold text-neutral-800 mt-2'>{total}</p>
                </div>
                <div className='bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-gray-400'>
                    <p className='text-sm text-gray-500 font-medium'>Open Tickets</p>
                    <p className='text-3xl font-bold text-neutral-800 mt-2'>{status.open}</p>
                    <p className='text-xs text-gray-400 mt-1'>{pct(status.open)}% of total</p>
                </div>
                <div className='bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500'>
                    <p className='text-sm text-gray-500 font-medium'>Assigned Tickets</p>
                    <p className='text-3xl font-bold text-neutral-800 mt-2'>{status.assigned}</p>
                    <p className='text-xs text-gray-400 mt-1'>{pct(status.assigned)}% of total</p>
                </div>
                <div className='bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-green-500'>
                    <p className='text-sm text-gray-500 font-medium'>Resolved Tickets</p>
                    <p className='text-3xl font-bold text-neutral-800 mt-2'>{status.resolved}</p>
                    <p className='text-xs text-gray-400 mt-1'>{pct(status.resolved)}% resolution rate</p>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Priority Distribution */}
                <div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm'>
                    <h2 className='text-lg font-semibold text-neutral-800 mb-5'>Priority Breakdown</h2>
                    <div className='flex flex-col gap-4'>
                        {/* High Priority */}
                        <div>
                            <div className='flex justify-between text-sm mb-1'>
                                <span className='font-medium text-red-600'>High Priority</span>
                                <span className='text-gray-500'>{priority.high} ({pct(priority.high)}%)</span>
                            </div>
                            <div className='w-full bg-gray-100 h-2.5 rounded-full overflow-hidden'>
                                <div style={{ width: `${pct(priority.high)}%` }} className='bg-red-500 h-full rounded-full'></div>
                            </div>
                        </div>

                        {/* Medium Priority */}
                        <div>
                            <div className='flex justify-between text-sm mb-1'>
                                <span className='font-medium text-amber-600'>Medium Priority</span>
                                <span className='text-gray-500'>{priority.medium} ({pct(priority.medium)}%)</span>
                            </div>
                            <div className='w-full bg-gray-100 h-2.5 rounded-full overflow-hidden'>
                                <div style={{ width: `${pct(priority.medium)}%` }} className='bg-amber-500 h-full rounded-full'></div>
                            </div>
                        </div>

                        {/* Low Priority */}
                        <div>
                            <div className='flex justify-between text-sm mb-1'>
                                <span className='font-medium text-green-600'>Low Priority</span>
                                <span className='text-gray-500'>{priority.low} ({pct(priority.low)}%)</span>
                            </div>
                            <div className='w-full bg-gray-100 h-2.5 rounded-full overflow-hidden'>
                                <div style={{ width: `${pct(priority.low)}%` }} className='bg-green-500 h-full rounded-full'></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Distribution */}
                <div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm'>
                    <h2 className='text-lg font-semibold text-neutral-800 mb-5'>Category Distribution</h2>
                    {Object.keys(categories).length === 0 ? (
                        <p className='text-gray-400 text-sm'>No category details available.</p>
                    ) : (
                        <div className='flex flex-col gap-4'>
                            {Object.entries(categories).map(([cat, count]) => (
                                <div key={cat}>
                                    <div className='flex justify-between text-sm mb-1'>
                                        <span className='font-medium text-gray-700 capitalize'>{cat}</span>
                                        <span className='text-gray-500'>{count} ({pct(count)}%)</span>
                                    </div>
                                    <div className='w-full bg-gray-100 h-2.5 rounded-full overflow-hidden'>
                                        <div style={{ width: `${pct(count)}%` }} className='bg-primary h-full rounded-full'></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TicketReports
