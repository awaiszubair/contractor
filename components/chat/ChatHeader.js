export default function ChatHeader({
  selectedUser,
  isOnline,
  isTyping,
  onBack,
}) {
  return (
    <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
            {selectedUser.avatar ? (
              <img src={selectedUser.avatar} className="w-full h-full" />
            ) : (
              selectedUser.name[0]
            )}
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div>
          <h2 className="font-bold">{selectedUser.name}</h2>
          <p
            className={`text-xs ${
              isTyping
                ? "text-blue-600"
                : isOnline
                  ? "text-green-600"
                  : "text-gray-500"
            }`}
          >
            {isTyping ? "typing..." : isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>
      <div className="flex gap-2 text-gray-500">
        <button onClick={onBack} className="md:hidden">
          Back
        </button>
      </div>
    </div>
  );
}
