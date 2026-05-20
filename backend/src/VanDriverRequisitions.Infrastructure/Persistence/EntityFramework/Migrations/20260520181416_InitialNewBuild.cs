using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Migrations
{
    /// <inheritdoc />
    public partial class InitialNewBuild : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence(
                name: "FeRequisitionNumber");

            migrationBuilder.CreateTable(
                name: "FeReasons",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeReasons", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FeRequisitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RequisitionNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    RequisitionDate = table.Column<DateOnly>(type: "date", nullable: false),
                    VanDriverId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VanDriverName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    TradersName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    VanDriverCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ShopId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ShopCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ShopName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SubmittedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SubmittedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProcessedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ProcessedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RejectedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RejectedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RejectionNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    PoNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsVatApplicable = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
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
                name: "LimitValues",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameOfValue = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Fascia = table.Column<int>(type: "int", nullable: true),
                    TypeOfLimitation = table.Column<int>(type: "int", nullable: false),
                    NumericalLimit = table.Column<int>(type: "int", nullable: true),
                    CurrencyLimit = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LimitValues", x => x.Id);
                    table.CheckConstraint("CK_LimitValues_CurrencyLimit_NonNegative", "[CurrencyLimit] IS NULL OR [CurrencyLimit] >= 0");
                    table.CheckConstraint("CK_LimitValues_NumericalLimit_NonNegative", "[NumericalLimit] IS NULL OR [NumericalLimit] >= 0");
                    table.CheckConstraint("CK_LimitValues_OneValueSet", "([NumericalLimit] IS NOT NULL AND [CurrencyLimit] IS NULL) OR ([NumericalLimit] IS NULL AND [CurrencyLimit] IS NOT NULL)");
                });

            migrationBuilder.CreateTable(
                name: "Shops",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
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
                name: "SubmitWindows",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
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
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
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
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
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
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FeRequisitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WeekEndingDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ReasonId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReasonText = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
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
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeAdditionalCosts", x => x.Id);
                    table.CheckConstraint("CK_FeAdditionalCosts_Miles_NonNegative", "[Miles] IS NULL OR [Miles] >= 0");
                    table.CheckConstraint("CK_FeAdditionalCosts_MutuallyExclusive", "([ChargingOption] = 0 AND [Miles] IS NOT NULL AND [TotalNumber] IS NULL) OR ([ChargingOption] = 1 AND [TotalNumber] IS NOT NULL AND [Miles] IS NULL)");
                    table.CheckConstraint("CK_FeAdditionalCosts_RatePerJob_NonNegative", "[RatePerJob] IS NULL OR [RatePerJob] >= 0");
                    table.CheckConstraint("CK_FeAdditionalCosts_RatePerMile_NonNegative", "[RatePerMile] IS NULL OR [RatePerMile] >= 0");
                    table.CheckConstraint("CK_FeAdditionalCosts_TotalNumber_NonNegative", "[TotalNumber] IS NULL OR [TotalNumber] >= 0");
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
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
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
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeGeneralTasks", x => x.Id);
                    table.CheckConstraint("CK_FeGeneralTasks_RatePerJob_NonNegative", "[RatePerJob] IS NULL OR [RatePerJob] >= 0");
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
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
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
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeMileages", x => x.Id);
                    table.CheckConstraint("CK_FeMileages_RatePerMile_NonNegative", "[RatePerMile] IS NULL OR [RatePerMile] >= 0");
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
                name: "FeTaskTypes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DailyQuantityLimitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RateLimitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByNameSnapshot = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeTaskTypes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeTaskTypes_LimitValues_DailyQuantityLimitId",
                        column: x => x.DailyQuantityLimitId,
                        principalTable: "LimitValues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_FeTaskTypes_LimitValues_RateLimitId",
                        column: x => x.RateLimitId,
                        principalTable: "LimitValues",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FeTransfers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FeRequisitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WeekEndingDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ShopIdFrom = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ShopIdTo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
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
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeTransfers", x => x.Id);
                    table.CheckConstraint("CK_FeTransfers_RatePerJob_NonNegative", "[RatePerJob] IS NULL OR [RatePerJob] >= 0");
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

            migrationBuilder.CreateIndex(
                name: "IX_FeAdditionalCosts_ChargingOption",
                table: "FeAdditionalCosts",
                column: "ChargingOption");

            migrationBuilder.CreateIndex(
                name: "IX_FeAdditionalCosts_FeRequisitionId",
                table: "FeAdditionalCosts",
                column: "FeRequisitionId");

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
                name: "IX_FeReasons_Reason",
                table: "FeReasons",
                column: "Reason",
                unique: true);

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
                name: "IX_FeTaskTypes_Code",
                table: "FeTaskTypes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FeTaskTypes_DailyQuantityLimitId",
                table: "FeTaskTypes",
                column: "DailyQuantityLimitId");

            migrationBuilder.CreateIndex(
                name: "IX_FeTaskTypes_Name",
                table: "FeTaskTypes",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_FeTaskTypes_RateLimitId",
                table: "FeTaskTypes",
                column: "RateLimitId");

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
                name: "IX_LimitValues_Fascia",
                table: "LimitValues",
                column: "Fascia");

            migrationBuilder.CreateIndex(
                name: "IX_LimitValues_Title",
                table: "LimitValues",
                column: "Title",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LimitValues_TypeOfLimitation",
                table: "LimitValues",
                column: "TypeOfLimitation");

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
                name: "FeAdditionalCosts");

            migrationBuilder.DropTable(
                name: "FeGeneralTasks");

            migrationBuilder.DropTable(
                name: "FeMileages");

            migrationBuilder.DropTable(
                name: "FeReasons");

            migrationBuilder.DropTable(
                name: "FeTaskTypes");

            migrationBuilder.DropTable(
                name: "FeTransfers");

            migrationBuilder.DropTable(
                name: "SubmitWindows");

            migrationBuilder.DropTable(
                name: "VanDrivers");

            migrationBuilder.DropTable(
                name: "LimitValues");

            migrationBuilder.DropTable(
                name: "FeRequisitions");

            migrationBuilder.DropTable(
                name: "Shops");

            migrationBuilder.DropSequence(
                name: "FeRequisitionNumber");
        }
    }
}
