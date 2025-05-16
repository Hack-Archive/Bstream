import React from 'react'
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ActionProps {
  icon: React.ElementType;
  onClick: () => void;
  isLoading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  unit?: string;
  action?: ActionProps;
}

const StatCard = React.memo(({ title, value, icon: Icon, unit, action }: StatCardProps) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100/50 shadow-lg">
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-600">{title}</span>
      <div className="flex items-center space-x-2">
        {action && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={action.onClick}
            disabled={action.isLoading}
          >
            {action.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            ) : (
              <action.icon className="h-4 w-4 text-blue-500" />
            )}
          </Button>
        )}
        <Icon className="w-5 h-5 text-blue-500" />
      </div>
    </div>
    <div className="text-3xl font-bold text-gray-800">
      {value} {unit && <span className="text-base font-normal">{unit}</span>}
    </div>
  </div>
))

StatCard.displayName = 'StatCard'

export default StatCard 