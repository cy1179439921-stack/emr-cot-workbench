import axios from 'axios'
// import qs from 'qs'
axios.defaults.timeout = 60 * 1000 * 10
axios.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)
axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    return Promise.reject(error)
  }
)

function checkStatus (response) {
  if (response.status === 200 || response.status === 304) {
    return response.data
  } else {
        throw new Error(response.data.message); // eslint-disable-line
  }
}

export function request (config) {
  return axios.request(config).then(checkStatus)
}

export function get (url, params) {
  // let queryData = Object.assign(params, {t: new Date().getTime()})
  return axios.get(url, { params }).then(checkStatus)
}

// export function delet (url, params) {
//   return axios.delete(url, params).then(checkStatus)
// }

// export function post (url, data, config) {
//   return axios.post(url, qs.stringify(data), config).then(checkStatus)
// }

// export function postDefine (url, data, config) {
//   return axios.post(url, data, config).then(checkStatus)
// }

// export function postData (url, data, config) {
//   return axios.post(url, data, config).then(checkStatus)
// }

// export function put (url, data, config) {
//   return axios.put(url, data, config).then(checkStatus)
// }

// export function patch (url, data, config) {
//   return axios.patch(url, data, config).then(checkStatus)
// }
