import React from 'react'

const Navbar = () => {
  return (
    <div className='flex flex-row justify-between mb-4  w-full position-sticky top-0 z-50' >
        <div className='flex flex-row justify-between border-2 rounded-lg p-2 gap-1 '>
            <input className='w-64 outline-none' type="text" placeholder='Search here...'  onChange={()=>{

            }}/>
        </div>

        <div className='flex flex-row justify-between border-2 rounded-lg p-2 gap-10  ' >

        <h4>hi hello </h4>
        <h4>hi hello </h4>

        <h4>hi hello </h4>

        <h4>hi hello </h4>
        </div>

      
    </div>
  )
}

export default Navbar
