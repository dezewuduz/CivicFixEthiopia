using CivicFixEthiopia.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace CivicFixEthiopia.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Report> Reports => Set<Report>();
    public DbSet<ReportStatusHistory> ReportStatusHistories => Set<ReportStatusHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            // No two users can share an email
            entity.HasIndex(u => u.Email).IsUnique();

            // A Department Officer belongs to one Department
            entity.HasOne(u => u.Department)
                  .WithMany(d => d.Officers)
                  .HasForeignKey(u => u.DepartmentId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Report>(entity =>
        {
            entity.HasIndex(r => r.ReportNumber).IsUnique();

            // A report belongs to one citizen
            entity.HasOne(r => r.Citizen)
                  .WithMany(u => u.Reports)
                  .HasForeignKey(r => r.CitizenId)
                  .OnDelete(DeleteBehavior.Restrict);

            // A report belongs to one category
            entity.HasOne(r => r.Category)
                  .WithMany(c => c.Reports)
                  .HasForeignKey(r => r.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);

            // A report may be assigned to one department (nullable until assigned)
            entity.HasOne(r => r.Department)
                  .WithMany(d => d.Reports)
                  .HasForeignKey(r => r.DepartmentId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<ReportStatusHistory>(entity =>
        {
            // If a report is deleted, its history goes with it
            entity.HasOne(h => h.Report)
                  .WithMany(r => r.StatusHistory)
                  .HasForeignKey(h => h.ReportId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(h => h.ChangedByUser)
                  .WithMany(u => u.StatusChangesMade)
                  .HasForeignKey(h => h.ChangedByUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}