using CivicFixEthiopia.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CivicFixEthiopia.Infrastructure.Data;

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
            entity.HasIndex(u => u.Email).IsUnique();

            entity.HasOne(u => u.Department)
                  .WithMany(d => d.Officers)
                  .HasForeignKey(u => u.DepartmentId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Report>(entity =>
        {
            entity.HasIndex(r => r.ReportNumber).IsUnique();

            entity.HasOne(r => r.Citizen)
                  .WithMany(u => u.Reports)
                  .HasForeignKey(r => r.CitizenId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.Category)
                  .WithMany(c => c.Reports)
                  .HasForeignKey(r => r.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.Department)
                  .WithMany(d => d.Reports)
                  .HasForeignKey(r => r.DepartmentId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<ReportStatusHistory>(entity =>
        {
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