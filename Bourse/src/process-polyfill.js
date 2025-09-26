// process-polyfill.js
if (typeof window !== 'undefined' && !window.process) {
    window.process = {
      env: {}
    };
  }