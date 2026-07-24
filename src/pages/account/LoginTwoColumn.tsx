import { Field, Form, Formik } from "formik";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { Button, Input } from '../../components/ui';
import type { ILoginRequestModel } from '../../models/account';
import { Routing } from "../../routes/routing";
import { adminLogin } from '../../store/slices/authSlice';
import { handleFormLoader } from "../../store/slices/generalSlice";
import { LoginValidationSchema } from "../../validation/account";

const LoginTwoColumn = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const initialValues: ILoginRequestModel = {
    email: "admin@gmail.com",
    password: "Admin@123",
  };

  const handleSubmit = async (values: ILoginRequestModel) => {
    console.log("🚀 ~ handleSubmit ~ values:", values)

    // bypass the api call
    dispatch(handleFormLoader(true));
    const response = {
      token: "mock-jwt-token-xyz123",
      user: {
        id: "mock-user-id-001",
        email: values.email || "admin@gmail.com",
        phone: "1234567890",
        role: "admin",
        is_active: true,
        first_name: "Admin",
        last_name: "User"
      }
    }
    toast.success("Login successful");
    dispatch(adminLogin(response as any));
    navigate(Routing.Dashboard)
    dispatch(handleFormLoader(false))

    // original api call

    // dispatch(handleFormLoader(true));
    // await accountService
    //   .login(values)
    //   .then(async (response) => {
    //     if (response) {
    //       toast.success("Login successful");
    //       dispatch(adminLogin(response as any));
    //       navigate(Routing.Dashboard)
    //     }
    //   })
    //   .catch((error: Error) => console.log(error?.message))
    //   .finally(() => dispatch(handleFormLoader(false)))
  };

  return (
    <div className='flex h-screen w-full bg-background overflow-hidden'>
      {/* Left Column */}
      <div className='hidden md:flex flex-col w-1/2 bg-primary-50 p-12 lg:p-16 relative overflow-hidden'>
        <div className='absolute inset-0 bg-primary-100 opacity-20 pointer-events-none'></div>
        <div className='relative z-10 flex items-center gap-2'>
          <img src="/favicon.svg" alt='Logo' className='w-auto h-10' />
          <span className='text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight'>Admin Portal</span>
        </div>
        <div className='relative z-10 flex-1 flex flex-col justify-center px-4 lg:px-12'>
          <h2 className='text-3xl lg:text-4xl font-semibold text-slate-800 dark:text-slate-100 leading-snug mb-6'>
            “Built for teams that lead industries.”
          </h2>
          <p className='text-xl text-slate-400 dark:text-slate-300 font-medium italic'>
            John Doe
          </p>
        </div>
      </div>

      {/* Right Column */}
      <div className='flex-1 flex justify-center items-center p-8 bg-background'>
        <div className="w-full max-w-md bg-content1 border border-default-200/50 dark:border-default-100/10 p-8 sm:p-10 rounded-2xl shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 leading-snug">
              Please sign in to your<br />admin account!
            </h1>
          </div>
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={LoginValidationSchema}
            validateOnBlur={false}
            validateOnChange={true}
            enableReinitialize={true}
          >
            {({ handleSubmit, values, setFieldValue }) => {
              return (
                <Form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                  <div className="relative">
                    <Field
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={values?.email}
                      onChange={(e: any) => setFieldValue("email", e.target.value)}
                      component={Input}
                    />
                  </div>
                  <div className="relative">
                    <Field
                      name="password"
                      type="password"
                      placeholder="Password"
                      isPasswordToggle={true}
                      value={values?.password}
                      onChange={(e: any) => setFieldValue("password", e.target.value)}
                      component={Input}
                    />
                  </div>
                  <div className="mt-2">
                    <Button fullWidth type="submit" className="justify-center py-2.5 font-semibold text-base">
                      Sign In
                    </Button>
                  </div>
                  <div className="text-center mt-4">
                    <p className="hover:cursor-pointer text-default-600 hover:text-primary transition-colors font-medium text-sm inline-block" onClick={() => navigate(Routing.ForgotPassword)}>
                      Forgot password?
                    </p>
                  </div>
                </Form>
              )
            }}
          </Formik>
        </div>
      </div>
    </div>
  )
}

export default LoginTwoColumn
