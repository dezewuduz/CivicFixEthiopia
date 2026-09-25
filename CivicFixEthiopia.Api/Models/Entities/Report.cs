using System.ComponentModel.DataAnnotations;
using CivicFixEthiopia.Api.Models.Enums;

namespace CivicFixEthiopia.Api.Models.Entities;

public class Report
{
    public int Id { get; set; }

    [Required, MaxLength(30)]
    public string ReportNumber { get; set; } = string.Empty; // e.g. CF-2026-0012

    [Required, MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    public int? DepartmentId { get; set; }
    public Department? Department { get; set; }

    public int CitizenId { get; set; }
    public User? Citizen { get; set; }

    public ReportStatus Status { get; set; } = ReportStatus.Submitted;

    [MaxLength(300)]
    public string? LocationText { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ReportStatusHistory> StatusHistory { get; set; } = new List<ReportStatusHistory>();
}