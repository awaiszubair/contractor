import MessageTicks from "./MessageTicks";

export default function MessageTimestamp({
  timestamp,
  isMe,
  status,
  showTicks,
}) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-1">
      <span>
        {new Date(timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
      {isMe && showTicks && <MessageTicks status={status} />}
    </div>
  );
}
