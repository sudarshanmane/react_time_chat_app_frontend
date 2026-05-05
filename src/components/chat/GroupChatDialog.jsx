import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const GroupChatDialog = ({
  open,
  onOpenChange,
  name,
  onNameChange,
  search,
  onSearchChange,
  users,
  selectedUserIds,
  selectedCount,
  loading,
  creating,
  error,
  onToggleUser,
  onCreate,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create group chat</DialogTitle>
          <DialogDescription>
            Choose members from the full user list.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            className="h-9 w-full rounded-none border bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Group name"
          />

          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-9 w-full rounded-none border bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Filter users"
          />

          <div className="max-h-72 overflow-auto border">
            {loading ? (
              <div className="p-3 text-sm text-muted-foreground">
                Loading users...
              </div>
            ) : users.length > 0 ? (
              users.map((user) => {
                const checked = selectedUserIds.has(String(user._id));

                return (
                  <label
                    key={user._id}
                    className="flex cursor-pointer items-center gap-3 border-b p-3 last:border-b-0 hover:bg-muted/60"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => onToggleUser(user)}
                      aria-label={`Select ${user.name || user.email}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {user.name || user.email}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </span>
                  </label>
                );
              })
            ) : (
              <div className="p-3 text-sm text-muted-foreground">
                No users found.
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            {selectedCount} selected
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onCreate}
            disabled={creating || loading}
          >
            {creating ? "Creating..." : "Create group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupChatDialog;
