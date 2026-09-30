using CivicFixEthiopia.Infrastructure.Data;
using CivicFixEthiopia.Domain.Entities;
using CivicFixEthiopia.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CivicFixEthiopia.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepartmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DepartmentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/departments
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DepartmentDto>>> GetDepartments([FromQuery] bool activeOnly = true)
    {
        var query = _context.Departments.AsQueryable();
        if (activeOnly)
            query = query.Where(d => d.IsActive);

        return await query.Select(d => new DepartmentDto
        {
            Id = d.Id,
            Name = d.Name,
            Description = d.Description,
            ContactPhone = d.ContactPhone,
            Email = d.Email,
            IsActive = d.IsActive,
            CreatedAt = d.CreatedAt
        }).ToListAsync();
    }

    // POST: api/departments
    [HttpPost]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<DepartmentDto>> CreateDepartment(Department department)
    {
        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        var dto = new DepartmentDto
        {
            Id = department.Id,
            Name = department.Name,
            Description = department.Description,
            ContactPhone = department.ContactPhone,
            Email = department.Email,
            IsActive = department.IsActive,
            CreatedAt = department.CreatedAt
        };
        return CreatedAtAction(nameof(GetDepartments), new { id = department.Id }, dto);
    }

    // PUT: api/departments/5
    [HttpPut("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> UpdateDepartment(int id, Department department)
    {
        if (id != department.Id)
            return BadRequest();

        _context.Entry(department).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/departments/5 (deactivate, matches spec)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> DeactivateDepartment(int id)
    {
        var department = await _context.Departments.FindAsync(id);
        if (department == null)
            return NotFound();

        department.IsActive = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}