import request from 'superagent';

const APPLICATION_JSON = 'application/json;charset=UTF-8';
const APPLICATION_OCTET_STREAM = 'application/octet-stream';

const REQUEST_TIMEOUT = 180000;

/**
 * Return a random-ish path for get request to prevent IE from caching GET request. NOTE: Why IE why?!? It does optimization
 * which is not proper and doesn't follow standard w3 conventions. 'Cache-Control': 'no-cache' <- tell all other browsers not
 * to cache this request.... but IE no that makes no-sense to it!!!
 * 
 * https://thisinterestsme.com/ajax-request-internet-explorer-cache/
 * 
 * @param {String} method the method name eg: 'POST', 'GET'
 * @param {String} path the url.
 */
const makePathSafeForIE = (method, path) => {
  // https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
  /* eslint no-undef: 0 */
  if (!!window.document.documentMode && method === 'GET') {
    return `${path}${path.indexOf('?') !== -1 ? '&' : '?'}rtie=${new Date().getTime()}&rid=${Math.ceil(Math.random() * 10000)}`;
  }
  return path;
};

/**
 * Check if the response is a success reponse code >=200 && <=299. Else
 * it sends a rejected promise.
 *
 * @param {Object} response the response from the server, which has header and the body.
 */
const checkStatus = (response) => {
  if (response.statusCode >= 200 && response.statusCode < 300) {
    return Promise.resolve(response.body);
  }
  return Promise.reject(response.body);
};

/**
 * A wrapper function which converts the (path, options) fetch.
 * NOTE: this gives us the flexibility to modify/alter the fetch library and
 * still keep the default fetch API call parameters.
 * 
 * Exported this to allow testing the IE path fix for get request.
 *
 * @param {String} path the url to send the request to.
 * @param {Object} options options object used by fetch library.
 * @param {fetch} defaultRequest default request library which is used.
 */
export const sendRequest = (path, options, defaultRequest = request) => {
  // because IE is a horrible browser.
  const newPath = makePathSafeForIE(options.method, path);
  let req = defaultRequest(options.method, newPath).set(options.headers);

  if (options.responseType) {
    req = req.responseType(options.responseType);
  }

  if (options.body) {
    req = req.send(options.body);
  }

  return req.timeout(REQUEST_TIMEOUT).then((res) => {
    return checkStatus(res);
  }).catch((err) => {
    return Promise.reject(err);
  });
};

/**
 * Make an object which has
 * @param {String} method method of the request GET, POST, PUT, DELETE.
 * @param {Object} payload the body of the request, if null the body is not sent.
 * @param {String} acceptType 
 */
const makeRequest = (method, payload = null, acceptType = APPLICATION_JSON) => {
  let options = {
    method: method,
    headers: {
      'Cache-Control': 'no-cache',
      Accept: acceptType
    }
  };
  if (payload) {
    options.headers['Content-Type'] = APPLICATION_JSON;
    options.body = JSON.stringify(payload);
  }
  if (acceptType !== APPLICATION_JSON) {
    options.responseType = 'blob';
  }
  return (path, fetch = sendRequest) => ({
    path,
    options,
    fetch
  });
};

// https://github.com/hemanth/functional-programming-jargon#partial-application
export const getJson = () => makeRequest('GET');
export const getObject = () => makeRequest('GET', null, APPLICATION_OCTET_STREAM);
// send API Request directly without adding the token via ADAL.
export const sendAPIRequest = (URL, requestWrapper, requestHandler = sendRequest) => {
  const {
    path,
    options,
    fetch
  } = requestWrapper(URL, requestHandler);
  return fetch(path, options);
};