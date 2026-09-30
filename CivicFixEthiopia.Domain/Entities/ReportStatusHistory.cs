using System.ComponentModel.DataAnnotations;
using CivicFixEthiopia.Domain.Enums;

namespace CivicFixEthiopia.Domain.Entities;

public class ReportStatusHistory
{
    public int Id { get; set; }

    public int ReportId { get; set; }
    public Report? Report { get; set; }

    public ReportStatus OldStatus { get; set; }
    public ReportStatus NewStatus { get; set; }

    [MaxLength(500)]
    public string? Comment { get; set; }

    public int ChangedByUserId { get; set; }
    public User? ChangedByUser { get; set; }

    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}