const { AxePuppeteer } = require('@axe-core/puppeteer');
const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const exphbs  = require('express-handlebars');

const app = express();
const port = process.env.port || 8080;
const httpChecker = re = new RegExp("^(http|https)://", "i");
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static('public'))

app.get('/', function(req, res) {
  res.render('home');
});

app.get('/result', function(req, res) {
  const url = httpChecker.test(req.query.submittedUrl) 
    ? req.query.submittedUrl
    : 'http://' + req.query.submittedUrl;
    
  puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/usr/bin/chromium-browser'
  }).then((browser) => {
    browser.newPage().then((page) => {
      page.setBypassCSP(true);
      page.goto(
        decodeURIComponent(url).toString()
      ).then(() => {
        new AxePuppeteer(page).analyze().then((results) => {
          res.setHeader('Content-Type', 'text/html');
          res.render('home', { data: results });
        });
      });
    });
  });
});

app.listen(port);
console.log('Server started at http://localhost:' + port);