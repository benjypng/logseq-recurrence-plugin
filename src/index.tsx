import '@logseq/libs';
import './App.css';
import { handleClosePopup } from './handleClosePopup';
import React from 'react';
import ReactDOM from 'react-dom';
import Recurrence from './Recurrence';

const main = () => {
  console.log('logseq-recurrence-plugin loaded');

  window.setTimeout(async () => {
    const userConfigs = await logseq.App.getUserConfigs();
    const preferredDateFormat: string = userConfigs.preferredDateFormat;
    logseq.updateSettings({ preferredDateFormat: preferredDateFormat });
    console.log(`Settings updated to ${preferredDateFormat}`);

    if (!logseq.settings.lang) {
      logseq.updateSettings({
        lang: '',
      });
    }
  }, 3000);

  logseq.Editor.registerSlashCommand('Set Recurrence', async () => {
    ReactDOM.render(
      <React.StrictMode>
        <Recurrence />
      </React.StrictMode>,
      document.getElementById('app')
    );

    logseq.showMainUI();
  });

  handleClosePopup();
};

logseq.ready(main).catch(console.error);