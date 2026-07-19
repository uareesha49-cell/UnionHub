import { useState } from "react";
import { Signreset } from "../components/Signreset";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import { mediaData } from "../utils/mediaData";
import { apiRequest } from "../auth/api";
import { ActionButton } from "../components/ActionButton";
import { toast } from "sonner";

// Validation Schema
const SignupSchema = Yup.object().shape({
  name: Yup.string().required("Institute name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
});

export const InstituteSignup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Signreset centerHeading="Sign Up Institute" contentOffsetClassName="mt-14">
      <h4 className="text-gray-500 text-center mb-4 font-montserrat font-semibold">
        Create your institute account
      </h4>

      <Formik
        initialValues={{ name: "", email: "", password: "", confirmPassword: "" }}
        validationSchema={SignupSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await apiRequest("/auth/director/register", {
              method: "POST",
              body: { 
                name: values.name, 
                email: values.email, 
                password: values.password,
                institute_name: values.name, // Use the institute name as institute_name
              },
            });
            toast.success("Account created successfully! Please login.");
            navigate("/login");
          } catch (e) {
            // Error toast handled in apiRequest
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ handleSubmit, isSubmitting }) => (
          <Form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
            {/* Institute/Name Input */}
            <div className="flex flex-col items-start mb-4 w-full max-w-[432px]">
              <h2 className="text-lg mb-2 font-poppins text-gray-700">Institute Name</h2>
              <div className="relative w-full">
                <img
                  src={mediaData.Sms} 
                  alt="Name Icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10"
                />
                <Field
                  type="text"
                  name="name"
                  placeholder="Enter your institute name"
                  className="w-full h-[48px] pl-10 pr-4 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 bg-bgcolor
                    font-nunito text-[16px] leading-[24px] text-gray-700 placeholder-gray-400"
                />
              </div>
              <ErrorMessage
                name="name"
                component="div"
                className="text-red text-sm mt-1 font-montserrat"
              />
            </div>

            {/* Email Input */}
            <div className="flex flex-col items-start mb-4 w-full max-w-[432px]">
              <h2 className="text-lg mb-2 font-poppins text-gray-700">
                Email Address
              </h2>
              <div className="relative w-full">
                <img
                  src={mediaData.Sms} 
                  alt="Email Icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10"
                />
                <Field
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full h-[48px] pl-10 pr-4 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 bg-bgcolor
                    font-nunito text-[16px] leading-[24px] text-gray-700 placeholder-gray-400"
                />
              </div>
              <ErrorMessage
                name="email"
                component="div"
                className="text-red text-sm mt-1 font-montserrat"
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col items-start mb-4 w-full max-w-[432px]">
              <h2 className="text-lg mb-3 mt-1 font-poppins text-gray-700">
                Password
              </h2>
              <div className="relative w-full">
                <img
                  src={mediaData.Password}
                  alt="Lock Icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                />
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  className="w-full h-[48px] pl-10 pr-10 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 bg-bgcolor
                    font-nunito text-[16px] leading-[24px] text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 rounded-3xl"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <ErrorMessage
                name="password"
                component="div"
                className="text-red text-sm mt-1 font-montserrat"
              />
            </div>

            {/* Confirm Password Input */}
            <div className="flex flex-col items-start mb-4 w-full max-w-[432px]">
              <h2 className="text-lg mb-3 mt-1 font-poppins text-gray-700">
                Confirm Password
              </h2>
              <div className="relative w-full">
                <img
                  src={mediaData.Password}
                  alt="Lock Icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                />
                <Field
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  className="w-full h-[48px] pl-10 pr-10 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 bg-bgcolor
                    font-nunito text-[16px] leading-[24px] text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 rounded-3xl"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <ErrorMessage
                name="confirmPassword"
                component="div"
                className="text-red text-sm mt-1 font-montserrat"
              />
            </div>

            {/* Sign Up Button */}
            <div className="w-full flex justify-center mt-4">
              <ActionButton
                type="submit"
                loading={isSubmitting}
                className="w-full max-w-[432px] bg-primary text-white py-2 rounded-3xl font-montserrat min-h-[44px]"
              >
                Sign Up
              </ActionButton>
            </div>

            {/* Link to Login */}
            <div className="w-full flex justify-center mt-6">
              Already have an account ?
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-primary text-md font-semibold hover:underline"
              >
                Login here
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Signreset>
  );
};
