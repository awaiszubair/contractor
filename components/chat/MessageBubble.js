import MessageMenu from "./MessageMenu";
import MessageAttachments from "./MessageAttachments";
import MessageEditForm from "./MessageEditForm";
import MessageTimestamp from "./MessageTimestamp";

export default function MessageBubble({
  msg,
  isMe,
  editingId,
  editText,
  onEditTextChange,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDelete,
}) {
  const status = msg.status || "sent";

  const bubbleBase = `
    relative min-w-[8%] max-w-[78%] p-4.5 rounded-2xl shadow-sm text-sm
    transition-all duration-150 break-words
  `;
  const myBubble = `${bubbleBase} bg-[#000000] px-5 text-[#F8F9FD]`;
  const theirBubble = `${bubbleBase} bg-[#D9D9D9] px-5 text-[#1A1A1B]`;

  const isDeleted = msg.content === "[Deleted]";
  const isEditing = editingId === msg._id;

  return (
    <>
      <div className={`${isMe ? myBubble : theirBubble}  group`}>
        {/* Attachments */}
        <MessageAttachments attachments={msg.attachments} />

        {/* Message content */}
        {isEditing ? (
          <MessageEditForm
            isMe={isMe}
            editText={editText}
            onEditTextChange={onEditTextChange}
            onSave={() => onEditSave(msg)}
            onCancel={onEditCancel}
          />
        ) : isDeleted ? (
          <div className="flex items-center gap-2 opacity-70 italic text-sm py-1">
            <span>🚫</span>
            <span>This message was deleted</span>
          </div>
        ) : (
          <div className="leading-relaxed">{msg.content}</div>
        )}

        {/* Menu for own messages */}
        {isMe && !isDeleted && !isEditing && (
          <MessageMenu
            editingId={editingId}
            onEdit={() => onEditStart(msg)}
            onDelete={() => onDelete(msg)}
          />
        )}
      </div>

      {/* Timestamp and status */}
      <MessageTimestamp
        timestamp={msg.createdAt}
        isMe={isMe}
        status={status}
        showTicks={!isDeleted}
      />
    </>
  );
}
