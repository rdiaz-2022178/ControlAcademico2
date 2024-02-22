import express from 'express'
import { add, find } from './assigned.controller.js'


const api = express.Router()

api.post('/add', add)
api.get('/find', find)

export default api