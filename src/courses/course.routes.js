import express from 'express'
import { add, deleted, find, update } from './course.controller.js'
import { isTeacher, validateJwt } from '../middlewares/validate.js'

const api = express.Router()

api.post('/add', [validateJwt, isTeacher], add)
api.put('/update/:id', [validateJwt, isTeacher], update)
api.delete('/delete/:id', [validateJwt, isTeacher], deleted)
api.get('/find', find)

export default api