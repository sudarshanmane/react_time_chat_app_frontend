import React from "react";

export default function UserSearch({
  value,
  onChange,
  results = [],
  onSelect,
  loading,
  placeholder = "Search users to start chat",
}) {
  return (
    <div className="relative">
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full border rounded px-2 py-1"
        aria-autocomplete="list"
        aria-expanded={results.length > 0}
      />

      {(results.length > 0 || loading) && (
        <div className="absolute left-0 right-0 mt-2 bg-white border rounded shadow max-h-48 overflow-auto z-50">
          {loading ? (
            <div className="p-2 text-sm text-gray-500">Searching...</div>
          ) : (
            results.map((u) => (
              <div
                key={u._id}
                onClick={() => onSelect(u)}
                className="p-2 cursor-pointer hover:bg-gray-100"
              >
                <div className="font-medium">{u.name || u.email}</div>
                <div className="text-sm text-gray-500">{u.email}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
