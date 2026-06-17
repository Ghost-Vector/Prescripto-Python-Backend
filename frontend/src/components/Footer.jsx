import React from 'react'
import { assets } from '../assets/assets_frontend/assets'

const Footer = () => {
    return (
        <div className='md:mx-10'>
            <div className='flex flex-col sm:grid grid-cols-1 sm:grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

                {/* Left section */}
                <div>
                    <img className='mb-5 w-40' src={assets.logo} alt="Logo" />
                    <p className='w-full md:w-2/3 text-gray-600 leading-6'>
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                    </p>
                </div>

                {/* Middle section */}
                <div>
                    <p className='text-xl font-medium mb-5'>COMPANY</p>
                    <ul className='flex flex-col gap-2 text-gray-600 cursor-pointer'>
                        <li className='hover:text-gray-900 transition'>Home</li>
                        <li className='hover:text-gray-900 transition'>About us</li>
                        <li className='hover:text-gray-900 transition'>Contact us</li>
                        <li className='hover:text-gray-900 transition'>Privacy policy</li>
                    </ul>
                </div>

                {/* Right section */}
                <div>
                    <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li>📞 +91 1234567890</li>
                        <li>📩 getprincedev@gmail.com</li>
                    </ul>
                </div>
            </div>

            {/* Bottom section */}
            <div>
                <hr className='border-gray-300' />
                <p className='py-5 text-sm text-center text-gray-600'>
                    © 2025 All rights reserved | This template is made with ❤️ by Prince
                </p>
            </div>
        </div>
    )
}

export default Footer;
