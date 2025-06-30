'use client';

import { useEffect } from 'react';

export function SessionInitializer() {
  useEffect(() => {
    const initializeSession = async () => {
      try {
        console.log('🚀 Initializing healthcare session...');
        
        // Initialize session via API endpoint instead of direct import
        const response = await fetch('/api/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'initialize',
            config: {
              clearOnStart: true,
              clearMethod: 'all'
            }
          })
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Healthcare session initialized successfully');
        } else {
          console.error('❌ Session initialization failed:', result.error);
        }
      } catch (error) {
        console.error('❌ Failed to initialize session:', error);
      }
    };

    initializeSession();
  }, []);

  return null; // This component doesn't render anything
}