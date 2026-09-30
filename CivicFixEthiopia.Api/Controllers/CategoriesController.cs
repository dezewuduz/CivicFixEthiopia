using CivicFixEthiopia.Domain.Entities;
using CivicFixEthiopia.Application.DTOs;
using CivicFixEthiopia.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace CivicFixEthiopia.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CategoriesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories([FromQuery] bool activeOnly = true)
    {
        var query = _context.Categories.AsQueryable();
        if (activeOnly)
            query = query.Where(c => c.IsActive);

        return await query.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            IsActive = c.IsActive,
            CreatedAt = c.CreatedAt
        }).ToListAsync();
    }

    [HttpPost]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<CategoryDto>> CreateCategory(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        var dto = new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            IsActive = category.IsActive,
            CreatedAt = category.CreatedAt
        };
        return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, dto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> UpdateCategory(int id, Category category)
    {
        if (id != category.Id)
            return BadRequest();

        _context.Entry(category).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> DeactivateCategory(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return NotFound();

        category.IsActive = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}