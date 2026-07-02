import { camelCase } from 'lodash';
import React from "react";

export const stringIsNumber = (value: string): boolean => isNaN(Number(value)) === false;

export const enumToArray = <T extends Record<string, any>>(enumeration: T): (T[keyof T])[] => {
  return Object.keys(enumeration)
    .filter(stringIsNumber)
    .map((key) => enumeration[key as keyof T]);
};


export const camelizeKeys = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((v) => camelizeKeys(v));
  } else if (obj != null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [camelCase(key)]: camelizeKeys(obj[key]),
      }),
      {},
    );
  }
  return obj;
};


// Turn payload into patch Api payload
interface FormData {
  [key: string]: any;
}

interface OriginalData {
  [key: string]: any;
}

interface Payload {
  [key: string]: any;
}

export const generatePayload = (formData: FormData, originalData: OriginalData): Payload => {
  const payload: Payload = {};
  for (const key in formData) {
    if (formData[key] !== originalData[key]) {
      payload[key] = originalData[key];
    }
  }
  return payload;
};


// export const handlePageDetailChange = (
//   action: PageActions,
//   value: string | number,
//   pageDetails: Pagination
// ): Pagination => {
//   let pageDetail: Pagination = pageDetails;

//   switch (action) {
//     case PageActions.OrderDetailChange: {
//       const isAsc = pageDetail.sort_by === value && pageDetail.sort === ORDER_BY_ASC;
//       pageDetail = {
//         ...pageDetail,
//         sort: isAsc ? ORDER_BY_DESC : ORDER_BY_ASC,
//         sort_by: value as string,
//       };
//       break;
//     }
//     case PageActions.PageChange: {
//       pageDetail = {
//         ...pageDetail,
//         page: value as number,
//       };
//       break;
//     }
//     case PageActions.RowsPerPageChange: {
//       pageDetail = {
//         ...pageDetail,
//         page: Digits.One,
//         limit: value as number,
//       };
//       break;
//     }
//   }
//   return pageDetail;
// };


interface CheckboxClickEvent {
  target: EventTarget & HTMLInputElement;
}

export const handleCheckboxClick = (
  _event: CheckboxClickEvent,
  id: string | number,
  selected: Array<string | number>
): Array<string | number> => {
  const selectedIndex = selected.indexOf(id);
  let newSelected: Array<string | number> = [];

  if (selectedIndex === -1) {
    newSelected = newSelected.concat(selected, id);
  } else if (selectedIndex === 0) {
    newSelected = newSelected.concat(selected.slice(1));
  } else if (selectedIndex === selected.length - 1) {
    newSelected = newSelected.concat(selected.slice(0, -1));
  } else if (selectedIndex > 0) {
    newSelected = newSelected.concat(
      selected.slice(0, selectedIndex),
      selected.slice(selectedIndex + 1)
    );
  }

  return newSelected;
};


export const getBaseURL = (url: string) => {
  return url + "/";
};


export const toFixed = (value: number, decimals = 2) => {
  value = Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals);
  return value?.toFixed(decimals);
};


interface ArrayItem {
  [key: string]: any;
}

export const isSameArray = (
  array1: Array<any>,
  array2: Array<ArrayItem>,
  key: string
): boolean => {
  let i: number,
    isSameArray: boolean = false;
  for (i = 0; i < array2?.length; i++) {
    if (array1.includes(array2[i]?.[key])) {
      isSameArray = true;
    } else {
      isSameArray = false;
      break;
    }
  }
  return isSameArray;
};


export const sumOfNumber = (num: number): number => {
  let total: number = 0;
  total += Math.floor(num / 100);
  total += Math.floor((num % 100) / 10);
  total += num % 10;

  const lastDigit: number = total % 10;

  return lastDigit;
};


interface SumGetLastDigitInput {
  value: number | string | null;
}

export const sumGetLastDigit = (value: SumGetLastDigitInput['value']): number | null => {
  if (value == null) {
    return null;
  } else {
    return (
      value
        .toString()
        .split('')
        .map(Number)
        .reduce(function (a: number, b: number): number {
          return a + b;
        }, 0) % 10
    );
  }
};


interface FormatLargeNumberInput {
  number: number;
}

interface FormatLargeNumberOutput {
  formattedNumber: string;
}

export function formatLargeNumber(number: FormatLargeNumberInput['number']): FormatLargeNumberOutput['formattedNumber'] {
  var SI_SYMBOL: string[] = ["", "k", "M", "G", "T", "P", "E"];

  if (Math.abs(number) > 9999) {
    var tier: number = Math.floor(Math.log10(Math.abs(number)) / 3);
    var suffix: string = SI_SYMBOL[tier] || SI_SYMBOL[SI_SYMBOL.length - 1];

    var scale: number = Math.pow(10, tier * 3);
    var scaled: number = number / scale;

    return scaled.toFixed(1) + suffix;
  } else {
    return number.toString();
  }
}


interface UseClickOutsideAndEscapeProps {
  ref: React.RefObject<HTMLElement>;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useClickOutsideAndEscape = (
  ref: UseClickOutsideAndEscapeProps['ref'],
  setShow: UseClickOutsideAndEscapeProps['setShow']
): void => {
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShow(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setShow(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [ref, setShow]);
};


export const truncatedText = (text: string, maxLength:  number) => {
  if (text?.length <= maxLength) {
    return text;
  }

  const truncatedText = `${text?.substring(0, maxLength)}...`;

  return truncatedText;
};

export const buildQueryParams = (params: Record<string, any>): string => {
  const processedParams = { ...params };

  if (processedParams.pageNo && processedParams.limit && processedParams.skip === undefined) {
    processedParams.skip =
      parseInt(processedParams.pageNo) * parseInt(processedParams.limit) -
        parseInt(processedParams.limit) || 0;
  }

  const query = Object.entries(processedParams)
    .filter(([_, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
  return query ? `?${query}` : "";
};
