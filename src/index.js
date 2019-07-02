const express = require('express');
const path = require('path');
const readline = require('readline');
const fs = require('fs');
const env = require('node-env-file');

const app = express();

env(__dirname + '/../.env');

const { PORT } = process.env;
const pathToFiles = path.join(__dirname, 'files');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const onLineInput = (line) => {
  if (line.length > 0) {
    const [pathTo, content] = line.split(' ');

    const { dir, base } = path.parse(pathTo);

    if (dir) {
      fs.mkdirSync(path.join(pathToFiles, dir), { recursive: true });
    }

    dir
      ? fs.writeFileSync(path.join(path.join(pathToFiles, dir), base), content)
      : fs.writeFileSync(path.join(pathToFiles, base), content);
  }

};

rl.on('line', onLineInput);

const checkUrl = (req, res, next) => {
  const re = /^\/([A-z0-9-_+]+\/)*([A-z0-9]+\.([A-z])*)$/gm;
  if (re.test(req.url)) {
    return next();
  }
  return res.status(400).send('Bad Request');
};

app.get('/*', checkUrl, (req, res) => {
  try {
    const pathToFile = path.parse(req.url);

    const fileDir = path.join(__dirname, pathToFile.dir);

    fs.readFile(path.join(fileDir, pathToFile.base), (err, data) => {
      if(err) return res.status(404).send('Not Found!');

      return res.send(data.toString());
    });
  } catch (e) {
    console.error(e);
    return res.status(500).send('Error');
  }
});

app.listen(PORT, () => console.log(`Listen PORT ${PORT}`));
