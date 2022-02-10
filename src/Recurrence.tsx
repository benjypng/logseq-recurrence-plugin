import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getDateForPageWithoutBrackets } from 'logseq-dateutils';
import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user';

const Recurrence = () => {
  const [content, setContent] = useState('');

  const getCurrentBlock = async () => {
    const currBlock: BlockEntity = await logseq.Editor.getCurrentBlock();
    setContent(currBlock.content);
  };

  useEffect(() => {
    getCurrentBlock();
  });

  const [recurrenceValues, setRecurrenceValues] = useState({
    recurrencePattern: '',
    recurrenceType: '',
    options: {
      endAfter: '',
      endBy: Date,
    },
  });

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

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
        endBy: Date,
      },
    });
  };

  const createBlocks = async () => {
    const { recurrencePattern, recurrenceType, options } = recurrenceValues;
    const { preferredDateFormat } = logseq.settings;
    const d = new Date();

    console.log(recurrenceType);
    console.log(recurrencePattern);

    // Create blocks
    if (recurrenceType === 'occurrences') {
      if (recurrencePattern === 'daily') {
        let dates = [];
        for (let i = 0; i < parseInt(options.endAfter); i++) {
          const payload = getDateForPageWithoutBrackets(
            addDays(d, i),
            preferredDateFormat
          );
          dates.push(payload.toLowerCase());
        }

        for (let j = 1; j < dates.length; j++) {
          const getPage = await logseq.Editor.getPage(dates[j]);
          console.log(getPage);

          if (getPage === null) {
            await logseq.Editor.createPage(dates[j], '', {
              redirect: false,
              createFirstBlock: false,
              format: 'markdown',
            });
          }
          await logseq.Editor.insertBlock(dates[j], content, {
            isPageBlock: true,
          });
        }

        setRecurrenceValues({
          recurrencePattern: '',
          recurrenceType: '',
          options: {
            endAfter: '',
            endBy: Date,
          },
        });

        logseq.App.showMsg('Blocks added successfully!');

        logseq.hideMainUI();
      }
    } else if (recurrenceType === 'date') {
    }

    // Save recurrence
    // const recurrences: any[] = logseq.settings.recurrences;
    // const payload = {
    //   recurrencePattern: recurrencePattern,
    //   recurrenceType: recurrenceType,
    //   recurrenceOption: options.endAfter ? options.endAfter : options.endBy,
    // };

    // recurrences.push(payload);
  };

  return (
    <div className="flex justify-center border border-black" tabIndex={-1}>
      <div className=" absolute top-10 bg-white rounded-lg p-3 w-1/3 border">
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
          <p className="text-lg">Saved Recurrences</p>
        </div>
        <div className="flex flex-row justify-between items-center">
          <div className="items-center">
            <p className="">Recurrence 1, Daily, End by 23/5/2022</p>
          </div>
          <div>
            <button
              className="shadow bg-red-500 hover:bg-red-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
              type="button"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recurrence;
