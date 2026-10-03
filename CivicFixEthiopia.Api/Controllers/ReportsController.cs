using CivicFixEthiopia.Domain.Entities;
using CivicFixEthiopia.Infrastructure.Data;
using CivicFixEthiopia.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CivicFixEthiopia.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace CivicFixEthiopia.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReportsController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// GET: api/reports
[HttpGet]
[Authorize]
public async Task<ActionResult<IEnumerable<ReportListDto>>> GetReports()
{
    var role = User.FindFirstValue(ClaimTypes.Role);
    var query = _context.Reports
        .Include(r => r.Category)
        .Include(r => r.Department)
        .AsQueryable();

    if (role == "Citizen")
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        query = query.Where(r => r.CitizenId == userId);
    }
    else if (role == "DepartmentOfficer")
    {
        var deptClaim = User.FindFirst("departmentId")?.Value;
        if (deptClaim != null)
        {
            var deptId = int.Parse(deptClaim);
            query = query.Where(r => r.DepartmentId == deptId);
        }
        else
        {
            query = query.Where(r => false); // department ያልተመደበለት officer ምንም አያይም
        }
    }
    // Administrar without filtering you will see

    return await query
        .Select(r => new ReportListDto
        {
            Id = r.Id,
            ReportNumber = r.ReportNumber,
            Title = r.Title,
            Status = r.Status,
            CategoryName = r.Category != null ? r.Category.Name : null,
            DepartmentName = r.Department != null ? r.Department.Name : null,
            LocationText = r.LocationText,
            CreatedAt = r.CreatedAt
        })
        .ToListAsync();
}
// GET: api/reports/5
[HttpGet("{id}")]
public async Task<ActionResult<ReportDetailDto>> GetReport(int id)
{
    var report = await _context.Reports
        .Include(r => r.Category)
        .Include(r => r.Department)
        .Include(r => r.StatusHistory)
        .FirstOrDefaultAsync(r => r.Id == id);

    if (report == null)
        return NotFound();

    var dto = new ReportDetailDto
    {
        Id = report.Id,
        ReportNumber = report.ReportNumber,
        Title = report.Title,
        Description = report.Description,
        Status = report.Status,
        LocationText = report.LocationText,
        Latitude = report.Latitude,
        Longitude = report.Longitude,
        ImageUrl = report.ImageUrl,
        CreatedAt = report.CreatedAt,
        UpdatedAt = report.UpdatedAt,
        Category = report.Category != null ? new CategorySummaryDto { Id = report.Category.Id, Name = report.Category.Name } : null,
        Department = report.Department != null ? new DepartmentSummaryDto { Id = report.Department.Id, Name = report.Department.Name } : null,
        StatusHistory = report.StatusHistory
            .OrderBy(h => h.ChangedAt)
            .Select(h => new StatusHistoryDto
            {
                OldStatus = h.OldStatus,
                NewStatus = h.NewStatus,
                Comment = h.Comment,
                ChangedByUserId = h.ChangedByUserId,
                ChangedAt = h.ChangedAt
            }).ToList()
    };

    return dto;
}
  // POST: api/reports
