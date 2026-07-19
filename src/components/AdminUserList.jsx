import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../auth/api";
import { toast } from "sonner";
import { CustomToast } from "./CustomToast";

export const AdminUserList = ({ role, title }) => {
  const auth = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiRequest(`/admin/users/${role}`, {
          method: "GET",
          token: auth.token,
        });
        setUsers(data.users || []);
      } catch (e) {
        toast.custom((t) => (
          <CustomToast
            id={t}
            message={e?.message || "Failed to fetch users"}
            type="error"
          />
        ));
      } finally {
        setLoading(false);
      }
    };

    if (auth.isAuthenticated) {
      fetchUsers();
    }
  }, [auth.isAuthenticated, auth.token, role]);

  return (
    <div className="flex flex-col gap-6 bg-white rounded-3xl h-full p-6 font-montserrat">

      {loading ? (
        <p className="text-gray-500 font-nunito">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500 font-nunito">No users found for this role.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600 font-nunito text-sm">
                  ID
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-nunito text-sm">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-nunito text-sm">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-nunito text-sm">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800 font-nunito">{user.id}</td>
                  <td className="py-3 px-4 text-gray-800 font-nunito">
                    {user.name || "-"}
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-nunito">
                    {user.email}
                  </td>
                  <td className="py-3 px-4 text-gray-500 font-nunito text-sm">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
