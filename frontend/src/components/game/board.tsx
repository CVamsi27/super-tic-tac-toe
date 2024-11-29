"use client";
const Board = () => {
  return (
    <div className="grid grid-cols-3 gap-2 p-2 bg-white rounded-lg shadow-lg">
      {[0, 1, 2].map((mainRow) => (
        <div key={mainRow} className="contents">
          {/* {[0, 1, 2].map(mainCol => renderSubBoard(mainRow, mainCol))} */}
        </div>
      ))}
    </div>
  );
};
export default Board;
