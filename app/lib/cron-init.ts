// This file initializes the cron job when the app starts
// It's imported in layout.tsx to ensure the cron job runs on the server

let cronInitialized = false;

export function initializeCronJob() {
  // Only initialize once
  if (cronInitialized) {
    console.log('Cron job already initialized');
    return;
  }

  if (typeof window === 'undefined') {
    // Only run on the server side
    console.log('Initializing cron jobs...');
    
    // Use dynamic import to avoid circular dependency
    import('../api/notify/cron').then(module => {
      if (module.startCronJob) {
        module.startCronJob();
        cronInitialized = true;
        console.log('Cron job initialized successfully');
      }
    }).catch(err => {
      console.error('Failed to start cron job:', err);
    });
  }
} 