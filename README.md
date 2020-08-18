# node-fetch-client
NodeJS Rest API Client module wrapping infamous [node-fetch](https://www.npmjs.com/package/node-fetch) 

## Why this module

Intention behind this module is expose cleaner API by wrapping `node-fetch` and provide a simpler timeout support for API calls.

This module supports working with `JSON` type and Binary data `Buffer` type simply because those are commonly used data types across networks.



## How to use 

```javascript
const APIClient = require('node-fetch-client');

const api = new APIClient({ headers: { 'content-type': 'application/json '}});
 
  ...

  try {

    const result = await api.get('http://localhost:3000/');

  } catch(error) {

  }

```

### API

New object needed to created (by providing common configs, if any) to call relevant Http method.

```javascript
const APIClient = require('node-fetch-client');

const api = APIClient(commonConfigs);
```
`commonConfigs :` Any allowed configs to node-fetch API. These are common configs.

 
Call the relevant Http method with the `url` and specific configs.

```javascript
const result = api.get('http://localhost:3000', configs);
```
`configs :` Any allowed configs to node-fetch API. These are method and API call relevant specific configs.

####

`result` will the `json` response from the API call.

#### Allowed Http method

`GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS`

`api.(get|post|put|patch|delete|head|options|download*)`

*Special method - `download` : This method can be used to handle binary data in a response

#### CommonConfig and configs

At final API caller stage, commonConfigs and configs are merged. Example is given below

```javascript
const commonConfig = {
 headers: {
   'content-type': 'application/json',
   'user-agent': 'api-caller',
 },
 timeout: 20000,
}

const configs = {
  headers: {
   'accept': 'application/json'
  },
  timeout: 50000,
}

// Final configs will be

{
    headers: {
       'content-type': 'application/json',
       'user-agent': 'api-caller',
        accept': 'application/json'
     },
     timeout: 50000, // precedence given to configs
}
```





