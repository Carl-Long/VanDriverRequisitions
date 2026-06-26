using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Migrations
{
    /// <inheritdoc />
    public partial class InitialCleanCreateForDemo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence(
                name: "FeRequisitionNumber");

            migrationBuilder.CreateSequence(
                name: "PoNumber");

            migrationBuilder.CreateSequence(
                name: "StdRequisitionNumber");
            
            migrationBuilder.Sql("""
                ALTER SEQUENCE [dbo].[FeRequisitionNumber]
                CACHE 10;
                """);

            migrationBuilder.Sql("""
                ALTER SEQUENCE [dbo].[StdRequisitionNumber]
                CACHE 10;
                """);

            migrationBuilder.Sql("""
                ALTER SEQUENCE [dbo].[PoNumber]
                CACHE 10;
                """);

            migrationBuilder.CreateTable(
                name: "CostReasons",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Scope = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CostReasons", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FeRequisitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    RequisitionNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    RequisitionDate = table.Column<DateOnly>(type: "date", nullable: false),
                    VanDriverId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VanDriverName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    TradersName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    VanDriverCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ShopId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ShopCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ShopName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsVatApplicable = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SubmittedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SubmittedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    SubmittedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ApprovedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    PoNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RejectedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RejectedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RejectedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    RejectionNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeRequisitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FeTaskTypes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeTaskTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Shops",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Address2 = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Town = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    County = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Postcode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shops", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StdCollectionTypes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StdCollectionTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StdRequisitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    RequisitionNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    RequisitionDate = table.Column<DateOnly>(type: "date", nullable: false),
                    VanDriverId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VanDriverName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    TradersName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    VanDriverCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ShopId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ShopCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ShopName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsVatApplicable = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SubmittedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SubmittedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    SubmittedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ApprovedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    PoNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RejectedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RejectedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RejectedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    RejectionNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StdRequisitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SubmitWindows",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    OpenFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OpenTo = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedByNameSnapshot = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubmitWindows", x => x.Id);
                    table.CheckConstraint("CK_SubmitWindows_DateRange", "[OpenTo] > [OpenFrom]");
                });

            migrationBuilder.CreateTable(
                name: "VanDrivers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TradersName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Address1 = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Address2 = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Town = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    County = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Postcode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    VatNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VanDrivers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FeAdditionalCosts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    FeRequisitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WeekEndingDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ReasonId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReasonTextSnapshot = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ReasonCodeSnapshot = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ChargingOption = table.Column<int>(type: "int", nullable: false),
                    Miles = table.Column<int>(type: "int", nullable: true),
                    RatePerMile = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TotalNumber = table.Column<int>(type: "int", nullable: true),
                    RatePerJob = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TotalValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeAdditionalCosts", x => x.Id);
                    table.CheckConstraint("CK_FeAdditionalCosts_Miles_Positive", "[Miles] IS NULL OR [Miles] >= 1");
                    table.CheckConstraint("CK_FeAdditionalCosts_MutuallyExclusive", "([ChargingOption] = 0 AND [Miles] IS NOT NULL AND [RatePerMile] IS NOT NULL AND [TotalNumber] IS NULL AND [RatePerJob] IS NULL) OR ([ChargingOption] = 1 AND [TotalNumber] IS NOT NULL AND [RatePerJob] IS NOT NULL AND [Miles] IS NULL AND [RatePerMile] IS NULL)");
                    table.CheckConstraint("CK_FeAdditionalCosts_RatePerJob_Minimum", "[RatePerJob] IS NULL OR [RatePerJob] >= 0.01");
                    table.CheckConstraint("CK_FeAdditionalCosts_RatePerMile_Minimum", "[RatePerMile] IS NULL OR [RatePerMile] >= 0.01");
                    table.CheckConstraint("CK_FeAdditionalCosts_TotalNumber_Positive", "[TotalNumber] IS NULL OR [TotalNumber] >= 1");
                    table.CheckConstraint("CK_FeAdditionalCosts_TotalValue_NonNegative", "[TotalValue] IS NULL OR [TotalValue] >= 0");
                    table.ForeignKey(
                        name: "FK_FeAdditionalCosts_FeRequisitions_FeRequisitionId",
                        column: x => x.FeRequisitionId,
                        principalTable: "FeRequisitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FeGeneralTasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    FeRequisitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FeTaskTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TaskTypeName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TaskTypeCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    WeekEndingDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Sun = table.Column<int>(type: "int", nullable: true),
                    Mon = table.Column<int>(type: "int", nullable: true),
                    Tue = table.Column<int>(type: "int", nullable: true),
                    Wed = table.Column<int>(type: "int", nullable: true),
                    Thu = table.Column<int>(type: "int", nullable: true),
                    Fri = table.Column<int>(type: "int", nullable: true),
                    Sat = table.Column<int>(type: "int", nullable: true),
                    TotalNumber = table.Column<int>(type: "int", nullable: false),
                    RatePerJob = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TotalValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeGeneralTasks", x => x.Id);
                    table.CheckConstraint("CK_FeGeneralTasks_RatePerJob_Minimum", "[RatePerJob] IS NULL OR [RatePerJob] >= 0.01");
                    table.CheckConstraint("CK_FeGeneralTasks_TotalNumber_NonNegative", "[TotalNumber] >= 0");
                    table.CheckConstraint("CK_FeGeneralTasks_TotalValue_NonNegative", "[TotalValue] IS NULL OR [TotalValue] >= 0");
                    table.ForeignKey(
                        name: "FK_FeGeneralTasks_FeRequisitions_FeRequisitionId",
                        column: x => x.FeRequisitionId,
                        principalTable: "FeRequisitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FeMileages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    FeRequisitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WeekEndingDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Sun = table.Column<int>(type: "int", nullable: true),
                    Mon = table.Column<int>(type: "int", nullable: true),
                    Tue = table.Column<int>(type: "int", nullable: true),
                    Wed = table.Column<int>(type: "int", nullable: true),
                    Thu = table.Column<int>(type: "int", nullable: true),
                    Fri = table.Column<int>(type: "int", nullable: true),
                    Sat = table.Column<int>(type: "int", nullable: true),
                    TotalMiles = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    RatePerMile = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TotalValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeMileages", x => x.Id);
                    table.CheckConstraint("CK_FeMileages_RatePerMile_Minimum", "[RatePerMile] IS NULL OR [RatePerMile] >= 0.01");
                    table.CheckConstraint("CK_FeMileages_TotalMiles_NonNegative", "[TotalMiles] IS NULL OR [TotalMiles] >= 0");
                    table.CheckConstraint("CK_FeMileages_TotalValue_NonNegative", "[TotalValue] IS NULL OR [TotalValue] >= 0");
                    table.ForeignKey(
                        name: "FK_FeMileages_FeRequisitions_FeRequisitionId",
                        column: x => x.FeRequisitionId,
                        principalTable: "FeRequisitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FeRequisitionSubmissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    FeRequisitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubmissionNumber = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SubmittedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubmittedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    SubmittedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReviewedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ReviewedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ReviewedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PoNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RejectionNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    SnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeRequisitionSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeRequisitionSubmissions_FeRequisitions_FeRequisitionId",
                        column: x => x.FeRequisitionId,
                        principalTable: "FeRequisitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RequisitionLimitRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    Category = table.Column<int>(type: "int", nullable: false),
                    FeTaskTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Fascia = table.Column<int>(type: "int", nullable: false),
                    MaxQuantity = table.Column<int>(type: "int", nullable: false),
                    MaxRate = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequisitionLimitRules", x => x.Id);
                    table.CheckConstraint("CK_RequisitionLimitRules_MaxQuantity_Positive", "[MaxQuantity] > 0");
                    table.CheckConstraint("CK_RequisitionLimitRules_MaxRate_Positive", "[MaxRate] > 0");
                    table.ForeignKey(
                        name: "FK_RequisitionLimitRules_FeTaskTypes_FeTaskTypeId",
                        column: x => x.FeTaskTypeId,
                        principalTable: "FeTaskTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "FeTransfers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    FeRequisitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WeekEndingDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ShopIdFrom = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ShopCodeFrom = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ShopNameFrom = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ShopIdTo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ShopCodeTo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ShopNameTo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Sun = table.Column<int>(type: "int", nullable: true),
                    Mon = table.Column<int>(type: "int", nullable: true),
                    Tue = table.Column<int>(type: "int", nullable: true),
                    Wed = table.Column<int>(type: "int", nullable: true),
                    Thu = table.Column<int>(type: "int", nullable: true),
                    Fri = table.Column<int>(type: "int", nullable: true),
                    Sat = table.Column<int>(type: "int", nullable: true),
                    TotalNumber = table.Column<int>(type: "int", nullable: false),
                    RatePerJob = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TotalValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeTransfers", x => x.Id);
                    table.CheckConstraint("CK_FeTransfers_RatePerJob_Minimum", "[RatePerJob] IS NULL OR [RatePerJob] >= 0.01");
                    table.CheckConstraint("CK_FeTransfers_TotalNumber_NonNegative", "[TotalNumber] >= 0");
                    table.CheckConstraint("CK_FeTransfers_TotalValue_NonNegative", "[TotalValue] IS NULL OR [TotalValue] >= 0");
                    table.ForeignKey(
                        name: "FK_FeTransfers_FeRequisitions_FeRequisitionId",
                        column: x => x.FeRequisitionId,
                        principalTable: "FeRequisitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FeTransfers_Shops_ShopIdFrom",
                        column: x => x.ShopIdFrom,
                        principalTable: "Shops",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FeTransfers_Shops_ShopIdTo",
                        column: x => x.ShopIdTo,
                        principalTable: "Shops",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StdLocations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    CollectionTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ShopId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LocationName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PostCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StdLocations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StdLocations_Shops_ShopId",
                        column: x => x.ShopId,
                        principalTable: "Shops",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StdLocations_StdCollectionTypes_CollectionTypeId",
                        column: x => x.CollectionTypeId,
                        principalTable: "StdCollectionTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StdAdditionalCosts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    StdRequisitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    ReasonId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReasonCodeSnapshot = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ReasonTextSnapshot = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NumberOfBags = table.Column<int>(type: "int", nullable: false),
                    ChargeType = table.Column<int>(type: "int", nullable: false),
                    Miles = table.Column<int>(type: "int", nullable: true),
                    RatePerMile = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    FlatCharge = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TotalValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StdAdditionalCosts", x => x.Id);
                    table.CheckConstraint("CK_StdAdditionalCosts_ChargeShape", "([ChargeType] = 0 AND [Miles] IS NOT NULL AND [RatePerMile] IS NOT NULL AND [FlatCharge] IS NULL) OR ([ChargeType] = 1 AND [FlatCharge] IS NOT NULL AND [Miles] IS NULL AND [RatePerMile] IS NULL)");
                    table.CheckConstraint("CK_StdAdditionalCosts_FlatCharge_Minimum", "[FlatCharge] IS NULL OR [FlatCharge] >= 0.01");
                    table.CheckConstraint("CK_StdAdditionalCosts_Miles_Positive", "[Miles] IS NULL OR [Miles] >= 1");
                    table.CheckConstraint("CK_StdAdditionalCosts_NumberOfBags_Positive", "[NumberOfBags] >= 1");
                    table.CheckConstraint("CK_StdAdditionalCosts_RatePerMile_Minimum", "[RatePerMile] IS NULL OR [RatePerMile] >= 0.01");
                    table.CheckConstraint("CK_StdAdditionalCosts_TotalValue_NonNegative", "[TotalValue] IS NULL OR [TotalValue] >= 0");
                    table.ForeignKey(
                        name: "FK_StdAdditionalCosts_StdRequisitions_StdRequisitionId",
                        column: x => x.StdRequisitionId,
                        principalTable: "StdRequisitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StdCollectionVanPacks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    StdRequisitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeliveryDate = table.Column<DateOnly>(type: "date", nullable: false),
                    PostCodeZone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    VanPacksOut = table.Column<int>(type: "int", nullable: false),
                    FilledBags = table.Column<int>(type: "int", nullable: false),
                    RatePerVanPack = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StdCollectionVanPacks", x => x.Id);
                    table.CheckConstraint("CK_StdCollectionVanPacks_FilledBags_NotGreaterThanVanPacksOut", "[FilledBags] <= [VanPacksOut]");
                    table.CheckConstraint("CK_StdCollectionVanPacks_FilledBags_Positive", "[FilledBags] >= 1");
                    table.CheckConstraint("CK_StdCollectionVanPacks_RatePerVanPack_Minimum", "[RatePerVanPack] >= 0.01");
                    table.CheckConstraint("CK_StdCollectionVanPacks_TotalValue_NonNegative", "[TotalValue] IS NULL OR [TotalValue] >= 0");
                    table.CheckConstraint("CK_StdCollectionVanPacks_VanPacksOut_Positive", "[VanPacksOut] >= 1");
                    table.ForeignKey(
                        name: "FK_StdCollectionVanPacks_StdRequisitions_StdRequisitionId",
                        column: x => x.StdRequisitionId,
                        principalTable: "StdRequisitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StdPickups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    StdRequisitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    NumberOfBags = table.Column<int>(type: "int", nullable: false),
                    NumberOfHouseholds = table.Column<int>(type: "int", nullable: false),
                    ChargeType = table.Column<int>(type: "int", nullable: false),
                    Miles = table.Column<int>(type: "int", nullable: true),
                    RatePerMile = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    FlatCharge = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TotalValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StdPickups", x => x.Id);
                    table.CheckConstraint("CK_StdPickups_ChargeShape", "([ChargeType] = 0 AND [Miles] IS NOT NULL AND [RatePerMile] IS NOT NULL AND [FlatCharge] IS NULL) OR ([ChargeType] = 1 AND [FlatCharge] IS NOT NULL AND [Miles] IS NULL AND [RatePerMile] IS NULL)");
                    table.CheckConstraint("CK_StdPickups_FlatCharge_Minimum", "[FlatCharge] IS NULL OR [FlatCharge] >= 0.01");
                    table.CheckConstraint("CK_StdPickups_Miles_Positive", "[Miles] IS NULL OR [Miles] >= 1");
                    table.CheckConstraint("CK_StdPickups_NumberOfBags_Positive", "[NumberOfBags] >= 1");
                    table.CheckConstraint("CK_StdPickups_NumberOfHouseholds_Positive", "[NumberOfHouseholds] >= 1");
                    table.CheckConstraint("CK_StdPickups_RatePerMile_Minimum", "[RatePerMile] IS NULL OR [RatePerMile] >= 0.01");
                    table.CheckConstraint("CK_StdPickups_TotalValue_NonNegative", "[TotalValue] IS NULL OR [TotalValue] >= 0");
                    table.ForeignKey(
                        name: "FK_StdPickups_StdRequisitions_StdRequisitionId",
                        column: x => x.StdRequisitionId,
                        principalTable: "StdRequisitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StdRequisitionSubmissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    StdRequisitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubmissionNumber = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SubmittedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubmittedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    SubmittedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReviewedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ReviewedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ReviewedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PoNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RejectionNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    SnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StdRequisitionSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StdRequisitionSubmissions_StdRequisitions_StdRequisitionId",
                        column: x => x.StdRequisitionId,
                        principalTable: "StdRequisitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StdTransfers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    StdRequisitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    ShopIdFrom = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ShopCodeFrom = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ShopNameFrom = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ShopIdTo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ShopCodeTo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ShopNameTo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NumberOfBags = table.Column<int>(type: "int", nullable: true),
                    NumberOfBoxes = table.Column<int>(type: "int", nullable: true),
                    ChargeType = table.Column<int>(type: "int", nullable: false),
                    Miles = table.Column<int>(type: "int", nullable: true),
                    RatePerMile = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    FlatCharge = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TotalValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StdTransfers", x => x.Id);
                    table.CheckConstraint("CK_StdCollectionChargesBanksAndBins_FlatCharge_Minimum", "[FlatCharge] IS NULL OR [FlatCharge] >= 0.01");
                    table.CheckConstraint("CK_StdCollectionChargesBanksAndBins_Miles_Positive", "[Miles] IS NULL OR [Miles] >= 1");
                    table.CheckConstraint("CK_StdCollectionChargesBanksAndBins_RatePerMile_Minimum", "[RatePerMile] IS NULL OR [RatePerMile] >= 0.01");
                    table.CheckConstraint("CK_StdTransfers_ChargeShape", "([ChargeType] = 0 AND [Miles] IS NOT NULL AND [RatePerMile] IS NOT NULL AND [FlatCharge] IS NULL) OR ([ChargeType] = 1 AND [FlatCharge] IS NOT NULL AND [Miles] IS NULL AND [RatePerMile] IS NULL)");
                    table.CheckConstraint("CK_StdTransfers_DifferentShops", "[ShopIdFrom] <> [ShopIdTo]");
                    table.CheckConstraint("CK_StdTransfers_NumberOfBags_NonNegative", "[NumberOfBags] IS NULL OR [NumberOfBags] >= 0");
                    table.CheckConstraint("CK_StdTransfers_NumberOfBoxes_NonNegative", "[NumberOfBoxes] IS NULL OR [NumberOfBoxes] >= 0");
                    table.CheckConstraint("CK_StdTransfers_TotalValue_NonNegative", "[TotalValue] IS NULL OR [TotalValue] >= 0");
                    table.ForeignKey(
                        name: "FK_StdTransfers_Shops_ShopIdFrom",
                        column: x => x.ShopIdFrom,
                        principalTable: "Shops",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StdTransfers_Shops_ShopIdTo",
                        column: x => x.ShopIdTo,
                        principalTable: "Shops",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StdTransfers_StdRequisitions_StdRequisitionId",
                        column: x => x.StdRequisitionId,
                        principalTable: "StdRequisitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StdCollectionChargesBanksAndBins",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    StdRequisitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    CollectionTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CollectionTypeNameSnapshot = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CollectionTypeCodeSnapshot = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LocationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LocationNameSnapshot = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    LocationPostCodeSnapshot = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    NumberOfBags = table.Column<int>(type: "int", nullable: true),
                    ChargeType = table.Column<int>(type: "int", nullable: false),
                    Miles = table.Column<int>(type: "int", nullable: true),
                    RatePerMile = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    FlatCharge = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TotalValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StdCollectionChargesBanksAndBins", x => x.Id);
                    table.CheckConstraint("CK_StdCollectionChargesBanksAndBins_ChargeShape", "([ChargeType] = 0 AND [Miles] IS NOT NULL AND [RatePerMile] IS NOT NULL AND [FlatCharge] IS NULL) OR ([ChargeType] = 1 AND [FlatCharge] IS NOT NULL AND [Miles] IS NULL AND [RatePerMile] IS NULL)");
                    table.CheckConstraint("CK_StdCollectionChargesBanksAndBins_FlatCharge_NonNegative", "[FlatCharge] IS NULL OR [FlatCharge] >= 0");
                    table.CheckConstraint("CK_StdCollectionChargesBanksAndBins_Miles_NonNegative", "[Miles] IS NULL OR [Miles] >= 0");
                    table.CheckConstraint("CK_StdCollectionChargesBanksAndBins_NumberOfBags_NonNegative", "[NumberOfBags] IS NULL OR [NumberOfBags] >= 0");
                    table.CheckConstraint("CK_StdCollectionChargesBanksAndBins_RatePerMile_NonNegative", "[RatePerMile] IS NULL OR [RatePerMile] >= 0");
                    table.CheckConstraint("CK_StdCollectionChargesBanksAndBins_TotalValue_NonNegative", "[TotalValue] IS NULL OR [TotalValue] >= 0");
                    table.ForeignKey(
                        name: "FK_StdCollectionChargesBanksAndBins_StdCollectionTypes_CollectionTypeId",
                        column: x => x.CollectionTypeId,
                        principalTable: "StdCollectionTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StdCollectionChargesBanksAndBins_StdLocations_LocationId",
                        column: x => x.LocationId,
                        principalTable: "StdLocations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StdCollectionChargesBanksAndBins_StdRequisitions_StdRequisitionId",
                        column: x => x.StdRequisitionId,
                        principalTable: "StdRequisitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CostReasons_Code",
                table: "CostReasons",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CostReasons_IsActive",
                table: "CostReasons",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_CostReasons_Reason",
                table: "CostReasons",
                column: "Reason");

            migrationBuilder.CreateIndex(
                name: "IX_CostReasons_Scope",
                table: "CostReasons",
                column: "Scope");

            migrationBuilder.CreateIndex(
                name: "IX_CostReasons_Scope_IsActive",
                table: "CostReasons",
                columns: new[] { "Scope", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_FeAdditionalCosts_ChargingOption",
                table: "FeAdditionalCosts",
                column: "ChargingOption");

            migrationBuilder.CreateIndex(
                name: "IX_FeAdditionalCosts_FeRequisitionId",
                table: "FeAdditionalCosts",
                column: "FeRequisitionId");

            migrationBuilder.CreateIndex(
                name: "IX_FeAdditionalCosts_ReasonCodeSnapshot",
                table: "FeAdditionalCosts",
                column: "ReasonCodeSnapshot");

            migrationBuilder.CreateIndex(
                name: "IX_FeAdditionalCosts_ReasonId",
                table: "FeAdditionalCosts",
                column: "ReasonId");

            migrationBuilder.CreateIndex(
                name: "IX_FeAdditionalCosts_WeekEndingDate",
                table: "FeAdditionalCosts",
                column: "WeekEndingDate");

            migrationBuilder.CreateIndex(
                name: "IX_FeGeneralTasks_FeRequisitionId",
                table: "FeGeneralTasks",
                column: "FeRequisitionId");

            migrationBuilder.CreateIndex(
                name: "IX_FeGeneralTasks_FeTaskTypeId",
                table: "FeGeneralTasks",
                column: "FeTaskTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_FeGeneralTasks_WeekEndingDate",
                table: "FeGeneralTasks",
                column: "WeekEndingDate");

            migrationBuilder.CreateIndex(
                name: "IX_FeMileages_FeRequisitionId",
                table: "FeMileages",
                column: "FeRequisitionId");

            migrationBuilder.CreateIndex(
                name: "IX_FeMileages_WeekEndingDate",
                table: "FeMileages",
                column: "WeekEndingDate");

            migrationBuilder.CreateIndex(
                name: "IX_FeRequisitions_CreatedById_Status",
                table: "FeRequisitions",
                columns: new[] { "CreatedById", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_FeRequisitions_RequisitionNumber",
                table: "FeRequisitions",
                column: "RequisitionNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FeRequisitions_ShopId",
                table: "FeRequisitions",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_FeRequisitions_ShopId_Status",
                table: "FeRequisitions",
                columns: new[] { "ShopId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_FeRequisitions_Status",
                table: "FeRequisitions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_FeRequisitionSubmissions_FeRequisitionId_SubmissionNumber",
                table: "FeRequisitionSubmissions",
                columns: new[] { "FeRequisitionId", "SubmissionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FeTaskTypes_Code",
                table: "FeTaskTypes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FeTaskTypes_Name",
                table: "FeTaskTypes",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_FeTransfers_FeRequisitionId",
                table: "FeTransfers",
                column: "FeRequisitionId");

            migrationBuilder.CreateIndex(
                name: "IX_FeTransfers_ShopIdFrom",
                table: "FeTransfers",
                column: "ShopIdFrom");

            migrationBuilder.CreateIndex(
                name: "IX_FeTransfers_ShopIdTo",
                table: "FeTransfers",
                column: "ShopIdTo");

            migrationBuilder.CreateIndex(
                name: "IX_FeTransfers_WeekEndingDate",
                table: "FeTransfers",
                column: "WeekEndingDate");

            migrationBuilder.CreateIndex(
                name: "IX_RequisitionLimitRules_Category_Fascia",
                table: "RequisitionLimitRules",
                columns: new[] { "Category", "Fascia" },
                unique: true,
                filter: "[FeTaskTypeId] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_RequisitionLimitRules_Category_FeTaskTypeId_Fascia",
                table: "RequisitionLimitRules",
                columns: new[] { "Category", "FeTaskTypeId", "Fascia" },
                unique: true,
                filter: "[FeTaskTypeId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_RequisitionLimitRules_FeTaskTypeId",
                table: "RequisitionLimitRules",
                column: "FeTaskTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Shops_Code",
                table: "Shops",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Shops_IsActive",
                table: "Shops",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Shops_Name",
                table: "Shops",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_StdAdditionalCosts_ChargeType",
                table: "StdAdditionalCosts",
                column: "ChargeType");

            migrationBuilder.CreateIndex(
                name: "IX_StdAdditionalCosts_Date",
                table: "StdAdditionalCosts",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_StdAdditionalCosts_ReasonId",
                table: "StdAdditionalCosts",
                column: "ReasonId");

            migrationBuilder.CreateIndex(
                name: "IX_StdAdditionalCosts_StdRequisitionId",
                table: "StdAdditionalCosts",
                column: "StdRequisitionId");

            migrationBuilder.CreateIndex(
                name: "IX_StdCollectionChargesBanksAndBins_ChargeType",
                table: "StdCollectionChargesBanksAndBins",
                column: "ChargeType");

            migrationBuilder.CreateIndex(
                name: "IX_StdCollectionChargesBanksAndBins_CollectionTypeId",
                table: "StdCollectionChargesBanksAndBins",
                column: "CollectionTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_StdCollectionChargesBanksAndBins_Date",
                table: "StdCollectionChargesBanksAndBins",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_StdCollectionChargesBanksAndBins_LocationId",
                table: "StdCollectionChargesBanksAndBins",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_StdCollectionChargesBanksAndBins_StdRequisitionId",
                table: "StdCollectionChargesBanksAndBins",
                column: "StdRequisitionId");

            migrationBuilder.CreateIndex(
                name: "IX_StdCollectionTypes_Code",
                table: "StdCollectionTypes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StdCollectionTypes_IsActive",
                table: "StdCollectionTypes",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_StdCollectionTypes_Name",
                table: "StdCollectionTypes",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_StdCollectionVanPacks_DeliveryDate",
                table: "StdCollectionVanPacks",
                column: "DeliveryDate");

            migrationBuilder.CreateIndex(
                name: "IX_StdCollectionVanPacks_PostCodeZone",
                table: "StdCollectionVanPacks",
                column: "PostCodeZone");

            migrationBuilder.CreateIndex(
                name: "IX_StdCollectionVanPacks_StdRequisitionId",
                table: "StdCollectionVanPacks",
                column: "StdRequisitionId");

            migrationBuilder.CreateIndex(
                name: "IX_StdLocations_CollectionTypeId",
                table: "StdLocations",
                column: "CollectionTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_StdLocations_IsActive",
                table: "StdLocations",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_StdLocations_LocationName",
                table: "StdLocations",
                column: "LocationName");

            migrationBuilder.CreateIndex(
                name: "IX_StdLocations_PostCode",
                table: "StdLocations",
                column: "PostCode");

            migrationBuilder.CreateIndex(
                name: "IX_StdLocations_ShopId",
                table: "StdLocations",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_StdLocations_ShopId_CollectionTypeId_IsActive",
                table: "StdLocations",
                columns: new[] { "ShopId", "CollectionTypeId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_StdLocations_ShopId_CollectionTypeId_LocationName_PostCode",
                table: "StdLocations",
                columns: new[] { "ShopId", "CollectionTypeId", "LocationName", "PostCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StdPickups_ChargeType",
                table: "StdPickups",
                column: "ChargeType");

            migrationBuilder.CreateIndex(
                name: "IX_StdPickups_Date",
                table: "StdPickups",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_StdPickups_StdRequisitionId",
                table: "StdPickups",
                column: "StdRequisitionId");

            migrationBuilder.CreateIndex(
                name: "IX_StdRequisitions_CreatedById_Status",
                table: "StdRequisitions",
                columns: new[] { "CreatedById", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_StdRequisitions_RequisitionNumber",
                table: "StdRequisitions",
                column: "RequisitionNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StdRequisitions_ShopId",
                table: "StdRequisitions",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_StdRequisitions_ShopId_Status",
                table: "StdRequisitions",
                columns: new[] { "ShopId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_StdRequisitions_Status",
                table: "StdRequisitions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_StdRequisitionSubmissions_StdRequisitionId_SubmissionNumber",
                table: "StdRequisitionSubmissions",
                columns: new[] { "StdRequisitionId", "SubmissionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StdTransfers_ChargeType",
                table: "StdTransfers",
                column: "ChargeType");

            migrationBuilder.CreateIndex(
                name: "IX_StdTransfers_Date",
                table: "StdTransfers",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_StdTransfers_ShopIdFrom",
                table: "StdTransfers",
                column: "ShopIdFrom");

            migrationBuilder.CreateIndex(
                name: "IX_StdTransfers_ShopIdTo",
                table: "StdTransfers",
                column: "ShopIdTo");

            migrationBuilder.CreateIndex(
                name: "IX_StdTransfers_StdRequisitionId",
                table: "StdTransfers",
                column: "StdRequisitionId");

            migrationBuilder.CreateIndex(
                name: "IX_VanDrivers_Code",
                table: "VanDrivers",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VanDrivers_IsActive",
                table: "VanDrivers",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_VanDrivers_TradersName",
                table: "VanDrivers",
                column: "TradersName");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CostReasons");

            migrationBuilder.DropTable(
                name: "FeAdditionalCosts");

            migrationBuilder.DropTable(
                name: "FeGeneralTasks");

            migrationBuilder.DropTable(
                name: "FeMileages");

            migrationBuilder.DropTable(
                name: "FeRequisitionSubmissions");

            migrationBuilder.DropTable(
                name: "FeTransfers");

            migrationBuilder.DropTable(
                name: "RequisitionLimitRules");

            migrationBuilder.DropTable(
                name: "StdAdditionalCosts");

            migrationBuilder.DropTable(
                name: "StdCollectionChargesBanksAndBins");

            migrationBuilder.DropTable(
                name: "StdCollectionVanPacks");

            migrationBuilder.DropTable(
                name: "StdPickups");

            migrationBuilder.DropTable(
                name: "StdRequisitionSubmissions");

            migrationBuilder.DropTable(
                name: "StdTransfers");

            migrationBuilder.DropTable(
                name: "SubmitWindows");

            migrationBuilder.DropTable(
                name: "VanDrivers");

            migrationBuilder.DropTable(
                name: "FeRequisitions");

            migrationBuilder.DropTable(
                name: "FeTaskTypes");

            migrationBuilder.DropTable(
                name: "StdLocations");

            migrationBuilder.DropTable(
                name: "StdRequisitions");

            migrationBuilder.DropTable(
                name: "Shops");

            migrationBuilder.DropTable(
                name: "StdCollectionTypes");

            migrationBuilder.DropSequence(
                name: "FeRequisitionNumber");

            migrationBuilder.DropSequence(
                name: "PoNumber");

            migrationBuilder.DropSequence(
                name: "StdRequisitionNumber");
        }
    }
}
