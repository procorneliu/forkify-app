import { TIMEOUT_SEC } from './config';

// Throw error meesage if request took too long
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

// Requesting or posting data to API
export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? // If uploadData is defined, load recipe to API
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadData),
        })
      : // If not, get data from API
        fetch(url);
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message}`);
    return data;
  } catch (err) {
    throw err;
  }
};
