export default function ChatEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
      <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center text-4xl">
        💬
      </div>
      <h2 className="text-xl font-bold text-gray-700">Contractor Chat Web</h2>
      <p className="mt-2 text-sm text-center max-w-md">
        Send and receive messages. <br /> Select a user from the sidebar to
        start chatting.
      </p>
    </div>
  );
}
