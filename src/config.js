const ACCESS_TOKEN_EXPIRE_TIME = "30m"; // 60s 2m 5m 5h 1d 30d
const REFRESH_TOKEN_EXPIRE_TIME = "10d"; // 60s 2m 5m 5h 1d 30d
const MAX_API_REQUEST_PER_IP_FOR_MINUTE = 100;

module.exports = {
  ACCESS_TOKEN_EXPIRE_TIME,
  REFRESH_TOKEN_EXPIRE_TIME,
  MAX_API_REQUEST_PER_IP_FOR_MINUTE,
};
