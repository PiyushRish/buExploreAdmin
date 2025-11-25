import React from "react";

const DataTable = () => {
  const data = [
    {
      id: 1,
      name: "John Doe",
      role: "Admin",
      email: "john@example.com",
      status: "Active",
      createdAt: "2025-01-12",
    },
    {
      id: 2,
      name: "Sarah Smith",
      role: "Editor",
      email: "sarah@example.com",
      status: "Pending",
      createdAt: "2025-02-20",
    },
    {
      id: 3,
      name: "Mike Johnson",
      role: "Viewer",
      email: "mike@example.com",
      status: "Inactive",
      createdAt: "2025-03-14",
    },
    {
      id: 4,
      name: "Emily Davis",
      role: "Admin",
      email: "emily@example.com",
      status: "Active",
      createdAt: "2025-05-09",
    },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">User Details</h2>
      <table className="min-w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left border-b">#</th>
            <th className="px-4 py-2 text-left border-b">Name</th>
            <th className="px-4 py-2 text-left border-b">Email</th>
            <th className="px-4 py-2 text-left border-b">Role</th>
            <th className="px-4 py-2 text-left border-b">Status</th>
            <th className="px-4 py-2 text-left border-b">Created At</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-gray-50 transition duration-150 ease-in-out"
            >
              <td className="px-4 py-2 border-b">{user.id}</td>
              <td className="px-4 py-2 border-b font-medium">{user.name}</td>
              <td className="px-4 py-2 border-b text-gray-600">
                {user.email}
              </td>
              <td className="px-4 py-2 border-b">{user.role}</td>
              <td
                className={`px-4 py-2 border-b font-semibold ${
                  user.status === "Active"
                    ? "text-green-600"
                    : user.status === "Pending"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {user.status}
              </td>
              <td className="px-4 py-2 border-b">{user.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;