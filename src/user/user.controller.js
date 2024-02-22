import User from './user.model.js'
import { generateJwt } from '../utils/jwt.js'
import jwt from 'jsonwebtoken'
import { checkPassword, checkUpdateTeacher, encrypt, checkUpdateStudent } from '../utils/validator.js'

export const test = (req, res) => {
    console.log('test is running')
    return res.send({ message: 'Test is running' })
}

export const add = async (req, res) => {
    try {
        let data = req.body
        const existingUser = await User.findOne({ username: data.username });

        if (existingUser) {
            return res.status(400).send({ message: 'Username is already in use' });
        }
        data.password = await encrypt(data.password)
        data.role = 'STUDENT'
        let user = new User(data)
        await user.save()
        return res.send({ message: `Registered successfully, can be logged with username ${user.username}` })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error registering user', error: error })
    }
}

export const addTeacher = async (req, res) => {
    try {
        let data = req.body
        const existingUser = await User.findOne({ username: data.username });

        if (existingUser) {
            return res.status(400).send({ message: 'Username is already in use' });
        }
        data.password = await encrypt(data.password)
        data.role = 'TEACHER'
        let user = new User(data)
        await user.save()
        return res.send({ message: `Registered successfully, can be logged with username ${user.username}` })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error registering user', error: error })
    }
}

export const login = async (req, res) => {
    try {
        let { username, password } = req.body
        let user = await User.findOne({ username })
        if (user && await checkPassword(password, user.password)) {
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }
            let token = await generateJwt(loggedUser)
            return res.send({ message: `Welcome ${loggedUser.name}`, loggedUser, token })

        }
        return res.status(404).send({ message: 'Invalid credentials' })


    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error to login' })
    }
}

export const deleted = async (req, res) => {
    try {
        let { token } = req.headers
        let { id } = req.params
        let { validationWord } = req.body
        if (!token) return res.status(401).send({ message: `Token is required. | Login required.` })
        let { role, uid } = jwt.verify(token, process.env.SECRET_KEY);

        switch (role) {
            case 'TEACHER':
                if (!validationWord) return res.status(400).send({ message: `valitaion word IS REQUIRED.` });
                if (validationWord !== 'CONFIRM') return res.status(400).send({ message: `valitaion word must be -> CONFIRM` });
                let deletedUser = await User.findOneAndDelete({ _id: id })
                if (!deletedUser) return res.status(404).send({ message: 'Account not found and not deleted' })
                return res.send({ message: `Account with username ${deletedUser.username} deleted successfully` }) //status 200
                break;

            case 'STUDENT':
                if (!validationWord) return res.status(400).send({ message: `valitaion word IS REQUIRED.` });
                if (validationWord !== 'CONFIRM') return res.status(400).send({ message: `valitaion word must be -> CONFIRM` });
                if(id !== uid) return  res.status(401).send({ message: 'you can only delete your account' })
                let deletedUsers = await User.findOneAndDelete({ _id: uid })
                if (!deletedUsers) return res.status(404).send({ message: 'Account not found and not deleted' })
                return res.send({ message: `Account with username ${deletedUsers.username} deleted successfully` }) //status 200
                break;
        }

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error deleting account' })
    }
}

export const update = async (req, res) => {
    try {
        let { token } = req.headers
        let { id } = req.params
        let data = req.body
        if (!token) return res.status(401).send({ message: `Token is required. | Login required.` })
        let { role, uid } = jwt.verify(token, process.env.SECRET_KEY)

        switch (role) {
            case 'TEACHER':
                let update = checkUpdateTeacher(data, id)
                if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
                let updatedUser = await User.findOneAndUpdate(
                    { _id: id }, //ObjectsId <- hexadecimales (Hora sys, Version Mongo, Llave privada...)
                    data, //Los datos que se van a actualizar
                    { new: true } //Objeto de la BD ya actualizado
                )
                if (!updatedUser) return res.status(401).send({ message: 'User not found and not updated' })
                return res.send({ message: 'Updated user', updatedUser })
                break;

            case 'STUDENT':
                let updated = checkUpdateStudent(data, id)
                if(id !== uid) return  res.status(401).send({ message: 'you can only delete your account' })
                if (!updated) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
                let updatedUsers = await User.findOneAndUpdate(
                    { _id: uid }, //ObjectsId <- hexadecimales (Hora sys, Version Mongo, Llave privada...)
                    data, //Los datos que se van a actualizar
                    { new: true } //Objeto de la BD ya actualizado
                )
                if (!updatedUsers) return res.status(401).send({ message: 'User not found and not updated' })
                return res.send({ message: 'Updated user', updatedUsers })
                break;
        }

    } catch (err) {
        console.error(err)
        if (err.keyValue.username) return res.status(400).send({ message: `Username ${err.keyValue.username} is alredy taken` })
        return res.status(500).send({ message: 'Error updating account' })
    }
}


export const defaultTeacher = async () => {
    try {
        const existingUser = await User.findOne({ username: 'default' });

        if (existingUser) {
            console.log('El username "default" ya está en uso.');
            return; 
        }
        let data = {
            name: 'Default',
            username: 'default',
            password: await encrypt('default'),
            role: 'TEACHER'
        }

        let user = new User(data)
        await user.save()

    } catch (error) {
        console.error(error)
    }
}