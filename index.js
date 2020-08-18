const fetch = require('node-fetch');
const merge = require('js-merge-object');
const { to } = require('./utils');

// Define a default API timeout
const DEFAULT_API_TIMEOUT = 10000;

// Allowed Http request methods
const HTTP_REQUEST_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

// API client that wrap node-fetch
class APIClient {
  constructor(commonConfigs = {}) {
    // Register each http method
    HTTP_REQUEST_METHODS.forEach((method) => {
      this[method.toLowerCase()] = async (url, configs  = {}) => {
        const finalConfigs = merge(commonConfigs, { method, ...configs });
        const [err, res] = await to(this.doFetch(url, finalConfigs));
        if (err) {
          return Promise.reject(err);
        }
        return this.resolveResponse(res);
      };
    });
    // File download as a buffer, unless method is specified inside otherOptions POST will be used
    this.download = async (url, configs = {}) => {
      const method = configs.method || 'POST';
      const finalConfigs = merge(commonConfigs, { method, ...configs });
      const [err, res] = await to(this.doFetch(url, finalConfigs));
      if (err) {
        return Promise.reject(err);
      }
      return res.buffer();
    };
  }

  // Fetch will resolve for non 200 responses, hence correct type is returned through this method
  async resolveResponse(res) {
    const [err, jsonBody] = await to(res.json());
    if (err) {
      return Promise.reject(err);
    }
    // res.ok = res.status >= 200 and res.status < 300
    if (res.ok) {
      // Return success only for 200 response
      return Promise.resolve(jsonBody);
    }
    return Promise.reject(jsonBody);
  }

  /**
   * Current node-fetch does not provide timeout functionality for requests.
   * This method provides that functionality, by introducing a race between fetch and timeout.
   * Promise.race will output of the first promise to resolve/reject.
   * Thus if fetch will takes more that timeout this will return an error.
   */
  doFetch(url, options) {
    const timeout = options.timeout || DEFAULT_API_TIMEOUT;
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Request to ${url} timed out`));
        }, timeout);
      }),
    ]);
  }
}

module.exports = APIClient;
