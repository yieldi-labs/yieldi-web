import TranslucentCard from '@/app/TranslucentCard'
import React from 'react'

export default function PositionsPlaceholder() {
  return (
    <TranslucentCard>
        <div className="w-full h-24 p-2.5 border-4 border-white justify-center items-center flex">
            <p className="text-neutral-800 font-medium text-base">Your liquidity positions will appear here.</p>
        </div>
    </TranslucentCard>
  )
}
