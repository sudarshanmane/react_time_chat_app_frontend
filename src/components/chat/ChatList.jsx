import { Plus, User, Users } from "@phosphor-icons/react";
import UserSearch from "../UserSearch";
import { Button } from "../ui/button";
import {
  getChatTitle,
  getOtherParticipant,
  getParticipantEmail,
  getParticipantId,
  getParticipantLabel,
} from "./chatHelpers";

const ChatList = ({
  chats,
  selectedChatId,
  currentUser,
  currentUserId,
  search,
  searchResults,
  searchLoading,
  onSearchChange,
  onUserSelect,
  onChatSelect,
  onCreateGroup,
}) => {
  return (
    <aside className="w-80 border rounded p-2 h-[70vh] overflow-auto">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-medium">Chats</h3>
        <Button
          type="button"
          onClick={onCreateGroup}
          variant="outline"
          size="icon"
          title="Create group chat"
          aria-label="Create group chat"
        >
          <Plus size={16} />
        </Button>
      </div>

      <div className="mb-3">
        <UserSearch
          value={search}
          onChange={onSearchChange}
          results={searchResults}
          onSelect={onUserSelect}
          loading={searchLoading}
        />
      </div>

      <div className="space-y-2">
        {chats.map((chat) => {
          const other = getOtherParticipant(chat, currentUserId);
          const title = getChatTitle(chat, currentUserId, currentUser);

          return (
            <div
              key={chat._id}
              onClick={() => onChatSelect(chat)}
              className={`group relative p-2 rounded cursor-pointer ${
                selectedChatId === chat._id ? "bg-gray-100" : ""
              }`}
            >
              <div className="flex items-center gap-2 justify-between">
                <div className="font-medium flex items-center">
                  {chat.isGroup ? (
                    <Users className="mr-2" size={18} aria-hidden />
                  ) : (
                    <User className="mr-2" size={18} aria-hidden />
                  )}
                  {title}
                </div>

                <div className="text-sm text-gray-500">
                  {chat.isGroup
                    ? `${chat.participants?.length || 0} members`
                    : getParticipantEmail(other, currentUserId, currentUser)}
                </div>
              </div>
              {chat.isGroup && (
                <div className="mt-2 hidden border bg-background p-2 shadow-sm group-hover:block">
                  <div className="mb-2 text-xs font-medium text-muted-foreground">
                    Members
                  </div>
                  <div className="max-h-52 overflow-auto">
                    {(chat.participants || []).map((participant) => {
                      const participantId = getParticipantId(participant);
                      const email = getParticipantEmail(
                        participant,
                        currentUserId,
                        currentUser,
                      );

                      return (
                        <div
                          key={participantId}
                          className="flex items-center justify-between gap-2 border-b py-2 last:border-b-0"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {getParticipantLabel(
                                participant,
                                currentUserId,
                                currentUser,
                              )}
                            </div>
                            {email && (
                              <div className="truncate text-xs text-muted-foreground">
                                {email}
                              </div>
                            )}
                          </div>
                          {participantId === currentUserId && (
                            <span className="shrink-0 text-xs text-muted-foreground">
                              You
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default ChatList;
