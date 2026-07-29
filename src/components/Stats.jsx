import React from 'react'
import { Eye, Hand } from 'lucide-react'

function Stats() {
  return (
    <div className='bg-white border border-slate-200 p-6 rounded-2xl shadow-sm max-w-xs'>
      <h3 className='text-slate-500 text-sm font-semibold uppercase tracking-wider mb-4'>
        Stats
      </h3>
      
      <div className='lg:flex flex-col items-center justify-around gap-8 space-y-4 lg:space-y-0 sm:flex-row'>
        {/* Views Stat */}
        <div className="flex flex-col items-center m-1 gap-1 group">
          <div className='p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors'>
            <Eye size={20} className="text-blue-600" />
          </div>
          <span className='lg:text-xl font-bold text-slate-800 sm:text'>1,234</span>
          <span className='text-xs text-slate-400 font-medium'>Views</span>
        </div>

        {/* Reach/Hand Stat */}
        <div className=" flex flex-col items-center gap-1 group">
          <div className='p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors'>
            <Hand size={20} className="text-indigo-600" />
          </div>
          <span className='text-xl font-bold text-slate-800'>567</span>
          <span className='text-xs text-slate-400 font-medium'>Reach</span>
        </div>
      </div>
    </div>
  )
}

export default Stats