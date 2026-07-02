import * as Yup from "yup";

export const AppSettingsValidationSchema = () => {
  return Yup.object().shape({
    androidVersion: Yup.string()
      .matches(
        /^\d+\.\d+(\.\d+)?$/,
        "Enter a valid version format (e.g. 1.2.3)"
      )
      .required("Android version is required"),
    iosVersion: Yup.string()
      .matches(
        /^\d+\.\d+(\.\d+)?$/,
        "Enter a valid version format (e.g. 1.0)"
      )
      .required("iOS version is required"),
    androidForceUpdate: Yup.boolean(),
    iosForceUpdate: Yup.boolean(),
    androidMaintenance: Yup.boolean(),
    iosMaintenance: Yup.boolean(),
  });
};
