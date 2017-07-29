import moment from 'moment'

export function getUtcDateString(date, normalize_timezone=false) {
  let utc_date = moment(date).utc();
  if (normalize_timezone) {
    utc_date.add(moment(date).utcOffset(), 'm');
  }
  return utc_date.toISOString();
}
