using CivicFixEthiopia.Domain.Entities;
using CivicFixEthiopia.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CivicFixEthiopia.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext db)
    {
        if (!await db.Categories.AnyAsync())
        {
            db.Categories.AddRange(
                new Category { Name = "Road and Sidewalk Damage" },
                new Category { Name = "Garbage and Waste Management" },
                new Category { Name = "Broken Streetlight" },
                new Category { Name = "Water Supply Problem" },
                new Category { Name = "Drainage and Flooding" },
                new Category { Name = "Public Toilet and Sanitation" },
                new Category { Name = "Traffic Signal Problem" },
                new Category { Name = "Other Civic Issue" }
            );
        }

        if (!await db.Departments.AnyAsync())
        {
            db.Departments.AddRange(
                new Department { Name = "Road and Infrastructure Department" },
                new Department { Name = "Sanitation and Waste Management Department" },
                new Department { Name = "Electricity and Street Lighting Department" },
                new Department { Name = "Water and Sewerage Department" },
                new Department { Name = "Traffic Management Department" },
                new Department { Name = "Municipal Services Department" }
            );
        }

        await db.SaveChangesAsync();

        if (!await db.Users.AnyAsync(u => u.Role == UserRole.Administrator))
        {
            db.Users.Add(new User
            {
                FullName = "System Administrator",
                Email = "demisezewudud43@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Best2053"),
                Role = UserRole.Administrator,
                IsActive = true
            });
            await db.SaveChangesAsync();
        }
    }
}