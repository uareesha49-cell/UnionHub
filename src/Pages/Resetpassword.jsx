import { Signreset } from "../components/Signreset";
import { Emailvalidation } from "../components/Emailvalidation";
import { useNavigate } from "react-router-dom";
import { Back } from "../components/Back";
import { apiRequest } from "../auth/api";
import { ActionButton } from "../components/ActionButton";

export const Resetpassword = () => {
  const navigate = useNavigate();

  const handleEmailSubmit = async (values, { setSubmitting }) => {
    const email = String(values?.email || "").toLowerCase();
    setSubmitting(true);
    try {
      await apiRequest("/auth/password-reset/request", {
        method: "POST",
        body: { email },
      });
      navigate("/otp", { state: { email } });
    } catch (e) {
      // Toast handled in apiRequest
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Signreset centerHeading="Reset Password" contentOffsetClassName="mt-14">
      <h4 className="text-gray-500 text-center mb-4 font-montserrat font-semibold">
        Please enter your email to reset your password
      </h4>

      {/* Email Input (Formik handles validation inside) */}
      <Emailvalidation onSubmit={handleEmailSubmit}>
        {({ isSubmitting }) => (
          <ActionButton
            type="submit"
            loading={isSubmitting}
            className="w-full max-w-[432px] bg-primary text-white py-2 rounded-3xl font-montserrat mt-[30px] min-h-[44px]"
          >
            Continue
          </ActionButton>
        )}
      </Emailvalidation>
      <Back variant="inline" className="mx-auto" />
    </Signreset>
    
  );
};
