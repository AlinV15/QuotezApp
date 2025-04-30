import React, { useEffect } from 'react';

const Loader = () => {
  useEffect(() => {
    // Create a style element for the loader animation
    const style = document.createElement('style');
    const id = 'loader-animation-style';

    // Avoid duplicate style elements
    if (!document.getElementById(id)) {
      style.id = id;
      style.textContent = `
        @keyframes loaderAnimation {
          to { background-position: 300% 0; }
        }
        
        .custom-loader {
          --s: 10px;
          --g: 5px;
          height: calc(var(--s) + var(--g));
          aspect-ratio: 3;
          background:
            radial-gradient(calc(var(--s)/1.414) at calc(50% - 0.1*var(--s)) calc(50% - 0.2*var(--s)), transparent 5%, transparent 60%, #111 98%),
            linear-gradient(#4ECDC4 0 0) no-repeat white;
          background-size: calc(100%/3) 100%;
          background-position: 0 0;
          mask: radial-gradient(calc(var(--s)/2), black calc(100% - 1px), transparent) 0 / calc(100%/3) 100%;
          animation: loaderAnimation steps(3) 1.5s infinite;
        }
      `;
      document.head.appendChild(style);
    }

    // Cleanup function
    return () => {
      const existingStyle = document.getElementById(id);
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div className="custom-loader"></div>
    </div>
  );
};

export default Loader;