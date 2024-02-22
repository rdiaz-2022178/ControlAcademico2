import express from 'express'
import { add, addTeacher, deleted, login, update } from './user.controller.js'
import { isTeacher, validateJwt } from '../middlewares/validate.js'


const api = express.Router()

api.post('/add', add)
api.post('/addTeacher', [validateJwt, isTeacher], addTeacher)
api.post('/login', login)
api.delete('/delete/:id', deleted)
api.put('/update/:id', update)

export default api