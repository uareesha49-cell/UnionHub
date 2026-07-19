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

  // Group users by institute_name
  const institutes = users.reduce((acc, user) => {
    const institute = user.institute_name || "Unassigned";
    if (!acc[institute]) {
      acc[institute] = {
        name: institute,
        director: null,
        roleCounts: {
          student: 0,
          principal: 0,
          vice_principal: 0,
          teacher: 0,
          tech_staff: 0,
          finance: 0,
        },
      };
    }
    if (user.role === "director") {
      acc[institute].director = user;
    }
    if (acc[institute].roleCounts.hasOwnProperty(user.role)) {
      acc[institute].roleCounts[user.role]++;
    }
    return acc;
  }, {});

  const instituteList = Object.values(institutes);

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
              {instituteList.map((institute, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800 font-nunito" title={institute.name}>
                    {
                      institute.name.length > 10
                        ? institute.name.slice(0, 10) + "..."
                        : institute.name
                    }
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-nunito" title={institute.director?.email || "-"}>
                    {
                      (institute.director?.email || "-").length > 10
                        ? (institute.director?.email || "-").slice(0, 10) + "..."
                        : (institute.director?.email || "-")
                    }
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-nunito">
                    {institute.roleCounts.student}
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-nunito">
                    {institute.roleCounts.principal}
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-nunito">
                    {institute.roleCounts.vice_principal}
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-nunito">
                    {institute.roleCounts.teacher}
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-nunito">
                    {institute.roleCounts.tech_staff}
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-nunito">
                    {institute.roleCounts.finance}
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
