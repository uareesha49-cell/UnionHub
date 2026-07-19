import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../auth/api";
import { CustomToast } from "../components/CustomToast";
import { toast } from "sonner";

export const AdminInstitute = () => {
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
            message={e?.message || "Failed to fetch stats"}
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

  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  const directorUser = users.find(user => user.role === "director");

  return (
    <div className="flex flex-col gap-6 bg-white rounded-3xl h-full p-6 font-montserrat">

      {loading ? (
        <p className="text-gray-500 font-nunito">Loading institute info...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600 font-nunito text-sm">
                  Institute Name
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-nunito text-sm">
                  Director Email
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-nunito text-sm">
                 Students
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-nunito text-sm">
              Principals
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-nunito text-sm">
                Vice Principals
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-nunito text-sm">
                 Teachers
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-nunito text-sm">
                   Tech Staff
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-nunito text-sm">
                  Finance
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-800 font-nunito" title="Union Hub Institute">
                  {
                    "Union Hub Institute".length > 10
                      ? "Union Hub Institute".slice(0, 10) + "..."
                      : "Union Hub Institute"
                  }
                </td>
                <td className="py-3 px-4 text-gray-800 font-nunito" title={directorUser?.email || "-"}>
                  {
                    (directorUser?.email || "-").length > 10
                      ? (directorUser?.email || "-").slice(0, 10) + "..."
                      : (directorUser?.email || "-")
                  }
                </td>
                <td className="py-3 px-4 text-gray-800 font-nunito">
                  {roleCounts.student || 0}
                </td>
                <td className="py-3 px-4 text-gray-800 font-nunito">
                  {roleCounts.principal || 0}
                </td>
                <td className="py-3 px-4 text-gray-800 font-nunito">
                  {roleCounts.vice_principal || 0}
                </td>
                <td className="py-3 px-4 text-gray-800 font-nunito">
                  {roleCounts.teacher || 0}
                </td>
                <td className="py-3 px-4 text-gray-800 font-nunito">
                  {roleCounts.tech_staff || 0}
                </td>
                <td className="py-3 px-4 text-gray-800 font-nunito">
                  {roleCounts.finance || 0}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
