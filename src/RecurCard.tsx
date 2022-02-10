import React, { useState } from 'react';

const RecurCard = (props: { uuids: any[]; id: string; item: string }) => {
  const [uuids] = useState(props.uuids);

  const deleteBlocks = async () => {
    for (let u of uuids) {
      await logseq.Editor.removeBlock(u);
    }
    let clone = [...logseq.settings.recurrences];
    clone = clone.filter((i) => i.dateAdded !== props.id);
    logseq.updateSettings({ recurrences: '' });
    logseq.updateSettings({ recurrences: clone });
    logseq.hideMainUI();
    logseq.App.showMsg('Blocks deleted successfully!');
  };

  return (
    <div className="flex flex-row justify-between items-center mb-3">
      <div className="items-center">
        <p className="">{props.item}</p>
      </div>
      <div>
        <button
          className="shadow bg-red-500 hover:bg-red-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
          type="button"
          onClick={deleteBlocks}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default RecurCard;
