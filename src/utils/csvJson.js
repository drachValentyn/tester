const { Transform } = require('stream');

function createCsvToJson() {
  let first = true;
  let firstHeader = true;
  let resultStr = '[';
  let lines = [];
  let headers = [];

  const transform = (chunk, encoding, cb) => {
    const csv = chunk.toString();
    lines = csv.split('\n');
    if (firstHeader) {
      headers = lines[0].split(',');
      firstHeader = false;
    } else {
      resultStr = '';
    }

    for (let i = 1; i < lines.length - 1; i++) {
      let str = '';
      const currentline = lines[i].split(',');

      for (let j = 0; j < headers.length - 1; j++) {
        if (headers[j] === 'price') {
          str += ` "unitPrice": "${currentline[j]}$",`;
        } else {
          str += ` "${headers[j]}": "${currentline[j]}",`;
        }

        if (j === headers.length - 2) str = str.slice(0, -1);
      }

      resultStr += `, {${str}}`;
    }

    if (first) {
      resultStr = resultStr.slice(0, 1) + resultStr.slice(2);
      first = false;
    }

    cb(null, resultStr);
  };

  const flush = (cb) => {
    cb(null, ']');
  };
  return new Transform({ transform, flush });
}

function dedupAndSum(arr) {
  const result = {};
  const order = [];
  arr.forEach((obj) => {
    obj.quantity = +obj.quantity;
    const id = obj.type && obj.color;

    if (id in result) {
      const stocklevel = +result[id].quantity + +obj.quantity;
      result[id] = obj;
      result[id].quantity = stocklevel;
      order.push(order.splice(order.indexOf(id), 1));
    } else {
      result[id] = obj;
      order.push(id);
    }
  });

  return order.map((obj) => result[obj]);
}

function optimizeJson() {
  let chunks = '';
  const transform = (chunk, encoding, cb) => {
    chunks += chunk;
    cb(null, '');
  };

  const flush = (cb) => {
    cb(null, '');
  };
  return new Transform({ transform, flush });
}

module.exports = { createCsvToJson, optimizeJson };