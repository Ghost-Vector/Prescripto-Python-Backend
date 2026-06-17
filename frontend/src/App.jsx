import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/home'
import Doctor from './pages/Doctor'
import Login from './pages/Login'
import About from './pages/About'
import Contatct from './pages/Contatct'
import Profile from './pages/Profile'
import MyApponitment from './pages/MyApponitment'
import Appointment from './pages/Appointment'
import Tickets from './pages/Tickets'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <div className='mx4 sm:mx-[10%]'>
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/doctors' element={<Doctor />} />
        <Route path='/doctors/:speciality' element={<Doctor />} />
        <Route path='/login' element={<Login />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contatct />} />
        <Route path='/my-profile' element={<Profile />} />
        <Route path='/my-appointment' element={<MyApponitment />} />
        <Route path='/my-tickets' element={<Tickets />} />
        <Route path='/appointment/:docId' element={<Appointment />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
