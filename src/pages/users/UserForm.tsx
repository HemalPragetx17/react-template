import { Field, Form, Formik } from "formik";
import React from "react";
import { Button, Input, PhoneNumberInput, Switch } from "../../components/ui";
import type { IUserModal } from "../../models/user";
import { UserValidationSchema } from "../../validation/user";

interface UserFormProps {
  user: IUserModal | null;
  onUserAdd: () => void;
  handleDialogClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onUserAdd, handleDialogClose }) => {
  const initialState: IUserModal = {
    firstName: "",
    lastName: "",
    email: "",
    phoneCountry: "",
    phone: "",
    role: 3,
    active: undefined,
  };

  const getData = () => user ? user : initialState;

  const handleSubmit = (values: IUserModal) => {
    console.log("🚀 ~ handleSubmit ~ values:", values)
    onUserAdd();
  };

  return (
    <Formik
      initialValues={getData()}
      validationSchema={UserValidationSchema}
      onSubmit={handleSubmit}
      validateOnBlur={false}
      validateOnChange={true}
      enableReinitialize={true}
    >
      {({ handleSubmit, values, setFieldValue }) => (
        <Form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Field
              name="firstName"
              label="First Name"
              placeholder="Enter first name"
              component={Input}
            />
            <Field
              name="lastName"
              label="Last Name"
              placeholder="Enter last name"
              component={Input}
            />
            <Field
              name="email"
              type="email"
              label="Email Address"
              placeholder="Enter email address"
              component={Input}
            />
            <Field
              country={'in'}
              type="tel"
              name='phone'
              label="Phone Number"
              placeholder="Enter phone number"
              inputProps={{
                name: 'phone',
                required: true,
              }}
              value={values?.phone}
              onChange={(value: string, country: any) => {
                setFieldValue('phoneCountry', `+${country.dialCode}`);
                setFieldValue('phone', value);
              }}
              component={PhoneNumberInput}
            />
            {user?._id && (
              <Field
                name="active"
                label="Account Status"
                component={Switch}
                size="lg"
                activeLabel="Active"
                inactiveLabel="Inactive"
              />
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="bordered" color="danger" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button type="submit" variant="solid" color="primary">
              Add User
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default UserForm;
