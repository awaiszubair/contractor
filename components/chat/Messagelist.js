// import { useRef, useEffect, useState } from "react";
// import { RiArrowDropDownLine } from "react-icons/ri";
// import MessageTicks from "./MessageTicks";

// export default function MessageList({
//   messages,
//   currentUserId,
//   messagesEndRef,
//   hasMore,
//   isLoadingMore,
//   onLoadMore,
//   setMessages,
//   socket,
//   editMessageApi, // 🔹 Pass these functions from parent
//   deleteMessageApi,
// }) {
//   const currentAudioRef = useRef(null);
//   const messageListRef = useRef(null);
//   const [prevScrollHeight, setPrevScrollHeight] = useState(0);
//   const [isInitialLoad, setIsInitialLoad] = useState(true);
//   const [editingId, setEditingId] = useState(null);
//   const [editText, setEditText] = useState("");

//   useEffect(() => {
//     if (!socket || !socket.connected) return;
//     socket.on("private_message", (editedMessage) => {
//       // Update the message in the UI
//       setMessages((prev) =>
//         prev.map((msg) => {
//           if (msg._id === editedMessage._id) {
//             return editedMessage;
//           }
//           return msg;
//         }),
//       );
//     });
//     return () => {
//       socket.off("private_message");
//     };
//   }, [socket, socket?.connected]);

//   const handleAudioPlay = (e) => {
//     if (currentAudioRef.current && currentAudioRef.current !== e.target) {
//       currentAudioRef.current.pause();
//     }
//     currentAudioRef.current = e.target;
//   };

//   useEffect(() => {
//     if (isInitialLoad && messages.length > 0) {
//       setTimeout(() => setIsInitialLoad(false), 300);
//     }
//   }, [messages.length, isInitialLoad]);

//   const handleScroll = () => {
//     if (!messageListRef.current || isLoadingMore || !hasMore) return;
//     if (isInitialLoad) return;
//     if (messageListRef.current.scrollTop < 100) {
//       setPrevScrollHeight(messageListRef.current.scrollHeight);
//       onLoadMore();
//     }
//   };

//   useEffect(() => {
//     if (messageListRef.current && prevScrollHeight > 0 && !isLoadingMore) {
//       const newScrollHeight = messageListRef.current.scrollHeight;
//       messageListRef.current.scrollTop = newScrollHeight - prevScrollHeight;
//       setPrevScrollHeight(0);
//     }
//   }, [messages.length, isLoadingMore]);

//   // 🔹 Handle Edit Save
//   const handleEditSave = async (msg) => {
//     if (!editText.trim()) return;
//     await editMessageApi(msg._id, editText); // API + socket
//     setEditingId(null);
//     setEditText("");
//   };

//   // 🔹 Handle Delete
//   const handleDelete = async (msg) => {
//     if (confirm("Are you sure you want to delete this message?")) {
//       await deleteMessageApi(msg._id); // API + socket
//     }
//   };

//   return (
//     <div
//       ref={messageListRef}
//       onScroll={handleScroll}
//       className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('/bg-chat.png')] bg-repeat bg-contain bg-opacity-10"
//     >
//       {hasMore && (
//         <div className="flex justify-center py-3 text-gray-400 text-xs italic">
//           {isLoadingMore
//             ? "Loading older messages..."
//             : "Scroll up to load more"}
//         </div>
//       )}

//       {messages.map((msg, idx) => {
//         const isMe =
//           msg.sender._id === currentUserId || msg.sender === currentUserId;
//         const status = msg.status || "sent";

//         const bubbleBase = `
//         relative max-w-[78%] p-3.5 rounded-2xl shadow-sm text-sm
//         transition-all duration-150 break-words
//       `;
//         const myBubble = `${bubbleBase} bg-[#000000] px-5 text-[#F8F9FD]`;
//         const theirBubble = `${bubbleBase} bg-[#D9D9D9] px-5 text-[#1A1A1B]`;

//         const isPureVoice =
//           msg.type === "voice" && (!msg.content || msg.content.trim() === "");

