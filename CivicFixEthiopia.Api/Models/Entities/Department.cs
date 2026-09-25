using System.ComponentModel.DataAnnotations;

namespace CivicFixEthiopia.Api.Models.Entities;

public class Department
{
    public int Id { get; set; }

    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(20)]
    public string? ContactPhone { get; set; }

    [MaxLength(200)]
    public string? Email { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Report> Reports { get; set; } = new List<Report>();
    public ICollection<User> Officers { get; set; } = new List<User>();
}