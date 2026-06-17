import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets_frontend/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyApponitment = () => {
    const { userData, setUserData, token, backendUrl, loadUserProfile } = useContext(AppContext)
    const [isEdit, setIsEdit] = useState(false)
    const [image, setImage] = useState(false)
    const [editData, setEditData] = useState({ ...userData })

    // Update editData when userData changes
    useEffect(() => {
        if (userData) {
            setEditData({ ...userData })
        }
    }, [userData])

    const updateUserProfileData = async () => {
        try {
            const formData = new FormData()
            formData.append('name', editData.name)
            formData.append('phone', editData.phone)
            formData.append('address', JSON.stringify(editData.address))
            formData.append('dob', editData.dob)
            formData.append('gender', editData.gender)

            image && formData.append('image', image)

            const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (data.success) {
                toast.success(data.message)
                await loadUserProfile()
                setIsEdit(false)
                setImage(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Failed to update profile')
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setEditData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleAddressChange = (e, line) => {
        setEditData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [line]: e.target.value
            }
        }))
    }

    return userData && (
        <div className='max-w-lg flex flex-col gap-2 text-sm'>
            {
                isEdit
                    ? <label htmlFor='image'>
                        <div className='inline-block realtive cursor-pointer'>
                            <img className='w-36 rounded opacity-75' src={image ? URL.createObjectURL(image) : userData.image} alt="" />
                            <img className='w-10 absolute bottom-12 right-12' src={image ? '' : assets.upload_icon} alt="" />
                        </div>
                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
                    </label>
                    : <img className='w-36 rounded' src={userData.image} alt="" />
            }

            {
                isEdit ? <input
                    className='bg-gray-50 text-3xl font-medium max-w-60 mt-4'
                    type="input"
                    name="name"
                    value={editData.name || ''}
                    onChange={handleInputChange}
                />
                    : <p className='font-medium text-3xl text-neutral-800 mt-4'>{userData.name}</p>
            }
            <hr className='bg-zinc-400 h-[1px] border-none' />
            <div>
                <p className='text-neutral-500 underline mt-3'>CONTACT INFORMATION</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
                    <p className='font-medium'>Email id:</p>
                    <p className='text-blue-500'>{userData.email}</p>
                    <p className='font-medium'>Phone</p>
                    {
                        isEdit ? <input
                            className='bg-gray-100 max-w-52'
                            type="input"
                            name="phone"
                            value={editData.phone || ''}
                            onChange={handleInputChange}
                        />
                            : <p className='text-blue-500'>{userData.phone}</p>
                    }
                    <p className='font-medium'>Address</p>
                    {
                        isEdit
                            ? <p>
                                <input
                                    className='bg-gray-50'
                                    onChange={(e) => handleAddressChange(e, 'line1')}
                                    value={editData.address?.line1 || ''}
                                    type="text"
                                />
                                <br />
                                <input
                                    className='bg-gray-50'
                                    onChange={(e) => handleAddressChange(e, 'line2')}
                                    value={editData.address?.line2 || ''}
                                    type="text"
                                />
                            </p>
                            : <p className='text-gray-500'>
                                {userData.address?.line1}
                                <br />
                                {userData.address?.line2}
                            </p>
                    }
                </div>
            </div>

            <div>
                <p className='text-neutral-500 underline mt-3'>BASIC INFORMATION</p>
                <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
                    <p className='font-medium'>Gender:</p>
                    {
                        isEdit ? <select
                            className='max-w-20 bg-gray-100'
                            name="gender"
                            value={editData.gender || ''}
                            onChange={handleInputChange}
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                            : <p className='text-gray-400'>{userData.gender}</p>
                    }
                    <p className='font-medium'>Birthday:</p>
                    {
                        isEdit
                            ? <input
                                className='max-w-28 bg-gray-100'
                                type="date"
                                name="dob"
                                value={editData.dob || ''}
                                onChange={handleInputChange}
                            />
                            : <p className='text-gray-400'>{userData.dob}</p>
                    }
                </div>
            </div>

            <div className='mt-10'>
                {
                    isEdit
                        ? <button
                            className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition'
                            onClick={updateUserProfileData}
                        >
                            Save information
                        </button>
                        : <button
                            className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition'
                            onClick={() => setIsEdit(true)}
                        >
                            edit
                        </button>
                }
            </div>
        </div>
    )
}

export default MyApponitment