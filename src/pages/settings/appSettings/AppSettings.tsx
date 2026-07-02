import { Field, Form, Formik } from "formik";
import { toast } from "react-toastify";
import { Button, Card, CardBody, Checkbox, Input } from "../../../components/ui";
import type { IAppSettingsModel } from "../../../models/settings";
import { AppSettingsValidationSchema } from "../../../validation/settings";

const initialValues: IAppSettingsModel = {
  androidVersion: "1.2.3",
  iosVersion: "1.0",
  androidForceUpdate: false,
  iosForceUpdate: false,
  androidMaintenance: false,
  iosMaintenance: false,
};

const AppSettings = () => {
  const handleSubmit = (
    values: IAppSettingsModel,
    { setSubmitting }: { setSubmitting: (v: boolean) => void }
  ) => {
    console.log("App Settings submitted:", values);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("App settings updated successfully!");
    }, 900);
  };

  return (
    <section>
      <div className="flex justify-between items-center">
        <p className="text-2xl">App Settings</p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={AppSettingsValidationSchema()}
        onSubmit={handleSubmit}
        validateOnBlur={true}
        validateOnChange={true}
      >
        {({ isSubmitting }) => (
          <Form>
            <Card className="my-5" shadow="md" fullWidth>
              <CardBody className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Android Version
                      </label>
                      <Field
                        name="androidVersion"
                        placeholder="e.g. 1.2.3"
                        variant="bordered"
                        radius="md"
                        size="md"
                        component={Input}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        iOS Version
                      </label>
                      <Field
                        name="iosVersion"
                        placeholder="e.g. 1.0"
                        variant="bordered"
                        radius="md"
                        size="md"
                        component={Input}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-5">
                    <Field
                      name="androidForceUpdate"
                      label="Android Force Update"
                      color="primary"
                      size="md"
                      radius="md"
                      component={Checkbox}
                    />
                    <Field
                      name="iosForceUpdate"
                      label="iOS Force Update"
                      color="primary"
                      size="md"
                      radius="md"
                      component={Checkbox}
                    />
                    <Field
                      name="androidMaintenance"
                      label="Android App Maintenance"
                      color="primary"
                      size="md"
                      radius="md"
                      component={Checkbox}
                    />
                    <Field
                      name="iosMaintenance"
                      label="iOS App Maintenance"
                      color="primary"
                      size="md"
                      radius="md"
                      component={Checkbox}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            <div className="mt-6">
              <Button type="submit" isLoading={isSubmitting}>
                Update
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default AppSettings;