//         return (
//           <div
//             key={idx}
//             className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
//           >
//             {isPureVoice ? (
//               <>
//                 {msg.attachments?.length > 0 &&
//                   msg.attachments.map((att, i) => (
//                     <audio
//                       key={i}
//                       controls
//                       className={`
//                       w-full max-w-[380px]  h-12
//                       rounded-xl my-2
//                       text-black
//                     `}
//                       style={{
//                         // backgroundColor: "#D9D9D9", // force light gray background
//                         color: "#1A1A1B", // force dark text
//                         borderRadius: "1rem",
//                       }}
//                       onPlay={handleAudioPlay}
//                     >
//                       <source src={att} type="audio/webm" />
//                       <source src={att} type="audio/mpeg" />
//                       <source src={att} type="audio/ogg" />
//                       Your browser does not support the audio element.
//                     </audio>
//                   ))}

//                 <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
//                   <span>
//                     {new Date(msg.createdAt).toLocaleTimeString([], {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </span>
//                   {isMe && <MessageTicks status={status} />}
//                 </div>
//               </>
//             ) : (
//               <div className={`${isMe ? myBubble : theirBubble} group`}>
//                 {/* 3-dot menu for own messages */}
//                 {isMe && msg.content !== "[Deleted]" && (
//                   <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition">
//                     <div className="relative group">
//                       <button className="text-gray-400  cursor-pointer hover:text-gray-200 text-xl leading-none focus:outline-none">
//                         <RiArrowDropDownLine size={32} color="white" />
//                       </button>
//                       <div
//                         className="
//                       absolute right-0 mt-1 w-28 bg-white/95 backdrop-blur-sm
//                       border border-gray-200 rounded-lg shadow-xl
//                       opacity-0 group-hover:opacity-100 transition-opacity duration-150
//                       pointer-events-none group-hover:pointer-events-auto
//                     "
//                       >
//                         <button
//                           className="block w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-t-lg"
//                           onClick={() => {
//                             setEditingId(msg._id);
//                             setEditText(msg.content || "");
//                           }}
//                         >
//                           Edit
//                         </button>
//                         <button
//                           className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
//                           onClick={() => handleDelete(msg)}
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Normal attachments */}
//                 {msg.attachments?.length > 0 &&
//                   msg.attachments.map((att, i) => {
//                     if (/\.(jpg|jpeg|png|gif)$/i.test(att)) {
//                       return (
//                         <img
//                           key={i}
//                           src={att}
//                           alt="attachment"
//                           className="mt-2 max-h-64 w-auto rounded-xl object-contain border border-black/10 shadow-sm"
//                         />
//                       );
//                     } else {
//                       return (
//                         <a
//                           key={i}
//                           href={att}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="block mt-2 text-blue-500 hover:text-blue-700 underline text-sm"
//                         >
//                           📎 {att.split("/").pop() || "Attachment"}
//                         </a>
//                       );
//                     }
//                   })}

