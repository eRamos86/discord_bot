
import { gatewayTools } from './dist/services/tools.js';
(async () => {
  try {
    const result = await gatewayTools.execute('dummy', 'wiki nova');
    console.log('Result:', result.slice(0,200));
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
