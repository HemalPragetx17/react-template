import { Field, Form, Formik } from 'formik';
import React from 'react';
import { FaChevronLeft } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { Button, Input, OTPInput } from '../../components/ui';
import type { IForgotPasswordEmailModel, IForgotPasswordOTPModel, IForgotPasswordPasswordModel } from '../../models/account';
import { Routing } from '../../routes/routing';
import { ForgotEmailValidationSchema, ForgotOTPValidationSchema, ForgotPasswordValidationSchema } from '../../validation/account';

const ActionType = {
  Email: 'Email',
  Otp: 'Otp',
  Password: 'Password',
} as const;

type ActionType = typeof ActionType[keyof typeof ActionType];

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [actionType, setActionType] = React.useState<ActionType>(ActionType.Email);

  const emailState: IForgotPasswordEmailModel = { email: "" };

  const otpState: IForgotPasswordOTPModel = { otp: '' };

  const passwordState: IForgotPasswordPasswordModel = {
    password: '',
    confirmPassword: ''
  };

  const handleEmailSubmit = async (values: IForgotPasswordEmailModel) => {
    console.log("🚀 ~ handleEmailSubmit ~ values:", values)
    // await accountService
    //   .forgotPassword(values)
    //   .then((response) => {
    //     const responseData: ILoginResponseModel = response?.data?.data;
    //     if (response?.data?.status) {
    // dispatch(adminLogin(responseData));
    setActionType(ActionType.Otp);
    //   }
    // })
    // .catch((error: Error) => console.log(error?.message));
  };

  const handleOtpSubmit = async (values: IForgotPasswordOTPModel) => {
    console.log("🚀 ~ handleOtpSubmit ~ values:", values)
    // await accountService
    //   .varifyOTP(values)
    //   .then((response) => {
    //     const responseData: ILoginResponseModel = response?.data?.data;
    //     if (response?.data?.status) {
    // dispatch(adminLogin(responseData));
    setActionType(ActionType.Password);
    //   }
    // })
    // .catch((error: Error) => console.log(error?.message));
  };

  const ResendOTP = async () => {
    // await accountService
    //   .resendOTP()
    //   .then((response) => {
    //     const responseData: ILoginResponseModel = response?.data?.data;
    //     if (response?.data?.status) {
    // dispatch(adminLogin(responseData));
    //   }
    // })
    // .catch((error: Error) => console.log(error?.message));
  };

  const handlePasswordSubmit = async (values: IForgotPasswordPasswordModel) => {
    console.log("🚀 ~ handlePasswordSubmit ~ values:", values)
    // await accountService
    //   .resetPassword(values)
    //   .then((response) => {
    //     if (response?.data?.status) {
    navigate(Routing.Login)
    //   }
    // })
    // .catch((error: Error) => console.log(error?.message));
  };


  return (
    <div className='h-screen w-full flex flex-col justify-center items-center overflow-hidden relative bg-background'>
      <div className="fixed -bottom-[500px] -left-[500px] max-w-[1000px] w-[1000px] h-[1000px] z-0 opacity-50 animate-rotate-bg"></div>
      <div className="flex justify-center items-center w-full z-10">
        <div className='max-w-[450px] w-full shadow-sm border border-default-200/50 dark:border-default-100/10 px-[40px] py-[50px] z-10 bg-content1 rounded-xl' >
          <button type="button" className="cursor-pointer text-default-700 hover:text-primary dark:text-neutral-400 dark:hover:text-primary" onClick={() => navigate(Routing.Login)} aria-label="Back to login">
            <FaChevronLeft className="h-[1.375em] w-[1.375em]" aria-hidden />
          </button>
          <div className="text-center">
            <div className="max-w-[100px] w-full mx-auto flex justify-center">
              <img src="/favicon.svg" alt='' />
            </div>
            <div className="mt-[5px]">
              <p className="text-2xl font-bold">Admin Portal</p>
            </div>
          </div>

          <div className="p-0 mt-[40px] overflow-visible">
            {actionType === ActionType.Email && (
              <>
                <p className='mb-2 text-center text-xl font-semibold'>Forgot password</p>
                <p className="text-muted text-base text-center text-default-700">
                  Enter your register E-mail id to reset your password
                </p>
                <Formik
                  initialValues={emailState}
                  onSubmit={handleEmailSubmit}
                  validationSchema={ForgotEmailValidationSchema}
                  validateOnBlur={false}
                  validateOnChange={true}
                  enableReinitialize={true}
                >
                  {({ handleSubmit, values, setFieldValue }) => {
                    return (
                      <Form onSubmit={handleSubmit} className='mt-[30px]'>
                        <div className="mb-5 relative">
                          <Field
                            name="email"
                            type="email"
                            label="Email"
                            placeholder="Enter your email"
                            value={values?.email}
                            onChange={(e: any) => setFieldValue("email", e.target.value)}
                            component={Input}
                          />
                        </div>
                        <Button fullWidth type="submit" className="mt-5 justify-center">
                          Submit
                        </Button>
                      </Form>
                    )
                  }}
                </Formik>
              </>
            )}

            {actionType === ActionType.Otp && (
              <>
                <p className='mb-2 text-center text-xl font-semibold'>Forgot password</p>
                <p className="text-muted text-base text-center text-default-700">
                  Enter 6 digit code that you received in your mail
                </p>
                <Formik
                  initialValues={otpState}
                  onSubmit={handleOtpSubmit}
                  validationSchema={ForgotOTPValidationSchema}
                  validateOnBlur={false}
                  validateOnChange={true}
                  enableReinitialize={true}
                >
                  {({ handleSubmit, values, setFieldValue }) => {
                    return (
                      <Form onSubmit={handleSubmit} className='mt-[30px]'>
                        <div className='mt-5'>
                          <Field
                            name="otp"
                            numInputs={6}
                            placeholder="Enter OTP"
                            value={values?.otp}
                            onChange={(e: any) => setFieldValue("otp", e.target.value)}
                            component={OTPInput}
                          />
                          <div className="text-right mt-5">
                            <p className="hover:cursor-pointer text-default-700 text-sm inline-block" onClick={ResendOTP}>
                              Resend Otp
                            </p>
                          </div>
                          <Button fullWidth type="submit" className="mt-5 justify-center">
                            Submit
                          </Button>
                        </div>
                      </Form>
                    )
                  }}
                </Formik>
              </>
            )}

            {actionType === ActionType.Password && (
              <>
                <p className='mb-2 text-center text-xl font-semibold'>Reset password</p>
                <p className="text-muted text-base text-center text-default-700">
                  Reset your password for re-login in your account
                </p>
                <Formik
                  initialValues={passwordState}
                  onSubmit={handlePasswordSubmit}
                  validationSchema={ForgotPasswordValidationSchema}
                  validateOnBlur={false}
                  validateOnChange={true}
                  enableReinitialize={true}
                >
                  {({ handleSubmit, values, setFieldValue }) => {
                    return (
                      <Form onSubmit={handleSubmit} className='mt-[30px]'>
                        <div className="mb-5 relative">
                          <Field
                            type="password"
                            name="password"
                            label="Password"
                            placeholder="Enter new password"
                            isPasswordToggle={true}
                            value={values?.password}
                            onChange={(e: any) => setFieldValue("password", e.target.value)}
                            component={Input}
                          />
                        </div>
                        <div className="mb-4 relative">
                          <Field
                            type="password"
                            name="confirmPassword"
                            label="Confirm Password"
                            placeholder="Confirm new password"
                            isPasswordToggle={true}
                            value={values?.confirmPassword}
                            onChange={(e: any) => setFieldValue("confirmPassword", e.target.value)}
                            component={Input}
                          />
                        </div>
                        <Button fullWidth type="submit" className="mt-5 justify-center">
                          Submit
                        </Button>
                      </Form>
                    )
                  }}
                </Formik>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
