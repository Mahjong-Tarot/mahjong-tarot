// The slice of edge8-web's boards entity mahjong-tarot runs: the board tables
// (migration 059), card moves and subtask ticks, and the Revenue board screen
// (routes/). Same door names as edge8's, so the campaigns entity's Revenue
// board sync ports unchanged.
export {
  selectBoards,
  selectBoardColumns,
  selectBoardMembers,
  selectTasks,
  insertTasks,
  updateTasks,
  endPosition,
  dayLabel,
} from "./lib/data";
export { landCard, landCardAsSystem, toggleSubtask, type CardMoveOutcome } from "./lib/moves";
