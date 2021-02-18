// mysql 유저정보 배포 상태에따라 로컬 파일혹은 heroku 환경변수에서 정보를 가져온다.
if (process.env.NODE_ENV === 'production') {
    module.exports = require('./prod');
} else {
    module.exports = require('./dev');
}