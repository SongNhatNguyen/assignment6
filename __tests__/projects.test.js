const projectData = require("../modules/project.js");

describe("test projects - Song Nhat Nguyen - 169284239", () => {
  
  beforeAll(async () => {
    await projectData.initialize();
  });

  test("getAllProjects should return all projects", async () => {
    const projects = await projectData.getAllProjects();
    const maxId = Math.max(...projects.map(p => p.id));
    expect(maxId).toBe(30);
  });

  test("getProjectById should return the correct project when a valid ID is given", async () => {
    const project = await projectData.getProjectById(15);
    expect(project).toHaveProperty("id", 15);
  });

  test("getProjectById should reject with an error when given an invalid ID", async () => {
    await expect(projectData.getProjectById(50)).rejects.toThrow();
  });

  test("getProjectsBySector should return projects for a valid sector", async () => {
    const projects = await projectData.getProjectsBySector("Transportation");
    expect(projects[0]).toHaveProperty("sector", "Transportation");
  });

  test("getProjectsBySector should reject with an error when given an invalid sector", async () => {
    await expect(projectData.getProjectsBySector("Induestrialization")).rejects.toThrow();
  });

  test("getProjectsBySector should reject with an error when no projects are found for the given sector", async () => {
    await expect(projectData.getProjectsBySector("sector")).rejects.toThrow();
  });
});
