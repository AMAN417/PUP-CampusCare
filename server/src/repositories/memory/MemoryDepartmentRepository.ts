import { IDepartmentRepository } from '../interfaces.js';
import { Department } from '../../types/index.js';
import { INITIAL_DEPARTMENTS } from '../../data/initialData.js';

export class MemoryDepartmentRepository implements IDepartmentRepository {
  private departments: Department[] = JSON.parse(JSON.stringify(INITIAL_DEPARTMENTS));

  public async getAll(): Promise<Department[]> {
    return JSON.parse(JSON.stringify(this.departments));
  }

  public async getById(id: string): Promise<Department | null> {
    const dept = this.departments.find((d) => d.id === id);
    return dept ? JSON.parse(JSON.stringify(dept)) : null;
  }

  public async getByCode(code: string): Promise<Department | null> {
    const dept = this.departments.find(
      (d) => d.code.toUpperCase() === code.trim().toUpperCase()
    );
    return dept ? JSON.parse(JSON.stringify(dept)) : null;
  }

  public async create(data: Partial<Department>): Promise<Department> {
    const newDept: Department = {
      id: data.id || `dept-${Date.now()}`,
      name: data.name || 'Unnamed Department',
      code: (data.code || 'DEPT').toUpperCase(),
      contactEmail: data.contactEmail || 'dept@pup.ac.in',
      leadOfficer: data.leadOfficer || 'Department Officer',
      activeComplaints: data.activeComplaints || 0,
      resolvedComplaints: data.resolvedComplaints || 0,
    };

    this.departments.push(newDept);
    return JSON.parse(JSON.stringify(newDept));
  }
}
