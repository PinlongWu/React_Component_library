const request = ({ url, method = "post", data, headers = {} }) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    Object.keys(headers).forEach((key) =>
      xhr.setRequestHeader(key, headers[key])
    );
    xhr.send(data);
    xhr.onload = (e) => {
      if (e.target.status !== 200) {
        reject({ data: e.target.response, status: e.target.status });
      } else {
        resolve({
          data: e.target.response,
        });
      }
    };
  });
};

export default request;
