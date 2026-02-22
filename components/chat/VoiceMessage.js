import { useEffect } from "react";
import MessageTimestamp from "./MessageTimestamp";

export default function VoiceMessage({ msg, isMe, onAudioPlay }) {
  const status = msg.status || "sent";
  console.log("Audio attachments:", msg.attachments); // Debug this

  useEffect(()=>{
    console.log("VoiceMessage mounted with attachments:", msg.attachments);
  },[])

  return (
    <>
      {msg.attachments?.length > 0 &&
        msg.attachments.map((att, i) => (

          <audio
            key={i}
            controls
            className="w-full max-w-[380px] h-12 rounded-xl my-2 text-black"
            style={{
              color: "#1A1A1B",
              borderRadius: "1rem",
            }}
            onPlay={onAudioPlay}
          >
            <source src={att} type="audio/webm" />
            <source src={att} type="audio/mpeg" />
            <source src={att} type="audio/ogg" />
            Your browser does not support the audio element.
          </audio>
        ))}

      <MessageTimestamp
        timestamp={msg.createdAt}
        isMe={isMe}
        status={status}
        showTicks={true}
      />
    </>
  );
}
