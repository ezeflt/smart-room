let lastAlarmUser = null;

function setLastAlarmUser(user) {
    lastAlarmUser = user;
}

function getLastAlarmUser() {
    return lastAlarmUser;
}

module.exports = { setLastAlarmUser, getLastAlarmUser }; 