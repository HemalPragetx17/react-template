/* eslint-disable no-useless-escape */
export const RegularExpression = {
    Email: new RegExp(
        /^(?=.{1,64}@)(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(?=.{1,255}$)((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\s*$/,
    ),
    MobileNumber: new RegExp(/^[0-9]\d{9}$/),
    FullName: new RegExp(/^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/),
    AlphaNumeric: new RegExp(/^[A-Za-z0-9]*[A-Za-z][A-Za-z0-9]*$/),
    AlphaNumericSpace: new RegExp(/^[A-Za-z0-9 ]+$/),
    Numeric: new RegExp(/^(0|[1-9][0-9]*)$/),
    PanCard: new RegExp(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
    AddharCard: new RegExp(/^[0-9]{12}$/),
    Address: new RegExp(/^(?! )[a-zA-Z0-9\s.,#-]+$/i),
    Description: new RegExp(/^[^\s].*\S$/),
};