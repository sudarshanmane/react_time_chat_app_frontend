const ChatWindow = ({
  title,
  messages,
  currentUserId,
  text,
  typing,
  hasSelectedChat,
  onTextChange,
  onTyping,
  onSend,
}) => {
  return (
    <main className="flex-1 border rounded p-4 h-[70vh] flex flex-col">
      <div className="mb-4">
        <div className="font-medium text-lg">
          {hasSelectedChat ? title : "Select a chat"}
        </div>
      </div>

      <div className="flex-1 overflow-auto mb-4 space-y-2 flex flex-col">
        {messages.map((message, index) => {
          const isMine = String(message.senderId) === currentUserId;

          return (
            <div
              key={message._id || index}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-2 rounded w-fit ${
                  isMine ? "bg-blue-100 text-right" : "bg-gray-100 text-left"
                }`}
              >
                <div>{message.message}</div>
                <div className="text-xs text-gray-400">
                  {new Date(message.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto flex gap-3">
        <textarea
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          onKeyUp={onTyping}
          className="w-full border rounded p-2 h-24 mb-2"
          placeholder={
            hasSelectedChat
              ? "Write a message..."
              : "Select a chat to start messaging"
          }
          disabled={!hasSelectedChat}
        />
        <div className="flex justify-between items-center">
          <button
            onClick={onSend}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
            disabled={!hasSelectedChat || !text.trim()}
          >
            Send
          </button>
          {typing && (
            <div className="text-sm text-gray-600">{typing} is typing...</div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ChatWindow;
