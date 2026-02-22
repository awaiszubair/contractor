export default function VoiceRecorder({ recordingTime, onStop, onCancel }) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 
      bg-white/95 backdrop-blur-md 
      border-t border-gray-200 
      px-4 py-3 
      flex items-center justify-between 
      shadow-lg"
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Animated Recording Dot */}
        <div className="relative flex items-center justify-center">
          <span className="absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75 animate-ping"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
        </div>

        <span className="text-sm font-medium text-gray-700">
          Recording • {recordingTime}
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm 
          bg-gray-100 hover:bg-gray-200 
          text-gray-700 
          rounded-full 
          transition-all duration-200"
        >
          Cancel
        </button>

        <button
          onClick={onStop}
          className="px-5 py-2 text-sm 
          bg-[#25D366] hover:bg-[#20bd5a] 
          text-white 
          rounded-full 
          transition-all duration-200 
          flex items-center gap-2 shadow-md"
        >
          <span>Send</span>
          <span className="text-base">🎤</span>
        </button>
      </div>
    </div>
  );
}
