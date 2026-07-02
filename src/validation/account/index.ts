import * as Yup from 'yup';

export const LoginValidationSchema = () => {
    return Yup.object().shape({
        email: Yup.string().required('Email is required!'),
        password: Yup.string().min(6, 'Password must be 6 character length!').required('Password is required!'),
    });
};

export const ForgotEmailValidationSchema = () => {
    return Yup.object().shape({
        email: Yup.string().required('Email is required!'),
    });
};

export const ForgotOTPValidationSchema = () => {
    return Yup.object().shape({
        otp: Yup.string().required('OTP is required!'),
    });
};
export const ForgotPasswordValidationSchema = () => {
    return Yup.object().shape({
        password: Yup.string().min(6, 'Password must be 6 character length!').required('Password is required!'),
        confirmPassword: Yup.string().required('Confirm Password is a required!')
            .min(6, 'Confirm Password must be 6 character length!')
            .oneOf([Yup.ref('password'), ''], 'New Password and Confirm Password must match.'),
    });
};

export const ChangePasswordValidationSchema = () => {
    return Yup.object().shape({
        oldPassword: Yup.string().required("Old password is required"),
        password: Yup.string()
            .min(8, "Password must be at least 8 characters")
            .matches(/[A-Z]/, "Must contain at least one uppercase letter")
            .matches(/[0-9]/, "Must contain at least one number")
            .matches(/[^A-Za-z0-9]/, "Must contain at least one special character")
            .required("New password is required"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("password")], "Passwords do not match")
            .required("Please confirm your new password"),
    });
};
