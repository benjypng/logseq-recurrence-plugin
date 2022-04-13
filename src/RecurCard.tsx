import React, { useState } from "react";

const RecurCard = (props: { uuids: any[]; id: string; item: string }) => {
  const [uuids] = useState(props.uuids);
  const [settings, setSettings] = useState(logseq.settings);

  const deleteBlocks = async () => {
    // delete all blocks
    for (let u of uuids) {
      await logseq.Editor.removeBlock(u);
    }

    // delete entry from settings by matching the id from props and the dateAdded from settings
    const recurrencesClone: any[] = settings.recurrences;
    recurrencesClone.splice(
      recurrencesClone.findIndex((i) => i.dateAdded === props.id),
      1
    );
    setSettings((prevSettings) => ({
      ...prevSettings,
      recurrences: recurrencesClone,
    }));
    logseq.hideMainUI();
    logseq.App.showMsg("Blocks deleted successfully!");
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
