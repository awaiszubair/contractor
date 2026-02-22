export default function MessageEditForm({
  isMe,
  editText,
  onEditTextChange,
  onSave,
  onCancel,
}) {
  return (
    <div className="mt-3 w-full flex gap-2">
      <input
        className={`
          flex-1 px-4 py-2.5 text-sm rounded-xl border
          ${
            isMe
              ? "bg-gray-900/60 border-gray-700 text-white placeholder-gray-400"
              : "bg-white/70 border-gray-300 text-black placeholder-gray-500"
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500/40
        `}
        value={editText}
        onChange={(e) => onEditTextChange(e.target.value)}
        autoFocus
        placeholder="Edit message..."
      />
      <button
        className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors min-w-[70px]"
        onClick={onSave}
      >
        Save
      </button>
      <button
        className="px-5 py-2.5 cursor-pointer bg-gray-600/80 text-white text-sm rounded-xl hover:bg-gray-700 transition-colors min-w-[70px]"
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
}