[HttpPost]
[Authorize] 
public async Task<ActionResult<Report>> CreateReport(CreateReportRequest request)
{
    // citizenId ከ request body ሳይሆን ከ JWT token ራሱ ይወሰዳል
    var citizenIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (citizenIdClaim == null || !int.TryParse(citizenIdClaim, out var citizenId))
        return Unauthorized();

    var report = new Report
    {
        ReportNumber = $"CF-{DateTime.UtcNow.Year}-{Guid.NewGuid().ToString()[..8].ToUpper()}",
        Title = request.Title,
        Description = request.Description,
        CategoryId = request.CategoryId,
        CitizenId = citizenId, 
        LocationText = request.LocationText,
        Latitude = request.Latitude,
        Longitude = request.Longitude,
        ImageUrl = request.ImageUrl,
        Status = ReportStatus.Submitted,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    _context.Reports.Add(report);
    await _context.SaveChangesAsync();

    _context.ReportStatusHistories.Add(new ReportStatusHistory
    {
        ReportId = report.Id,
        OldStatus = ReportStatus.Submitted,
        NewStatus = ReportStatus.Submitted,
        Comment = "Report submitted by citizen.",
        ChangedByUserId = citizenId,
        ChangedAt = DateTime.UtcNow
    });
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(GetReport), new { id = report.Id }, report);
}
    // PUT: api/reports/5/verify
    [HttpPut("{id}/verify")]
    [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> VerifyReport(int id, [FromBody] VerifyRequest request)
    {
        var report = await _context.Reports.FindAsync(id);
        if (report == null)
            return NotFound();

        var oldStatus = report.Status;
        report.Status = request.Approved ? ReportStatus.Verified : ReportStatus.Rejected;
        report.UpdatedAt = DateTime.UtcNow;

        _context.ReportStatusHistories.Add(new ReportStatusHistory
        {
            ReportId = report.Id,
            OldStatus = oldStatus,
            NewStatus = report.Status,
            Comment = request.Comment,
            ChangedByUserId = request.ChangedByUserId,
            ChangedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // PUT: api/reports/5/assign
    [HttpPut("{id}/assign")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> AssignDepartment(int id, [FromBody] AssignRequest request)
    {
        var report = await _context.Reports.FindAsync(id);
        if (report == null)
            return NotFound();

        var oldStatus = report.Status;
        report.DepartmentId = request.DepartmentId;
        report.Status = ReportStatus.Assigned;
        report.UpdatedAt = DateTime.UtcNow;

        _context.ReportStatusHistories.Add(new ReportStatusHistory
        {
            ReportId = report.Id,
            OldStatus = oldStatus,
            NewStatus = report.Status,
            ChangedByUserId = request.ChangedByUserId,
            ChangedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // PUT: api/reports/5/status
[HttpPut("{id}/status")]
[Authorize(Roles = "Administrator,DepartmentOfficer")]
public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateRequest request)
{
    var report = await _context.Reports.FindAsync(id);
    if (report == null)
        return NotFound();

    // የተፈቀዱ transitions ብቻ - እያንዳንዱ status ወደ የትኞቹ ቀጣይ statuses መሄድ እንደሚችል
    var allowedTransitions = new Dictionary<ReportStatus, ReportStatus[]>
    {
        [ReportStatus.Assigned] = new[] { ReportStatus.InProgress },
        [ReportStatus.InProgress] = new[] { ReportStatus.Resolved }
    };

    if (!allowedTransitions.TryGetValue(report.Status, out var allowedNext) ||
        !allowedNext.Contains(request.NewStatus))
    {
        return BadRequest(new
        {
            message = $"Cannot change status from {report.Status} to {request.NewStatus}."
        });
    }

    var oldStatus = report.Status;
    report.Status = request.NewStatus;
    report.UpdatedAt = DateTime.UtcNow;

    _context.ReportStatusHistories.Add(new ReportStatusHistory
    {
        ReportId = report.Id,
        OldStatus = oldStatus,
        NewStatus = request.NewStatus,
        Comment = request.Comment,
        ChangedByUserId = request.ChangedByUserId,
        ChangedAt = DateTime.UtcNow
    });

    await _context.SaveChangesAsync();
    return NoContent();
}
}

public class VerifyRequest
{
    public bool Approved { get; set; }
    public string? Comment { get; set; }
    public int ChangedByUserId { get; set; }
}

public class AssignRequest
{
    public int DepartmentId { get; set; }
    public int ChangedByUserId { get; set; }
}

public class StatusUpdateRequest
{
    public ReportStatus NewStatus { get; set; }
    public string? Comment { get; set; }
    public int ChangedByUserId { get; set; }
}
public class CreateReportRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public int CitizenId { get; set; }
    public string? LocationText { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? ImageUrl { get; set; }
}