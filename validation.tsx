import * as Yup from "yup";


const LoginSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string()
        .min(5, "Password cannot be less than 5 characters")
        .required("This field is required"),
});

const ResetPasswordSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Required"),
    code: Yup.string().required("Code is required"),
    password: Yup.string()
        .min(5, "Password cannot be less than 5 characters")
        .required("This field is required")
        .matches(
            /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
            "Password must contain at least 5 characters, one uppercase, one number and one special case character"
        ),
    confirmPassword: Yup.string()
        .required("Confirm Password is required")
        .oneOf([Yup.ref("password")], "Confirm Password does not match"),
});

const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Required"),
});

const SignupSchema = Yup.object().shape({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Required"),
    username: Yup.string()
        .min(5, "Username cannot be less than 5 characters")
        .required("This field is required"),
    password: Yup.string()
        .min(5, "Password cannot be less than 5 characters")
        .required("This field is required")
        .matches(
            /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
            "Password must contain at least 8 characters, one uppercase, one number and one special case character"
        ),
    password_confirmation: Yup.string()
        .required("Confirm Password is required")
        .oneOf([Yup.ref("password")], "Passwords must match"),
});

export { LoginSchema, ResetPasswordSchema, ForgotPasswordSchema, SignupSchema };