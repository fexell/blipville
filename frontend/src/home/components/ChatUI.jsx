import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

export default function ChatUI({ messages, input, setInput, sendChat, maxLength = 200 }) {
  return (
    <div className="chat-ui flex flex-col h-full justify-end w-96 rounded-r-[40px] bg-neutral-950">
      <div className="chat-wrapper flex-1 p-4 overflow-y-scroll overflow-x-hidden flex flex-col-reverse min-h-0">
        {[...messages].map((m, i) => (
          <div key={i} className="msg hyphens-auto text-wrap">
            <strong>{m.name || m.from}: </strong>
            {m.message}
          </div>
        ))}
      </div>
      <div className="flex flex-row gap-2 p-4 pt-0">
        <div className='relative flex-1'>
          <input
            className="flex-1 w-full min-w-0 px-2 py-2 pr-16 rounded-r-2xl bg-neutral-800"
            value={input}
            maxLength={maxLength}
            onChange={(e) => {
              if (e.target.value.length <= maxLength) setInput(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
            placeholder="Write a message..."
          />
          <div className='absolute right-2 top-1/2 -translate-y-1/2'>
            <span className='text-neutral-500'>{input.length}/{maxLength}</span>
          </div>
        </div>
        <button
          className="shrink-0 px-4 py-2 rounded-full text-neutral-500 hover:cursor-pointer hover:text-neutral-50"
          onClick={sendChat}
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </div>
  );
}
