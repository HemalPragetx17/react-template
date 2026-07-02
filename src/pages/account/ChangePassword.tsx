import React from "react";
import { Field, Form, Formik } from "formik";
import { Button, Input } from "../../components/ui";
import type { IChangePasswordModel } from "../../models/account";
import { ChangePasswordValidationSchema } from "../../validation/account";

interface ChangePasswordFormProps {
  handleDialogClose: () => void;
}

const initialValues: IChangePasswordModel = {
  oldPassword: "",
  password: "",
  confirmPassword: "",
};

const ChangePassword: React.FC<ChangePasswordFormProps> = ({ handleDialogClose }) => {
  const handleSubmit = (
    values: IChangePasswordModel,
    { setSubmitting, resetForm }: { setSubmitting: (v: boolean) => void; resetForm: () => void }
  ) => {
    console.log("Change password submitted:", values);
    setTimeout(() => {
      setSubmitting(false);
      resetForm();
      handleDialogClose();
    }, 900);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={ChangePasswordValidationSchema}
      onSubmit={handleSubmit}
      validateOnBlur={true}
      validateOnChange={true}
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-4">
          <Field
            name="oldPassword"
            label="Old Password"
            placeholder="Enter old password"
            type="password"
            isPasswordToggle={true}
            variant="bordered"
            radius="md"
            size="md"
            component={Input}
          />

          <Field
            name="password"
            label="New Password"
            placeholder="Enter new password"
            type="password"
            isPasswordToggle={true}
            variant="bordered"
            radius="md"
            size="md"
            component={Input}
          />

          <Field
            name="confirmPassword"
            label="Confirm New Password"
            placeholder="Re-enter new password"
            type="password"
            isPasswordToggle={true}
            variant="bordered"
            radius="md"
            size="md"
            component={Input}
          />

          {/* Footer Action Area */}
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-default-100">
            <Button type="button" variant="bordered" color="danger" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button type="submit" variant="solid" color="primary" isLoading={isSubmitting}>
              Change Password
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ChangePassword;
