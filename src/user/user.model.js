import mongoose  from "mongoose";

const userSchema = mongoose.Schema({
    name:{
        type: String,
        require: true
    },
    username:{
        type: String,
        unique: true,
        require: true
    },
    password:{
        type: String,
        require: true
    },
    role:{
        type: String,
        uppercase: true,
        enum: ['TEACHER', 'STUDENT'],
        required: true
    }

},{
    versionKey: false
})

export default mongoose.model('user', userSchema)