using CivicFixEthiopia.Api.Data;
using CivicFixEthiopia.Api.Models.Entities;
using CivicFixEthiopia.Api.Models.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

    // GET: api/reports
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Report>>> GetReports()
    {
        return await _context.Reports
            .Include(r => r.Category)
            .Include(r => r.Department)
            .ToListAsync();
    }

    // GET: api/reports/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Report>> GetReport(int id)
    {
        var report = await _context.Reports
            .Include(r => r.Category)
            .Include(r => r.Department)
            .Include(r => r.StatusHistory)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (report == null)
            return NotFound();

        return report;
    }

    // POST: api/reports
    [HttpPost]
    public async Task<ActionResult<Report>> CreateReport(Report report)
    {
        report.Status = ReportStatus.Submitted;
        report.CreatedAt = DateTime.UtcNow;
        report.UpdatedAt = DateTime.UtcNow;

        _context.Reports.Add(report);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetReport), new { id = report.Id }, report);
    }

    // PUT: api/reports/5/verify
    [HttpPut("{id}/verify")]
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
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateRequest request)
    {
        var report = await _context.Reports.FindAsync(id);
        if (report == null)
            return NotFound();

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

// Small request DTOs — keep these in the same file for now, or move to Models/DTOs later
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