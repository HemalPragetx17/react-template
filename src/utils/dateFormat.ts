import moment from 'moment';

export const DateUTCToLocalDateString = (date: Date | string): string => moment.utc(date).local().format('DD MMMM, YYYY');
export const DateUTCToLocalDateAndTimeString = (date: Date | string): string => moment.utc(date).local().format('DD MMMM, YYYY hh:mm A');
export const DateToLocalDateString = (date: Date | string): string => moment(date).format('YYYY-MM-DD');
export const DateUTCToLocalDateTimeString = (date: Date | string) => moment(new Date(date)).format('DD-MMM-yyyy hh:mm a');
export const DateUTCToLocalDateWithTimeString = (date: Date | string) => moment(new Date(date)).format('DD/MM/yyyy hh:mm A');
export const DateUTCToLocalDateTimeWithSecondString = (date: Date | string) => moment(new Date(date)).format('HH:mm:ss');
export const TimeToTimeString = (time: string) => moment(time, 'hh:mm').format('hh:mm A');
export const TimeTo24HourTimeString = (time: string) => moment(time, 'hh:mm A').format('mm:ss');
export const DateTimeToDateString = (date: Date | string) => moment(date).format('DD-MMM-yyyy');
export const DateTimeToDate_String = (date: Date | string) => moment(date).format('DD-MM-yyyy');
export const DateToLocalTimeString = (date: Date | string) => moment(date).format('hh:mm A')
export const DateToLocalDayString = (date: Date | string) => moment(new Date(date)).format('dddd')
export const DurationToLocalDurationString = (duration: string) => moment.utc(moment.duration(duration).asMilliseconds()).format('HH:mm:ss')
