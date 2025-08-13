'use client'

import React, { useEffect, useState } from 'react'

interface NeuralBackgroundProps {
  theme?: 'light' | 'dark'
}

export function NeuralBackground({ theme }: NeuralBackgroundProps) {
  const [mounted, setMounted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    setMounted(true)
    
    // If theme prop is provided, use it, otherwise detect from document
    if (theme) {
      setCurrentTheme(theme)
    } else {
      // Auto-detect theme from document
      const detectTheme = () => {
        const savedTheme = localStorage.getItem('theme')
        const documentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
        const dataTheme = document.body.getAttribute('data-theme') as 'light' | 'dark'
        
        return savedTheme as 'light' | 'dark' || dataTheme || documentTheme
      }
      
      setCurrentTheme(detectTheme())
      
      // Watch for theme changes
      const observer = new MutationObserver(() => {
        setCurrentTheme(detectTheme())
      })
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme']
      })
      
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-theme']
      })
      
      return () => observer.disconnect()
    }
  }, [theme])

  if (!mounted) return null

  return (
    <>
      {/* Main background gradient that changes with theme */}
      <div 
        className={`fixed inset-0 z-0 transition-all duration-500 ease-in-out ${
          currentTheme === 'dark' 
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
            : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200'
        }`}
              style={{
          background: currentTheme === 'dark' 
            ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)'
        }}
      />
      
      {/* Animated Neural Network */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="neural-network">
          <div className="neural-container">
            {/* Main neural nodes */}
            <div className="neuron" style={{ top: '15%', left: '20%', animationDelay: '0s' }}></div>
            <div className="neuron" style={{ top: '25%', left: '60%', animationDelay: '0.5s' }}></div>
            <div className="neuron" style={{ top: '35%', left: '30%', animationDelay: '1s' }}></div>
            <div className="neuron" style={{ top: '45%', left: '70%', animationDelay: '1.5s' }}></div>
            <div className="neuron" style={{ top: '55%', left: '15%', animationDelay: '2s' }}></div>
            <div className="neuron" style={{ top: '65%', left: '50%', animationDelay: '2.5s' }}></div>
            <div className="neuron" style={{ top: '75%', left: '80%', animationDelay: '0.3s' }}></div>
            <div className="neuron" style={{ top: '85%', left: '35%', animationDelay: '0.8s' }}></div>
            <div className="neuron" style={{ top: '20%', left: '85%', animationDelay: '1.3s' }}></div>
            <div className="neuron" style={{ top: '40%', left: '5%', animationDelay: '1.8s' }}></div>
            <div className="neuron" style={{ top: '60%', left: '90%', animationDelay: '2.3s' }}></div>
            <div className="neuron" style={{ top: '10%', left: '45%', animationDelay: '0.7s' }}></div>

            {/* Secondary nodes */}
            <div className="neuron" style={{ top: '18%', left: '75%', animationDelay: '1.2s', opacity: 0.7 }}></div>
            <div className="neuron" style={{ top: '28%', left: '40%', animationDelay: '1.7s', opacity: 0.7 }}></div>
            <div className="neuron" style={{ top: '38%', left: '55%', animationDelay: '2.2s', opacity: 0.7 }}></div>
            <div className="neuron" style={{ top: '48%', left: '25%', animationDelay: '0.4s', opacity: 0.7 }}></div>
            <div className="neuron" style={{ top: '58%', left: '75%', animationDelay: '0.9s', opacity: 0.7 }}></div>
            <div className="neuron" style={{ top: '68%', left: '10%', animationDelay: '1.4s', opacity: 0.7 }}></div>
            <div className="neuron" style={{ top: '78%', left: '65%', animationDelay: '1.9s', opacity: 0.7 }}></div>
            <div className="neuron" style={{ top: '12%', left: '30%', animationDelay: '2.4s', opacity: 0.7 }}></div>

            {/* Neural connections */}
            <div className="connection" style={{ top: '15%', left: '20%', width: '40%', transform: 'rotate(15deg)', animationDelay: '0s' }}></div>
            <div className="connection secondary" style={{ top: '25%', left: '30%', width: '30%', transform: 'rotate(-20deg)', animationDelay: '0.5s' }}></div>
            <div className="connection tertiary" style={{ top: '35%', left: '60%', width: '25%', transform: 'rotate(45deg)', animationDelay: '1s' }}></div>
            <div className="connection" style={{ top: '45%', left: '15%', width: '55%', transform: 'rotate(-10deg)', animationDelay: '1.5s' }}></div>
            <div className="connection secondary" style={{ top: '55%', left: '50%', width: '35%', transform: 'rotate(30deg)', animationDelay: '2s' }}></div>
            <div className="connection tertiary" style={{ top: '65%', left: '35%', width: '45%', transform: 'rotate(-35deg)', animationDelay: '2.5s' }}></div>
            <div className="connection" style={{ top: '75%', left: '20%', width: '60%', transform: 'rotate(8deg)', animationDelay: '0.3s' }}></div>
            <div className="connection secondary" style={{ top: '85%', left: '5%', width: '30%', transform: 'rotate(-25deg)', animationDelay: '0.8s' }}></div>
            <div className="connection tertiary" style={{ top: '20%', left: '45%', width: '40%', transform: 'rotate(60deg)', animationDelay: '1.3s' }}></div>
            <div className="connection" style={{ top: '40%', left: '70%', width: '20%', transform: 'rotate(-45deg)', animationDelay: '1.8s' }}></div>
            <div className="connection secondary" style={{ top: '60%', left: '50%', width: '40%', transform: 'rotate(15deg)', animationDelay: '2.3s' }}></div>
            <div className="connection tertiary" style={{ top: '10%', left: '75%', width: '15%', transform: 'rotate(-60deg)', animationDelay: '0.7s' }}></div>

            {/* Additional vertical connections */}
            <div className="connection" style={{ top: '15%', left: '30%', width: '20%', transform: 'rotate(90deg)', animationDelay: '1.1s' }}></div>
            <div className="connection secondary" style={{ top: '35%', left: '50%', width: '30%', transform: 'rotate(90deg)', animationDelay: '1.6s' }}></div>
            <div className="connection tertiary" style={{ top: '55%', left: '70%', width: '25%', transform: 'rotate(90deg)', animationDelay: '2.1s' }}></div>
            <div className="connection" style={{ top: '25%', left: '80%', width: '40%', transform: 'rotate(90deg)', animationDelay: '0.6s' }}></div>

            {/* Branching elements */}
            <div className="branch" style={{ top: '20%', left: '40%', transform: 'rotate(30deg)', animationDelay: '0.2s' }}></div>
            <div className="branch" style={{ top: '50%', left: '60%', transform: 'rotate(-45deg)', animationDelay: '1.2s' }}></div>
            <div className="branch" style={{ top: '70%', left: '20%', transform: 'rotate(60deg)', animationDelay: '2.2s' }}></div>
            <div className="branch" style={{ top: '30%', left: '80%', transform: 'rotate(-30deg)', animationDelay: '0.9s' }}></div>

            {/* Neural clusters */}
            <div className="cluster" style={{ top: '10%', left: '10%', animationDelay: '0s' }}></div>
            <div className="cluster" style={{ top: '40%', right: '15%', animationDelay: '2s' }}></div>
            <div className="cluster" style={{ bottom: '20%', left: '60%', animationDelay: '4s' }}></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .neural-network {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .neural-container {
          width: 120%;
          height: 120%;
          position: relative;
          animation: slowRotate 60s linear infinite;
        }

        .neuron {
          position: absolute;
          width: 4px;
          height: 4px;
          background: ${currentTheme === 'dark' ? 'rgba(102, 126, 234, 0.6)' : 'rgba(59, 130, 246, 0.4)'};
          border-radius: 50%;
          box-shadow: 0 0 10px ${currentTheme === 'dark' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(59, 130, 246, 0.2)'};
          animation: pulse 3s ease-in-out infinite;
        }

        .neuron::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          width: 8px;
          height: 8px;
          background: ${currentTheme === 'dark' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(59, 130, 246, 0.1)'};
          border-radius: 50%;
          animation: expand 3s ease-in-out infinite;
        }

        .connection {
          position: absolute;
          height: 1px;
          background: linear-gradient(90deg, 
            ${currentTheme === 'dark' ? 'rgba(102, 126, 234, 0)' : 'rgba(59, 130, 246, 0)'} 0%, 
            ${currentTheme === 'dark' ? 'rgba(102, 126, 234, 0.4)' : 'rgba(59, 130, 246, 0.2)'} 20%, 
            ${currentTheme === 'dark' ? 'rgba(102, 126, 234, 0.4)' : 'rgba(59, 130, 246, 0.2)'} 80%, 
            ${currentTheme === 'dark' ? 'rgba(102, 126, 234, 0)' : 'rgba(59, 130, 246, 0)'} 100%);
          transform-origin: left center;
          animation: dataFlow 4s ease-in-out infinite;
        }

        .connection::before {
          content: '';
          position: absolute;
          width: 6px;
          height: 6px;
          background: ${currentTheme === 'dark' ? 'rgba(167, 139, 250, 0.8)' : 'rgba(139, 92, 246, 0.6)'};
          border-radius: 50%;
          top: -2.5px;
          left: 0;
          animation: signal 4s linear infinite;
          box-shadow: 0 0 8px ${currentTheme === 'dark' ? 'rgba(167, 139, 250, 0.5)' : 'rgba(139, 92, 246, 0.3)'};
        }

        .connection.secondary {
          background: linear-gradient(90deg, 
            ${currentTheme === 'dark' ? 'rgba(167, 139, 250, 0)' : 'rgba(139, 92, 246, 0)'} 0%, 
            ${currentTheme === 'dark' ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.2)'} 20%, 
            ${currentTheme === 'dark' ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.2)'} 80%, 
            ${currentTheme === 'dark' ? 'rgba(167, 139, 250, 0)' : 'rgba(139, 92, 246, 0)'} 100%);
        }

        .connection.tertiary {
          background: linear-gradient(90deg, 
            ${currentTheme === 'dark' ? 'rgba(59, 130, 246, 0)' : 'rgba(16, 185, 129, 0)'} 0%, 
            ${currentTheme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.2)'} 20%, 
            ${currentTheme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.2)'} 80%, 
            ${currentTheme === 'dark' ? 'rgba(59, 130, 246, 0)' : 'rgba(16, 185, 129, 0)'} 100%);
        }

        .connection.tertiary::before {
          background: ${currentTheme === 'dark' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(16, 185, 129, 0.6)'};
          box-shadow: 0 0 8px ${currentTheme === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(16, 185, 129, 0.3)'};
        }

        .branch {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .branch::before {
          content: '';
          position: absolute;
          width: 1px;
          height: 200px;
          background: linear-gradient(180deg, 
            ${currentTheme === 'dark' ? 'rgba(102, 126, 234, 0)' : 'rgba(59, 130, 246, 0)'} 0%, 
            ${currentTheme === 'dark' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(59, 130, 246, 0.2)'} 50%, 
            ${currentTheme === 'dark' ? 'rgba(102, 126, 234, 0)' : 'rgba(59, 130, 246, 0)'} 100%);
          animation: branchGlow 5s ease-in-out infinite;
        }

        .cluster {
          position: absolute;
          width: 80px;
          height: 80px;
          border: 1px solid ${currentTheme === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(59, 130, 246, 0.05)'};
          border-radius: 50%;
          animation: clusterPulse 6s ease-in-out infinite;
        }

        .cluster::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          border: 1px solid ${currentTheme === 'dark' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(59, 130, 246, 0.1)'};
          border-radius: 50%;
          animation: clusterPulse 6s ease-in-out infinite reverse;
        }

        .cluster::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          border: 1px solid ${currentTheme === 'dark' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(59, 130, 246, 0.15)'};
          border-radius: 50%;
          animation: clusterPulse 6s ease-in-out infinite;
        }

        @keyframes slowRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.6;
          }
          50% { 
            transform: scale(1.5);
            opacity: 1;
          }
        }

        @keyframes expand {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.2;
          }
          50% { 
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes dataFlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }

        @keyframes signal {
          0% { 
            left: 0;
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { 
            left: 100%;
            opacity: 0;
          }
        }

        @keyframes branchGlow {
          0%, 100% { 
            opacity: 0.2;
            transform: scaleY(1);
          }
          50% { 
            opacity: 0.6;
            transform: scaleY(1.2);
          }
        }

        @keyframes clusterPulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.1;
          }
          50% { 
            transform: scale(1.1);
            opacity: 0.3;
          }
        }
      `}</style>
    </>
  )
}

export default NeuralBackground 