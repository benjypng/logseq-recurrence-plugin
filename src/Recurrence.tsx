import React, { useState } from 'react';

const Recurrence = (props: { content: string }) => {
  const [content, setContent] = useState(props.content);

  // Get from Outlook
  const [recurrenceValues, setRecurrenceValues] = useState({});

  const handleForm = (e: any) => {};

  return (
    <div className="flex justify-center border border-black" tabIndex={-1}>
      <div className=" absolute top-10 bg-white rounded-lg p-3 w-1/3 border">
        <input
          className="search-field appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
          type="text"
          placeholder="E.g. tomorrow, 4th July, 6 months later"
          aria-label="Parse day date"
          name="searchVal"
          onChange={handleForm}
          value={searchVal}
          onKeyDown={(e) => handleSubmit(e)}
        />
      </div>
    </div>
  );
};

export default Recurrence;
