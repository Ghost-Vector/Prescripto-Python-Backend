import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';

const DoctorList = () => {
    const { doctors, aToken, getAllDoctors, changeAvailablity } = useContext(AdminContext);

    useEffect(() => {
        if (aToken) {
            getAllDoctors();
        }
    }, [aToken, getAllDoctors]);

    return (
        <div>
            <div className='m-5 max-h-[90vh] overflow-y-scroll '>
                <h1 className='text-lg font-medium'>All Doctors</h1>
                <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
                    {doctors && doctors.length > 0 ? (
                        doctors.map((doctor) => (
                            <div className='border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group' key={doctor._id}>
                                <img className='bg-indigo-50 group-hover:bg-primary transition-all duration-500' src={doctor.image} alt={doctor.name} />
                                <div className='p-4'>
                                    <p className='text-neutral-800 text-lg font-medium'>{doctor.name}</p>
                                    <p className='text-zinc-600 text-sm'>{doctor.speciality}</p>
                                    <div className='mt-2 flex items-center gap-1 text-sm' >

                                        <input
                                            onChange={() => changeAvailablity(doctor._id)}
                                            type="checkbox"
                                            checked={doctor.available || false}
                                        />
                                        <p>Available</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No doctors found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorList;