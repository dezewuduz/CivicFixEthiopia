using System.ComponentModel.DataAnnotations;
using CivicFixEthiopia.Domain.Enums;

namespace CivicFixEthiopia.Domain.Entities;

public class User
{
    public int Id { get; set; }

    [Required, MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    public UserRole Role { get; set; } = UserRole.Citizen;

    public int? DepartmentId { get; set; }
    public Department? Department { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Report> Reports { get; set; } = new List<Report>();
    public ICollection<ReportStatusHistory> StatusChangesMade { get; set; } = new List<ReportStatusHistory>();
}