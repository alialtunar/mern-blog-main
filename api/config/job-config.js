export const jobConfig = {
    claudeJob: {
        schedule: '*/20 * * * *',
        enabled: true,
        maxRetries: 3,
        timeout: 30000
    }
 };
 
 export default jobConfig;