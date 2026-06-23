using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Migrations
{
    /// <inheritdoc />
    public partial class AddedStdEntititesAndConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence(
                name: "StdRequisitionNumber");

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
                    ReasonNameSnapshot = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
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
                    table.CheckConstraint("CK_StdAdditionalCosts_FlatCharge_NonNegative", "[FlatCharge] IS NULL OR [FlatCharge] >= 0");
                    table.CheckConstraint("CK_StdAdditionalCosts_Miles_NonNegative", "[Miles] IS NULL OR [Miles] >= 0");
                    table.CheckConstraint("CK_StdAdditionalCosts_NumberOfBags_Positive", "[NumberOfBags] >= 1");
                    table.CheckConstraint("CK_StdAdditionalCosts_RatePerMile_NonNegative", "[RatePerMile] IS NULL OR [RatePerMile] >= 0");
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
                    table.CheckConstraint("CK_StdCollectionVanPacks_RatePerVanPack_NonNegative", "[RatePerVanPack] >= 0");
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
                    table.CheckConstraint("CK_StdPickups_FlatCharge_NonNegative", "[FlatCharge] IS NULL OR [FlatCharge] >= 0");
                    table.CheckConstraint("CK_StdPickups_Miles_NonNegative", "[Miles] IS NULL OR [Miles] >= 0");
                    table.CheckConstraint("CK_StdPickups_NumberOfBags_Positive", "[NumberOfBags] >= 1");
                    table.CheckConstraint("CK_StdPickups_NumberOfHouseholds_Positive", "[NumberOfHouseholds] >= 1");
                    table.CheckConstraint("CK_StdPickups_RatePerMile_NonNegative", "[RatePerMile] IS NULL OR [RatePerMile] >= 0");
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
                    table.CheckConstraint("CK_StdTransfers_ChargeShape", "([ChargeType] = 0 AND [Miles] IS NOT NULL AND [RatePerMile] IS NOT NULL AND [FlatCharge] IS NULL) OR ([ChargeType] = 1 AND [FlatCharge] IS NOT NULL AND [Miles] IS NULL AND [RatePerMile] IS NULL)");
                    table.CheckConstraint("CK_StdTransfers_DifferentShops", "[ShopIdFrom] <> [ShopIdTo]");
                    table.CheckConstraint("CK_StdTransfers_FlatCharge_NonNegative", "[FlatCharge] IS NULL OR [FlatCharge] >= 0");
                    table.CheckConstraint("CK_StdTransfers_Miles_NonNegative", "[Miles] IS NULL OR [Miles] >= 0");
                    table.CheckConstraint("CK_StdTransfers_NumberOfBags_NonNegative", "[NumberOfBags] IS NULL OR [NumberOfBags] >= 0");
                    table.CheckConstraint("CK_StdTransfers_NumberOfBoxes_NonNegative", "[NumberOfBoxes] IS NULL OR [NumberOfBoxes] >= 0");
                    table.CheckConstraint("CK_StdTransfers_RatePerMile_NonNegative", "[RatePerMile] IS NULL OR [RatePerMile] >= 0");
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
                name: "StdLocations");

            migrationBuilder.DropTable(
                name: "StdRequisitions");

            migrationBuilder.DropTable(
                name: "StdCollectionTypes");

            migrationBuilder.DropSequence(
                name: "StdRequisitionNumber");
        }
    }
}
