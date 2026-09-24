import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import PortalTransition from '../components/PortalTransition';
import Hero from '../components/Hero';

export default function AboutPage() {
  const [isPortalActive, setIsPortalActive] = useState(false);
  const navigate = useNavigate();

  const handleTriggerPortal = () => {
    setIsPortalActive(true);
  };

  const handlePortalComplete = () => {
    navigate('/Journey');
  };

  return (
    <div className="relative min-h-screen bg-[#07090e] text-[#f0f2f8] overflow-x-clip">
      <Background />

      <PortalTransition
        isActive={isPortalActive}
        onComplete={handlePortalComplete}
      />


      <main className="relative z-10 w-full">
        <Hero onTriggerTransition={handleTriggerPortal} />
      </main>
    </div>
  );
}
