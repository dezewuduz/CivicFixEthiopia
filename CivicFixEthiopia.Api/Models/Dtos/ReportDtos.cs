using CivicFixEthiopia.Api.Models.Enums;

namespace CivicFixEthiopia.Api.Models.DTOs;

// Used for GET /api/reports (list view)
public class ReportListDto
{
    public int Id { get; set; }
    public string ReportNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public ReportStatus Status { get; set; }
    public string? CategoryName { get; set; }
    public string? DepartmentName { get; set; }
    public string? LocationText { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Used for GET /api/reports/{id} (full detail view)
public class ReportDetailDto
{
    public int Id { get; set; }
    public string ReportNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ReportStatus Status { get; set; }
    public string? LocationText { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public CategorySummaryDto? Category { get; set; }
    public DepartmentSummaryDto? Department { get; set; }
    public List<StatusHistoryDto> StatusHistory { get; set; } = new();
}

public class CategorySummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class DepartmentSummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class StatusHistoryDto
{
    public ReportStatus OldStatus { get; set; }
    public ReportStatus NewStatus { get; set; }
    public string? Comment { get; set; }
    public int ChangedByUserId { get; set; }
    public DateTime ChangedAt { get; set; }
}