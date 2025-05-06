import { createClient } from 'redis';



const subscriber = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

subscriber.on('error', (err) => console.error('Redis Subscriber Error', err));

let isWorkerRunning = false;

async function startBackgroundWorker() {
  if (isWorkerRunning) {
    console.log('Background worker is already running');
    return;
  }

  try {
    await subscriber.connect();
    await subscriber.subscribe('background-tasks', (message) => {
      handleTask(message);
    });
    isWorkerRunning = true;
    console.log('Background worker started and listening for tasks');

    // Handle process termination
    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM signal, shutting down background worker...');
      await stopBackgroundWorker();
    });

    process.on('SIGINT', async () => {
      console.log('Received SIGINT signal, shutting down background worker...');
      await stopBackgroundWorker();
    });
  } catch (error) {
    console.error('Error starting background worker:', error);
    isWorkerRunning = false;
    throw error;
  }
}

async function stopBackgroundWorker() {
  if (!isWorkerRunning) return;

  try {
    await subscriber.unsubscribe('background-tasks');
    await subscriber.disconnect();
    isWorkerRunning = false;
    console.log('Background worker stopped successfully');
  } catch (error) {
    console.error('Error stopping background worker:', error);
    throw error;
  }
}

async function handleTask(message: string) {
  try {
    const task = JSON.parse(message);
    
    switch (task.type) {
      case 'update-user-spins':
        console.log(`Updated user ${task.data.uuid} spins in database`);
        break;
        
      default:
        console.warn(`Unknown task type: ${task.type}`);
    }
  } catch (error) {
    console.error('Error handling background task:', error);
  }
}

export { startBackgroundWorker, stopBackgroundWorker }; 