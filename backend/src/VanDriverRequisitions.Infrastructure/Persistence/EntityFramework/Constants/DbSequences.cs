namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Constants;

public static class DbSequences
{
    public const string FeRequisitionNumber = "FeRequisitionNumber";
    public const int FeRequisitionNumberStartsAt = 101; // set at 101 to avoid needing to amend on seeding
    public const int FeRequisitionNumberIncrementsBy = 1;
    
    public const string StdRequisitionNumber = "StdRequisitionNumber";
    public const int StdRequisitionNumberStartsAt = 1;
    public const int StdRequisitionNumberIncrementsBy = 1;

    public const string PoNumber = "PoNumber";
    public const int PoNumberStartsAt = 1;
    public const int PoNumberIncrementsBy = 1;
    
}