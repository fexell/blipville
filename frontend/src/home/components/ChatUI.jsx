import React from "react";

export default function ChatUI({ messages, input, setInput, sendChat }) {
  return (
    <div className="flex flex-col flex-1 p-2 rounded-2xl bg-neutral-950">
      <div className="flex-1 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className="msg">
            <strong>{m.name || m.from}: </strong>
            {m.message}
          </div>
        ))}
      </div>
      <div className="flex flex-row py-2">
        <input
          className="flex-1 grow-4 p-2 rounded-2xl bg-neutral-800"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendChat()}
        />
        <button className="flex-1" onClick={sendChat}>Send</button>
      </div>
    </div>
  );
}
