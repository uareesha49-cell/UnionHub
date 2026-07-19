import { useCallback, useEffect, useState } from "react";
import { Table } from "../components/Table";
import { Form } from "../components/Form";
import { Imagemodal } from "../components/Imagemodal";
import { Customcard } from "../components/Customcard";
import { mediaData } from "../utils/mediaData";
import { useAuth } from "../auth/AuthContext";
import { apiRequest } from "../auth/api";
import { toast } from "sonner";
import { CustomToast } from "../components/CustomToast";

function formatDateOnly(iso) {
  if (!iso) return "";
  const t = Date.parse(String(iso));
  return Number.isFinite(t) ? new Date(t).toLocaleDateString() : "";
}

export const Students = () => {
  const auth = useAuth();
  const canManageStudents = auth.user?.role === "director" || auth.user?.role === "principal";

  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isNewStudent, setIsNewStudent] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalType, setModalType] = useState("created");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createConfirmPassword, setCreateConfirmPassword] = useState("");
  const [createInstituteName, setCreateInstituteName] = useState("");

  const [editUserId, setEditUserId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [editInstituteName, setEditInstituteName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadStudents = useCallback(async () => {
    const data = await apiRequest("/director/users/students", { token: auth.token });
    setStudents(data.students || []);
  }, [auth.token]);

  useEffect(() => {
    if (!auth.token) return;
    loadStudents().catch(() => {});
  }, [auth.token, loadStudents]);

  const handleAddClick = () => {
    setIsNewStudent(true);
    setEditUserId(null);
    setCreateName("");
    setCreateEmail("");
    setCreatePassword("");
    setCreateConfirmPassword("");
    setCreateInstituteName("");
    setShowForm(true);
  };

  const handleStartEdit = (row) => {
    const id = row?.__id;
    if (!id) return;
    const u = students.find((s) => s.id === id);
    setIsNewStudent(false);
    setEditUserId(id);
    setEditName(u?.name ? String(u.name) : "");
    setEditEmail(u?.email ?? String(row?.Email?.value ?? ""));
    setEditPassword("");
    setEditConfirmPassword("");
    setEditInstituteName(u?.institute_name ?? "");
    setShowForm(true);
  };

  const handleCreateStudent = async () => {
    if (isSubmitting) return;
    const emailNorm = String(createEmail || "").trim().toLowerCase();
    if (!emailNorm || !createPassword) {
      toast.custom((t) => <CustomToast id={t} message="Please fill email and password" type="error" />);
      return;
    }
    if (createPassword !== createConfirmPassword) {
      toast.custom((t) => <CustomToast id={t} message="Passwords do not match" type="error" />);
      return;
    }
    try {
      setIsSubmitting(true);
      await apiRequest("/director/users/students", {
        method: "POST",
        token: auth.token,
        body: {
          email: emailNorm,
          password: createPassword,
          name: String(createName || "").trim() || undefined,
          institute_name: createInstituteName || undefined,
        },
      });
      setShowForm(false);
      setModalType("created");
      setShowSuccessModal(true);
      await loadStudents();
    } catch {
      // apiRequest toasts
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStudent = async () => {
    if (isSubmitting || !editUserId) return;
    const emailNorm = String(editEmail || "").trim().toLowerCase();
    if (!emailNorm) {
      toast.custom((t) => <CustomToast id={t} message="Email is required" type="error" />);
      return;
    }
    if (editPassword && editPassword !== editConfirmPassword) {
      toast.custom((t) => <CustomToast id={t} message="Passwords do not match" type="error" />);
      return;
    }
    try {
      setIsSubmitting(true);
      await apiRequest(`/director/users/students/${editUserId}`, {
        method: "PUT",
        token: auth.token,
        body: {
          email: emailNorm,
          name: editName.trim() === "" ? null : editName.trim(),
          password: editPassword ? editPassword : undefined,
          institute_name: editInstituteName || undefined,
        },
      });
      setShowForm(false);
      setModalType("updated");
      setShowSuccessModal(true);
      await loadStudents();
    } catch {
      // apiRequest toasts
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

  const handleDeleteStudent = async () => {
    if (!deleteTarget?.id) {
      setShowDeleteModal(false);
      setDeleteTarget(null);
      return;
    }
    setDeleteSubmitting(true);
    try {
      await apiRequest(`/director/users/students/${deleteTarget.id}`, {
        method: "DELETE",
        token: auth.token,
      });
      setModalType("deleted");
      setShowSuccessModal(true);
      await loadStudents();
    } catch {
      // apiRequest toasts
    } finally {
      setDeleteSubmitting(false);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const baseColumns = [
    { header: "Name", key: "Name" },
    { header: "Email", key: "Email" },
    { header: "Created At", key: "CreatedAt" },
  ];
  const columns = canManageStudents ? [...baseColumns, { header: "Action", key: "Action" }] : baseColumns;

  const tableData = students.map((u) => {
    const row = {
      __id: u.id,
      Name: { type: "text", value: u.name || "—" },
      Email: { type: "text", value: u.email },
      CreatedAt: { type: "text", value: formatDateOnly(u.created_at) },
    };
    if (canManageStudents) {
      row.Action = { type: "image", value: [mediaData.Edit, mediaData.Recycle] };
    }
    return row;
  });

  const newStudentFields = [
    {
      label: "Name (optional)",
      placeholder: "Display name",
      type: "text",
      fullWidth: true,
      icon: mediaData.User,
      value: createName,
      onChange: (e) => setCreateName(e.target.value),
    },
    {
      label: "Email",
      placeholder: "student@example.com",
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
      placeholder: "Enter password",
      type: "password",
      fullWidth: false,
      icon: mediaData.Lock,
      value: createPassword,
      onChange: (e) => setCreatePassword(e.target.value),
    },
    {
      label: "Confirm Password",
      placeholder: "Confirm password",
      type: "password",
      fullWidth: false,
      icon: mediaData.Lock,
      value: createConfirmPassword,
      onChange: (e) => setCreateConfirmPassword(e.target.value),
    },
  ];

  const editStudentFields = [
    {
      label: "Name",
      placeholder: "Display name",
      type: "text",
      fullWidth: true,
      icon: mediaData.User,
      value: editName,
      onChange: (e) => setEditName(e.target.value),
    },
    {
      label: "Email",
      placeholder: "student@example.com",
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
      placeholder: "Leave blank to keep current",
      type: "password",
      fullWidth: false,
      icon: mediaData.Lock,
      value: editPassword,
      onChange: (e) => setEditPassword(e.target.value),
    },
    {
      label: "Confirm Password",
      placeholder: "Confirm new password",
      type: "password",
      fullWidth: false,
      icon: mediaData.Lock,
      value: editConfirmPassword,
      onChange: (e) => setEditConfirmPassword(e.target.value),
    },
  ];

  const buttons = isNewStudent
    ? [
        {
          label: "Cancel",
          onClick: () => setShowForm(false),
          className:
            "bg-grey text-white hover:bg-gray-400 font-semibold font-montserrat w-full sm:w-auto px-6 sm:px-[60px]",
        },
        {
          label: "Create student",
          loading: isSubmitting,
          onClick: handleCreateStudent,
          disabled: isSubmitting,
          className: "bg-primary font-semibold font-montserrat text-white w-full sm:w-[200px] px-6 sm:px-9",
        },
      ]
    : [
        {
          label: "Cancel",
          onClick: () => setShowForm(false),
          className:
            "bg-grey text-white hover:bg-gray-400 font-semibold font-montserrat w-full sm:w-auto px-6 sm:px-[60px]",
        },
        {
          label: "Update",
          loading: isSubmitting,
          onClick: handleUpdateStudent,
          disabled: isSubmitting,
          className: "bg-primary font-semibold font-montserrat text-white w-full sm:w-[200px] px-6 sm:px-9",
        },
      ];

  const emptyState = (
    <div className="flex justify-center">
      <div className="bg-white rounded-[10px] w-full max-w-full h-[271px] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-[16px]">
          <img
            src={mediaData.Nomeeting}
            alt=""
            className="w-[140px] h-[140px] object-cover rounded"
          />
          <h3 className="font-montserrat font-semibold text-[18px] text-black text-center">No students yet</h3>
          <p className="font-montserrat font-normal text-[14px] text-center text-grey max-w-md px-4">
            {canManageStudents
              ? "Add a student account so they can log in and view fees and vouchers."
              : "Student accounts will appear here when a director or principal adds them."}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {!showForm ? (
        <Table
          title="Students"
          buttonText={canManageStudents ? "Add student" : undefined}
          onButtonClick={canManageStudents ? handleAddClick : undefined}
          columns={columns}
          data={tableData}
          emptyState={emptyState}
          onActionClick={(row, actionIndex) => {
            if (!canManageStudents) return;
            if (actionIndex === 0) handleStartEdit(row);
            if (actionIndex === 1) openDeleteModal(row);
          }}
        />
      ) : (
        <Form
          heading={isNewStudent ? "Add student" : "Edit student"}
          fields={isNewStudent ? newStudentFields : editStudentFields}
          buttons={buttons}
          isNewEmployee={isNewStudent}
        />
      )}

      {showDeleteModal && (
        <Customcard
          heading="Delete student"
          content={
            <div>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteTarget?.email || "this student"}</span>? <br />
              This action cannot be undone.
            </div>
          }
          button1Text={
            <div className="flex items-center justify-center gap-2">
              <img src={mediaData.Cancel} alt="" className="w-5 h-5" />
              <span>No, Cancel</span>
            </div>
          }
          button2Text={
            <div className="flex items-center justify-center gap-2">
              <img src={mediaData.Trash} alt="" className="w-5 h-5" />
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
          onButton2Click={handleDeleteStudent}
          button2Loading={deleteSubmitting}
        />
      )}

      {showSuccessModal && (
        <Imagemodal
          heading={
            modalType === "deleted"
              ? "Student deleted"
              : modalType === "updated"
                ? "Student updated"
                : "Student created"
          }
          subheading={
            modalType === "deleted"
              ? "The student account has been removed."
              : modalType === "updated"
                ? "The student account has been saved."
                : "The student account has been created."
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
