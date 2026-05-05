import { useCallback, useEffect, useMemo, useState } from "react";
import ChatList from "../../components/chat/ChatList";
import ChatWindow from "../../components/chat/ChatWindow";
import GroupChatDialog from "../../components/chat/GroupChatDialog";
import {
  dedupeById,
  getChatTitle,
  normalizeMessages,
} from "../../components/chat/chatHelpers";
import { useAuth } from "../../context/AuthContext";
import useDebounce from "../../hooks/useDebounce";
import api from "../../lib/api";
import socket from "../../lib/socket";

const Chat = () => {
  const { user } = useAuth();
  const currentUserId = String(user?._id || user?.id || "");

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);

  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [groupOpen, setGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [groupUsers, setGroupUsers] = useState([]);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [groupUsersLoading, setGroupUsersLoading] = useState(false);
  const [groupCreating, setGroupCreating] = useState(false);
  const [groupError, setGroupError] = useState("");

  const visibleGroupUsers = useMemo(() => {
    const query = groupSearch.trim().toLowerCase();
    if (!query) return groupUsers;

    return groupUsers.filter((groupUser) => {
      const name = groupUser.name || "";
      const email = groupUser.email || "";
      return `${name} ${email}`.toLowerCase().includes(query);
    });
  }, [groupSearch, groupUsers]);

  const selectedGroupUserIds = useMemo(
    () => new Set(selectedGroupUsers.map((groupUser) => String(groupUser._id))),
    [selectedGroupUsers],
  );

  const removeCurrentUser = useCallback(
    (list) =>
      dedupeById(list).filter(
        (listUser) => String(listUser._id) !== currentUserId,
      ),
    [currentUserId],
  );

  const refreshChats = useCallback(async () => {
    const res = await api.get("/chats/all");
    if (!res.data?.success) return [];

    const nextChats = dedupeById(res.data.data || []);
    setChats(nextChats);
    return nextChats;
  }, []);

  const updateMessages = useCallback((updater) => {
    setMessages((previousMessages) =>
      normalizeMessages(
        typeof updater === "function"
          ? updater(previousMessages)
          : updater,
      ),
    );
  }, []);

  const fetchGroupUsers = async () => {
    setGroupUsersLoading(true);
    setGroupError("");

    try {
      const res = await api.get("/users");
      setGroupUsers(removeCurrentUser(res.data?.data || []));
    } catch (err) {
      setGroupError("Could not load users.");
      console.error(err);
    } finally {
      setGroupUsersLoading(false);
    }
  };

  const debouncedSearch = useDebounce(async (query) => {
    if (!query.trim()) {
      setFilteredUsers([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    try {
      const res = await api.get(`/users?search=${encodeURIComponent(query)}`);
      setFilteredUsers(removeCurrentUser(res.data?.data || []));
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  }, 300);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshChats().catch(console.error);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [refreshChats]);

  useEffect(() => {
    if (!selectedChat) return;

    socket.emit("join", selectedChat._id);

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${selectedChat._id}`);
        if (res.data?.success) setMessages(normalizeMessages(res.data.data));
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    const handleMessage = (message) => {
      if (!selectedChat || message.chatId !== selectedChat._id) return;

      updateMessages((previousMessages) => {
        if (previousMessages.find((item) => item._id === message._id)) {
          return previousMessages;
        }

        const tempIndex = previousMessages.findIndex(
          (item) =>
            typeof item._id === "string" &&
            item._id.startsWith("temp-") &&
            item.senderId === message.senderId &&
            item.chatId === message.chatId &&
            item.message === message.message,
        );

        if (tempIndex === -1) return [...previousMessages, message];

        const nextMessages = [...previousMessages];
        nextMessages[tempIndex] = message;
        return nextMessages;
      });
    };

    socket.on("message:receive", handleMessage);
    return () => socket.off("message:receive", handleMessage);
  }, [selectedChat, updateMessages]);

  useEffect(() => {
    const handleTyping = (event) => {
      setTyping(event.name);
      setTimeout(() => setTyping(false), 1200);
    };

    socket.on("typing", handleTyping);
    return () => socket.off("typing", handleTyping);
  }, []);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    debouncedSearch?.(value);
  };

  const handleUserSelect = async (selectedUser) => {
    try {
      const res = await api.post("/chats", { userId: selectedUser._id });
      if (!res.data?.success) {
        console.error("Chat API failed", res.data);
        return;
      }

      const chat = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
      if (!chat) return;

      await refreshChats();
      setSelectedChat(chat);
      setSearch("");
      setFilteredUsers([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGroupOpenChange = (open) => {
    setGroupOpen(open);

    if (open) {
      fetchGroupUsers();
      return;
    }

    setGroupName("");
    setGroupSearch("");
    setSelectedGroupUsers([]);
    setGroupError("");
  };

  const toggleGroupUser = (selectedUser) => {
    setSelectedGroupUsers((previousUsers) => {
      const exists = previousUsers.some((item) => item._id === selectedUser._id);
      return exists
        ? previousUsers.filter((item) => item._id !== selectedUser._id)
        : [...previousUsers, selectedUser];
    });
    setGroupError("");
  };

  const createGroupChat = async () => {
    if (!groupName.trim()) {
      setGroupError("Group name is required.");
      return;
    }

    if (selectedGroupUsers.length === 0) {
      setGroupError("Select at least one member.");
      return;
    }

    setGroupCreating(true);
    setGroupError("");

    try {
      const participants = [
        currentUserId,
        ...selectedGroupUsers.map((groupUser) => groupUser._id),
      ];

      const res = await api.post("/chats/group", {
        groupName: groupName.trim(),
        participants,
      });

      if (!res.data?.success) {
        setGroupError(res.data?.message || "Could not create group.");
        return;
      }

      const chat = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
      const nextChats = await refreshChats();
      const createdChat = nextChats.find((item) => item._id === chat?._id) || chat;

      if (createdChat) setSelectedChat(createdChat);
      setGroupOpen(false);
      setGroupName("");
      setGroupSearch("");
      setSelectedGroupUsers([]);
    } catch (err) {
      setGroupError(err.response?.data?.message || "Could not create group.");
      console.error(err);
    } finally {
      setGroupCreating(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedChat || !currentUserId || !text.trim()) return;

    const payload = {
      chatId: selectedChat._id,
      senderId: currentUserId,
      message: text,
    };

    const tempId = `temp-${Date.now()}`;

    if (socket?.connected) {
      socket.emit("message:send", payload, (res) => {
        if (!res?.success || !res.data) {
          updateMessages((previousMessages) =>
            previousMessages.filter((message) => message._id !== tempId),
          );
          console.error("Socket send failed", res?.message || res);
          return;
        }

        updateMessages((previousMessages) => {
          const newMessage = res.data;

          if (previousMessages.find((message) => message._id === newMessage._id)) {
            return previousMessages;
          }

          const tempIndex = previousMessages.findIndex(
            (message) => message._id === tempId,
          );

          if (tempIndex === -1) return [...previousMessages, newMessage];

          const nextMessages = [...previousMessages];
          nextMessages[tempIndex] = newMessage;
          return nextMessages;
        });
      });
    } else {
      try {
        const res = await api.post("/messages", payload);
        if (res.data?.success && res.data.data) {
          updateMessages((previousMessages) => [
            ...previousMessages,
            res.data.data,
          ]);
        }
      } catch (err) {
        console.error(err);
      }
    }

    setText("");
  };

  const handleTyping = () => {
    if (selectedChat) socket.emit("typing", selectedChat._id);
  };

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <div className="flex gap-4">
        <ChatList
          chats={chats}
          selectedChatId={selectedChat?._id}
          currentUser={user}
          currentUserId={currentUserId}
          search={search}
          searchResults={filteredUsers}
          searchLoading={searchLoading}
          onSearchChange={handleSearchChange}
          onUserSelect={handleUserSelect}
          onChatSelect={setSelectedChat}
          onCreateGroup={() => handleGroupOpenChange(true)}
        />

        <ChatWindow
          title={getChatTitle(selectedChat, currentUserId, user)}
          messages={messages}
          currentUserId={currentUserId}
          text={text}
          typing={typing}
          hasSelectedChat={!!selectedChat}
          onTextChange={setText}
          onTyping={handleTyping}
          onSend={sendMessage}
        />
      </div>

      <GroupChatDialog
        open={groupOpen}
        onOpenChange={handleGroupOpenChange}
        name={groupName}
        onNameChange={setGroupName}
        search={groupSearch}
        onSearchChange={setGroupSearch}
        users={visibleGroupUsers}
        selectedUserIds={selectedGroupUserIds}
        selectedCount={selectedGroupUsers.length}
        loading={groupUsersLoading}
        creating={groupCreating}
        error={groupError}
        onToggleUser={toggleGroupUser}
        onCreate={createGroupChat}
      />
    </div>
  );
};

export default Chat;
