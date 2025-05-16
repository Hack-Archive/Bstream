import React from 'react';

const StaticRadialGradientBackground: React.FC = () => (
  <div className="absolute inset-0 z-0 opacity-40">
    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(120,180,255,0.4)_0%,rgba(0,0,0,0)_50%)]"></div>
    <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(100,150,255,0.4)_0%,rgba(0,0,0,0)_50%)]"></div>
  </div>
);

export default StaticRadialGradientBackground; 