import React from 'react'

interface EmptyStateProps {
  icon: React.ElementType
  message: string
}

const EmptyState = React.memo(({ icon: Icon, message }: EmptyStateProps) => (
  <div className="flex-1 flex flex-col justify-center items-center h-[320px]">
    <div className="flex flex-col items-center">
      <span className="text-4xl text-gray-500 mb-2">
        <Icon className="w-12 h-12" />
      </span>
      <span className="text-gray-500">{message}</span>
    </div>
  </div>
))

EmptyState.displayName = 'EmptyState'

export default EmptyState 