import regeneratorRuntime from "regenerator-runtime";

export class CountryService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  GetAllByName(name) {
    let reference = this;
    return new Promise(function (resolve, reject) {
      fetch(reference.endpoint + "/"  + name, {
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

  get headers() {
    return {
      'Content-Type': 'application/json'
    };
  }
}