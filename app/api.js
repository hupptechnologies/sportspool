const HOST = __DEV__ ? 'http://localhost:1215' : 'https://api.thesportspoolapp.com';

class API {
  constructor() {

  }

  async GET(endpoint, params, token) {
    var headers = {};

    if (token !== undefined) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    var esc = encodeURIComponent;
    var query = Object.keys(params)
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&');

    return new Promise(async (resolve, reject) => {
      var uri = this.normalizePath(`${endpoint}?${query}`);

      try {
        var res = await fetch(uri, {
          method: 'GET',
          headers: headers
        });

        res.json().then(json => {
          if (res.status >= 200 && res.status < 300) {
            resolve(json);
          } else {
            reject(json);
          }
        }).catch(async (err) => {
          var res2 = res.clone();
          res2.text().then(t => {
            reject(new Error(t));
          }).catch(reject);
        });
      } catch(err) {
        reject(err);
      }
    });
  }

  async POST(endpoint, params, token) {
    var headers = {
      'Content-Type': 'application/json'
    };

    if (token !== undefined) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
      fetch(this.normalizePath(endpoint), {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(params)
      })
      .then((res) => {
        return res.json().then((json) => {
          if (res.status >= 200 && res.status < 300) {
            resolve(json);
          } else {
            reject(json);
          }
        });
      })
      .catch(reject);
    });
  }

  async PUT(endpoint, params, token) {
    var headers = {
      'Content-Type': 'application/json'
    };

    if (token !== undefined) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
      fetch(this.normalizePath(endpoint), {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(params)
      })
      .then((res) => {
        return res.json().then((json) => {
          if (res.status >= 200 && res.status < 300) {
            resolve(json);
          } else {
            reject(json);
          }
        });
      })
      .catch(reject);
    });
  }

  async DELETE(endpoint, params, token) {
    var headers = {
      'Content-Type': 'application/json'
    };

    if (token !== undefined) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
      fetch(this.normalizePath(endpoint), {
        method: 'DELETE',
        headers: headers,
        body: JSON.stringify(params)
      })
      .then((res) => {
        return res.json().then((json) => {
          if (res.status >= 200 && res.status < 300) {
            resolve(json);
          } else {
            reject(json);
          }
        });
      })
      .catch(reject);
    });
  }

  normalizePath(endpoint) {
    return `${HOST}${endpoint}`;
  }
}

export default new API();
