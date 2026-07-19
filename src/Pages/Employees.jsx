import { useCallback, useEffect, useMemo, useState } from "react";
import { Table } from "../components/Table";
import { Form } from "../components/Form";
import { Imagemodal } from "../components/Imagemodal";
import { Customcard } from "../components/Customcard";
import { mediaData } from "../utils/mediaData";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../auth/api";
import { toast } from "sonner";
import { CustomToast } from "../components/CustomToast";
import { coerceStaffRoleSlug } from "../utils/staffRoles";

export const Employees = () => {
  const auth = useAuth();
  const role = auth.user?.role;
  const isPrincipal = role === "principal";
  const isVicePrincipal = role === "vice_principal";
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalType, setModalType] = useState("created");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isNewEmployee, setIsNewEmployee] = useState(false);
  const [showForm, setShowForm] = useState(false); // 👈 new state for toggling table/form
  const [users, setUsers] = useState([]);
  const [createRole, setCreateRole] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createConfirmPassword, setCreateConfirmPassword] = useState("");
  const [createInstituteName, setCreateInstituteName] = useState("");
  const [editUserId, setEditUserId] = useState(null);
  const [editRole, setEditRole] = useState("teacher");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [editInstituteName, setEditInstituteName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    const data = await apiRequest("/director/users", { token: auth.token });
    setUsers(data.users || []);
  }, [auth.token]);

  useEffect(() => {
    if (!auth.token) return;
    loadUsers().catch(() => {});
  }, [auth.token, loadUsers]);

  const handleNewEmployeeClick = () => {
    setIsNewEmployee(true);
    setEditUserId(null);
    setEditRole("teacher");
    setEditEmail("");
    setEditPassword("");
    setEditConfirmPassword("");
    setEditInstituteName("");
    const defaultCreateRole = isVicePrincipal ? "finance" : isPrincipal ? "teacher" : "principal";
    setCreateRole(defaultCreateRole);
    setCreateEmail("");
    setCreatePassword("");
    setCreateConfirmPassword("");
    setCreateInstituteName("");
    setShowForm(true); // 👈 replaces table with form
  };

  const employeeRows = useMemo(() => {
    const allowedRoles = new Set([
      "employee",
      "teacher",
      "principal",
      "vice_principal",
      "tech_staff",
      "finance",
    ]);
    let rows = users.filter((u) => allowedRoles.has(u.role));
    if (isPrincipal) {
      rows = rows.filter((u) => u.role !== "principal");
    }
    return rows;
  }, [users, isPrincipal]);

  const columns = [
    { header: "Email", key: "Email" },
    { header: "Role", key: "Role" },
    { header: "Created At", key: "CreatedAt" },
    { header: "Action", key: "Action" },
  ];

  const data = employeeRows.map((u) => ({
    __id: u.id,
    Email: { type: "text", value: u.email },
    Role: {
      type: "text",
      value: u.role
        ? u.role
            .replace(/_/g, " ")
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        : "",
    },
    CreatedAt: { type: "text", value: u.created_at ? new Date(u.created_at).toLocaleDateString() : "" },
    Action: { type: "image", value: [mediaData.Edit, mediaData.Recycle] },
  }));

  const roleSelectOptions = useMemo(
    () =>
      isVicePrincipal
        ? [{ label: "Finance", value: "finance" }]
        : isPrincipal
          ? [
              { label: "Teacher", value: "teacher" },
              { label: "Vice Principal", value: "vice_principal" },
              { label: "Tech Staff", value: "tech_staff" },
              { label: "Finance", value: "finance" },
            ]
          : [
              { label: "Principal", value: "principal" },
              { label: "Vice Principal", value: "vice_principal" },
              { label: "Teacher", value: "teacher" },
              { label: "Employee", value: "employee" },
              { label: "Tech Staff", value: "tech_staff" },
              { label: "Finance", value: "finance" },
            ],
    [isVicePrincipal, isPrincipal]
  );

  const allowedRoleValues = useMemo(() => roleSelectOptions.map((o) => o.value), [roleSelectOptions]);

  useEffect(() => {
    if (!showForm || !isNewEmployee) return;
    if (!createRole || !allowedRoleValues.includes(createRole)) {
      setCreateRole(allowedRoleValues[0] ?? "finance");
    }
  }, [showForm, isNewEmployee, allowedRoleValues, createRole]);

  const newEmployeeFields = [
    {
      label: "Role",
      placeholder: "Select role",
      type: "select",
      fullWidth: true,
      icon: mediaData.User,
      value: createRole,
      onChange: (e) => setCreateRole(e.target.value),
      options: roleSelectOptions,
    },
    {
      label: "Email",
      placeholder: "user@example.com",
      type: "email",
      fullWidth: true,
      icon: mediaData.Sms,
      value: createEmail,
      onChange: (e) => setCreateEmail(e.target.value),
    },
    {
      label: "Institute Name",
      placeholder: "Enter institute name",
      type: "text",
      fullWidth: true,
      icon: mediaData.User,
      value: createInstituteName,
      onChange: (e) => setCreateInstituteName(e.target.value),
    },
    {
      label: "Password",
      placeholder: "Enter Password",
      fullWidth: false,
      type: "password",
      icon: mediaData.Lock,
      value: createPassword,
      onChange: (e) => setCreatePassword(e.target.value),
    },
    {
      label: "Confirm Password",
      placeholder: "Confirm Password",
      fullWidth: false,
      type: "password",
      icon: mediaData.Lock,
      value: createConfirmPassword,
      onChange: (e) => setCreateConfirmPassword(e.target.value),
    },
  ];

  const handleCreateAccount = async () => {
    if (isSubmitting) return;
    const emailNorm = String(createEmail || "").trim().toLowerCase();
    const roleSlug = coerceStaffRoleSlug(createRole);
    if (!roleSlug) {
      toast.custom((t) => (
        <CustomToast id={t} message="Choose a valid role (e.g. Finance)." type="error" />
      ));
      return;
    }
    if (!emailNorm || !createPassword) {
      toast.custom((t) => <CustomToast id={t} message="Please fill all fields" type="error" />);
      return;
    }

    if (createPassword !== createConfirmPassword) {
      toast.custom((t) => <CustomToast id={t} message="Passwords do not match" />);
      return;
    }
    try {
      setIsSubmitting(true);
      const created = await apiRequest("/director/users", {
        method: "POST",
        token: auth.token,
        body: { 
          email: emailNorm, 
          password: createPassword, 
          role: roleSlug,
          institute_name: createInstituteName || undefined,
        },
      });
      const createdUser = created?.user
        ? {
            id: created.user.id,
            email: created.user.email,
            role: created.user.role,
            created_by: created.user.created_by ?? null,
            created_at: new Date().toISOString(),
          }
        : null;

      if (createdUser) {
        setUsers((prev) => {
          if (prev.some((u) => u.id === createdUser.id)) return prev;
          return [createdUser, ...prev];
        });
      }

      setShowForm(false);
      setModalType("created");
      setShowSuccessModal(true);
      loadUsers().catch(() => {});
    } catch (e) {
      // Toast handled in apiRequest
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (row) => {
    setIsNewEmployee(false);
    setEditUserId(row?.__id ?? null);
    setEditEmail(String(row?.Email?.value ?? ""));
    setEditRole(String(row?.Role?.value ?? "teacher"));
    setEditPassword("");
    setEditConfirmPassword("");
    // Find the user in the users array to get the institute_name
    const user = users.find(u => u.id === row?.__id);
    setEditInstituteName(user?.institute_name ?? "");
    setShowForm(true);
  };

  const handleUpdateAccount = async () => {
    if (isSubmitting) return;
    if (!editUserId) return;
    const emailNorm = String(editEmail || "").trim().toLowerCase();
    if (!emailNorm) return;
    const roleSlug = coerceStaffRoleSlug(editRole);
    if (!roleSlug) {
      toast.custom((t) => <CustomToast id={t} message="Invalid role selected." type="error" />);
      return;
    }
    if (editPassword && editPassword !== editConfirmPassword) {
      toast.custom((t) => <CustomToast id={t} message="Passwords do not match" />);
      return;
    }

    try {
      setIsSubmitting(true);
      await apiRequest(`/director/users/${editUserId}`, {
        method: "PUT",
        token: auth.token,
        body: {
          email: emailNorm,
          role: roleSlug,
          password: editPassword ? editPassword : undefined,
          institute_name: editInstituteName || undefined,
        },
      });
      setShowForm(false);
      setModalType("updated");
      setShowSuccessModal(true);
      loadUsers().catch(() => {});
    } catch (e) {
      // Toast handled in apiRequest
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (row) => {
    const id = row?.__id;
    if (!id) return;
    const email = row?.Email?.value ? String(row.Email.value) : "";
    setDeleteTarget({ id, email });
    setShowDeleteModal(true);
  };

  const handleDeleteAccount = async () => {
    if (!deleteTarget?.id) {
      setShowDeleteModal(false);
      setDeleteTarget(null);
      return;
    }
    setDeleteSubmitting(true);
    try {
      await apiRequest(`/director/users/${deleteTarget.id}`, { method: "DELETE", token: auth.token });
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setModalType("deleted");
      setShowSuccessModal(true);
      loadUsers().catch(() => {});
    } catch (e) {
      // Toast handled in apiRequest
    } finally {
      setDeleteSubmitting(false);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // Buttons
  const buttons = isNewEmployee
    ? [
        {
          label: "Cancel",
          onClick: () => setShowForm(false),
          className: "bg-grey text-white hover:bg-gray-400 font-semibold font-montserrat w-full sm:w-auto px-6 sm:px-[60px]",
        },
        {
          label: "Create Account",
          loading: isSubmitting,
          onClick: handleCreateAccount,
          disabled: isSubmitting,
          className: "bg-primary font-semibold font-montserrat text-white w-full sm:w-[200px] px-6 sm:px-9",
        },
      ]
    : [
        {
          label: "Cancel",
          onClick: () => setShowForm(false),
          className: "bg-grey text-white hover:bg-gray-400 font-semibold font-montserrat w-full sm:w-auto px-6 sm:px-[60px]",
        },
        {
          label: "Update",
          loading: isSubmitting,
          onClick: handleUpdateAccount,
          disabled: isSubmitting,
          className: "bg-primary font-semibold font-montserrat text-white w-full sm:w-[200px] px-6 sm:px-9",
        },
      ];

  return (
    <>
      {/* 👇 Conditionally render either the table OR the form */}
      {!showForm ? (
        <Table
          title="Accounts"
          buttonText="New Employee"
          onButtonClick={handleNewEmployeeClick}
          columns={columns}
          data={data}
          onActionClick={(row, actionIndex) => {
            if (actionIndex === 0) handleStartEdit(row);
            if (actionIndex === 1) openDeleteModal(row);
          }}
        />
      ) : (
        <Form
          heading={isNewEmployee ? "Create Account" : "Edit Employee Information"}
          fields={
            isNewEmployee
              ? newEmployeeFields
              : [
                  {
                    label: "Role",
                    placeholder: "Select role",
                    type: "select",
                    fullWidth: true,
                    icon: mediaData.User,
                    value: editRole,
                    onChange: (e) => setEditRole(e.target.value),
                    options: roleSelectOptions,
                  },
                  {
                    label: "Email",
                    placeholder: "user@example.com",
                    type: "email",
                    fullWidth: true,
                    icon: mediaData.Sms,
                    value: editEmail,
                    onChange: (e) => setEditEmail(e.target.value),
                  },
                  {
                    label: "Institute Name",
                    placeholder: "Enter institute name",
                    type: "text",
                    fullWidth: true,
                    icon: mediaData.User,
                    value: editInstituteName,
                    onChange: (e) => setEditInstituteName(e.target.value),
                  },
                  {
                    label: "New Password",
                    placeholder: "Enter Password",
                    fullWidth: false,
                    type: "password",
                    icon: mediaData.Lock,
                    value: editPassword,
                    onChange: (e) => setEditPassword(e.target.value),
                  },
                  {
                    label: "Confirm Password",
                    placeholder: "Confirm Password",
                    fullWidth: false,
                    type: "password",
                    icon: mediaData.Lock,
                    value: editConfirmPassword,
                    onChange: (e) => setEditConfirmPassword(e.target.value),
                  },
                ]
          }
          buttons={buttons}
          isNewEmployee={isNewEmployee}
        />
      )}

      {showDeleteModal && (
        <Customcard
          heading="Delete Account"
          content={
            <div>
              Are you sure you want to delete this account? <br />
              This action cannot be undone.
            </div>
          }
          button1Text={
            <div className="flex items-center justify-center gap-2">
              <img src={mediaData.Cancel} alt="cancel" className="w-5 h-5" />
              <span>No, Cancel</span>
            </div>
          }
          button2Text={
            <div className="flex items-center justify-center gap-2">
              <img src={mediaData.Trash} alt="delete" className="w-5 h-5" />
              <span>Yes, Delete</span>
            </div>
          }
          button1Bg="bg-gray-400"
          button2Bg="bg-[#E30000]"
          onButton1Click={() => {
            if (deleteSubmitting) return;
            setShowDeleteModal(false);
            setDeleteTarget(null);
          }}
          onButton2Click={handleDeleteAccount}
          button2Loading={deleteSubmitting}
        />
      )}

      {showSuccessModal && (
        <Imagemodal
          heading={
            modalType === "deleted" ? "Account Deleted" : modalType === "updated" ? "Account Updated" : "Account Created"
          }
          subheading={
            modalType === "deleted"
              ? "The account has been successfully deleted."
              : modalType === "updated"
                ? "The account has been successfully updated."
                : "The account has been successfully created."
          }
          onClose={() => {
            setShowSuccessModal(false);
            setModalType("created");
          }}
        />
      )}
    </>
  );
};
