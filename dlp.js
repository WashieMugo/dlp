require('dotenv').config();
const express = require('express');
const { DlpServiceClient } = require('@google-cloud/dlp');

const app = express();
const port = 3000;

const dlpClient = new DlpServiceClient();

async function redactText(text) {
  const request = {
    parent: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/locations/global`,
    item: {
      value: text,
    },
    inspectConfig: {
      infoTypes: [{ name: 'PHONE_NUMBER' }, { name: 'EMAIL_ADDRESS' }],
      includeQuote: true,
    },
    replaceConfigs: [
      {
        infoType: { name: 'PHONE_NUMBER' },
        replaceWith: 'REDACTED_PHONE',
      },
      {
        infoType: { name: 'EMAIL_ADDRESS' },
        replaceWith: 'REDACTED_EMAIL',
      },
    ],
  };

  const [response] = await dlpClient.redactContent(request);
  return response.item.value;
}

app.use(express.json());

app.post('/redact', async (req, res) => {
  const { text } = req.body;

  try {
    const redactedText = await redactText(text);
    res.send(redactedText);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred.');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
