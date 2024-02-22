import Course from './course.model.js'
import User from '../user/user.model.js'
import Assigned from '../assigned/assigned.model.js'
import jwt from 'jsonwebtoken'

import { checkUpdateCourse } from '../utils/validator.js'

export const test = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is running' })
}

export const add = async (req, res) => {
    try {
        let data = req.body
        let {token } = req.headers
        if(!token) return res.status(401).send({ message: `Token is required. | Login required.` })
        let {role, uid} = jwt.verify(token, process.env.SECRET_KEY)
        data.teacher = uid
        let user = await User.findOne({ _id: data.teacher })
        if (user.role == 'STUDENT') return res.status(404).send({ message: 'is not teacher' })
        
        let course = new Course(data)
        await course.save()
        return res.send({ message: 'Registered successfully' })

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error registering course', err: err })
    }
}

export const update = async (req, res) => {
    try {
        let { id } = req.params
        let data = req.body
        let {token} = req.headers
        if (!token) return res.status(401).send({ message: `Token is required. | Login required.` })
        let {role, uid} = jwt.verify(token,process.env.SECRET_KEY )
        // Busca al usuario que está realizando la solicitud
        let user = await User.findById(uid);

        // Verifica si el usuario existe
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        let course = await Course.findOne({ _id: id, teacher: uid });

        // Si el curso no pertenece al usuario, no se permite actualizar
        if (!course) {
            return res.status(403).send({ message: 'You are not authorized to update this course' });
        }

        let update = checkUpdateCourse(data, id)
        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        let updateCourse = await Course.findOneAndUpdate({ _id: id }, data, { new: true })
        if (!updateCourse) return res.status(401).send({ message: 'Course not found and not updated' })
        await Assigned.updateMany({ course: id }, { $set: { course: updateCourse } });

        return res.send({ message: 'Updated Course', updateCourse })

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating course' })
    }

}

export const deleted = async (req, res) => {
    try {
        let { id } = req.params
        let {token} = req.headers
        if (!token) return res.status(401).send({ message: `Token is required. | Login required.` })
        let {role, uid} = jwt.verify(token,process.env.SECRET_KEY )
        let users = await User.findById(uid);

        // Verifica si el usuario existe
        if (!users) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Verifica si el usuario es el propietario del curso
        const course = await Course.findOne({ _id: id, teacher: uid });

        // Si el curso no pertenece al usuario, no se permite eliminar
        if (!course) {
            return res.status(403).send({ message: 'You are not authorized to delete this course' });
        }
        let user = await User.find() 
        await Assigned.deleteMany({ course: id });
        let deleted = await Course.findOneAndDelete({ _id: id })
        if (!deleted) return res.status(404).send({ message: 'Course not found and not deleted' })
        return res.send({ message: `Course with name ${deleted.name} deleted successfully` }) //status 200

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error deleting Course' })
    }
}

export const find = async (req, res) => {
    try {
        let {token} = req.headers
        if (!token) return res.status(401).send({ message: `Token is required. | Login required.` })
        let {role, uid} = jwt.verify(token,process.env.SECRET_KEY )
        let user = await User.find({
            _id: uid
     })
        
        let course = await Course.find({ teacher: uid }).populate('teacher', ['name', 'role'])
        if (!user ) return res.status(404).send({ message: 'the teacher does not exist ' })
        return res.send({ course })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting course' })
    }
}