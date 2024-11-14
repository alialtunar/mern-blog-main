import claudeJob from './blogJob.js';
import ClaudeTopicJob from './claudeTopicJob.js'

export const startAll = () => {
          claudeJob.start();
      ClaudeTopicJob.start();

};


export default {
    startAll
};