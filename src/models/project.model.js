import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  technologies: {
    type: [String],
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  projectLink: {
    type: String,
    required: true,
    trim: true,
  },
  codeLink: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

projectSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
