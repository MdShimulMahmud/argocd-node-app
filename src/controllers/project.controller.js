import Project from "../models/project.model.js";
import ResponseHandler, {
  findDocumentById,
  validateRequiredFields,
} from "../utils/responseHandler.js";
// Get all projects
export const getAllProjects = ResponseHandler.asyncHandler(async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  ResponseHandler.success(
    res,
    200,
    projects,
    "Projects retrieved successfully"
  );
});

// Get project by ID
export const getProjectById = ResponseHandler.asyncHandler(async (req, res) => {
  const project = await findDocumentById(Project, req.params.id, res);
  if (project) {
    ResponseHandler.success(
      res,
      200,
      project,
      "Project retrieved successfully"
    );
  }
});

// Create project
export const createProject = ResponseHandler.asyncHandler(async (req, res) => {
  // Define required fields
  const requiredFields = [
    "image",
    "title",
    "description",
    "technologies",
    "category",
    "projectLink",
    "codeLink",
  ];

  // Check for missing fields
  const missingFields = validateRequiredFields(req.body, requiredFields);

  // If any fields are missing, return validation error
  if (missingFields.length > 0) {
    return ResponseHandler.validationError(res, missingFields);
  }

  // Create new project
  const project = new Project(req.body);

  // Save project
  const newProject = await project.save();

  // Send success response
  ResponseHandler.success(res, 201, newProject, "Project created successfully");
});

// Update project
export const updateProject = ResponseHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find existing project
  const project = await findDocumentById(Project, id, res);
  if (!project) return;

  // Define updatable fields
  const updatableFields = [
    "image",
    "title",
    "description",
    "technologies",
    "category",
    "projectLink",
    "codeLink",
  ];

  // Update only provided fields
  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      project[field] = req.body[field];
    }
  });

  // Save updated project
  const updatedProject = await project.save();

  // Send success response
  ResponseHandler.success(
    res,
    200,
    updatedProject,
    "Project updated successfully"
  );
});

// Delete project
export const deleteProject = ResponseHandler.asyncHandler(async (req, res) => {
  const project = await findDocumentById(Project, req.params.id, res);
  if (!project) return;

  // Remove project
  await project.deleteOne();

  // Send success response
  ResponseHandler.success(res, 200, null, "Project deleted successfully");
});

// Pagination example
export const getProjectsPaginated = ResponseHandler.asyncHandler(
  async (req, res) => {
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

    // Convert to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Calculate skip
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch paginated projects
    const projects = await Project.find()
      .sort(sort)
      .skip(skip)
      .limit(limitNumber);

    // Count total projects
    const total = await Project.countDocuments();

    // Prepare pagination response
    ResponseHandler.success(
      res,
      200,
      {
        projects,
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalProjects: total,
      },
      "Paginated projects retrieved"
    );
  }
);
