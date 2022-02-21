import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getDateForPageWithoutBrackets } from 'logseq-dateutils';
import dayjs from 'dayjs';
import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user';
import RecurCard from './RecurCard';

const Recurrence = () => {
  const [content, setContent] = useState('');
  const [contentUUID, setContentUUID] = useState('');

  const getCurrentBlock = async () => {
    const currBlock: BlockEntity = await logseq.Editor.getCurrentBlock();
    setContent(currBlock.content);
    setContentUUID(currBlock.uuid);
  };

  useEffect(() => {
    getCurrentBlock();
  }, []);

  const [recurrenceValues, setRecurrenceValues] = useState({
    recurrencePattern: '',
    recurrenceType: '',
    options: {
      endAfter: '',
      endBy: '',
    },
  });

  const handleForm = (e: any) => {
    if (!e.type) {
      setRecurrenceValues((prevValues) => ({
        ...prevValues,
        options: {
          endAfter: '',
          endBy: e,
        },
      }));
    } else {
      const name = e.target.name.split('.');
      if (name.length > 1) {
        setRecurrenceValues((prevValues) => ({
          ...prevValues,
          [name[0]]: { [name[1]]: e.target.value, endBy: '' },
        }));
      } else {
        setRecurrenceValues((prevValues) => ({
          ...prevValues,
          [name[0]]: e.target.value,
        }));
      }
    }
  };

  const resetForm = () => {
    setRecurrenceValues({
      recurrencePattern: '',
      recurrenceType: '',
      options: {
        endAfter: '',
        endBy: '',
      },
    });
  };

  const createBlocks = async () => {
    if (content === '' || !content) {
      logseq.App.showMsg('You have no content to recur', 'error');
      return;
    }

    // Get basic settings
    const { recurrencePattern, recurrenceType, options } = recurrenceValues;
    const { preferredDateFormat } = logseq.settings;
    const d = new Date();
    let dates = [];
    let settingsToBeSaved = {
      item: content,
      dateAdded: dayjs(d).unix(),
      uuids: [contentUUID],
    };

    // Create blocks
    if (recurrenceType === 'occurrences') {
      if (parseInt(options.endAfter) < 1) {
        logseq.App.showMsg(
          'You have indicated a negative or zero occurence.',
          'error'
        );
        return;
      }

      for (let i = 0; i < parseInt(options.endAfter); i++) {
        if (recurrencePattern === 'daily') {
          const payload = getDateForPageWithoutBrackets(
            dayjs().add(i, 'day').toDate(),
            preferredDateFormat
          );
          dates.push(payload.toLowerCase());
        } else if (recurrencePattern === 'weekly') {
          const payload = getDateForPageWithoutBrackets(
            dayjs().add(i, 'week').toDate(),
            preferredDateFormat
          );
          dates.push(payload.toLowerCase());
        } else if (recurrencePattern === 'monthly') {
          const payload = getDateForPageWithoutBrackets(
            dayjs().add(i, 'month').toDate(),
            preferredDateFormat
          );
          dates.push(payload.toLowerCase());
        } else if (recurrencePattern === 'yearly') {
          const payload = getDateForPageWithoutBrackets(
            dayjs().add(i, 'year').toDate(),
            preferredDateFormat
          );
          dates.push(payload.toLowerCase());
        }
      }
    } else if (recurrenceType === 'date') {
      const pushPayload = (d: Date) => {
        const payload = getDateForPageWithoutBrackets(d, preferredDateFormat);
        dates.push(payload.toLowerCase());
      };
      const endByDate = dayjs(new Date(options.endBy)).add(1, 'day').toDate();

      let i = 0;
      while (true) {
        if (recurrencePattern === 'daily') {
          const d = dayjs().add(i, 'day').toDate();

          if (d <= endByDate) {
            pushPayload(d);
          } else {
            break;
          }
        } else if (recurrencePattern === 'weekly') {
          const d = dayjs().add(i, 'week').toDate();
          console.log(d);
          console.log(options.endBy);

          if (d <= endByDate) {
            pushPayload(d);
          } else {
            break;
          }
        } else if (recurrencePattern === 'monthly') {
          const d = dayjs().add(i, 'month').toDate();

          if (d <= endByDate) {
            pushPayload(d);
          } else {
            break;
          }
        } else if (recurrencePattern === 'yearly') {
          const d = dayjs().add(i, 'year').toDate();

          if (d <= endByDate) {
            pushPayload(d);
          } else {
            break;
          }
        }
        i++;
      }
    }

    // Add blocks to the designated pages
    for (let j = 1; j < dates.length; j++) {
      const getPage = await logseq.Editor.getPage(dates[j]);

      if (getPage === null) {
        await logseq.Editor.createPage(dates[j], '', {
          redirect: false,
          createFirstBlock: false,
          format: 'markdown',
        });
      }

      const itemBlock = await logseq.Editor.insertBlock(dates[j], content, {
        isPageBlock: true,
      });

      settingsToBeSaved.uuids.push(itemBlock.uuid);
    }

    // Clear forms
    resetForm();

    logseq.App.showMsg('Blocks added successfully!');

    logseq.hideMainUI();

    // Save recurrences to settings so can delete them
    if (
      !logseq.settings.recurrences ||
      logseq.settings.recurrences.length === 0
    ) {
      console.log('Updating settings for the first time...');
      logseq.updateSettings({ recurrences: [settingsToBeSaved] });
      console.log(logseq.settings);
    } else {
      console.log('Updating settings...');
      logseq.updateSettings({ recurrences: [settingsToBeSaved] });
      console.log(logseq.settings);
    }
  };

  return (
    <div className="flex justify-center bordermborder-black" tabIndex={-1}>
      <div className=" absolute top-10 bg-white rounded-lg p-3 w-2/3 border">
        <div className="mb-6 text-blue-800 font-extrabold text-xl">
          {content}
        </div>

        <div className="md:flex mb-6">
          <div className="md:w-1/6">
            <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
              Pattern
            </label>
          </div>
          <div className="md:w-5/6">
            <select
              className="recurrencePattern block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              name="recurrencePattern"
              onChange={handleForm}
              value={recurrenceValues.recurrencePattern}
            >
              <option value="-">-</option>
              <option value="daily">Daily </option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div className="md:flex mb-6">
          <div className="md:w-1/6">
            <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
              End Using
            </label>
          </div>
          <div className="md:w-5/6">
            <select
              className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              name="recurrenceType"
              onChange={handleForm}
              value={recurrenceValues.recurrenceType}
            >
              <option value="-">-</option>
              <option value="occurrences">No. of occurrences</option>
              <option value="date">Specific Date</option>
            </select>
          </div>
        </div>

        {recurrenceValues.recurrenceType === 'occurrences' && (
          <div className="md:flex mb-6">
            <div className="md:w-1/6">
              <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
                End after:
              </label>
            </div>
            <div className="md:w-5/6">
              <input
                className="bg-white appearance-none border-2 border-gray-200 rounded w-1/3 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                id="inline-full-name"
                type="number"
                placeholder="e.g. 10"
                min="1"
                name="options.endAfter"
                onChange={handleForm}
                value={recurrenceValues.options.endAfter}
              />{' '}
              occurences
            </div>
          </div>
        )}

        {recurrenceValues.recurrenceType === 'date' && (
          <div className="md:flex mb-6">
            <div className="md:w-1/6">
              <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
                End By:
              </label>
            </div>
            <div className="md:w-5/6">
              <DatePicker
                selected={recurrenceValues.options.endBy}
                onChange={handleForm}
                name="options.endBy"
                inline
              />
            </div>
          </div>
        )}

        <div className="md:flex mb-10">
          <div className="md:w-1/6"></div>
          <div className="md:w-5/6">
            <button
              className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded mr-2"
              type="button"
              onClick={createBlocks}
            >
              Create Blocks
            </button>
            <button
              className="shadow bg-pink-500 hover:bg-pink-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
              type="button"
              onClick={resetForm}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mb-3">
          {logseq.settings.recurrences.length > 0 && (
            <p className="text-lg font-bold underline">Saved Recurrences</p>
          )}
        </div>
        {logseq.settings.recurrences &&
          logseq.settings.recurrences.map(
            (r: { uuids: any[]; item: string; dateAdded: string }) => (
              <RecurCard uuids={r.uuids} item={r.item} id={r.dateAdded} />
            )
          )}
      </div>
    </div>
  );
};

export default Recurrence;
