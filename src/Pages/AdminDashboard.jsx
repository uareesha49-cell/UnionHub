import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../auth/api";
import { CustomToast } from "../components/CustomToast";
import { toast } from "sonner";

export const AdminDashboard = () => {
  const auth = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiRequest("/admin/users", {
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
  }, [auth.isAuthenticated, auth.token]);

  // Group users by role to count
  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6 bg-white rounded-3xl h-full p-6 font-montserrat">
     

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-md">
          <h3 className="text-gray-600 font-nunito text-sm mb-2">Total Users</h3>
          <p className="text-4xl font-bold text-primary">{users.length}</p>
        </div>
        {Object.entries(roleCounts).map(([role, count]) => (
          <div
            key={role}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-md"
          >
            <h3 className="text-gray-600 font-nunito text-sm mb-2">
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </h3>
            <p className="text-4xl font-bold text-primary">{count}</p>
          </div>
        ))}
      </div>

     
    </div>
  );
};
