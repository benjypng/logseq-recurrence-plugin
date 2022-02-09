import '@logseq/libs';
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

  logseq.Editor.registerSlashCommand('Recurrence', async () => {
    const content = await logseq.Editor.getEditingBlockContent();

    ReactDOM.render(
      <React.StrictMode>
        <Recurrence content={content} />
      </React.StrictMode>,
      document.getElementById('app')
    );

    logseq.showMainUI();

    document.addEventListener('keydown', (e: any) => {
      if (e.keyCode !== 27) {
        (document.querySelector('.search-field') as HTMLElement).focus();
      }
    });
  });

  handleClosePopup();
};

logseq.ready(main).catch(console.error);
