
const readline = require('readline')
const { google } = require('googleapis')
const fs = require('fs')

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = 'token.json';

function getSheets(sheetConf) {
  fs.readFile('credentials.json', (err, content) => {
    if (err) {
      const { riseError } = sheetConf
      if (riseError) riseError()
      return console.log('Error loading client secret file:', err);
    }

    authorize({ sheetConf, credentials: JSON.parse(content), onAuthSheet: requestSheet });
  });
}

function authorize({ credentials, onAuthSheet, sheetConf }) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken({ oAuth2Client, onAuthSheet, sheetConf });
    oAuth2Client.setCredentials(JSON.parse(token));
    onAuthSheet(oAuth2Client, sheetConf);
  });
}

function getNewToken({ oAuth2Client, onAuthSheet, sheetConf }) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();

    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        const { riseError } = authConfig
        if (riseError) riseError()
        return console.error('Error while trying to retrieve access token', err);
      }
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      onAuthSheet(oAuth2Client, sheetConf);
    });
  });
}

function requestSheet(auth, configuration) {
  const { onSheetFetched, method = 'get', ranges, range, spreadsheetId } = configuration
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values[method]({
    spreadsheetId,
    range,
    ranges,
  }, onSheetFetched);
}


module.exports = {
  getSheets,
} 