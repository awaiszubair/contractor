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
    <div className="p-3 bg-gray-100 flex items-center gap-3">
      {pendingFile && (
        <div className="flex items-center gap-2 p-2 bg-gray-200 rounded">
          <span>{pendingFile.name}</span>
          <button
            onClick={() => setPendingFile(null)}
            className="text-red-500 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <label className="cursor-pointer p-2 hover:bg-gray-200 rounded-full">
        <input type="file" className="hidden" onChange={onFileChange} />
        📎
      </label>
      <input
        type="text"
        value={input}
        onChange={onChange}
        onKeyDown={(e) => e.key === "Enter" && onSend(input)}
        onBlur={onStopTyping}
        placeholder="Type a message"
        className="flex-1 px-4 py-2 rounded-full border border-white focus:outline-none"
        disabled={isRecording}
      />
      <button
        onClick={onMicClick}
        className={`p-2 rounded-full transition ${
          isRecording ? "bg-red-100 text-red-600" : "hover:bg-gray-200"
        }`}
        title="Record voice message"
      >
        🎤
      </button>
      <button
        onClick={() => onSend(input)}
        className="p-2"
        disabled={isRecording}
      >
        ➤
      </button>
    </div>
  );
}
