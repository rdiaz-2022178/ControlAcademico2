import { initServer } from "./config/app.js"
import { connect } from "./config/mongo.js"
import { defaultTeacher } from "./src/user/user.controller.js"

/*const request = {
    name: 'Default',
    username: 'default',
    password: '12345678',
    role: 'TEACHER'
}
const response = 'a new teacher was created'*/
initServer()
connect()
defaultTeacher()