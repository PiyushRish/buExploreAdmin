import React from 'react'

const Navbar = () => {


  return (
    <div className='flex flex-row justify-between mb-4  w-full position-sticky top-0 z-50' >
        <div className='flex flex-row justify-between border-2 rounded-lg p-2 gap-1 hover:border-black' >
            <input className='w-64 outline-none ' type="text" placeholder='Search here...'  onChange={()=>{

            }}/>
        </div>

        <div className='flex flex-row justify-between border-2 rounded-lg p-2 gap-6 ' >

        {/* <h4><div className='hover:bg-gray-600 pointer cursor-pointer border rounded-lg p-1'>City </div></h4> */}
        <h4><div className='hover:bg-gray-600 hover:text-white pointer cursor-pointer border rounded-[10%] p-1'>Category</div></h4>

        <h4> <div className='hover:bg-gray-600 hover:text-white pointer cursor-pointer border rounded-[10%] p-1' >Likes</div></h4>

        {/* <h4> </h4> */}
        </div>

      
    </div>
  )
}

export default Navbar
