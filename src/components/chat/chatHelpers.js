export const dedupeById = (list) => [
  ...new Map((list || []).map((item) => [item._id, item])).values(),
];

export const getParticipantId = (participant) =>
  String(participant?._id || participant || "");

export const getOtherParticipant = (chat, currentUserId) =>
  (chat?.participants || []).find(
    (participant) => getParticipantId(participant) !== currentUserId,
  ) || chat?.participants?.[0];

export const getParticipantLabel = (participant, currentUserId, currentUser) => {
  const participantId = getParticipantId(participant);

  if (participantId === currentUserId) {
    return currentUser?.name || currentUser?.email || "You";
  }

  if (typeof participant === "string") return participant;

  return participant?.name || participant?.email || participantId;
};

export const getParticipantEmail = (participant, currentUserId, currentUser) => {
  const participantId = getParticipantId(participant);

  if (participantId === currentUserId) return currentUser?.email || "";
  if (typeof participant === "string") return "";

  return participant?.email || "";
};

export const getChatTitle = (chat, currentUserId, currentUser) => {
  if (!chat) return "";
  if (chat.isGroup) return chat.groupName || "Group";

  const other = getOtherParticipant(chat, currentUserId);
  return getParticipantLabel(other, currentUserId, currentUser) || "Chat";
};

export const normalizeMessages = (messages) => {
  const serverMessages = new Map();
  const tempMessages = [];

  for (const message of messages || []) {
    if (!message) continue;

    if (typeof message._id === "string" && message._id.startsWith("temp-")) {
      tempMessages.push(message);
    } else {
      serverMessages.set(message._id, message);
    }
  }

  const normalized = [...serverMessages.values()];

  for (const tempMessage of tempMessages) {
    const duplicate = normalized.find(
      (message) =>
        message.message === tempMessage.message &&
        message.senderId === tempMessage.senderId &&
        message.chatId === tempMessage.chatId,
    );

    if (!duplicate) normalized.push(tempMessage);
  }

  normalized.sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return normalized;
};
