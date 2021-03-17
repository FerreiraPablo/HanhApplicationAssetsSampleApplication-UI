import regeneratorRuntime from "regenerator-runtime";

export class AssetService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  get departments() {
    return [{
        id: 0,
        name: "Headquarters"
      },
      {
        id: 1,
        name: "First Store"
      },
      {
        id: 2,
        name: "Second Store"
      },
      {
        id: 3,
        name: "Maintance Station"
      }
    ]
  }

  get(id) {
    let reference = this;
    return new Promise(function (resolve, reject) {
      fetch(reference.endpoint + "/" + id, {
        method: "GET",
        headers: reference.headers
      }).then(async function (response) {
        if (response.ok) {
          resolve(await response.json());
        } else {
          reject(await response.json());
        }
      }).catch(reject);
    })
  }

  update(asset) {
    let reference = this;
    return new Promise(function (resolve, reject) {
      fetch(reference.endpoint + "/" + asset.id, {
        method: "PUT",
        headers: reference.headers,
        body: JSON.stringify(asset)
      }).then(async function (response) {
        if (response.ok) {
          resolve();
        } else {
          reject(await response.json());
        }
      }).catch(reject);
    })
  }

  create(asset) {
    let reference = this;
    return new Promise(function (resolve, reject) {
      fetch(reference.endpoint, {
        method: "POST",
        headers: reference.headers,
        body: JSON.stringify(asset)
      }).then(async function (response) {
        if (response.ok) {
          resolve(await response.json());
        } else {
          reject(await response.json());
        }
      }).catch(reject);
    })
  }

  all(filters) {
    let reference = this;
    return new Promise(function (resolve, reject) {
      fetch(reference.endpoint + (filters ? ("?" + reference._objectToQueryParameters(filters)) : ""), {
        method: "GET",
        headers: reference.headers
      }).then(async function (response) {
        if (response.ok) {
          resolve(await response.json());
        } else {
          reject(await response.json());
        }
      }).catch(reject);
    })
  }

  delete(id) {
    let reference = this;
    return new Promise(function (resolve, reject) {
      fetch(reference.endpoint + "/" + id, {
        method: "DELETE",
        headers: reference.headers
      }).then(async function (response) {
        if (response.ok) {
          resolve();
        } else {
          reject(await response.json());
        }
      }).catch(reject);
    })
  }

  _objectToQueryParameters(parameters) {
    if (!parameters) {
      return null;
    }
    return Object.keys(parameters).map(function (key) {
      if (parameters[key]) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(parameters[key]);
      } else {
        return "";
      }
    }).filter(x => x != "").join('&')
  }

  get headers() {
    return {
      'Content-Type': 'application/json'
    };
  }
}