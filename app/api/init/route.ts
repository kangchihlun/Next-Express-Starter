import { startBackgroundWorker, stopBackgroundWorker } from '../../../lib/backgroundWorker';

let isWorkerStarted = false;

export async function GET() {
    if (!isWorkerStarted) {
        await startBackgroundWorker();
        isWorkerStarted = true;
    }
    
    return new Response(JSON.stringify({ message: 'Server initialized' }), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

// Handle cleanup when the module is unloaded
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM signal in init route, stopping background worker...');
    await stopBackgroundWorker();
});

process.on('SIGINT', async () => {
    console.log('Received SIGINT signal in init route, stopping background worker...');
    await stopBackgroundWorker();
});