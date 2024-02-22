import { Schema, model } from 'mongoose';

const courseSchema = Schema({
    name:{
        type: String,
        require: true
    },
    description:{
        type: String,
        require: true
    },
    teacher:{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true 
    }
},{
    versionKey: false
})

export default model('course', courseSchema)