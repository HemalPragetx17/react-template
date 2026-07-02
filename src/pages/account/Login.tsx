import { Field, Form, Formik } from "formik";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Input } from '../../components/ui';
import type { ILoginRequestModel } from '../../models/account';
import { Routing } from "../../routes/routing";
import accountService from "../../services/account-service";
import { adminLogin } from '../../store/slices/authSlice';
import { handleFormLoader } from "../../store/slices/generalSlice";
import { LoginValidationSchema } from "../../validation/account";

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const initialValues: ILoginRequestModel = {
    email: "admin@gmail.com",
    password: "Admin@123",
  };

  const handleSubmit = async (values: ILoginRequestModel) => {
    dispatch(handleFormLoader(true));
    await accountService
      .login(values)
      .then(async (response) => {
        if (response) {
          toast.success("Login successful");
          dispatch(adminLogin(response as any));
          navigate(Routing.Dashboard)
        }
      })
      .catch((error: Error) => console.log(error?.message))
      .finally(() => dispatch(handleFormLoader(false)))
  };

  return (
    <div className='h-screen w-full flex flex-col justify-center items-center overflow-hidden relative bg-background'>
      <div className="fixed -bottom-[500px] -left-[500px] max-w-[1000px] w-[1000px] h-[1000px] z-0 opacity-50 animate-rotate-bg"></div>
      <div className="flex justify-center items-center w-full z-10">
        <div className="max-w-[450px] w-full shadow-[0px_18px_50px_-10px_rgba(0,0,0,0.2)] border-none px-[40px] py-[50px] z-10 bg-white rounded-xl">
          <div className="text-center">
            <div className="max-w-[100px] w-full mx-auto flex justify-center">
              <img src="/favicon.svg" alt='' />
            </div>
            <div className="mt-[5px]">
              <p className="text-2xl font-bold">Admin Portal</p>
            </div>
          </div>
          <div className="p-0 mt-[40px] overflow-visible">
            <p className="mb-5 text-center text-xl font-semibold">Login</p>
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
                  <Form onSubmit={handleSubmit} className='mt-[30px]'>
                    <div className="mb-3 relative">
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
                    <div className="mb-3 relative">
                      <Field
                        name="password"
                        type="password"
                        label="Password"
                        placeholder="Enter your password"
                        isPasswordToggle={true}
                        value={values?.password}
                        onChange={(e: any) => setFieldValue("password", e.target.value)}
                        component={Input}
                      />
                    </div>
                    <div className="text-right">
                      <p className="hover:cursor-pointer text-default-700 text-sm inline-block" onClick={() => navigate(Routing.ForgotPassword)}>
                        Forgot password?
                      </p>
                    </div>
                    <Button fullWidth type="submit" className="mt-5 justify-center">
                      Login
                    </Button>
                  </Form>
                )
              }}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
