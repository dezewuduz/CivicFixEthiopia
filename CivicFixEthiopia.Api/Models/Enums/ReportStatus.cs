namespace CivicFixEthiopia.Api.Models.Enums;

// Submitted -> Verified -> Assigned -> In Progress -> Resolved (Rejected branches off Verified)
public enum ReportStatus
{
    Submitted = 0,
    Verified = 1,
    Rejected = 2,
    Assigned = 3,
    InProgress = 4,
    Resolved = 5
}