//                 {/* Text or edit mode */}
//                 {editingId === msg._id ? (
//                   <div className="mt-3 w-full flex gap-2">
//                     <input
//                       className={`
//                       flex-1 px-4 py-2.5 text-sm rounded-xl border
//                       ${
//                         isMe
//                           ? "bg-gray-900/60 border-gray-700 text-white placeholder-gray-400"
//                           : "bg-white/70 border-gray-300 text-black placeholder-gray-500"
//                       }
//                       focus:outline-none focus:ring-2 focus:ring-blue-500/40
//                     `}
//                       value={editText}
//                       onChange={(e) => setEditText(e.target.value)}
//                       autoFocus
//                       placeholder="Edit message..."
//                     />
//                     <button
//                       className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors min-w-[70px]"
//                       onClick={() => handleEditSave(msg)}
//                     >
//                       Save
//                     </button>
//                     <button
//                       className="px-5 py-2.5 bg-gray-600/80 text-white text-sm rounded-xl hover:bg-gray-700 transition-colors min-w-[70px]"
//                       onClick={() => setEditingId(null)}
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 ) : msg.content === "[Deleted]" ? (
//                   <div className="flex items-center gap-2 opacity-70 italic text-sm py-1">
//                     <span>🚫</span>
//                     <span>This message was deleted</span>
//                   </div>
//                 ) : (
//                   <div className="leading-relaxed">{msg.content}</div>
//                 )}
//               </div>
//             )}

//             {!isPureVoice && (
//               <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-1">
//                 <span>
//                   {new Date(msg.createdAt).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </span>
//                 {isMe && msg.content !== "[Deleted]" && (
//                   <MessageTicks status={status} />
//                 )}
//               </div>
//             )}
//           </div>
//         );
//       })}

//       <div ref={messagesEndRef} />
//     </div>
//   );
// }

import { useRef, useEffect, useState } from "react";
import MessageBubble from "./MessageBubble";
import VoiceMessage from "./VoiceMessage";
import LoadMoreIndicator from "./LoadMoreIndicator";
import { useScrollManagement } from "@/hooks/useScrollManagement";
import { useMessageSocket } from "@/hooks/useMessageSocket";

export default function MessageList({
  messages,
  currentUserId,
  messagesEndRef,
  hasMore,
  isLoadingMore,
  onLoadMore,
  setMessages,
  socket,
  editMessageApi,
  deleteMessageApi,
  highlightMessageId
}) {
  const currentAudioRef = useRef(null);
  const messageRefs = useRef({});
  const messageListRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // Custom hooks for better organization
  useMessageSocket(socket, setMessages);

  const { isInitialLoad, handleScroll } = useScrollManagement({
    messageListRef,
    messages,
    isLoadingMore,
    hasMore,
    onLoadMore,
  });

  useEffect(() => {
    console.log("Editing ID changedss:", editingId);
  }, [editingId]); // for debugging

   // Scroll to and highlight specific message
  useEffect(() => {
    if (highlightMessageId && messages.length > 0) {
      // Wait for messages to render
      setTimeout(() => {
        const targetElement = messageRefs.current[highlightMessageId];
        
        if (targetElement) {
          // Scroll to the message
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          // Add highlight animation
          targetElement.classList.add("animate-highlight-pulse");
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            targetElement.classList.remove("animate-highlight-pulse");
          }, 3000);
        }
      }, 300);
    }
  }, [highlightMessageId, messages]);

  const handleAudioPlay = (e) => {
    if (currentAudioRef.current && currentAudioRef.current !== e.target) {
      currentAudioRef.current.pause();
    }
    currentAudioRef.current = e.target;
  };

  const handleEditSave = async (msg) => {
    if (!editText.trim()) return;
    await editMessageApi(msg._id, editText);
    setEditingId(null);
    setEditText("");
  };

  const handleDelete = async (msg) => {
    if (confirm("Are you sure you want to delete this message?")) {
      await deleteMessageApi(msg._id);
    }
  };

  const handleEditStart = (msg) => {
    setEditingId(msg._id);
    setEditText(msg.content || "");
  };

  const handleEditCancel = () => {
    console.log("Edit cancelled");
    setEditingId(null);
  };

  return (
    <div
      ref={messageListRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('/bg-chat.png')] bg-repeat bg-contain bg-opacity-10"
    >
      <LoadMoreIndicator hasMore={hasMore} isLoadingMore={isLoadingMore} />

      {messages.map((msg, idx) => {
        const isMe =
          msg.sender._id === currentUserId || msg.sender === currentUserId;
        const isPureVoice =
          msg.type === "voice" && (!msg.content || msg.content.trim() === "");

        return (
          <div
            key={msg._id || idx}
            ref={(el) => (messageRefs.current[msg._id] = el)}
            className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
          >
            {isPureVoice ? (
              <VoiceMessage
                msg={msg}
                isMe={isMe}
                onAudioPlay={handleAudioPlay}
              />
            ) : (
              <MessageBubble
                msg={msg}
                isMe={isMe}
                editingId={editingId}
                editText={editText}
                onEditTextChange={setEditText}
                onEditStart={handleEditStart}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
                onDelete={handleDelete}
              />
            )}
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
}
