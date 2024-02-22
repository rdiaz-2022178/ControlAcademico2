import Assigned from '../assigned/assigned.model.js'
import User from '../user/user.model.js'
import Course from '../courses/course.model.js'
import jwt from 'jsonwebtoken'

export const test = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is running' })
}

export const add = async (req, res) => {
    try {
        let {token} = req.headers
        if (!token) return res.status(401).send({ message: `Token is required. | Login required.` })
        let {role, uid} = jwt.verify(token,process.env.SECRET_KEY )
        let data = req.body
        let existingAssignment = await Assigned.findOne({
            student: uid,
            course: data.course
        });

        if (existingAssignment) {
            return res.status(400).send({ message: 'User is already assigned to this course' });
        }
        let user = await User.findById(uid);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        if (user.role == 'TEACHER') return res.status(400).send({ message: 'Teacher cannot be assigned to a course' });
        let assignmentCount = await Assigned.countDocuments({ student: uid });
        if (assignmentCount >= 3) {
            return res.status(400).send({ message: 'User cannot be assigned to more than 3 courses' });
        }

        let course = await Course.findById(data.course);
        if (!course) {
            return res.status(404).send({ message: 'Course not found' });
        }
        data.student = uid
        let assigned = new Assigned(data)
        await assigned.save()
        return res.send({ message: 'assigned successfully' })

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'error when assigning to a course' })
    }
}

export const find = async (req, res) => {
    try {
        let {token} = req.headers
        if (!token) return res.status(401).send({ message: `Token is required. | Login required.` })
        let {role, uid} = jwt.verify(token,process.env.SECRET_KEY )
        let assigned = await Assigned.find({student: uid}).populate('course')
        return res.send({ assigned })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting assigned' })
    }
}