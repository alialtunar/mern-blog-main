export const jobConfig = {
    claudeJob: {
        schedule: '*/10 * * * *',
        enabled: true,
        maxRetries: 3,
        timeout: 30000
    }
 };
 
 export default jobConfig;