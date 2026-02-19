import { FaMicrophone } from "react-icons/fa";
import { CgAttachment } from "react-icons/cg";
import { IoSend } from "react-icons/io5";

// export default function ChatInput({
//   input,
//   onChange,
//   onSend,
//   onStopTyping,
//   onFileChange,
//   onMicClick,
//   isRecording,
//   pendingFile,
//   setPendingFile,
// }) {
//   return (
//     <div className="p-3 bg-gray-100 flex items-center gap-3">
//       {pendingFile && (
//         <div className="flex items-center gap-2 p-2 bg-gray-200 rounded">
//           <span>{pendingFile.name}</span>
//           <button
//             onClick={() => setPendingFile(null)}
//             className="text-red-500 font-bold"
//           >
//             ✕
//           </button>
//         </div>
//       )}

//       <label className="cursor-pointer p-2 hover:bg-gray-200 rounded-full">
//         <input type="file" className="hidden" onChange={onFileChange} />
//         {/* 📎 */}
//         <CgAttachment />
//       </label>
//       <input
//         type="text"
//         value={input}
//         onChange={onChange}
//         onKeyDown={(e) => e.key === "Enter" && onSend(input)}
//         onBlur={onStopTyping}
//         placeholder="Type a message"
//         className="flex-1 px-4 py-2 rounded-full border border-white focus:outline-none"
//         disabled={isRecording}
//       />
//       <button
//         onClick={onMicClick}
//         className={`p-2 cursor-pointer rounded-full transition ${
//           isRecording ? "bg-red-100 text-red-600" : "hover:bg-gray-200"
//         }`}
//         title="Record voice message"
//       >
//         {/* 🎤 */}
//         <FaMicrophone />
//       </button>
//       <button
//         onClick={() => onSend(input)}
//         className="p-2"
//         disabled={isRecording}
//       >
//         {/* ➤ */}
//         <IoSend className={'cursor-pointer'} />
//       </button>
//     </div>
//   );
// }


export default function ChatInput({
  input,
  onChange,
  onSend,
  onStopTyping,
  onFileChange,
  onMicClick,
  isRecording,
  pendingFile,
  setPendingFile,
}) {
  return (
    <div className="p-2 sm:p-3 bg-gray-100 flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">

      {pendingFile && (
        <div className="flex items-center gap-2 p-2 bg-gray-200 rounded max-w-full sm:max-w-xs text-sm truncate">
          <span className="truncate">{pendingFile.name}</span>
          <button
            onClick={() => setPendingFile(null)}
            className="text-red-500 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <label className="cursor-pointer p-2 hover:bg-gray-200 rounded-full shrink-0">
        <input type="file" className="hidden" onChange={onFileChange} />
        <CgAttachment />
      </label>

      <input
        type="text"
        value={input}
        onChange={onChange}
        onKeyDown={(e) => e.key === "Enter" && onSend(input)}
        onBlur={onStopTyping}
        placeholder="Type a message"
        className="flex-1 min-w-0 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-full border border-white focus:outline-none"
        disabled={isRecording}
      />

      <button
        onClick={onMicClick}
        className={`p-2 shrink-0 cursor-pointer rounded-full transition ${
          isRecording
            ? "bg-red-100 text-red-600"
            : "hover:bg-gray-200"
        }`}
        title="Record voice message"
      >
        <FaMicrophone />
      </button>

      <button
        onClick={() => onSend(input)}
        className="p-2 shrink-0"
        disabled={isRecording}
      >
        <IoSend className="cursor-pointer" />
      </button>
    </div>
  );
}
